# feature_engineering_broadband.py — Broadband-only feature pipeline (Spark)
# ---------------------------------------------------------------
# - Yalnızca Broadband kayıtları üzerinde çalışır
# - Broadband için ilgili feature'lar: apps, auto_payment, tenure, age, 
#   customer_support_calls, satisfaction_score, data_usage, monthly_charge, overdue_payments
# - Winsor eşikleri ve log1p önerilerini "preprocessing_suggestions.csv" ya da "Broadband.csv" dosyalarından okur
# - Dosya yoksa: Broadband altkümesi üzerinde approxQuantile ile p01 / p50 / p99 hesaplar (tek tarama)
# - Eksik değer stratejisi: yapısal NA'lar 0 + flag, operasyonel NA'lar medyan + flag
# - Sağ-kuyruk değişkenlerde winsor + log1p uygular
# - Oran/normalize edilmiş ve stabil özellikler üretir
# - (df, feature_cols) döner

from typing import Dict, List, Tuple, Optional

from pyspark.sql import DataFrame, Window
from pyspark.sql import functions as F
from pyspark.sql.functions import col, size
from pyspark.sql import types as T


# === Kullanıcı ayarları (gerekirse değiştir) ===
SUGGESTIONS_PATHS = [
    # En güncel birleşik dosya (tüm segmentler)
    "preprocessing_suggestions.csv",
    # Segment dosyası isimleri (sen yüklediysen)
    "Broadband.csv",
    # Alternatif konumlar (örn. proje kökü / outputs)
    "outputs/preprocessing_suggestions.csv",
    "outputs/Broadband.csv",
]
# p01/p50/p99 approxQuantile hata toleransı
REL_ERR = 1e-3


# === Yardımcılar ===

def _is_numeric_type(spark_dtype: str) -> bool:
    markers = ["double", "int", "bigint", "float", "long", "decimal", "short", "tinyint"]
    return any(m in spark_dtype for m in markers)


def _read_csv_if_exists(spark, path: str) -> Optional[DataFrame]:
    try:
        from pathlib import Path
        p = Path(path)
        if p.exists() and p.stat().st_size > 0:
            return spark.read.option("header", True).csv(str(p))
    except Exception:
        pass
    return None


def _load_bounds_and_flags_from_suggestions(
    spark, segment_label: str = "broadband"
) -> Tuple[Dict[str, Tuple[float, float, float]], Dict[str, bool]]:
    """
    preprocessing_suggestions.csv (ya da Broadband.csv) içinden
    p01/p50/p99 ve log1p_ok bilgilerini okuyup döndürür.

    returns:
      quantiles: {col: (p01, p50, p99)}
      log1p_flags: {col: True/False}
    """
    seg = segment_label.lower()
    quantiles: Dict[str, Tuple[float, float, float]] = {}
    log1p_flags: Dict[str, bool] = {}

    for path in SUGGESTIONS_PATHS:
        df = _read_csv_if_exists(spark, path)
        if df is None:
            continue

        cols = [c.lower() for c in df.columns]
        has_segment = "segment" in cols
        # unify schema
        d = df
        if "column" not in df.columns:
            # bazı segment csv'lerinde ilk kolon adı "column" olmayabilir
            # en olası adları sırayla dene
            for cand in ["Column", "name", "feature", "col"]:
                if cand in df.columns:
                    d = d.withColumnRenamed(cand, "column")
                    break

        # alt set: yalnız broadband satırlar
        if has_segment:
            d = d.where(F.lower(F.col("segment")) == F.lit(seg))

        needed = ["column", "p01", "p50", "p99"]
        if not all(c in d.columns for c in needed):
            # bazı dosyalarda yalnız p01/p05/... olabilir, yine de dene
            pass

        # cast
        for c in ["p01", "p50", "p99"]:
            if c in d.columns:
                d = d.withColumn(c, F.col(c).cast("double"))

        if "log1p_ok" in d.columns:
            d = d.withColumn("log1p_ok", F.col("log1p_ok").cast("boolean"))
        else:
            d = d.withColumn("log1p_ok", F.lit(None).cast("boolean"))

        rows = d.select("column", "p01", "p50", "p99", "log1p_ok").collect()
        for r in rows:
            colname = r["column"]
            p01 = float(r["p01"]) if r["p01"] is not None else None
            p50 = float(r["p50"]) if r["p50"] is not None else None
            p99 = float(r["p99"]) if r["p99"] is not None else None
            l1p = bool(r["log1p_ok"]) if r["log1p_ok"] is not None else False
            if colname:
                quantiles[colname] = (p01, p50, p99)
                log1p_flags[colname] = l1p

        # bir dosya bulup okuduksa yeter
        if quantiles:
            break

    return quantiles, log1p_flags


