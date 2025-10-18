
import os
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import List, Tuple

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import Window
from pyspark.sql import functions as F, types as T
from pyspark.ml.feature import VectorAssembler, Imputer
from pyspark.ml.classification import GBTClassifier
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.regression import IsotonicRegression, IsotonicRegressionModel
from pyspark.ml.functions import vector_to_array

from feature_engineering_broadband import build_broadband_features

def frange(start: float, stop: float, step: float):
    x = start
    while x < stop:
        yield x
        x += step


# --------------------------
# Spark session
# --------------------------
def get_spark(app_name: str = "Broadband Churn Experiment") -> SparkSession:
    os.environ["PYSPARK_PYTHON"] = sys.executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable
    local_dirs = os.getenv("SPARK_LOCAL_DIRS") or os.getenv("SPARK_LOCAL_DIR")
    builder = (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]")
        .config("spark.pyspark.python", sys.executable)
        .config("spark.pyspark.driver.python", sys.executable)
        .config("spark.driver.memory", os.getenv("SPARK_DRIVER_MEM", "8g"))
        .config("spark.executor.memory", os.getenv("SPARK_EXECUTOR_MEM", "8g"))
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.sql.shuffle.partitions", os.getenv("SPARK_SHUFFLE_PARTS", "8"))
    )
    if local_dirs:
        builder = builder.config("spark.local.dir", local_dirs)
    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    try:
        ui_url = getattr(spark.sparkContext, "uiWebUrl", None)
        if callable(ui_url):
            ui_url = ui_url()
        print(f"[spark ui] {ui_url or 'unavailable'}", flush=True)
    except Exception:
        print("[spark ui] unavailable", flush=True)
    if local_dirs:
        print(f"[spark local dir] {local_dirs}", flush=True)
    return spark


# --------------------------
# Utils
# --------------------------
def has_col(df: DataFrame, name: str) -> bool:
    return name in df.columns

def parse_topk_list(env_value: str | None) -> List[float]:
    """Ortamdaki TOPK_LIST değerini [0.01, 0.05] gibi float listeye çevirir."""
    default = [0.01, 0.05]
    if not env_value:
        return default
    items = [s.strip() for s in env_value.split(",") if s.strip()]
    parsed: List[float] = []
    for it in items:
        s = it.replace("%", "").replace("pct", "").strip()
        try:
            v = float(s)
            if v > 1.0:
                v = v / 100.0
            parsed.append(v)
        except Exception:
            continue
    return parsed or default

def compute_class_weights(df: DataFrame, label_col: str = "label") -> Tuple[float, float, float]:
    agg = df.groupBy(label_col).count().collect()
    by = {int(r[label_col]): int(r["count"]) for r in agg if r[label_col] is not None}
    pos = by.get(1, 1)
    neg = by.get(0, 1)
    spw = (neg / max(pos, 1))  # scale_pos_weight ~ Neg/Pos
    return float(neg), float(pos), float(spw)

def add_weight_col(df: DataFrame, label_col: str = "label", spw: float = 1.0) -> DataFrame:
    return df.withColumn(
        "weight",
        F.when(F.col(label_col) == 1, F.lit(float(spw))).otherwise(F.lit(1.0))
    )

def assemble(df: DataFrame, feature_cols: List[str], out_col: str = "features") -> DataFrame:
    # 1) NaN/null imputasyonu (median)
    imputer = Imputer(inputCols=feature_cols, outputCols=feature_cols, strategy="median")
    df_imp = imputer.fit(df).transform(df)

    # 2) Assembler: invalid değerli satırları atla (skip)
    assembler = VectorAssembler(inputCols=feature_cols, outputCol=out_col, handleInvalid="skip")
    return assembler.transform(df_imp)

