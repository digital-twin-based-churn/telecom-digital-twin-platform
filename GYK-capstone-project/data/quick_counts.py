from pathlib import Path
from pyspark.sql import SparkSession, functions as F, types as T

spark = SparkSession.builder.master("local[*]").appName("QuickCounts").getOrCreate()
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
df = spark.read.schema(schema).option("mode", "PERMISSIVE").json([str(p) for p in files])

post = df.where(F.col("service_type") == "Postpaid")

print("[counts] total_all =", df.count())
print("[counts] total_postpaid =", post.count())
print("[counts] postpaid_label_notnull =", post.where(F.col("churn").isNotNull()).count())
print("[counts] label_pos =", post.where(F.col("churn") == True).count())
print("[counts] label_neg =", post.where(F.col("churn") == False).count())

spark.stop()