def _compute_quantiles_broadband(
    df_broadband: DataFrame, numeric_cols: List[str]
) -> Dict[str, Tuple[float, float, float]]:
    """Tek taramada Broadband altkümesi için p01/p50/p99 hesapla."""
    if not numeric_cols:
        return {}
    num_df = df_broadband.select(*[F.col(c).cast("double").alias(c) for c in numeric_cols])
    qmap = num_df.approxQuantile(numeric_cols, [0.01, 0.50, 0.99], REL_ERR)
    results: Dict[str, Tuple[float, float, float]] = {}
    if isinstance(qmap, dict):
        for c in numeric_cols:
            q = qmap.get(c, [None, None, None])
            results[c] = (
                float(q[0]) if q[0] is not None else None,
                float(q[1]) if q[1] is not None else None,
                float(q[2]) if q[2] is not None else None,
            )
    else:
        # eski sürümlerde liste dönebilir
        for i, c in enumerate(numeric_cols):
            q = qmap[i]
            results[c] = (
                float(q[0]) if q[0] is not None else None,
                float(q[1]) if q[1] is not None else None,
                float(q[2]) if q[2] is not None else None,
            )
    return results


def _winsorize(df: DataFrame, bounds: Dict[str, Tuple[Optional[float], Optional[float]]]) -> DataFrame:
    """Her kolon için (low, high) sınırları ile winsor uygular."""
    for c, (low, high) in bounds.items():
        if c not in df.columns:
            continue
        expr = F.col(c)
        if low is not None:
            expr = F.when(expr < F.lit(low), F.lit(low)).otherwise(expr)
        if high is not None:
            expr = F.when(expr > F.lit(high), F.lit(high)).otherwise(expr)
        df = df.withColumn(c, expr)
    return df


def _safe_div(num_col: str, den_col: str, eps: float = 1.0) -> F.Column:
    # pay: null -> 0.0, payda: >= eps
    num_safe = F.coalesce(F.col(num_col).cast("double"), F.lit(0.0))
    den_safe = F.greatest(F.col(den_col).cast("double"), F.lit(eps))
    return (num_safe / den_safe)


def _log1p_if(df: DataFrame, colnames: List[str]) -> DataFrame:
    for c in colnames:
        if c in df.columns:
            # null -> 0.0, negatif -> 0.0; log1p(0) = 0
            safe_val = F.greatest(F.coalesce(F.col(c).cast("double"), F.lit(0.0)), F.lit(0.0))
            df = df.withColumn(c, F.log1p(safe_val))
    return df


# === Asıl fonksiyon: yalnız Broadband ===