def stratified_split(df: DataFrame, label_col: str = "label",
                     train_ratio=0.7, val_ratio=0.15, test_ratio=0.15, seed=42) -> Tuple[DataFrame, DataFrame, DataFrame]:
    # oranları normalle
    s = train_ratio + val_ratio + test_ratio
    train_ratio, val_ratio, test_ratio = train_ratio/s, val_ratio/s, test_ratio/s

    # id yoksa üret (anti-join için)
    if "id" not in df.columns:
        df = df.withColumn("id", F.monotonically_increasing_id())

    labels = [int(r[0]) for r in df.select(label_col).distinct().collect()]
    frac_train = {lbl: train_ratio for lbl in labels}
    frac_hold  = {lbl: (val_ratio + test_ratio) for lbl in labels}

    train = df.sampleBy(label_col, fractions=frac_train, seed=seed)
    hold  = df.join(train.select("id").withColumnRenamed("id", "_mid"), on=(df["id"] == F.col("_mid")), how="left_anti")

    # hold -> val/test
    frac_val = {lbl: val_ratio/(val_ratio+test_ratio) for lbl in labels}
    val = hold.sampleBy(label_col, fractions=frac_val, seed=seed+1)
    test = hold.join(val.select("id").withColumnRenamed("id","_mid2"), on=(hold["id"]==F.col("_mid2")), how="left_anti")
    return train, val, test

def time_based_split(df: DataFrame, time_col: str, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15) -> Tuple[DataFrame, DataFrame, DataFrame]:
    qs = df.approxQuantile(time_col, [train_ratio, train_ratio+val_ratio], 1e-3)
    t1, t2 = qs
    train = df.where(F.col(time_col) <= F.lit(t1))
    val   = df.where((F.col(time_col) > F.lit(t1)) & (F.col(time_col) <= F.lit(t2)))
    test  = df.where(F.col(time_col) > F.lit(t2))
    return train, val, test

def evaluate_basic(df_pred: DataFrame, label_col="label", score_col="score") -> dict:
    roc = BinaryClassificationEvaluator(labelCol=label_col, rawPredictionCol=score_col, metricName="areaUnderROC").evaluate(df_pred)
    pr  = BinaryClassificationEvaluator(labelCol=label_col, rawPredictionCol=score_col, metricName="areaUnderPR").evaluate(df_pred)
    brier = df_pred.select(F.pow(F.col(score_col) - F.col(label_col).cast("double"), 2).alias("sqerr")).agg(F.mean("sqerr")).first()[0]
    return {"auc_roc": float(roc), "auc_pr": float(pr), "brier": float(brier)}

def precision_at_k(df_pred: DataFrame, k_frac: float, label_col="label", score_col="score") -> float:
    """Tahmini precision@k: global sıralama yerine approxQuantile ile eşik belirler."""
    total = df_pred.count()
    k = max(1, int(total * k_frac))
    if total == 0:
        return 0.0
    q = df_pred.approxQuantile(score_col, [max(0.0, 1.0 - k_frac)], 1e-3)
    thr = float(q[0]) if q and q[0] is not None else 0.5
    selected = df_pred.where(F.col(score_col) >= F.lit(thr))
    sel_cnt = selected.count()
    if sel_cnt == 0:
        return 0.0
    tp = selected.agg(F.sum(F.col(label_col).cast("int")).alias("tp")).first()["tp"] or 0
    return float(tp) / float(sel_cnt)

def export_topk_candidates(
    df_pred: DataFrame,
    out_dir: str,
    id_col: str = "id",
    label_col: str = "label",
    score_col: str = "score",
    ks: List[float] = [0.01, 0.05],
):
    """Top-%K aday listelerini CSV olarak yazar (id, score, label)."""
    out_dir_posix = Path(out_dir).as_posix()
    total = df_pred.count()
    if total == 0:
        return
    for k in ks:
        id_exists = (id_col in df_pred.columns)
        k_rows = max(1, int(round(total * float(k))))
        base = df_pred
        tmp_id = None
        if not id_exists:
            tmp_id = "_tmp_row_id"
            base = base.withColumn(tmp_id, F.monotonically_increasing_id())
        order_id = id_col if id_exists else tmp_id
        w = Window.orderBy(F.desc(score_col), F.desc(order_id))
        ranked = base.withColumn("_rn", F.row_number().over(w))
        sel = ranked.where(F.col("_rn") <= F.lit(k_rows))
        out_df = sel.select(
            F.col(id_col) if id_exists else F.col(tmp_id).alias(id_col),
            F.col(score_col),
            F.col(label_col).cast("int").alias(label_col)
        )
        pct_str = str(round(float(k) * 100.0, 3)).rstrip('0').rstrip('.')
        pct_str = pct_str.replace('.', '_')
        path = os.path.join(out_dir_posix, f"top_{pct_str}pct.csv")
        try:
            out_df.coalesce(1).write.mode("overwrite").option("header","true").csv(path)
        except Exception:
            try:
                import pandas as _pd
                _pd.DataFrame(out_df.toPandas()).to_csv(os.path.join(Path(out_dir).as_posix(), f"top_{pct_str}pct_fallback.csv"), index=False)
            except Exception as e:
                raise e

