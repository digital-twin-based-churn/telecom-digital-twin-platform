# GYK Capstone Project - Multi-Model Churn Prediction System

## 📋 Proje Özeti

Bu proje, telekomünikasyon sektöründe müşteri churn (ayrılma) tahmini için geliştirilmiş çoklu model makine öğrenmesi sistemidir. Postpaid, Prepaid ve Broadband servis türleri için ayrı ayrı optimize edilmiş modeller kullanır.

## 🎯 Özellikler

- **Çoklu Servis Türü Desteği**: Postpaid, Prepaid, Broadband
- **Farklı Model Algoritmaları**: 
  - Postpaid: GBT (Gradient Boosting Trees)
  - Prepaid: RandomForest
  - Broadband: RandomForest
- **Otomatik Feature Engineering**: Dinamik özellik oluşturma
- **Optimize Edilmiş Threshold'lar**: Her servis türü için ayrı threshold
- **Real-time Scoring**: Anlık churn tahmini
- **RESTful API**: FastAPI tabanlı web servisi

## 🏗️ Proje Yapısı

```
GYK-capstone-project/
├── data/                          # Veri ve model dosyaları
│   ├── artifacts/                 # Eğitilmiş modeller
│   │   ├── postpaid_prod_*/       # Postpaid GBT modeli
│   │   ├── prepaid_model_rf/      # Prepaid RandomForest modeli
│   │   ├── broadband_model_rf/    # Broadband RandomForest modeli
│   │   ├── model_metrics_report_rf.json  # Model metrikleri
│   │   └── churn_test_scenarios.json     # Test senaryoları
│   ├── outputs/                   # Analiz çıktıları
│   ├── feature_engineering*.py    # Feature engineering scriptleri
│   ├── experiment*.py            # Model eğitimi scriptleri
│   └── train_models_simple.py    # Basit model eğitimi
├── svc/                          # Web servisi
│   ├── app_multi_model.py        # Ana FastAPI uygulaması
│   └── app.py                    # Orijinal Postpaid servisi
├── scripts/                      # Başlatma scriptleri
│   ├── serve.sh                  # Unix/macOS başlatma
│   └── serve.ps1                 # Windows başlatma
└── README.md                     # Bu dosya
```

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Python**: 3.11+
- **Java**: 11+ (Temurin/OpenJDK)
- **Spark**: 3.4+ (otomatik yüklenir)
- **Memory**: En az 4GB RAM

### Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd GYK-capstone-project
```

2. **Virtual environment oluşturun:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
# veya
venv\Scripts\activate     # Windows
```

3. **Gerekli paketleri yükleyin:**
```bash
pip install -r data/requirements.txt
```

### Servisi Başlatma

#### Linux/macOS:
```bash
chmod +x scripts/serve.sh
./scripts/serve.sh 8000
```

#### Windows PowerShell:
```powershell
.\scripts\serve.ps1 -Port 8000
```

#### Manuel Başlatma:
```bash
cd svc
export SPARK_LOCAL_IP=127.0.0.1
export PYSPARK_PYTHON=/opt/anaconda3/bin/python
export PYSPARK_DRIVER_PYTHON=/opt/anaconda3/bin/python
python -c "
import uvicorn
uvicorn.run('app_multi_model:app', host='127.0.0.1', port=8000, reload=False)
"
```

## 🔧 API Kullanımı

### Health Check
```bash
curl http://localhost:8000/health
```

### Churn Tahmini

#### Postpaid Müşteri:
```bash
curl -X POST "http://localhost:8000/score" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "postpaid_001",
    "service_type": "Postpaid",
    "age": 35,
    "tenure": 24,
    "avg_call_duration": 120.5,
    "data_usage": 2.5,
    "roaming_usage": 0.1,
    "monthly_charge": 45.0,
    "overdue_payments": 0,
    "auto_payment": true,
    "call_drops": 2,
    "customer_support_calls": 1,
    "satisfaction_score": 4.2,
    "apps": ["WhatsApp", "Instagram", "Netflix"]
  }'
```

#### Prepaid Müşteri:
```bash
curl -X POST "http://localhost:8000/score" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "prepaid_001",
    "service_type": "Prepaid",
    "age": 28,
    "tenure": 12,
    "avg_call_duration": 80.0,
    "data_usage": 3.0,
    "roaming_usage": 0.5,
    "monthly_charge": 30.0,
    "avg_top_up_count": 3,
    "call_drops": 1,
    "customer_support_calls": 0,
    "satisfaction_score": 4.5,
    "apps": ["WhatsApp", "Instagram"]
  }'
```