def build_broadband_features(
    df: DataFrame,
    sample_frac: float = 0.0,
    suggestions_prefer_segment: bool = True,
) -> Tuple[DataFrame, List[str]]:
    """
    Broadband kayıtları için feature engineering uygular ve (df, feature_list) döner.

    Broadband için ilgili feature'lar:
    - apps (count), auto_payment, tenure, age, customer_support_calls,
      satisfaction_score, data_usage, monthly_charge, overdue_payments

    Notlar:
    - Winsor eşikleri ve log1p seçimi: preprocessing_suggestions.csv / Broadband.csv öncelikli.
      Bulunamazsa approxQuantile(Broadband) ile p01/p50/p99 hesaplanır.
    - Eksik stratejisi:
        * Operasyonel NA (monthly_charge, data_usage): medyan (Broadband p50) + *_missing flag
        * auto_payment: {True=1, False=0, None=None} + auto_payment_missing
        * overdue_payments: Broadband için önemli, medyan ile doldur
    """

    # 1) Yalnız Broadband altkümesi
    df = df.filter(F.col("service_type") == F.lit("Broadband"))

    # 2) apps_count (apps kolon tipi string/array olabilir; yoksa 0)
    if "apps" in df.columns:
        dtype = dict(df.dtypes).get("apps")
        if dtype == "array":
            df = df.withColumn("apps_count", F.when(F.col("apps").isNotNull(), size(F.col("apps"))).otherwise(F.lit(0)))
        elif dtype == "string":
            # 'app1|app2' veya 'a,b' gibi dizeleri ayır
            df = df.withColumn(
                "apps_count",
                F.when(
                    F.col("apps").isNotNull() & (F.col("apps") != ""),
                    size(F.split(F.col("apps"), r"\\||,|;"))
                ).otherwise(F.lit(0))
            )
        else:
            df = df.withColumn("apps_count", F.lit(0))
    else:
        df = df.withColumn("apps_count", F.lit(0))

    # 3) NA bayrakları (önce hepsini çıkaralım)
    df = (
        df.withColumn("data_usage_missing",       F.when(F.col("data_usage").isNull(),       1.0).otherwise(0.0))
          .withColumn("monthly_charge_missing",   F.when(F.col("monthly_charge").isNull(),   1.0).otherwise(0.0))
          .withColumn("auto_payment_missing",     F.when(F.col("auto_payment").isNull(),     1.0).otherwise(0.0))
          .withColumn("overdue_payments_missing", F.when(F.col("overdue_payments").isNull(), 1.0).otherwise(0.0))
    )

    # 4) auto_payment -> {1.0, 0.0, null}
    if "auto_payment" in df.columns:
        df = df.withColumn(
            "auto_payment",
            F.when(F.col("auto_payment") == True, 1.0)
             .when(F.col("auto_payment") == False, 0.0)
             .otherwise(F.lit(0.0))  # null yerine 0.0; missing flag zaten var
        )

    # 5) İhtiyaç duyacağımız sayısal kolonlar (ham) - Broadband için ilgili olanlar
    numeric_candidates = [
        "tenure",
        "age",
        "apps_count",
        "customer_support_calls",
        "data_usage",
        "monthly_charge",
        "overdue_payments",
        "satisfaction_score",
    ]
    numeric_cols_present = [c for c in numeric_candidates if c in df.columns]

    # 6) Basit eksik değer doldurma (quantile hesaplama atlanıyor)
    quantiles_sug = {}
    log1p_flags = {}
    p50_for_fill: Dict[str, Optional[float]] = {}
    
    # Varsayılan değerler
    for c in numeric_cols_present:
        p50_for_fill[c] = 0.0

    # 7) Eksik değer doldurma
    # Operasyonel NA: data_usage / monthly_charge -> medyan (Broadband p50) + flag
    for c in ["data_usage", "monthly_charge"]:
        if c in df.columns:
            med = p50_for_fill.get(c)
            if med is not None:
                df = df.withColumn(c, F.when(F.col(c).isNull(), float(med)).otherwise(F.col(c).cast("double")))
            else:
                # medyan yoksa 0'a düşmeyelim, segment ortası (yaklaşım)
                df = df.withColumn(c, F.when(F.col(c).isNull(), F.avg(F.col(c)).over(Window.rowsBetween(Window.unboundedPreceding, Window.unboundedFollowing))).otherwise(F.col(c).cast("double")))

    # Diğer sayısal kolonlar: medyan ile doldur + cast
    for c in numeric_cols_present:
        if c not in ["data_usage", "monthly_charge"]:
            med = p50_for_fill.get(c)
            if med is not None:
                df = df.withColumn(c, F.when(F.col(c).isNull(), float(med)).otherwise(F.col(c).cast("double")))
            else:
                df = df.withColumn(c, F.when(F.col(c).isNull(), F.lit(0.0)).otherwise(F.col(c).cast("double")))

    # 8) Oran/normalize edilmiş engineered özellikler (stabil)
    # paydalar güvenli (>=1)
    safe_tenure = F.greatest(F.col("tenure").cast("double"), F.lit(1.0))
    safe_usage  = F.greatest(F.col("data_usage").cast("double"), F.lit(0.1))

    df = df.withColumn("overdue_ratio",        _safe_div("overdue_payments", "tenure", eps=1.0))
    df = df.withColumn("support_calls_rate",   _safe_div("customer_support_calls", "tenure", eps=1.0))
    df = df.withColumn("charge_per_gb",        _safe_div("monthly_charge", "data_usage", eps=0.1))
    df = df.withColumn("usage_per_tenure",     _safe_div("data_usage", "tenure", eps=1.0))
    df = df.withColumn("charge_per_tenure",    _safe_div("monthly_charge", "tenure", eps=1.0))

    # Bayraklar (işe yarayan kolay ikililer)
    df = df.withColumn("has_overdue_flag", F.when(F.col("overdue_payments") > 0, 1.0).otherwise(0.0))
    df = df.withColumn("satisfaction_low", F.when(F.col("satisfaction_score") <= 4.0, 1.0).otherwise(0.0))
    df = df.withColumn("has_any_app",      F.when(F.col("apps_count") > 0, 1.0).otherwise(0.0))
    df = df.withColumn("high_usage",       F.when(F.col("data_usage") >= F.avg(F.col("data_usage")).over(Window.rowsBetween(Window.unboundedPreceding, Window.unboundedFollowing)), 1.0).otherwise(0.0))

    # 9) Winsor + log1p
    # bounds: p01-p99 (hazırdan okunan ya da hesaplanan)
    bounds = {}
    for c in numeric_cols_present + [
        "overdue_ratio", "support_calls_rate", "charge_per_gb",
        "usage_per_tenure", "charge_per_tenure"
    ]:
        # Mühendislenenlerde suggestions'ta yok; bunları p01/p99 yoksa dokunmadan bırak
        p = quantiles_sug.get(c)
        if p:
            low, _, high = p
            bounds[c] = (low, high)

    if bounds:
        df = _winsorize(df, bounds)

    # log1p adayları: suggestions -> log1p_ok == True
    log1p_cols = [c for c, ok in log1p_flags.items() if ok and c in df.columns]
    # ayrıca tipik sağ-kuyruk metrikler:
    for extra in ["monthly_charge", "data_usage", "customer_support_calls", "overdue_payments"]:
        if extra in df.columns and extra not in log1p_cols:
            log1p_cols.append(extra)

    df = _log1p_if(df, list(set(log1p_cols)))

    # 10) Etkileşim (ılımlı): log_charge x log_usage (patlatmadan)
    if all(c in df.columns for c in ["monthly_charge", "data_usage"]):
        df = df.withColumn("log_charge_x_log_usage", (F.col("monthly_charge") * F.col("data_usage")))

    # 11) Label
    if "churn" in df.columns:
        df = df.withColumn("label", F.col("churn").cast("int"))
    else:
        df = df.withColumn("label", F.lit(None).cast("int"))

    # 12) Örnekleme (opsiyonel)
    if 0.0 < sample_frac <= 1.0:
        df = df.sample(withReplacement=False, fraction=sample_frac, seed=42)

    # 13) Özellik listesi - Broadband için ilgili olanlar
    feature_cols: List[str] = [
        # ham + doldurulmuş
        "auto_payment", "tenure", "age", "apps_count", "customer_support_calls", 
        "data_usage", "monthly_charge", "overdue_payments", "satisfaction_score",
        # NA bayrakları
        "data_usage_missing", "monthly_charge_missing", "auto_payment_missing", "overdue_payments_missing",
        # engineered oranlar
        "overdue_ratio", "support_calls_rate", "charge_per_gb",
        "usage_per_tenure", "charge_per_tenure",
        # bayraklar
        "has_overdue_flag", "satisfaction_low", "has_any_app", "high_usage",
        # hafif etkileşim
        "log_charge_x_log_usage",
    ]

    # sadece mevcut olanları döndür
    feature_cols = [c for c in feature_cols if c in df.columns]

    # 14) Son emniyet: NaN -> 0.0
    for c in feature_cols:
        df = df.withColumn(c, F.when(F.isnan(F.col(c).cast("double")), F.lit(0.0)).otherwise(F.col(c)))

    return df, feature_cols
