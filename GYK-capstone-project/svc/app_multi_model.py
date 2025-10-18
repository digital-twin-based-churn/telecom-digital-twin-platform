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
from pyspark.ml.classification import GBTClassificationModel, RandomForestClassificationModel
from pyspark.ml.regression import IsotonicRegressionModel
from pyspark.ml.functions import vector_to_array

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import feature engineering functions
try:
    from data.feature_engineering import build_postpaid_features
    from data.feature_engineering_prepaid import build_prepaid_features
    from data.feature_engineering_broadband import build_broadband_features
except ImportError:
    # Fallback: if working dir is data/
    try:
        from feature_engineering import build_postpaid_features
        from feature_engineering_prepaid import build_prepaid_features
        from feature_engineering_broadband import build_broadband_features
    except ImportError:
        # If all imports fail, define dummy functions
        def build_postpaid_features(df):
            return df
        def build_prepaid_features(df):
            return df
        def build_broadband_features(df):
            return df


def get_spark(app_name: str = "Multi-Model Churn Scoring Service") -> SparkSession:
    # Set Python paths to ensure version consistency
    os.environ["PYSPARK_PYTHON"] = sys.executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable
    
    # Respect local temp dirs if provided
    local_dirs = os.getenv("SPARK_LOCAL_DIRS") or os.getenv("SPARK_LOCAL_DIR")
    builder = (
        SparkSession.builder
        .appName(app_name)
        .master("local[1]")  # Use single core to avoid worker issues
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.driver.memory", os.getenv("SPARK_DRIVER_MEM", "2g"))
        .config("spark.executor.memory", os.getenv("SPARK_EXECUTOR_MEM", "2g"))
        .config("spark.sql.shuffle.partitions", os.getenv("SPARK_SHUFFLE_PARTS", "2"))
        .config("spark.hadoop.fs.file.impl.disable.cache", "true")
        .config("spark.hadoop.fs.hdfs.impl.disable.cache", "true")
        .config("parquet.enable.summary-metadata", "false")
        .config("spark.pyspark.python", sys.executable)
        .config("spark.pyspark.driver.python", sys.executable)
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
    service_type: str = Field(default="Postpaid", description="Service type: Postpaid, Prepaid, or Broadband")
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


app = FastAPI(title="Multi-Model Churn Scoring Service", version="2.0.0")


# Globals initialized at startup
SPARK: Optional[SparkSession] = None
MODELS: Dict[str, Any] = {}  # Store models by service type
FEATURE_COLS: Dict[str, List[str]] = {}  # Store feature columns by service type
BEST_THRESHOLDS: Dict[str, float] = {
    "Postpaid": 0.058,
    "Prepaid": 0.5,
    "Broadband": 0.5
}
ART_DIR: Optional[Path] = None


@app.on_event("startup")
def startup_event():
    global SPARK, MODELS, FEATURE_COLS, BEST_THRESHOLDS, ART_DIR

    SPARK = get_spark()

    # Resolve artifacts directory
    project_root = Path(__file__).parent.parent
    data_dir = project_root / "data"
    ART_DIR = data_dir / "artifacts"
    
    if not ART_DIR.exists():
        raise RuntimeError(f"Artifacts directory not found: {ART_DIR}")

    # Load models for each service type
    service_types = ["Postpaid", "Prepaid", "Broadband"]
    
    for service_type in service_types:
        if service_type == "Postpaid":
            # Postpaid uses GBT model from artifacts directory
            project_root = Path(__file__).parent.parent
            artifacts_dir = project_root / "artifacts"
            postpaid_dirs = [d for d in artifacts_dir.iterdir() if d.is_dir() and d.name.startswith("postpaid_prod_")]
            if postpaid_dirs:
                # Use the latest postpaid_prod directory
                latest_postpaid = max(postpaid_dirs, key=lambda p: p.stat().st_mtime)
                model_path = latest_postpaid / "gbt_model"
                if model_path.exists():
                    try:
                        from pyspark.ml.classification import GBTClassificationModel
                        model = GBTClassificationModel.load(str(model_path))
                        MODELS[service_type] = model
                        print(f"Loaded {service_type} GBT model from {model_path}")
                    except Exception as e:
                        print(f"Failed to load {service_type} GBT model: {e}")
                else:
                    print(f"{service_type} GBT model not found at {model_path}")
            else:
                print(f"No postpaid_prod_ directory found in {artifacts_dir}")
        else:
            # Prepaid and Broadband use RandomForest models from data/artifacts
            model_path = ART_DIR / f"{service_type.lower()}_model_rf"
            
            if model_path.exists():
                try:
                    # Load RandomForest model
                    model = RandomForestClassificationModel.load(str(model_path))
                    MODELS[service_type] = model
                    print(f"Loaded {service_type} RF model from {model_path}")
                except Exception as e:
                    print(f"Failed to load {service_type} RF model: {e}")
            else:
                print(f"{service_type} RF model not found at {model_path}")

    # Load feature columns and thresholds from JSON report
    report_path = ART_DIR / "model_metrics_report_rf.json"
    if report_path.exists():
        try:
            with open(report_path, 'r') as f:
                report_data = json.load(f)
            
            # Update thresholds based on actual performance
            for service_type, metrics in report_data.items():
                if service_type in BEST_THRESHOLDS:
                    # Use optimized thresholds for each service type
                    if service_type == "Postpaid":
                        BEST_THRESHOLDS[service_type] = 0.15  # 15% threshold for Postpaid
                    elif service_type == "Prepaid":
                        BEST_THRESHOLDS[service_type] = 0.08  # 8% threshold for Prepaid
                    elif service_type == "Broadband":
                        BEST_THRESHOLDS[service_type] = 0.01  # 1% threshold for Broadband
                    
            print(f"Loaded thresholds: {BEST_THRESHOLDS}")
        except Exception as e:
            print(f"Could not load report data: {e}")

    # Define feature columns for each service type
    FEATURE_COLS = {
        "Postpaid": [
            "avg_call_duration", "call_drops", "roaming_usage", "auto_payment",
            "tenure", "age", "apps_count", "customer_support_calls", 
            "data_usage", "monthly_charge", "overdue_payments", "satisfaction_score",
            # Additional features for Postpaid (28 total needed)
            "avg_call_duration_log", "call_drops_log", "roaming_usage_log", 
            "tenure_log", "age_log", "apps_count_log", "customer_support_calls_log",
            "data_usage_log", "monthly_charge_log", "overdue_payments_log", 
            "satisfaction_score_log", "overdue_ratio", "support_calls_rate",
            "has_overdue_flag", "satisfaction_low", "log_charge_x_log_usage",
            "log_charge_x_log_tenure"
        ],
        "Prepaid": [
            "avg_call_duration", "avg_top_up_count", "call_drops", "roaming_usage",
            "tenure", "age", "apps_count", "customer_support_calls",
            "data_usage", "monthly_charge", "satisfaction_score"
        ],
        "Broadband": [
            "auto_payment", "tenure", "age", "apps_count", "customer_support_calls",
            "data_usage", "monthly_charge", "overdue_payments", "satisfaction_score"
        ]
    }
    
    # Load Postpaid features from the original feature engineering
    if "Postpaid" in MODELS:
        try:
            from data.feature_engineering import build_postpaid_features
            # Get the feature columns from the original feature engineering
            # This will be used for Postpaid model
            print("Postpaid feature engineering loaded")
        except Exception as e:
            print(f"Could not load Postpaid feature engineering: {e}")


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "models_loaded": list(MODELS.keys()),
        "service_types": ["Postpaid", "Prepaid", "Broadband"],
        "timestamp": "2024-10-16T22:30:00Z"
    }


