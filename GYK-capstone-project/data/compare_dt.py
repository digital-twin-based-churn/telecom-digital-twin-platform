from pathlib import Path
from pyspark.sql import SparkSession, functions as F, types as T
from pyspark.ml.feature import VectorAssembler, Imputer
from pyspark.ml.classification import DecisionTreeClassifier
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.ml.functions import vector_to_array
from feature_engineering import build_postpaid_features
import json, os

def eval_df(df, y="label", s="score"):
    e1 = BinaryClassificationEvaluator(labelCol=y, rawPredictionCol=s, metricName="areaUnderROC")
    e2 = BinaryClassificationEvaluator(labelCol=y, rawPredictionCol=s, metricName="areaUnderPR")
    return {"auc_roc": float(e1.evaluate(df)), "auc_pr": float(e2.evaluate(df))}

spark = SparkSession.builder.appName("CompareDT").master("local[*]").getOrCreate()
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

files = sorted(list(Path("data").glob("capstone*.jsonl"))) + sorted(list(Path("data").glob("capstone*.json")))
df_raw = spark.read.schema(schema).option("mode","PERMISSIVE").json([str(p) for p in files])

sample_frac = float(os.getenv("DT_SAMPLE_FRAC","0.2"))
df, feats = build_postpaid_features(df_raw, sample_frac=sample_frac)
df = df.where(F.col("label").isNotNull()).cache(); _ = df.count()

imp = Imputer(inputCols=feats, outputCols=feats, strategy="median").fit(df)
vec = VectorAssembler(inputCols=feats, outputCol="features", handleInvalid="skip")
data = vec.transform(imp.transform(df)).select("label","features")

train, test = data.randomSplit([0.8,0.2], seed=42)

dt = DecisionTreeClassifier(labelCol="label", featuresCol="features", maxDepth=int(os.getenv("DT_MAX_DEPTH","10")))
m  = dt.fit(train)
pred = m.transform(test).select(F.col("label").cast("double").alias("label"),
                                vector_to_array(F.col("probability")).getItem(1).cast("double").alias("score"))
print(json.dumps({"DecisionTree": eval_df(pred)}, indent=2))
spark.stop()
