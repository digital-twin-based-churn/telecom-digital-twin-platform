## Hızlı Başlangıç

### Gereksinimler

- Python 3.11 (venv ile)
- Java 11 (Temurin/OpenJDK)

### Kurulum

```bash
python -m venv venv
./venv/Scripts/pip install -r data/requirements.txt
```

### Servisi Başlatma (Windows PowerShell)

```powershell
.\u005cscriptsserve.ps1 -Port 8001
```

- OUT*DIR otomatik olarak en güncel `artifacts/postpaid_prod*\*` klasörüne işaret eder.
- Farklı bir artefakt klasörü için:

```powershell
.\u005cscriptsserve.ps1 -Port 8001 -OutDir "artifacts\postpaid_prod_YYYYMMDD_HHMMSS"
```

### Servisi Başlatma (Unix/macOS)

```bash
chmod +x scripts/serve.sh
./scripts/serve.sh 8001
```

### Sağlık Kontrolü

Tarayıcı: `http://127.0.0.1:8001/health`

### Swagger UI

`http://127.0.0.1:8001/docs`

### Örnek Skorlama (/score)

Swagger üzerinden POST `/score` seçip aşağıdaki örnek gövde ile çalıştırın:

```json
{
  "id": "demo_1",
  "age": 34,
  "tenure": 18,
  "service_type": "Postpaid",
  "avg_call_duration": 52.3,
  "data_usage": 9.4,
  "roaming_usage": 0.2,
  "monthly_charge": 129.9,
  "overdue_payments": 0,
  "auto_payment": true,
  "avg_top_up_count": 0,
  "call_drops": 1,
  "customer_support_calls": 0,
  "satisfaction_score": 8.2,
  "apps": ["app1", "app2"]
}
```

### Notlar

- JAVA_HOME ve PATH içinde Java 11 bulunduğundan emin olun.
- Spark temp klasörü varsayılan: `C:\\spark_tmp` (Windows) / `/tmp/spark_tmp` (Unix)
