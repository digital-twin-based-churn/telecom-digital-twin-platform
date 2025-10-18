from __future__ import annotations

import os
import sys
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Query, HTTPException, UploadFile, File
from pydantic import BaseModel, Field

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F, types as T
from pyspark.ml.feature import VectorAssembler, Imputer
from pyspark.ml.classification import GBTClassificationModel
from pyspark.ml.regression import IsotonicRegressionModel
from pyspark.ml.functions import vector_to_array

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import path: project_root/data/feature_engineering.py
try:
    from data.feature_engineering import build_postpaid_features
except Exception:
    # Fallback: if working dir is data/
    from feature_engineering import build_postpaid_features


def get_spark(app_name: str = "Churn Scoring Service") -> SparkSession:
    # Respect local temp dirs if provided
    local_dirs = os.getenv("SPARK_LOCAL_DIRS") or os.getenv("SPARK_LOCAL_DIR")
    builder = (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.driver.memory", os.getenv("SPARK_DRIVER_MEM", "4g"))
        .config("spark.executor.memory", os.getenv("SPARK_EXECUTOR_MEM", "4g"))
        .config("spark.sql.shuffle.partitions", os.getenv("SPARK_SHUFFLE_PARTS", "8"))
        .config("spark.hadoop.fs.file.impl.disable.cache", "true")
        .config("spark.hadoop.fs.hdfs.impl.disable.cache", "true")
        .config("parquet.enable.summary-metadata", "false")
    )
    if local_dirs:
        builder = builder.config("spark.local.dir", local_dirs)
    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    # Disable checksum verification for local file system
    hadoop_conf = spark.sparkContext._jsc.hadoopConfiguration()
    hadoop_conf.set("fs.file.impl.disable.cache", "true")
    hadoop_conf.set("fs.hdfs.impl.disable.cache", "true")
    hadoop_conf.setBoolean("dfs.client.read.checksum", False)
    hadoop_conf.setBoolean("fs.file.impl.disable.cache", True)
    return spark


def _find_latest_artifacts(base: Path, prefix: str) -> Optional[Path]:
    if not base.exists():
        return None
    cands = [p for p in base.iterdir() if p.is_dir() and p.name.startswith(prefix)]
    if not cands:
        return None
    cands.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return cands[0]


def assemble(df: DataFrame, feature_cols: List[str], out_col: str = "features") -> DataFrame:
    # Mirror experiment.py: impute median then assemble, skipping invalid rows
    imputer = Imputer(inputCols=feature_cols, outputCols=feature_cols, strategy="median")
    df_imp = imputer.fit(df).transform(df)
    assembler = VectorAssembler(inputCols=feature_cols, outputCol=out_col, handleInvalid="skip")
    return assembler.transform(df_imp)


class ScoreRequest(BaseModel):
    id: Optional[str] = Field(default=None)
    age: Optional[int] = None
    tenure: Optional[int] = None
    service_type: Optional[str] = Field(default="Postpaid")
    avg_call_duration: Optional[float] = None
    data_usage: Optional[float] = None
    roaming_usage: Optional[float] = None
    monthly_charge: Optional[float] = None
    overdue_payments: Optional[int] = None
    auto_payment: Optional[bool] = None
    avg_top_up_count: Optional[int] = None
    call_drops: Optional[int] = None
    customer_support_calls: Optional[int] = None
    satisfaction_score: Optional[float] = None
    apps: Optional[List[str]] = None


app = FastAPI(title="Churn Scoring Service", version="1.0.0")


# Globals initialized at startup
SPARK: Optional[SparkSession] = None
GBT: Optional[GBTClassificationModel] = None
ISO: Optional[IsotonicRegressionModel] = None
FEATURE_COLS: Optional[List[str]] = None
BEST_THRESHOLD: float = 0.058
ART_DIR: Optional[Path] = None


