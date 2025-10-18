
import os
import json
from pathlib import Path
from typing import Dict, List, Any
import click
from pyspark.sql import SparkSession
from pyspark.ml.classification import RandomForestClassificationModel, GBTClassificationModel
from pyspark.ml.evaluation import BinaryClassificationEvaluator
from pyspark.sql.functions import col, size, when, isnan, isnull
from pyspark.ml.feature import VectorAssembler

# Servis türüne göre ilgili feature'lar
RELEVANT_COLUMNS_DICT = {
    "Broadband": [
        "auto_payment", "tenure", "age", "apps_count", "customer_support_calls",
        "data_usage", "monthly_charge", "overdue_payments", "satisfaction_score",
    ],
    "Prepaid": [
        "avg_call_duration", "avg_top_up_count", "call_drops", "roaming_usage",
        "tenure", "age", "apps_count", "customer_support_calls", "data_usage",
        "monthly_charge", "satisfaction_score",
    ],
    "Postpaid": [
        "avg_call_duration", "call_drops", "roaming_usage", "auto_payment",
        "tenure", "age", "apps_count", "customer_support_calls", "data_usage",
        "monthly_charge", "overdue_payments", "satisfaction_score",
    ],
}


def build_spark_app(name: str = "Model Metrics Report"):
    spark = (
        SparkSession.builder.appName(name)
        .master("local[*]")
        .config("spark.driver.memory", "2g")
        .config("spark.executor.memory", "2g")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.sql.shuffle.partitions", "4")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    return spark


def load_model(model_path: str, model_type: str = "rf"):
    """Model yükle"""
    try:
        if model_type == "rf":
            return RandomForestClassificationModel.load(model_path)
        elif model_type == "gbt":
            return GBTClassificationModel.load(model_path)
        else:
            raise ValueError(f"Desteklenmeyen model türü: {model_type}")
    except Exception as e:
        print(f"Model yükleme hatası {model_path}: {e}")
        return None


def evaluate_model(spark, model, service_type: str, sample_size: int = 1000):
    """Model değerlendirme"""
    try:
        # Test verisi yükle
        df = spark.read.json("capstone.*.jsonl")
        df = df.sample(withReplacement=False, fraction=0.01, seed=42)  # %1 örnekleme
        
        # Servis türüne göre filtrele
        service_df = df.filter(df.service_type == service_type)
        
        # Feature engineering
        service_df = service_df.withColumn("apps_count", size(col("apps")))
        
        # auto_payment dönüşümü
        if "auto_payment" in service_df.columns:
            service_df = service_df.withColumn("auto_payment", 
                when(col("auto_payment") == True, 1.0)
                .when(col("auto_payment") == False, 0.0)
                .otherwise(0.0)
            )
        
        # Label oluştur
        service_df = service_df.withColumn("label", col("churn").cast("int"))
        
        # Eksik değerleri doldur
        relevant_columns = RELEVANT_COLUMNS_DICT[service_type]
        for col_name in relevant_columns:
            if col_name in service_df.columns:
                service_df = service_df.withColumn(col_name, 
                    when(isnull(col(col_name)) | isnan(col(col_name)), 0.0)
                    .otherwise(col(col_name).cast("double"))
                )
        
        # Eksik değerli satırları kaldır
        service_df = service_df.dropna()
        
        # VectorAssembler
        assembler = VectorAssembler(
            inputCols=relevant_columns,
            outputCol="features",
            handleInvalid="skip"
        )
        
        # Features oluştur
        df_features = assembler.transform(service_df)
        
        # Test seti oluştur
        test_df = df_features.sample(withReplacement=False, fraction=0.2, seed=42)
        
        # Tahmin
        predictions = model.transform(test_df)
        
        # Değerlendirme
        evaluator_auc = BinaryClassificationEvaluator(labelCol="label", metricName="areaUnderROC")
        evaluator_pr = BinaryClassificationEvaluator(labelCol="label", metricName="areaUnderPR")
        
        auc_roc = evaluator_auc.evaluate(predictions)
        auc_pr = evaluator_pr.evaluate(predictions)
        
        # Accuracy hesapla
        total = predictions.count()
        correct = predictions.filter(col("prediction") == col("label")).count()
        accuracy = correct / total if total > 0 else 0.0
        
        # Churn dağılımı
        churn_count = predictions.filter(col("label") == 1).count()
        churn_rate = churn_count / total if total > 0 else 0.0
        
        return {
            "auc_roc": auc_roc,
            "auc_pr": auc_pr,
            "accuracy": accuracy,
            "total_samples": total,
            "correct_predictions": correct,
            "churn_count": churn_count,
            "churn_rate": churn_rate
        }
        
    except Exception as e:
        print(f"Değerlendirme hatası {service_type}: {e}")
        return None


def print_model_report(service_type: str, metrics: Dict[str, Any], model_path: str):
    """Model raporu yazdır"""
    print(f"\n{'='*60}")
    print(f"{service_type.upper()} MODEL RAPORU")
    print(f"{'='*60}")
    print(f"Model Yolu: {model_path}")
    print(f"AUC-ROC: {metrics['auc_roc']:.4f}")
    print(f"AUC-PR:  {metrics['auc_pr']:.4f}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Toplam Örnek: {metrics['total_samples']:,}")
    print(f"Doğru Tahmin: {metrics['correct_predictions']:,}")
    print(f"🔄 Churn Sayısı: {metrics['churn_count']:,}")
    print(f"Churn Oranı: {metrics['churn_rate']:.2%}")


def compare_models(all_metrics: Dict[str, Dict[str, Any]]):
    """Modelleri karşılaştır"""
    print(f"\n{'='*80}")
    print("MODEL KARŞILAŞTIRMA RAPORU")
    print(f"{'='*80}")
    
    # Tablo başlığı
    print(f"{'Servis Türü':<12} {'AUC-ROC':<8} {'AUC-PR':<8} {'Accuracy':<8} {'Churn Rate':<10}")
    print("-" * 80)
    
    for service_type, metrics in all_metrics.items():
        if metrics:
            print(f"{service_type:<12} {metrics['auc_roc']:<8.4f} {metrics['auc_pr']:<8.4f} "
                  f"{metrics['accuracy']:<8.4f} {metrics['churn_rate']:<10.2%}")
    
    # En iyi performanslar
    if all_metrics:
        best_auc_roc = max(all_metrics.items(), key=lambda x: x[1]['auc_roc'] if x[1] else (0,))
        best_auc_pr = max(all_metrics.items(), key=lambda x: x[1]['auc_pr'] if x[1] else (0,))
        best_accuracy = max(all_metrics.items(), key=lambda x: x[1]['accuracy'] if x[1] else (0,))
        
        print(f"\nEN İYİ PERFORMANSLAR:")
        if best_auc_roc[1]:
            print(f"   AUC-ROC: {best_auc_roc[0]} ({best_auc_roc[1]['auc_roc']:.4f})")
        if best_auc_pr[1]:
            print(f"   AUC-PR:  {best_auc_pr[0]} ({best_auc_pr[1]['auc_pr']:.4f})")
        if best_accuracy[1]:
            print(f"   Accuracy: {best_accuracy[0]} ({best_accuracy[1]['accuracy']:.4f})")


@click.command()
@click.option("--service-type", default="all", help="Servis türü: Prepaid, Broadband, Postpaid, all")
@click.option("--model-type", default="rf", help="Model türü: rf, gbt")
@click.option("--detailed", is_flag=True, help="Detaylı rapor")
def cli(service_type: str, model_type: str, detailed: bool):
    print("Model Metrikleri Raporu")
    print("="*50)
    
    spark = build_spark_app()
    
    try:
        all_metrics = {}
        
        if service_type == "all":
            services = ["Prepaid", "Broadband", "Postpaid"]
        else:
            services = [service_type]
        
        for service in services:
            model_path = f"artifacts/{service.lower()}_model_{model_type}"
            
            if not Path(model_path).exists():
                print(f"Model bulunamadı: {model_path}")
                continue
            
            print(f"\n{service} modeli yükleniyor...")
            model = load_model(model_path, model_type)
            
            if model is None:
                continue
            
            print(f"{service} modeli değerlendiriliyor...")
            metrics = evaluate_model(spark, model, service)
            
            if metrics:
                all_metrics[service] = metrics
                print_model_report(service, metrics, model_path)
            else:
                print(f"{service} değerlendirme başarısız")
        
        # Karşılaştırma raporu
        if len(all_metrics) > 1:
            compare_models(all_metrics)
        
        # JSON raporu kaydet
        if all_metrics:
            report_path = f"artifacts/model_metrics_report_{model_type}.json"
            with open(report_path, "w", encoding="utf-8") as f:
                json.dump(all_metrics, f, ensure_ascii=False, indent=2)
            print(f"\nDetaylı rapor kaydedildi: {report_path}")
        
    finally:
        spark.stop()


if __name__ == "__main__":
    cli()