def export_confusion_at_threshold(
    df_pred: DataFrame,
    threshold: float,
    out_dir: str,
    label_col: str = "label",
    score_col: str = "score",
):
    """Verilen eşikte confusion matrix ve metrikleri JSON olarak yazar."""
    out_dir_posix = Path(out_dir).as_posix()
    pred = df_pred.select(
        F.col(label_col).cast("int").alias("y"),
        (F.col(score_col) >= F.lit(float(threshold))).cast("int").alias("yhat")
    )
    r = pred.agg(
        F.sum(F.when((F.col("yhat")==1) & (F.col("y")==1), 1).otherwise(0)).alias("tp"),
        F.sum(F.when((F.col("yhat")==1) & (F.col("y")==0), 1).otherwise(0)).alias("fp"),
        F.sum(F.when((F.col("yhat")==0) & (F.col("y")==1), 1).otherwise(0)).alias("fn"),
        F.sum(F.when((F.col("yhat")==0) & (F.col("y")==0), 1).otherwise(0)).alias("tn")
    ).first()
    tp, fp, fn, tn = [int(r[x] or 0) for x in ("tp","fp","fn","tn")]
    prec = tp / max(tp+fp, 1)
    rec  = tp / max(tp+fn, 1)
    f1   = 2*prec*rec / max(prec+rec, 1e-9)
    payload = {"threshold": float(threshold), "tp": tp, "fp": fp, "fn": fn, "tn": tn, "precision": prec, "recall": rec, "f1": f1}
    path = os.path.join(out_dir_posix, "confusion_at_threshold.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def find_best_threshold(df_val: DataFrame, label_col="label", score_col="score") -> Tuple[float, dict]:
    fine = [round(x,3) for x in list(frange(0.80, 1.0, 0.005))]
    tail = [0.985, 0.99, 0.992, 0.995]
    base = [0.5, 0.7, 0.75]
    qs = sorted(set(base + fine + tail))
    quants = df_val.approxQuantile(score_col, qs, 1e-3)
    candidates = sorted(set([float(q) for q in quants if q is not None] + [0.5]))
    best_f1, best_t = -1.0, 0.5
    for t in candidates:
        pred = df_val.select(
            F.col(label_col).alias("y"),
            (F.col(score_col) >= F.lit(t)).cast("int").alias("yhat")
        )
        agg = pred.agg(
            F.sum((F.col("yhat")==1) & (F.col("y")==1)).alias("tp"),
            F.sum((F.col("yhat")==1) & (F.col("y")==0)).alias("fp"),
            F.sum((F.col("yhat")==0) & (F.col("y")==1)).alias("fn")
        ).first()
        tp, fp, fn = [int(agg[x] or 0) for x in ("tp","fp","fn")]
        prec = tp / max(tp+fp, 1)
        rec  = tp / max(tp+fn, 1)
        f1 = 2*prec*rec / max(prec+rec, 1e-9)
        if f1 > best_f1:
            best_f1, best_t = f1, t
    return best_t, {"best_f1": best_f1}

def find_best_threshold_grouped(
    df_val: DataFrame,
    label_col: str = "label",
    score_col: str = "score",
    bin_decimals: int = 3,
) -> Tuple[float, dict]:
    df = df_val.select(
        F.col(label_col).cast("int").alias("y"),
        F.col(score_col).cast("double").alias("s"),
    )
    total_pos = int(df.agg(F.sum("y").alias("p")).first()["p"] or 0)
    if total_pos == 0:
        return 0.5, {"best_f1": -1.0}

    df_b = df.withColumn("bin", F.round(F.col("s"), bin_decimals))
    agg = df_b.groupBy("bin").agg(
        F.count(F.lit(1)).alias("n"),
        F.sum("y").alias("pos"),
    )
    w = Window.orderBy(F.desc("bin")).rowsBetween(Window.unboundedPreceding, Window.currentRow)
    ranked = (
        agg.orderBy(F.desc("bin"))
           .withColumn("cum_pos", F.sum("pos").over(w))
           .withColumn("cum_n",   F.sum("n").over(w))
    )
    ranked = ranked.withColumn("prec", F.col("cum_pos")/F.greatest(F.col("cum_n"), F.lit(1)))
    ranked = ranked.withColumn("rec",  F.col("cum_pos")/F.lit(float(total_pos)))
    ranked = ranked.withColumn("f1", (2*F.col("prec")*F.col("rec"))/(F.greatest(F.col("prec")+F.col("rec"), F.lit(1e-9))))

    best = ranked.orderBy(F.desc("f1")).select("bin","f1").first()
    if not best or best["f1"] is None:
        return 0.5, {"best_f1": -1.0}
    return float(best["bin"]), {"best_f1": float(best["f1"]) }

def save_isotonic_model(model: IsotonicRegressionModel, out_dir: str):
    out_dir_posix = Path(out_dir).as_posix()
    model_path = os.path.join(out_dir_posix, "calibration_isotonic")
    print(f"[checkpoint] saving isotonic model to: {model_path}", flush=True)
    model.write().overwrite().save(model_path)
    payload = {
        "boundaries": list(map(float, model.boundaries.toArray().tolist())),
        "predictions": list(map(float, model.predictions.toArray().tolist())),
        "isotonic": bool(model.getIsotonic())
    }
    json_path = os.path.join(out_dir_posix, "calibration_curve.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"[checkpoint] calibration curve saved: {json_path}", flush=True)


# --------------------------
# Main experiment
# --------------------------
def run_experiment(
    spark: SparkSession,
    df_raw: DataFrame,
    out_dir: str = "artifacts/broadband_baseline",
    seed: int = 42,
) -> dict:
    out_dir = Path(out_dir).as_posix()
    Path(out_dir).mkdir(parents=True, exist_ok=True)

    # 1) Feature engineering (Broadband-only)
    print("[checkpoint] starting feature engineering for Broadband", flush=True)
    try:
        sample_frac_env = float(os.getenv("SAMPLE_FRAC", "0.0"))
    except Exception:
        sample_frac_env = 0.0
    df_feat, feat_cols = build_broadband_features(df_raw, sample_frac=sample_frac_env)
    print("[checkpoint] feature engineering done", flush=True)

    # NaN/Inf -> null yerine: doğrudan güvenli değerlere çevir (0.0)
    for c in feat_cols + ["label"]:
        if c in df_feat.columns:
            df_feat = df_feat.withColumn(c, F.when(F.isnan(F.col(c)), F.lit(0.0)).otherwise(F.col(c)))

    # Split'ten ÖNCE label null olan satırları düş (stratified split için kritik)
    if "label" in df_feat.columns:
        df_feat = df_feat.where(F.col("label").isNotNull())

    # Materialize – ağır lineage'i erken kır
    df_feat = df_feat.cache()
    n_total = df_feat.count()
    print(f"[checkpoint] df_feat count: {n_total}", flush=True)

    neg, pos, spw = compute_class_weights(df_feat, label_col="label")

    # 2) Split
    if has_col(df_feat, "event_time"):
        if dict(df_feat.dtypes)["event_time"] == "string":
            df_feat = df_feat.withColumn("event_time", F.to_timestamp("event_time"))
        train, val, test = time_based_split(df_feat, time_col="event_time")
        split_mode = "time-based(event_time)"
    else:
        if "id" not in df_feat.columns:
            df_feat = df_feat.withColumn("id", F.monotonically_increasing_id())
        train, val, test = stratified_split(df_feat, label_col="label", seed=seed)
        split_mode = "stratified"

    # 3) Weights & assemble
    print("[checkpoint] assembling train/val/test", flush=True)
    train_w = add_weight_col(train, "label", spw)
    val_w   = add_weight_col(val,   "label", spw)
    test_w  = add_weight_col(test,  "label", spw)

    train_vec = assemble(train_w, feat_cols, "features")
    val_vec   = assemble(val_w,   feat_cols, "features")
    test_vec  = assemble(test_w,  feat_cols, "features")
    print("[checkpoint] assemble done", flush=True)

    # 4) Train GBT
    def _get_int(name: str, default: int) -> int:
        try:
            return int(os.getenv(name, str(default)))
        except Exception:
            return default
    def _get_float(name: str, default: float) -> float:
        try:
            return float(os.getenv(name, str(default)))
        except Exception:
            return default

    gbt = GBTClassifier(
        labelCol="label",
        featuresCol="features",
        weightCol="weight",
        maxDepth=_get_int("GBT_MAX_DEPTH", 6),
        maxIter=_get_int("GBT_MAX_ITER", 120),
        stepSize=_get_float("GBT_STEP_SIZE", 0.1),
        subsamplingRate=_get_float("GBT_SUBSAMPLING", 0.8),
        seed=seed
    )

    do_search = os.getenv("HPARAM_SEARCH", "0") == "1"
    if do_search:
        print("[checkpoint] starting small hyperparam search", flush=True)
        grid = [
            {"maxDepth": 6, "maxIter": 80,  "stepSize": 0.10, "subsamplingRate": 0.80},
            {"maxDepth": 7, "maxIter": 120, "stepSize": 0.10, "subsamplingRate": 0.70},
            {"maxDepth": 8, "maxIter": 120, "stepSize": 0.08, "subsamplingRate": 0.70},
            {"maxDepth": 6, "maxIter": 120, "stepSize": 0.05, "subsamplingRate": 0.80},
            {"maxDepth": 6, "maxIter": 100, "stepSize": 0.10, "subsamplingRate": 0.90},
            {"maxDepth": 7, "maxIter": 100, "stepSize": 0.08, "subsamplingRate": 0.80},
        ]
        best_pr, best_model, best_cfg = -1.0, None, None
        evaluator_pr = BinaryClassificationEvaluator(labelCol="label", rawPredictionCol="score", metricName="areaUnderPR")
        for cfg in grid:
            try:
                print(f"[search] try {cfg}", flush=True)
                cand = GBTClassifier(
                    labelCol="label",
                    featuresCol="features",
                    weightCol="weight",
                    maxDepth=int(cfg["maxDepth"]),
                    maxIter=int(cfg["maxIter"]),
                    stepSize=float(cfg["stepSize"]),
                    subsamplingRate=float(cfg["subsamplingRate"]),
                    seed=seed,
                )
                m = cand.fit(train_vec)
                vp = m.transform(val_vec).select(
                    F.col("label").cast("double").alias("label"),
                    vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score")
                )
                pr_auc = float(evaluator_pr.evaluate(vp))
                print(f"[search] pr_auc={pr_auc:.6f}", flush=True)
                if pr_auc > best_pr:
                    best_pr, best_model, best_cfg = pr_auc, m, cfg
            except Exception as e:
                print(f"[search] failed for {cfg}: {repr(e)}", flush=True)
        if best_model is not None:
            print(f"[checkpoint] best config: {best_cfg} (PR AUC={best_pr:.6f})", flush=True)
            model = best_model
        else:
            print("[checkpoint] search failed -> using baseline params", flush=True)
            print("[checkpoint] training GBT", flush=True)
            model = gbt.fit(train_vec)
            print("[checkpoint] GBT trained", flush=True)
    else:
        print("[checkpoint] training GBT", flush=True)
        model = gbt.fit(train_vec)
        print("[checkpoint] GBT trained", flush=True)

    # 5) Raw scores (prob_1) for val & test
    has_id = "id" in val_vec.columns
    sel_cols = ["label", vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score_raw")]
    if has_id:
        val_pred  = model.transform(val_vec).select(F.col("id"), *sel_cols)
        test_pred = model.transform(test_vec).select(F.col("id"), *sel_cols)
    else:
        val_pred  = model.transform(val_vec).select(*sel_cols)
        test_pred = model.transform(test_vec).select(*sel_cols)

    # 6) Isotonic calibration
    if has_id:
        val_for_fit = val_pred.select(
            F.col("id"),
            F.col("label").cast("double").alias("label"),
            F.col("score_raw").alias("feature")
        )
    else:
        val_for_fit = val_pred.select(
            F.col("label").cast("double").alias("label"),
            F.col("score_raw").alias("feature")
        )

    iso = IsotonicRegression(labelCol="label", featuresCol="feature", predictionCol="prediction", isotonic=True)
    print("[checkpoint] fitting isotonic calibration", flush=True)
    try:
        iso_sample = float(os.getenv("ISOTONIC_SAMPLE_FRAC", "1.0"))
    except Exception:
        iso_sample = 1.0
    fit_df = val_for_fit
    if 0.0 < iso_sample < 1.0:
        fit_df = val_for_fit.sample(withReplacement=False, fraction=iso_sample, seed=seed)
    iso_model = iso.fit(fit_df)

    val_eval_tmp = iso_model.transform(val_for_fit)
    if has_id:
        val_eval = val_eval_tmp.select(
            "id",
            F.col("label").cast("double").alias("label"),
            F.col("prediction").cast("double").alias("score")
        ).cache()
    else:
        val_eval = val_eval_tmp.select(
            F.col("label").cast("double").alias("label"),
            F.col("prediction").cast("double").alias("score")
        ).cache()
    _ = val_eval.count()

    if has_id:
        test_for_fit = test_pred.select(
            F.col("id"),
            F.col("label").cast("double").alias("label"),
            F.col("score_raw").alias("feature")
        )
    else:
        test_for_fit = test_pred.select(
            F.col("label").cast("double").alias("label"),
            F.col("score_raw").alias("feature")
        )
    test_cal_tmp = iso_model.transform(test_for_fit)
    if has_id:
        test_cal = test_cal_tmp.select(
            "id",
            F.col("label").cast("double").alias("label"),
            F.col("prediction").cast("double").alias("score")
        ).cache()
    else:
        test_cal = test_cal_tmp.select(
            F.col("label").cast("double").alias("label"),
            F.col("prediction").cast("double").alias("score")
        ).cache()
    _ = test_cal.count()

    # 7) Evaluation
    print("[checkpoint] evaluating calibrated/uncalibrated", flush=True)
    test_uncal = test_pred.select(F.col("label").cast("double").alias("label"),
                                  F.col("score_raw").alias("score"))
    met_uncal = evaluate_basic(test_uncal, label_col="label", score_col="score")
    met_cal   = evaluate_basic(test_cal,   label_col="label", score_col="score")

    # threshold seçimi
    try:
        best_thr, thr_info = find_best_threshold_grouped(val_eval, label_col="label", score_col="score", bin_decimals=3)
        if thr_info.get("best_f1", -1.0) < 0:
            raise RuntimeError("grouped threshold invalid")
    except Exception:
        try:
            best_thr, thr_info = find_best_threshold(val_eval, label_col="label", score_col="score")
        except Exception:
            best_thr, thr_info = 0.5, {"best_f1": -1.0}
    p_at_005 = precision_at_k(test_cal, 0.005, label_col="label", score_col="score")
    p_at_01  = precision_at_k(test_cal, 0.01,  label_col="label", score_col="score")
    p_at_02  = precision_at_k(test_cal, 0.02,  label_col="label", score_col="score")
    p_at_05  = precision_at_k(test_cal, 0.05,  label_col="label", score_col="score")

    # 8) Persist artifacts
    model_dir = os.path.join(out_dir, "gbt_model")
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    gbt_saved = False
    if os.getenv("SKIP_SAVE", "0") != "1":
        try:
            print(f"[checkpoint] saving GBT model to: {model_dir}", flush=True)
            model.write().overwrite().save(Path(model_dir).as_posix())
            gbt_saved = True
        except Exception as e:
            warn_path = os.path.join(out_dir, "gbt_save_skipped.txt")
            with open(warn_path, "w", encoding="utf-8") as wf:
                wf.write(f"GBT model save skipped due to error: {repr(e)}\n")
            print(f"[warn] GBT save skipped -> {warn_path}", flush=True)
        try:
            save_isotonic_model(iso_model, out_dir)
        except Exception as e:
            print(f"[warn] isotonic save failed: {repr(e)}", flush=True)
    else:
        print("[checkpoint] SKIP_SAVE=1 -> model saving skipped", flush=True)

    # 9) Operasyonel çıktılar
    try:
        ks_env = parse_topk_list(os.getenv("TOPK_LIST"))
        export_topk_candidates(test_cal, out_dir, id_col="id", label_col="label", score_col="score", ks=ks_env)
    except Exception as e:
        print(f"[warn] export_topk_candidates failed: {repr(e)}", flush=True)
    try:
        export_confusion_at_threshold(test_cal, best_thr, out_dir, label_col="label", score_col="score")
    except Exception as e:
        print(f"[warn] export_confusion_at_threshold failed: {repr(e)}", flush=True)

    report = {
        "meta": {
            "split_mode": split_mode,
            "n_total": int(n_total),
            "neg": int(neg),
            "pos": int(pos),
            "scale_pos_weight": float(spw),
            "features": feat_cols,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        },
        "metrics": {
            "test_uncalibrated": met_uncal,
            "test_calibrated": met_cal,
            "precision_at_0_5pct": p_at_005,
            "precision_at_1pct": p_at_01,
            "precision_at_2pct": p_at_02,
            "precision_at_5pct": p_at_05,
            "best_threshold_val": best_thr,
            "best_threshold_val_f1": thr_info["best_f1"]
        },
        "paths": {
            "model_dir": model_dir,
            "calibration_dir": os.path.join(out_dir, "calibration_isotonic"),
            "calibration_curve_json": os.path.join(out_dir, "calibration_curve.json"),
            "report_json": os.path.join(out_dir, "report.json"),
            "gbt_saved": gbt_saved
        }
    }
    report_path = os.path.join(out_dir, "report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print("=== BROADBAND REPORT ===", flush=True)
    print(json.dumps(report, indent=2, ensure_ascii=False), flush=True)
    print(f"[checkpoint] report saved -> {report_path}", flush=True)
    return report


# --------------------------
# CLI entry
# --------------------------
if __name__ == "__main__":
    spark = get_spark()

    # Ham veriyi yükle: data/capstone*.jsonl|json
    here = Path(__file__).resolve().parent
    candidates = [here / "data", here, here.parent / "data"]
    data_dir = next((p for p in candidates if p.exists()), None)
    if data_dir is None:
        raise FileNotFoundError(f"data klasörü bulunamadı. Denenen: {', '.join(map(str, candidates))}")

    files = sorted(list(data_dir.glob("capstone*.jsonl"))) + sorted(list(data_dir.glob("capstone*.json")))
    files = [p for p in files if p.stat().st_size > 0]
    if not files:
        raise FileNotFoundError(f"capstone*.jsonl/json dosyası bulunamadı: {data_dir}")

    schema = T.StructType([
        T.StructField("id", T.StringType(), True),
        T.StructField("age", T.IntegerType(), True),
        T.StructField("tenure", T.IntegerType(), True),
        T.StructField("service_type", T.StringType(), True),
        T.StructField("avg_call_duration", T.DoubleType(), True),
        T.StructField("data_usage", T.DoubleType(), True),
        T.StructField("roaming_usage", T.DoubleType(), True),
        T.StructField("monthly_charge", T.DoubleType(), True),
        T.StructField("overdue_payments", T.IntegerType(), True),
        T.StructField("auto_payment", T.BooleanType(), True),
        T.StructField("avg_top_up_count", T.IntegerType(), True),
        T.StructField("call_drops", T.IntegerType(), True),
        T.StructField("customer_support_calls", T.IntegerType(), True),
        T.StructField("satisfaction_score", T.DoubleType(), True),
        T.StructField("apps", T.ArrayType(T.StringType()), True),
        T.StructField("churn", T.BooleanType(), True),
    ])
    df_raw = spark.read.schema(schema).option("mode","PERMISSIVE").json([str(p) for p in files])

    # OUT_DIR ortam değişkeni verilmişse onu kullan
    run_experiment(spark, df_raw, out_dir=os.getenv("OUT_DIR", "artifacts/broadband_baseline"))
    spark.stop()
