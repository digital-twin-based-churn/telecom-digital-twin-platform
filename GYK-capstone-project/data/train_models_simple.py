

from typing import Dict, List
import click
from pyspark.ml.classification import RandomForestClassifier, GBTClassifier
from pyspark.ml.feature import VectorAssembler
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, size, when, isnan, isnull
from pyspark.ml.evaluation import BinaryClassificationEvaluator
import os
from pathlib import Path

ALL_COLUMNS = [
    "service_type",
    "app",
    "avg_call_duration",
    "avg_top_up_count",
    "call_drops",
    "id",
    "roaming_usage",
    "apps",
    "churn",
    "auto_payment",
    "tenure",
    "age",
    "apps_count",
    "customer_support_calls",
    "data_usage",
    "monthly_charge",
    "overdue_payments",
    "satisfaction_score",
]

RELEVANT_COLUMNS_DICT: Dict[str, List[str]] = {
    "Broadband": [
        "auto_payment",
        "tenure",
        "age",
        "apps_count",
        "customer_support_calls",
        "data_usage",
        "monthly_charge",
        "overdue_payments",
        "satisfaction_score",
    ],
    "Prepaid": [
        "avg_call_duration",
        "avg_top_up_count",
        "call_drops",
        "roaming_usage",
        "tenure",
        "age",
        "apps_count",
        "customer_support_calls",
        "data_usage",
        "monthly_charge",
        "satisfaction_score",
    ],
    "Postpaid": [
        "avg_call_duration",
        "call_drops",
        "roaming_usage",
        "auto_payment",
        "tenure",
        "age",
        "apps_count",
        "customer_support_calls",
        "data_usage",
        "monthly_charge",
        "overdue_payments",
        "satisfaction_score",
    ],
}


def build_spark_app(name: str = "Churn Prediction Application"):
    spark = (
        SparkSession.builder.appName(name)
        .master("local[*]")
        .config("spark.driver.memory", "4g")
        .config("spark.executor.memory", "4g")
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.sql.shuffle.partitions", "8")
        .getOrCreate()
    )
    spark.sparkContext.setLogLevel("WARN")
    return spark


def preprocess_data(df, service_type: str):
    """Veriyi ön işleme"""
    relevant_columns = RELEVANT_COLUMNS_DICT.get(service_type)
    
    # Servis türüne göre filtrele
    service_df = df.filter(df.service_type == service_type)
    
    # apps_count ekle
    service_df = service_df.withColumn("apps_count", size(col("apps")))
    
    # auto_payment boolean -> int dönüşümü
    if "auto_payment" in relevant_columns:
        service_df = service_df.withColumn("auto_payment", 
            when(col("auto_payment") == True, 1.0)
            .when(col("auto_payment") == False, 0.0)
            .otherwise(0.0)
        )
    
    # Sadece ilgili kolonları seç
    columns_to_keep = relevant_columns + ["churn", "id"]
    service_df = service_df.select(*columns_to_keep)
    
    # Label oluştur
    service_df = service_df.withColumn("label", col("churn").cast("int"))
    
    # Eksik değerleri doldur (basit yaklaşım)
    for col_name in relevant_columns:
        if col_name in service_df.columns:
            service_df = service_df.withColumn(col_name, 
                when(isnull(col(col_name)) | isnan(col(col_name)), 0.0)
                .otherwise(col(col_name).cast("double"))
            )
    
    # Eksik değerli satırları kaldır
    service_df = service_df.dropna()
    
    return service_df, relevant_columns