@app.on_event("startup")
def startup_event():
    global SPARK, GBT, ISO, FEATURE_COLS, BEST_THRESHOLD, ART_DIR

    SPARK = get_spark()

    # Resolve artifacts directory: OUT_DIR env or latest postpaid_prod_*
    out_dir_env = os.getenv("OUT_DIR")
    if out_dir_env:
        ART_DIR = Path(out_dir_env)
    else:
        # Use absolute path from project root
        project_root = Path(__file__).parent.parent
        ART_DIR = _find_latest_artifacts(project_root / "artifacts", prefix="postpaid_prod_")
    if ART_DIR is None or not ART_DIR.exists():
        raise RuntimeError("Artifacts directory not found. Set OUT_DIR to a valid path.")

    # Load model and isotonic
    gbt_path = (ART_DIR / "gbt_model").as_posix()
    ISO = None
    try:
        GBT = GBTClassificationModel.load(gbt_path)
    except Exception as e:
        raise RuntimeError(f"Failed to load GBT model from {gbt_path}: {e}")

    iso_path = (ART_DIR / "calibration_isotonic").as_posix()
    try:
        ISO = IsotonicRegressionModel.load(iso_path)
    except Exception:
        ISO = None

    # Load best threshold if available
    report_path = ART_DIR / "report.json"
    if report_path.exists():
        try:
            rep = json.loads(report_path.read_text(encoding="utf-8"))
            BEST_THRESHOLD = float(rep.get("metrics", {}).get("best_threshold_val", BEST_THRESHOLD))
        except Exception:
            pass


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "spark": bool(SPARK is not None),
        "gbt_loaded": bool(GBT is not None),
        "iso_loaded": bool(ISO is not None),
        "artifacts": str(ART_DIR) if ART_DIR else None,
        "best_threshold": BEST_THRESHOLD,
    }


def _make_single_spark_df(spark: SparkSession, payload: Dict[str, Any]) -> DataFrame:
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
        # label/event_time optional/not required at scoring
    ])
    # ensure service_type default
    if not payload.get("service_type"):
        payload["service_type"] = "Postpaid"
    return spark.createDataFrame([payload], schema=schema)