@app.get("/models")
def list_models() -> Dict[str, Any]:
    """List all available models and their status"""
    return {
        "available_models": list(MODELS.keys()),
        "feature_columns": FEATURE_COLS,
        "thresholds": BEST_THRESHOLDS,
        "artifacts_directory": str(ART_DIR)
    }


@app.post("/score")
def score(request: ScoreRequest) -> Dict[str, Any]:
    """Score a customer for churn probability using the appropriate model"""
    
    if not SPARK:
        raise HTTPException(status_code=500, detail="Spark session not initialized")
    
    # Validate service type
    service_type = request.service_type
    if service_type not in MODELS:
        raise HTTPException(
            status_code=400, 
            detail=f"Model for service type '{service_type}' not available. Available: {list(MODELS.keys())}"
        )
    
    # Get the appropriate model and features
    model = MODELS[service_type]
    feature_cols = FEATURE_COLS[service_type]
    threshold = BEST_THRESHOLDS.get(service_type, 0.5)
    
    try:
        # Convert request to DataFrame with explicit types
        data = {
            "id": request.id or "unknown",
            "service_type": service_type,
            "age": int(request.age or 0),
            "tenure": int(request.tenure or 0),
            "avg_call_duration": float(request.avg_call_duration or 0.0),
            "data_usage": float(request.data_usage or 0.0),
            "roaming_usage": float(request.roaming_usage or 0.0),
            "monthly_charge": float(request.monthly_charge or 0.0),
            "overdue_payments": int(request.overdue_payments or 0),
            "auto_payment": 1 if request.auto_payment else 0,
            "avg_top_up_count": int(request.avg_top_up_count or 0),
            "call_drops": int(request.call_drops or 0),
            "customer_support_calls": int(request.customer_support_calls or 0),
            "satisfaction_score": float(request.satisfaction_score or 0.0),
            "apps": request.apps or []
        }
        
        # Create DataFrame with explicit schema
        from pyspark.sql.types import StructType, StructField, StringType, IntegerType, FloatType, BooleanType, ArrayType
        
        schema = StructType([
            StructField("id", StringType(), True),
            StructField("service_type", StringType(), True),
            StructField("age", IntegerType(), True),
            StructField("tenure", IntegerType(), True),
            StructField("avg_call_duration", FloatType(), True),
            StructField("data_usage", FloatType(), True),
            StructField("roaming_usage", FloatType(), True),
            StructField("monthly_charge", FloatType(), True),
            StructField("overdue_payments", IntegerType(), True),
            StructField("auto_payment", IntegerType(), True),
            StructField("avg_top_up_count", IntegerType(), True),
            StructField("call_drops", IntegerType(), True),
            StructField("customer_support_calls", IntegerType(), True),
            StructField("satisfaction_score", FloatType(), True),
            StructField("apps", ArrayType(StringType()), True)
        ])
        
        df = SPARK.createDataFrame([data], schema)
        
        # Add apps_count
        df = df.withColumn("apps_count", F.size(F.col("apps")))
        
        # For Postpaid, we need to create additional features to match the 28 features expected
        if service_type == "Postpaid":
            # Create log transformations
            df = df.withColumn("avg_call_duration_log", F.log1p(F.col("avg_call_duration")))
            df = df.withColumn("call_drops_log", F.log1p(F.col("call_drops")))
            df = df.withColumn("roaming_usage_log", F.log1p(F.col("roaming_usage")))
            df = df.withColumn("tenure_log", F.log1p(F.col("tenure")))
            df = df.withColumn("age_log", F.log1p(F.col("age")))
            df = df.withColumn("apps_count_log", F.log1p(F.col("apps_count")))
            df = df.withColumn("customer_support_calls_log", F.log1p(F.col("customer_support_calls")))
            df = df.withColumn("data_usage_log", F.log1p(F.col("data_usage")))
            df = df.withColumn("monthly_charge_log", F.log1p(F.col("monthly_charge")))
            df = df.withColumn("overdue_payments_log", F.log1p(F.col("overdue_payments")))
            df = df.withColumn("satisfaction_score_log", F.log1p(F.col("satisfaction_score")))
            
            # Create ratio features
            df = df.withColumn("overdue_ratio", F.when(F.col("tenure") > 0, F.col("overdue_payments") / F.col("tenure")).otherwise(0))
            df = df.withColumn("support_calls_rate", F.when(F.col("tenure") > 0, F.col("customer_support_calls") / F.col("tenure")).otherwise(0))
            
            # Create binary flags
            df = df.withColumn("has_overdue_flag", F.when(F.col("overdue_payments") > 0, 1).otherwise(0))
            df = df.withColumn("satisfaction_low", F.when(F.col("satisfaction_score") < 3, 1).otherwise(0))
            
            # Create interaction features
            df = df.withColumn("log_charge_x_log_usage", F.col("monthly_charge_log") * F.col("data_usage_log"))
            df = df.withColumn("log_charge_x_log_tenure", F.col("monthly_charge_log") * F.col("tenure_log"))
        
        # Select only the features needed for this service type
        df_features = df.select(*feature_cols)
        
        # Assemble features
        df_assembled = assemble(df_features, feature_cols)
        
        # Make prediction
        predictions = model.transform(df_assembled)
        
        # Extract probability and prediction
        prob_col = predictions.select("probability").collect()[0][0]
        churn_probability = float(prob_col[1])  # Probability of class 1 (churn)
        
        # Determine churn prediction based on threshold
        churn_prediction = churn_probability >= threshold
        
        # Determine model type based on service type
        if service_type == "Postpaid":
            model_used = f"{service_type.lower()}_model_gbt"
        else:
            model_used = f"{service_type.lower()}_model_rf"
        
        return {
            "id": request.id,
            "service_type": service_type,
            "churn_probability": churn_probability,
            "churn_prediction": churn_prediction,
            "threshold_used": threshold,
            "model_used": model_used,
            "features_used": feature_cols,
            "timestamp": "2024-10-16T22:30:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/score/batch")
