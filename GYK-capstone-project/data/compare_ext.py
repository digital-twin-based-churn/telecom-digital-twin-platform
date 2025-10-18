import os
import json
from pathlib import Path

import numpy as np

try:
    from sklearn.metrics import roc_auc_score, average_precision_score
    from sklearn.model_selection import train_test_split
except Exception as e:  # pragma: no cover
    raise RuntimeError("scikit-learn gerekli: pip install scikit-learn") from e

from pyspark.sql import SparkSession, functions as F, types as T
from feature_engineering import build_postpaid_features


def compute_metrics(y_true: np.ndarray, y_score: np.ndarray) -> dict:
    try:
        auc_roc = float(roc_auc_score(y_true, y_score))
    except Exception:
        auc_roc = float('nan')
    try:
        auc_pr = float(average_precision_score(y_true, y_score))
    except Exception:
        auc_pr = float('nan')
    # precision@k (1% ve 5%)
    n = len(y_true)
    res = {"auc_roc": auc_roc, "auc_pr": auc_pr}
    if n > 0:
        order = np.argsort(-y_score)
        y_sorted = y_true[order]
        for frac in (0.01, 0.05):
            k = max(1, int(n * frac))
            prec = float(np.sum(y_sorted[:k]) / k)
            res[f"precision_at_{int(frac*100)}pct"] = prec
    return res


def main():
    builder = SparkSession.builder.appName("CompareExt").master("local[*]")
    shuffle_parts = os.getenv("SPARK_SHUFFLE_PARTS")
    if shuffle_parts:
        builder = builder.config("spark.sql.shuffle.partitions", shuffle_parts)
    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")

    # Veri şeması
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

    base = Path("data")
    files = sorted(list(base.glob("capstone*.jsonl"))) + sorted(list(base.glob("capstone*.json")))
    if not files:
        raise FileNotFoundError("data/capstone*.json[l] bulunamadı")

    df_raw = spark.read.schema(schema).option("mode", "PERMISSIVE").json([str(p) for p in files])

    # Örnekleme ve özellik inşası (Spark)
    sample_frac = float(os.getenv("EXT_SAMPLE_FRAC", "0.02"))
    max_rows = int(os.getenv("EXT_MAX_ROWS", "200000"))
    df_feat, feat_cols = build_postpaid_features(df_raw, sample_frac=sample_frac)
    df_feat = df_feat.where(F.col("label").isNotNull())

    # Toplanan pandas seti
    cols = feat_cols + ["label"]
    if max_rows > 0:
        df_feat = df_feat.limit(max_rows)
    pdf = df_feat.select(*cols).toPandas()
    spark.stop()

    if pdf.empty:
        print(json.dumps({"error": "empty_sample"}))
        return

    y = pdf["label"].astype(int).to_numpy()
    X = pdf.drop(columns=["label"]).to_numpy()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    results = {}

    # LightGBM
    try:
        import lightgbm as lgb
        lgbm_params = {
            "objective": "binary",
            "metric": ["auc", "average_precision"],
            "learning_rate": float(os.getenv("LGB_LR", "0.05")),
            "num_leaves": int(os.getenv("LGB_NUM_LEAVES", "31")),
            "max_depth": int(os.getenv("LGB_MAX_DEPTH", "-1")),
            "min_data_in_leaf": int(os.getenv("LGB_MIN_LEAF", "20")),
            "verbosity": -1,
            "feature_fraction": float(os.getenv("LGB_FEATURE_FRAC", "0.8")),
            "bagging_fraction": float(os.getenv("LGB_BAGGING_FRAC", "0.8")),
            "bagging_freq": 1,
            "is_unbalance": os.getenv("LGB_IS_UNBALANCED", "1") in ("1", "true", "True"),
            "n_estimators": int(os.getenv("LGB_N_EST", "500")),
        }
        lgbm = lgb.LGBMClassifier(**lgbm_params)
        # verbose argümanı bazı sürümlerde desteklenmez; yalnızca 'auc' ile eğit, PR'yi sklearn ile hesapla
        lgbm.fit(X_train, y_train, eval_set=[(X_test, y_test)], eval_metric="auc")
        y_score = lgbm.predict_proba(X_test)[:, 1]
        results["LightGBM"] = compute_metrics(y_test, y_score)
    except Exception as e:  # pragma: no cover
        results["LightGBM"] = {"error": repr(e)}

    # XGBoost
    try:
        import xgboost as xgb
        # scale_pos_weight ~ neg/pos (örnek seti üzerinden)
        pos = float(np.sum(y_train == 1))
        neg = float(np.sum(y_train == 0))
        spw = neg / max(pos, 1.0)
        xgb_params = {
            "n_estimators": int(os.getenv("XGB_N_EST", "500")),
            "max_depth": int(os.getenv("XGB_MAX_DEPTH", "6")),
            "learning_rate": float(os.getenv("XGB_LR", "0.1")),
            "subsample": float(os.getenv("XGB_SUBSAMPLE", "0.8")),
            "colsample_bytree": float(os.getenv("XGB_COLS", "0.8")),
            "reg_lambda": float(os.getenv("XGB_LAMBDA", "1.0")),
            "tree_method": os.getenv("XGB_TREE_METHOD", "hist"),
            "eval_metric": ["auc", "aucpr"],
            "scale_pos_weight": float(os.getenv("XGB_SPW", str(spw))),
            "n_jobs": int(os.getenv("XGB_N_JOBS", "-1")),
            "verbosity": 1,
        }
        xgbc = xgb.XGBClassifier(**xgb_params)
        xgbc.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
        y_score = xgbc.predict_proba(X_test)[:, 1]
        results["XGBoost"] = compute_metrics(y_test, y_score)
    except Exception as e:  # pragma: no cover
        results["XGBoost"] = {"error": repr(e)}

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()