def train_model(service_df, relevant_columns, model_type="rf"):
    """Model eğit"""
    # VectorAssembler
    assembler = VectorAssembler(
        inputCols=relevant_columns,
        outputCol="features",
        handleInvalid="skip"
    )
    
    # Features oluştur
    df_features = assembler.transform(service_df)
    
    # Train/Test split
    train, test = df_features.randomSplit(weights=[0.8, 0.2], seed=42)
    
    # Model seçimi
    if model_type == "rf":
        model = RandomForestClassifier(
            maxDepth=10, 
            numTrees=40,
            labelCol="label",
            featuresCol="features",
            seed=42
        )
    elif model_type == "gbt":
        model = GBTClassifier(
            maxDepth=6,
            maxIter=50,
            labelCol="label", 
            featuresCol="features",
            seed=42
        )
    else:
        raise ValueError(f"Desteklenmeyen model türü: {model_type}")
    
    # Model eğit
    trained_model = model.fit(train)
    
    # Tahmin
    predictions = trained_model.transform(test)
    
    # Değerlendirme
    evaluator_auc = BinaryClassificationEvaluator(labelCol="label", metricName="areaUnderROC")
    evaluator_pr = BinaryClassificationEvaluator(labelCol="label", metricName="areaUnderPR")
    
    auc_roc = evaluator_auc.evaluate(predictions)
    auc_pr = evaluator_pr.evaluate(predictions)
    
    # Accuracy hesapla
    total = predictions.count()
    correct = predictions.filter(col("prediction") == col("label")).count()
    accuracy = correct / total if total > 0 else 0.0
    
    return {
        "model": trained_model,
        "auc_roc": auc_roc,
        "auc_pr": auc_pr,
        "accuracy": accuracy,
        "total_samples": total,
        "correct_predictions": correct
    }


@click.command()
@click.option("--service-type", default="Broadband", help="Servis türü: Prepaid, Postpaid, Broadband")
@click.option("--file-glob", default="capstone.*.jsonl", help="Veri dosyası pattern")
@click.option("--model-type", default="rf", help="Model türü: rf (RandomForest) veya gbt (GradientBoosting)")
@click.option("--sample-frac", default=0.01, help="Örnekleme oranı (0.01 = %1)")
def cli(service_type: str, file_glob: str, model_type: str, sample_frac: float):
    print(f"{service_type} Model Eğitimi Başlıyor...")
    print(f"Dosya: {file_glob}")
    print(f"Model: {model_type}")
    print(f"Örnekleme: {sample_frac}")
    print("="*60)
    
    # Spark session oluştur
    spark = build_spark_app(f"{service_type} Churn Model")
    
    try:
        # Veriyi yükle
        print("Veri yükleniyor...")
        df = spark.read.json(file_glob)
        
        # Örnekleme
        if sample_frac < 1.0:
            df = df.sample(withReplacement=False, fraction=sample_frac, seed=42)
        
        print(f"Veri yüklendi: {df.count()} kayıt")
        
        # Veriyi ön işleme
        print("Veri ön işleme...")
        service_df, relevant_columns = preprocess_data(df, service_type)
        
        print(f"{service_type} için {service_df.count()} kayıt")
        print(f"Kullanılan feature'lar: {relevant_columns}")
        
        # Model eğit
        print("Model eğitiliyor...")
        results = train_model(service_df, relevant_columns, model_type)
        
        # Sonuçları yazdır
        print("\n" + "="*60)
        print(f"{service_type} MODEL SONUÇLARI")
        print("="*60)
        print(f"AUC-ROC: {results['auc_roc']:.4f}")
        print(f"AUC-PR:  {results['auc_pr']:.4f}")
        print(f"Accuracy: {results['accuracy']:.4f}")
        print(f"Toplam örnek: {results['total_samples']}")
        print(f"Doğru tahmin: {results['correct_predictions']}")
        
        # Model kaydet
        model_dir = f"artifacts/{service_type.lower()}_model_{model_type}"
        Path("artifacts").mkdir(exist_ok=True)
        
        try:
            results['model'].write().overwrite().save(model_dir)
            print(f"Model kaydedildi: {model_dir}")
        except Exception as e:
            print(f"Model kaydetme hatası: {e}")
        
        print(f"\n{service_type} model eğitimi tamamlandı!")
        
    finally:
        spark.stop()


if __name__ == "__main__":
    cli()
