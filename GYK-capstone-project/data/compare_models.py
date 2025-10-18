import os, json
from pathlib import Path
from pyspark.sql import SparkSession, functions as F, types as T
from pyspark.ml.feature import VectorAssembler, Imputer
from pyspark.ml.classification import GBTClassifier, RandomForestClassifier, LogisticRegression
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.functions import vector_to_array
from feature_engineering import build_postpaid_features

def evaluate(df, label_col="label", score_col="score"):
    e1 = BinaryClassificationEvaluator(labelCol=label_col, rawPredictionCol=score_col, metricName="areaUnderROC")
    e2 = BinaryClassificationEvaluator(labelCol=label_col, rawPredictionCol=score_col, metricName="areaUnderPR")
    return {"auc_roc": float(e1.evaluate(df)), "auc_pr": float(e2.evaluate(df))}

builder = SparkSession.builder.appName("CompareModels").master("local[*]")
shuffle_parts = os.getenv("SPARK_SHUFFLE_PARTS")
if shuffle_parts:
    builder = builder.config("spark.sql.shuffle.partitions", shuffle_parts)
spark = builder.getOrCreate()
spark.sparkContext.setLogLevel("WARN")

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
df_raw = spark.read.schema(schema).option("mode","PERMISSIVE").json([str(p) for p in files])

sample_frac = float(os.getenv("COMPARE_SAMPLE_FRAC", "0.2"))
df_feat, feat_cols = build_postpaid_features(df_raw, sample_frac=sample_frac)
df_feat = df_feat.where(F.col("label").isNotNull()).cache()
_ = df_feat.count()

imp = Imputer(inputCols=feat_cols, outputCols=feat_cols, strategy="median").fit(df_feat)
df_imp = imp.transform(df_feat)
vec = VectorAssembler(inputCols=feat_cols, outputCol="features", handleInvalid="skip").transform(df_imp)

train, test = vec.randomSplit([0.8, 0.2], seed=42)

by = {int(r["label"]): int(r["count"]) for r in train.groupBy("label").count().collect() if r["label"] is not None}
pos, neg = by.get(1,1), by.get(0,1)
spw = neg / max(pos,1)
train = train.withColumn("weight", F.when(F.col("label")==1, F.lit(float(spw))).otherwise(F.lit(1.0)))
test  = test .withColumn("weight", F.lit(1.0))

results = {}

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

# GBT
try:
    gbt = GBTClassifier(
        labelCol="label", featuresCol="features", weightCol="weight",
        maxDepth=_get_int("GBT_MAX_DEPTH", 6),
        maxIter=_get_int("GBT_MAX_ITER", 120),
        stepSize=_get_float("GBT_STEP_SIZE", 0.1),
        subsamplingRate=_get_float("GBT_SUBSAMPLING", 0.8),
        seed=42
    )
    m_gbt = gbt.fit(train)
    pred_gbt = m_gbt.transform(test).select(
        F.col("label").cast("double").alias("label"),
        vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score")
    )
    results["GBT"] = evaluate(pred_gbt)
except Exception as e:
    results["GBT"] = {"error": repr(e)}

# RandomForest (daha hafif varsayılanlarla)
try:
    rf = RandomForestClassifier(
        labelCol="label", featuresCol="features", weightCol="weight",
        numTrees=_get_int("RF_NUM_TREES", 150),
        maxDepth=_get_int("RF_MAX_DEPTH", 10),
        featureSubsetStrategy=os.getenv("RF_FEATURE_SUBSET", "sqrt"),
        subsamplingRate=_get_float("RF_SUBSAMPLING", 0.8),
        seed=42
    )
    m_rf = rf.fit(train)
    pred_rf = m_rf.transform(test).select(
        F.col("label").cast("double").alias("label"),
        vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score")
    )
    results["RandomForest"] = evaluate(pred_rf)
except Exception as e:
    results["RandomForest"] = {"error": repr(e)}

# LogisticRegression
try:
    lr = LogisticRegression(
        labelCol="label", featuresCol="features", weightCol="weight",
        maxIter=_get_int("LR_MAX_ITER", 120),
        regParam=_get_float("LR_REG", 0.1),
        elasticNetParam=_get_float("LR_EN", 0.0)
    )
    m_lr = lr.fit(train)
    pred_lr = m_lr.transform(test).select(
        F.col("label").cast("double").alias("label"),
        vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score")
    )
    results["LogisticRegression"] = evaluate(pred_lr)
except Exception as e:
    results["LogisticRegression"] = {"error": repr(e)}

print(json.dumps(results, indent=2))
spark.stop()