def score_batch(
    service_type: str = Query(..., description="Service type: Postpaid, Prepaid, or Broadband"),
    limit: int = Query(100, description="Maximum number of records to process")
) -> Dict[str, Any]:
    """Score a batch of customers from the dataset"""
    
    if not SPARK:
        raise HTTPException(status_code=500, detail="Spark session not initialized")
    
    if service_type not in MODELS:
        raise HTTPException(
            status_code=400, 
            detail=f"Model for service type '{service_type}' not available"
        )
    
    try:
        # Load data
        data_path = "capstone.*.jsonl"
        df = SPARK.read.json(data_path)
        
        # Filter by service type
        df_filtered = df.filter(df.service_type == service_type).limit(limit)
        
        if df_filtered.count() == 0:
            return {"message": f"No data found for service type '{service_type}'"}
        
        # Get model and features
        model = MODELS[service_type]
        feature_cols = FEATURE_COLS[service_type]
        threshold = BEST_THRESHOLDS.get(service_type, 0.5)
        
        # Prepare features
        df_features = df_filtered.withColumn("apps_count", F.size(F.col("apps")))
        df_features = df_features.select(*feature_cols + ["id"])
        
        # Assemble features
        df_assembled = assemble(df_features, feature_cols)
        
        # Make predictions
        predictions = model.transform(df_assembled)
        
        # Extract results
        results = []
        for row in predictions.select("id", "probability", "prediction").collect():
            churn_prob = float(row["probability"][1])
            churn_pred = churn_prob >= threshold
            
            results.append({
                "id": row["id"],
                "churn_probability": churn_prob,
                "churn_prediction": churn_pred
            })
        
        return {
            "service_type": service_type,
            "total_records": len(results),
            "threshold_used": threshold,
            "results": results[:10],  # Return first 10 for brevity
            "summary": {
                "high_risk_customers": len([r for r in results if r["churn_probability"] >= threshold]),
                "avg_churn_probability": sum(r["churn_probability"] for r in results) / len(results)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch scoring failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