@app.post("/score")
def score(req: ScoreRequest) -> Dict[str, Any]:
    if SPARK is None or GBT is None:
        raise HTTPException(status_code=500, detail="Service not ready")

    try:
        df_raw = _make_single_spark_df(SPARK, req.model_dump())
        df_feat, feat_cols = build_postpaid_features(df_raw, sample_frac=0.0)
        df_vec = assemble(df_feat, feat_cols, out_col="features")

        pred = GBT.transform(df_vec).select(
            F.col("id"),
            vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score_raw")
        )

        score = pred.select(F.col("score_raw").alias("feature"))
        prob_cal = None
        if ISO is not None:
            prob_cal = ISO.transform(score).select(F.col("prediction").cast("double").alias("score")).first()[0]
        else:
            prob_cal = pred.first()["score_raw"]

        churn_flag = 1 if float(prob_cal) >= float(BEST_THRESHOLD) else 0
        return {
            "id": req.id,
            "probability": float(prob_cal),
            "threshold": float(BEST_THRESHOLD),
            "churn_flag": int(churn_flag),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Score error: {str(e)}")


def _ensure_postpaid(df: DataFrame) -> DataFrame:
    if "service_type" not in df.columns:
        df = df.withColumn("service_type", F.lit("Postpaid"))
    return df


@app.post("/batch-score")
def batch_score(
    file: UploadFile = File(...),
    k: float = Query(0.005, ge=0.0001, le=0.2),
    save: bool = Query(True),
    limit_preview: int = Query(100, ge=1, le=2000),
) -> Dict[str, Any]:
    if SPARK is None or GBT is None:
        raise HTTPException(status_code=500, detail="Service not ready")

    # Save upload to temp and read with Spark
    project_root = Path(__file__).parent.parent
    tmp_dir = (project_root / "artifacts" / "_tmp_uploads")
    tmp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = tmp_dir / ("upload_" + file.filename.replace(" ", "_") )
    with open(tmp_path, "wb") as f:
        f.write(file.file.read())

    df_raw = SPARK.read.option("header", True).csv(tmp_path.as_posix())
    # Fix potential UTF-8 BOM in headers (e.g., \ufeffid)
    for c in list(df_raw.columns):
        if c and c.startswith("\ufeff"):
            df_raw = df_raw.withColumnRenamed(c, c.lstrip("\ufeff"))
    # Trim accidental spaces in headers
    for c in list(df_raw.columns):
        if c != c.strip():
            df_raw = df_raw.withColumnRenamed(c, c.strip())
    df_raw = _ensure_postpaid(df_raw)

    # If apps is a delimited string, convert to array
    if "apps" in df_raw.columns:
        try:
            dtype = dict(df_raw.dtypes).get("apps")
        except Exception:
            dtype = None
        if dtype == "string":
            df_raw = df_raw.withColumn(
                "apps",
                F.when(F.col("apps").isNull() | (F.col("apps") == ""), F.array())
                 .otherwise(F.split(F.col("apps"), r"\\||,|;"))
            )
    else:
        df_raw = df_raw.withColumn("apps", F.array())

    # Feature pipeline
    try:
        df_feat, feat_cols = build_postpaid_features(df_raw, sample_frac=0.0)
    except Exception:
        # Fallback: ensure required columns exist
        if "apps" not in df_raw.columns:
            df_raw = df_raw.withColumn("apps", F.array())
        df_feat, feat_cols = build_postpaid_features(df_raw, sample_frac=0.0)
    df_vec = assemble(df_feat, feat_cols, out_col="features")

    pred = GBT.transform(df_vec).select(
        (F.col("id") if "id" in df_vec.columns else F.monotonically_increasing_id().alias("id")),
        vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score_raw"),
        F.col("label").cast("int").alias("label") if "label" in df_vec.columns else F.lit(None).cast("int").alias("label"),
    )
    score_df = pred.select(F.col("id"), F.col("score_raw").alias("feature"))
    if ISO is not None:
        cal = ISO.transform(score_df).select(F.col("prediction").cast("double").alias("score"))
        out = pred.select("id", "label").join(cal.withColumn("rid", F.monotonically_increasing_id()), F.lit(True))
        # Join by row order; safer to recompute with a single DataFrame using window if needed
        out = SPARK.createDataFrame(pred.rdd.zip(cal.rdd).map(lambda x: (x[0][0], x[1][0], x[0][2])), schema=T.StructType([
            T.StructField("id", T.StringType(), True),
            T.StructField("score", T.DoubleType(), True),
            T.StructField("label", T.IntegerType(), True),
        ]))
    else:
        out = pred.select(F.col("id"), F.col("score_raw").alias("score"), F.col("label"))

    # Exact Top‑K
    total = out.count()
    k_rows = max(1, int(round(total * float(k))))
    w = F.window.partitionBy().orderBy(F.desc("score")) if hasattr(F, 'window') else None
    from pyspark.sql import Window as _W
    w2 = _W.orderBy(F.desc("score"))
    ranked = out.withColumn("_rn", F.row_number().over(w2))
    topk_df = ranked.where(F.col("_rn") <= F.lit(k_rows)).select("id", "score", "label")

    saved_path = None
    if save:
        project_root = Path(__file__).parent.parent
        base = ART_DIR or (project_root / "artifacts")
        out_dir = Path(base).joinpath(f"batch_topk_{os.getpid()}")
        out_dir_posix = out_dir.as_posix()
        try:
            topk_df.coalesce(1).write.mode("overwrite").option("header","true").csv(out_dir_posix)
            saved_path = out_dir_posix
        except Exception:
            try:
                import pandas as _pd
                _pd.DataFrame(topk_df.toPandas()).to_csv(str(out_dir.with_suffix(".csv")), index=False)
                saved_path = str(out_dir.with_suffix(".csv"))
            except Exception:
                saved_path = None

    preview = [
        {"id": r["id"], "score": float(r["score"]) if r["score"] is not None else None, "label": (int(r["label"]) if r["label"] is not None else None)}
        for r in topk_df.orderBy(F.desc("score")).limit(limit_preview).collect()
    ]

    return {
        "total": int(total),
        "k": float(k),
        "k_rows": int(k_rows),
        "saved_path": saved_path,
        "items": preview,
    }

@app.get("/topk")
def topk(k: float = Query(0.005, ge=0.0001, le=0.2), offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=5000)) -> Dict[str, Any]:
    if ART_DIR is None or SPARK is None:
        raise HTTPException(status_code=500, detail="Service not configured")
    pct_str = str(round(float(k) * 100.0, 3)).rstrip('0').rstrip('.').replace('.', '_')
    folder = ART_DIR / f"top_{pct_str}pct.csv"
    if not folder.exists():
        raise HTTPException(status_code=404, detail=f"Top-K folder not found: {folder}")
    # Pick the first part file
    part = None
    for p in folder.iterdir():
        if p.is_file() and p.name.startswith("part-") and p.suffix == ".csv":
            part = p
            break
    if part is None:
        raise HTTPException(status_code=404, detail="Top-K part file not found")

    try:
        # Read with Spark (CSV files have been cleaned of checksum issues)
        df = SPARK.read.option("header", True).csv(part.as_posix())
        df = df.select(
            F.col("id").alias("id"),
            F.col("score").cast("double").alias("score"),
            F.col("label").cast("int").alias("label")
        )
        total = df.count()
        
        # Sort and slice
        df_sorted = df.orderBy(F.desc("score"))
        rows = df_sorted.limit(offset + limit).collect()
        
        # Skip offset rows in driver
        data = []
        for i, r in enumerate(rows):
            if i < offset:
                continue
            data.append({
                "id": r["id"],
                "score": float(r["score"]) if r["score"] is not None else None,
                "label": int(r["label"]) if r["label"] is not None else None
            })
            if len(data) >= limit:
                break
        
        return {"total": int(total), "offset": int(offset), "limit": int(limit), "items": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read top-k file: {str(e)}")