#### Broadband Müşteri:
```bash
curl -X POST "http://localhost:8000/score" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "broadband_001",
    "service_type": "Broadband",
    "age": 42,
    "tenure": 36,
    "data_usage": 100.0,
    "monthly_charge": 60.0,
    "overdue_payments": 0,
    "auto_payment": true,
    "customer_support_calls": 0,
    "satisfaction_score": 4.8,
    "apps": ["WhatsApp", "Instagram", "Netflix", "YouTube"]
  }'
```

## 📊 Model Performansları

| Servis Türü | Model | AUC-ROC | AUC-PR | Accuracy | Threshold |
|-------------|-------|---------|--------|----------|-----------|
| Postpaid    | GBT   | 0.7792  | 0.1234 | 98.12%   | 15.0%     |
| Prepaid     | RF    | 0.6613  | 0.0294 | 98.09%   | 8.0%      |
| Broadband   | RF    | 0.5888  | 0.0040 | 99.70%   | 1.0%      |

## 🧪 Test Senaryoları

Test senaryolarını çalıştırmak için:

```bash
cd data/artifacts
python run_churn_tests.py
```

Bu script 6 farklı test senaryosunu çalıştırır:
- Postpaid: Sadık ve Problemli müşteri
- Prepaid: Sadık ve Problemli müşteri  
- Broadband: Sadık ve Problemli müşteri

## 🔍 Model Eğitimi

### Yeni Model Eğitimi

```bash
cd data
python train_models_simple.py --service-type Postpaid
python train_models_simple.py --service-type Prepaid
python train_models_simple.py --service-type Broadband
```

### Model Metriklerini Görüntüleme

```bash
cd data
python model_metrics_report.py
```

## 📈 Feature Engineering

### Postpaid Features (28 özellik)
- Temel özellikler: age, tenure, avg_call_duration, data_usage, etc.
- Log dönüşümleri: log_charge, log_usage, log_tenure
- Ratio özellikleri: overdue_ratio, support_calls_rate
- Binary flaglar: has_overdue_flag, satisfaction_low
- Etkileşim özellikleri: log_charge_x_log_usage

### Prepaid Features (12 özellik)
- Temel özellikler: age, tenure, avg_call_duration, data_usage, etc.
- Prepaid özel: avg_top_up_count, top_up_rate, frequent_top_up
- Roaming özellikleri: has_roaming, roaming_usage

### Broadband Features (9 özellik)
- Temel özellikler: age, tenure, data_usage, monthly_charge, etc.
- Broadband özel: overdue_ratio, high_usage, has_overdue_flag

## 🛠️ Geliştirme

### Yeni Servis Türü Ekleme

1. `data/feature_engineering_<service>.py` oluşturun
2. `svc/app_multi_model.py`'de yeni servis türünü ekleyin
3. Model eğitimi yapın
4. Test senaryolarını güncelleyin

### Debug Modu

```bash
export SPARK_LOCAL_IP=127.0.0.1
export PYSPARK_PYTHON=/opt/anaconda3/bin/python
export PYSPARK_DRIVER_PYTHON=/opt/anaconda3/bin/python
uvicorn app_multi_model:app --host 127.0.0.1 --port 8000 --reload
```

## 📝 API Dokümantasyonu

Swagger UI: `http://localhost:8000/docs`

### Endpoints

- `GET /health` - Servis durumu
- `POST /score` - Churn tahmini
- `GET /models` - Yüklenen modeller
- `GET /thresholds` - Aktif threshold'lar

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **Port zaten kullanımda**: Farklı port kullanın
2. **Java bulunamadı**: JAVA_HOME ayarlayın
3. **Spark session hatası**: PYSPARK_PYTHON ayarlayın
4. **Model yüklenemiyor**: artifacts klasörünü kontrol edin

### Log Kontrolü

```bash
# Servis loglarını görüntüle
tail -f logs/ml_service.log
```

## 📊 Veri Kaynakları

- **Eğitim Verisi**: 10M+ müşteri kaydı
- **Test Verisi**: 6 farklı senaryo
- **Model Artifacts**: Eğitilmiş modeller ve metrikler

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Ekip

- **Geliştirici**: GYK Capstone Team
- **Proje**: Multi-Model Churn Prediction System
- **Tarih**: 2024

## 📞 İletişim

Sorularınız için issue açabilir veya e-posta gönderebilirsiniz.

---

**Not**: Bu sistem production ortamında kullanılmadan önce kapsamlı testlerden geçirilmelidir.