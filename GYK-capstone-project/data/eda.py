# eda.py — Memory-safe EDA for large JSONL on Windows (local[*])
# --------------------------------------------------------------
# - venv Python'ını Spark worker'lara sabitler
# - Sürücü/yürütücü belleğini artırır (local modda aynı process)
# - data klasörünü otomatik bulur
# - Şemayla okur (infer problemi yok)
# - Persentil: tek geçiş, yalnız numeric kolonlar
# - Sonuçları normalize eder (eksik/bazı kolonlara None gelse bile patlamaz)
# - CSV'leri pandas ile yazar (winutils gerekmez)
# - Segment persentilleri bayrakla kontrol edilir

import os, sys, re
from pathlib import Path
from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql import types as T

# =========================
# Kullanıcı ayarları
# =========================
DO_NULL_REPORT = False               # Büyük tabloda ağır olabilir; gerekirse True
DO_SEGMENT_PERCENTILES = True        # İlk denemede False yapıp sadece overall çıkarabilirsin
DRIVER_MEM = "8g"                    # Gerekirse 6g/8g/12g
EXECUTOR_MEM = "8g"

# =========================
# Spark & Python ayarları
# =========================
os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

spark = (
    SparkSession.builder
    .appName("Churn EDA")
    .master("local[*]")
    # venv python
    .config("spark.pyspark.python", sys.executable)
    .config("spark.pyspark.driver.python", sys.executable)
    # bellek
    .config("spark.driver.memory", DRIVER_MEM)
    .config("spark.executor.memory", EXECUTOR_MEM)
    .config("spark.memory.fraction", "0.6")
    .config("spark.memory.storageFraction", "0.3")
    # performans
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.shuffle.partitions", "8")
    .config("spark.sql.files.maxPartitionBytes", "64m")
    .getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")
print(f"[INFO] Spark {spark.version}, Python {sys.version.split()[0]}")

# =========================
# Data klasörünü bul
# =========================
_here = Path(__file__).resolve().parent
cands = [_here / "data", _here, _here.parent / "data"]
data_dir = next((p for p in cands if p.exists()), None)
if data_dir is None:
    raise FileNotFoundError(f"data klasörü bulunamadı. Denenen: {', '.join(str(p) for p in cands)}")

files = sorted(list(data_dir.glob("capstone*.jsonl"))) + sorted(list(data_dir.glob("capstone*.json")))
files = [p for p in files if p.exists() and p.stat().st_size > 0]
if not files:
    raise FileNotFoundError(
        f"Boş ya da eksik veri. Çalışılan yer: {Path.cwd()}\n"
        f"Aranan kalıp: {data_dir/'capstone*.jsonl'} / .json"
    )
print(f"[INFO] {len(files)} dosya bulundu. İlk dosya: {files[0]}")

# =========================
# Şema (örnek kayıtlarına göre)
# =========================
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

# =========================
# Oku (PERMISSIVE) — show() KULLANMIYORUZ
# =========================
df = spark.read.schema(schema).option("mode","PERMISSIVE").json([str(p) for p in files])

# =========================
# Yardımcılar
# =========================
def _is_numeric_type(dtype: str) -> bool:
    for m in ["double","int","bigint","float","long","decimal","short","tinyint"]:
        if m in dtype:
            return True
    return False

def _normalize_q(q, k=6):
    """Persentil çıktısını güvenli hale getir: uzunluğu tam k olsun."""
    try:
        if q is None:
            vals = [None]*k
        else:
            try:
                tmp = list(q)
            except Exception:
                tmp = [None]*k
            vals = [(float(x) if x is not None else None) for x in tmp]
    except Exception:
        vals = [None]*k
    if len(vals) < k:
        vals = vals + [None]*(k - len(vals))
    elif len(vals) > k:
        vals = vals[:k]
    return vals

def _get_q_safe(qmap_obj, col, numeric_cols, k=6):
    """dict veya liste dönebilen approxQuantile çıktısından güvenli çekim"""
    try:
        if isinstance(qmap_obj, dict):
            return _normalize_q(qmap_obj.get(col), k)
        else:
            i = numeric_cols.index(col)
            return _normalize_q(qmap_obj[i], k)
    except Exception:
        return _normalize_q(None, k)

def _safe_write_csv(df_, path_):
    """Küçük/orta boy özetler için pandas ile CSV (winutils bağımsız)."""
    import pandas as pd
    os.makedirs(os.path.dirname(path_), exist_ok=True)
    pdf = df_.toPandas()
    pdf.to_csv(path_, index=False)
    print(f"[OK] {path_}")

# =========================
# Çıkış klasörü
# =========================
out_dir = "outputs"
os.makedirs(out_dir, exist_ok=True)

# =========================
# Dağılımlar (küçük sonuç setleri)
# =========================
if "service_type" in df.columns:
    svc_dist = df.groupBy("service_type").count().orderBy(F.desc("count"))
    _safe_write_csv(svc_dist, f"{out_dir}/service_type_dist.csv")

if "churn" in df.columns:
    churn_dist = df.groupBy("churn").count().orderBy(F.desc("count"))
    _safe_write_csv(churn_dist, f"{out_dir}/churn_dist.csv")

# =========================
# Null raporu (opsiyonel)
# =========================
if DO_NULL_REPORT:
    null_exprs = [F.sum(F.when(F.col(c).isNull(), 1).otherwise(0)).alias(c) for c in df.columns]
    null_df = df.agg(*null_exprs)
    _safe_write_csv(null_df, f"{out_dir}/null_counts.csv")

# =========================
# Persentiller (tek geçiş)
# =========================
numeric_cols = [c for c, t in df.dtypes if _is_numeric_type(t)]
if numeric_cols:
    probs = [0.01, 0.05, 0.50, 0.90, 0.95, 0.99]
    rel_err = 1e-3

    # sadece numeric kolonlar, double cast
    num_df = df.select(*[F.col(c).cast("double").alias(c) for c in numeric_cols])

    # Tek tarama; OOM olursa %10 örnek fallback
    try:
        qmap = num_df.approxQuantile(numeric_cols, probs, rel_err)
    except Exception as e:
        print(f"[WARN] approxQuantile OOM/Fail: {e} -> %10 örnek ile tekrar")
        num_df = num_df.sample(False, 0.10, seed=42)
        qmap = num_df.approxQuantile(numeric_cols, probs, rel_err)

    rows = []
    for c in numeric_cols:
        q = _get_q_safe(qmap, c, numeric_cols, k=6)
        rows.append((c, *q))

    schema_pct = T.StructType([
        T.StructField("column", T.StringType(), False),
        T.StructField("p01", T.DoubleType(), True),
        T.StructField("p05", T.DoubleType(), True),
        T.StructField("p50", T.DoubleType(), True),
        T.StructField("p90", T.DoubleType(), True),
        T.StructField("p95", T.DoubleType(), True),
        T.StructField("p99", T.DoubleType(), True),
    ])
    pct_df = spark.createDataFrame(rows, schema=schema_pct)
    _safe_write_csv(pct_df.orderBy("column"), f"{out_dir}/percentiles_overall.csv")

    # -------- segment bazında (bayrakla kontrol) --------
    if DO_SEGMENT_PERCENTILES and "service_type" in df.columns:
        st_vals = [r[0] for r in df.select("service_type").distinct().na.drop().collect()]

        schema_by = T.StructType([
            T.StructField("service_type", T.StringType(), False),
            T.StructField("column", T.StringType(), False),
            T.StructField("p01", T.DoubleType(), True),
            T.StructField("p05", T.DoubleType(), True),
            T.StructField("p50", T.DoubleType(), True),
            T.StructField("p90", T.DoubleType(), True),
            T.StructField("p95", T.DoubleType(), True),
            T.StructField("p99", T.DoubleType(), True),
        ])

        for st in st_vals:
            safe_st = re.sub(r"[^A-Za-z0-9_\-]", "_", st or "NA")
            sdf = df.where(F.col("service_type")==st).select(*[F.col(c).cast("double").alias(c) for c in numeric_cols])
            try:
                qmap_st = sdf.approxQuantile(numeric_cols, probs, rel_err)
            except Exception as e:
                print(f"[WARN] approxQuantile({st}) OOM/Fail: {e} -> %10 örnek ile tekrar")
                qmap_st = sdf.sample(False, 0.10, seed=42).approxQuantile(numeric_cols, probs, rel_err)

            rows = []
            for c in numeric_cols:
                q = _get_q_safe(qmap_st, c, numeric_cols, k=6)
                rows.append((st, c, *q))

            if rows:
                st_df = spark.createDataFrame(rows, schema=schema_by)
                _safe_write_csv(st_df.orderBy("column"), f"{out_dir}/percentiles_by_service_type/{safe_st}.csv")

print("[DONE] All requested outputs written.")
spark.stop()
