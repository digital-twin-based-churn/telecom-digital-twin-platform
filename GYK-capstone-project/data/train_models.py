
import os
import sys
import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from experiment import run_experiment as run_postpaid_experiment
from experiment_prepaid import run_experiment as run_prepaid_experiment
from experiment_broadband import run_experiment as run_broadband_experiment


def get_spark_session(service_type: str):
    """Servis türüne göre Spark session oluştur"""
    from pyspark.sql import SparkSession
    
    os.environ["PYSPARK_PYTHON"] = sys.executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable
    local_dirs = os.getenv("SPARK_LOCAL_DIRS") or os.getenv("SPARK_LOCAL_DIR")
    
    builder = (
        SparkSession.builder
        .appName(f"{service_type} Churn Model Training")
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
    return spark


def load_data(spark):
    """Ham veriyi yükle"""
    from pyspark.sql import types as T
    
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
    
    return spark.read.schema(schema).option("mode","PERMISSIVE").json([str(p) for p in files])


def run_single_model(service_type: str, df_raw, out_dir: str = None) -> Dict[str, Any]:
    """Tek bir servis türü için model eğit"""
    print(f"\n{'='*60}")
    print(f"{service_type} Model Eğitimi Başlıyor...")
    print(f"{'='*60}")
    
    spark = get_spark_session(service_type)
    
    try:
        # DataFrame'i yeni Spark session'da yeniden oluştur
        df_raw_new = spark.createDataFrame(df_raw.rdd, df_raw.schema)
        
        if service_type == "Prepaid":
            if out_dir is None:
                out_dir = f"artifacts/prepaid_baseline_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            result = run_prepaid_experiment(spark, df_raw_new, out_dir=out_dir)
            
        elif service_type == "Broadband":
            if out_dir is None:
                out_dir = f"artifacts/broadband_baseline_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            result = run_broadband_experiment(spark, df_raw_new, out_dir=out_dir)
            
        elif service_type == "Postpaid":
            if out_dir is None:
                out_dir = f"artifacts/postpaid_baseline_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            result = run_postpaid_experiment(spark, df_raw_new, out_dir=out_dir)
            
        else:
            raise ValueError(f"Desteklenmeyen servis türü: {service_type}")
        
        print(f"\n{service_type} Model Eğitimi Tamamlandı!")
        print(f"Sonuçlar: {out_dir}")
        
        return result
        
    finally:
        spark.stop()


def compare_models(results: Dict[str, Dict[str, Any]]) -> None:
    """Modelleri karşılaştır ve özet rapor oluştur"""
    print(f"\n{'='*80}")
    print("MODEL KARŞILAŞTIRMA RAPORU")
    print(f"{'='*80}")
    
    # Tablo başlığı
    print(f"{'Servis Türü':<12} {'AUC-ROC':<8} {'AUC-PR':<8} {'Brier':<8} {'Precision@1%':<12} {'F1-Score':<8}")
    print("-" * 80)
    
    for service_type, result in results.items():
        metrics = result.get("metrics", {})
        test_cal = metrics.get("test_calibrated", {})
        
        auc_roc = test_cal.get("auc_roc", 0.0)
        auc_pr = test_cal.get("auc_pr", 0.0)
        brier = test_cal.get("brier", 0.0)
        precision_1pct = metrics.get("precision_at_1pct", 0.0)
        f1_score = metrics.get("best_threshold_val_f1", 0.0)
        
        print(f"{service_type:<12} {auc_roc:<8.4f} {auc_pr:<8.4f} {brier:<8.4f} {precision_1pct:<12.4f} {f1_score:<8.4f}")
    
    # En iyi performans
    best_auc_roc = max(results.items(), key=lambda x: x[1]["metrics"]["test_calibrated"]["auc_roc"])
    best_auc_pr = max(results.items(), key=lambda x: x[1]["metrics"]["test_calibrated"]["auc_pr"])
    best_precision = max(results.items(), key=lambda x: x[1]["metrics"]["precision_at_1pct"])
    
    print(f"\n🏆 EN İYİ PERFORMANSLAR:")
    print(f"   AUC-ROC: {best_auc_roc[0]} ({best_auc_roc[1]['metrics']['test_calibrated']['auc_roc']:.4f})")
    print(f"   AUC-PR:  {best_auc_pr[0]} ({best_auc_pr[1]['metrics']['test_calibrated']['auc_pr']:.4f})")
    print(f"   Precision@1%: {best_precision[0]} ({best_precision[1]['metrics']['precision_at_1pct']:.4f})")
    
    # Özet raporu kaydet
    summary = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "models": results,
        "best_performers": {
            "auc_roc": {"service": best_auc_roc[0], "score": best_auc_roc[1]["metrics"]["test_calibrated"]["auc_roc"]},
            "auc_pr": {"service": best_auc_pr[0], "score": best_auc_pr[1]["metrics"]["test_calibrated"]["auc_pr"]},
            "precision_1pct": {"service": best_precision[0], "score": best_precision[1]["metrics"]["precision_at_1pct"]}
        }
    }
    
    summary_path = "artifacts/model_comparison_summary.json"
    Path("artifacts").mkdir(exist_ok=True)
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 Özet rapor kaydedildi: {summary_path}")


def main():
    parser = argparse.ArgumentParser(description="Servis türüne göre churn model eğitimi")
    parser.add_argument("--service-type", choices=["Prepaid", "Broadband", "Postpaid"], 
                       help="Eğitilecek servis türü")
    parser.add_argument("--all", action="store_true", 
                       help="Tüm servis türleri için model eğit")
    parser.add_argument("--out-dir", type=str, 
                       help="Çıktı dizini (varsayılan: otomatik)")
    parser.add_argument("--compare", action="store_true", 
                       help="Modelleri karşılaştır (--all ile birlikte kullan)")
    
    args = parser.parse_args()
    
    if not args.service_type and not args.all:
        parser.error("--service-type veya --all seçeneğini belirtmelisiniz")
    
    # Veriyi yükle
    print("📂 Veri yükleniyor...")
    spark = get_spark_session("DataLoader")
    try:
        df_raw = load_data(spark)
        print(f"Veri yüklendi: {df_raw.count()} kayıt")
    finally:
        spark.stop()
    
    results = {}
    
    if args.all:
        # Tüm servis türleri
        services = ["Prepaid", "Broadband", "Postpaid"]
        for service in services:
            try:
                result = run_single_model(service, df_raw, args.out_dir)
                results[service] = result
            except Exception as e:
                print(f"{service} model eğitimi başarısız: {e}")
                continue
        
        if args.compare and results:
            compare_models(results)
            
    else:
        # Tek servis türü
        result = run_single_model(args.service_type, df_raw, args.out_dir)
        results[args.service_type] = result
    
    print(f"\nİşlem tamamlandı! {len(results)} model eğitildi.")


if __name__ == "__main__":
    main()
