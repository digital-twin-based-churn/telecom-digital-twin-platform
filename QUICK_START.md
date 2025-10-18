# ⚡ Hızlı Başlangıç Kılavuzu

## 🎯 Port Yapılandırması

### Sabit Port Ayarları
- **Backend (FastAPI):** Port **8000** (http://localhost:8000)
- **Frontend (React/Vite):** Port **8081** (http://localhost:8081)
- **PostgreSQL:** Port **5433** (localhost:5433)

> ⚠️ **ÖNEMLİ:** Backend artık varsayılan olarak **8000** portunda çalışır. 
> Port çakışması problemi tamamen çözülmüştür.

---

## 🚀 Backend Başlatma

### Yöntem 1: Otomatik Script (Önerilen) ⭐

```bash
cd api
./start_backend.sh
```

Bu script otomatik olarak:
- ✅ Virtual environment'ı aktif eder
- ✅ Port 8000'de backend'i başlatır
- ✅ Gerekli kontrolleri yapar

### Yöntem 2: Manuel Başlatma

```bash
cd api
source venv/bin/activate
python main.py          # Port 8000 (varsayılan)
# veya
python main.py 9000     # Farklı bir port (örn: 9000)
```

---

## 🔗 Backend URL'leri

| Servis | URL |
|--------|-----|
| Ana Sayfa | http://localhost:8000 |
| Health Check | http://localhost:8000/health |
| Database Test | http://localhost:8000/db-test |
| API Docs (Swagger) | http://localhost:8000/swagger |
| ReDoc | http://localhost:8000/redoc |

---

## 🎨 Frontend Başlatma

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:8081

> **Not:** Frontend zaten 8000 portunu backend için kullanacak şekilde yapılandırılmıştır.

---

## 🐳 Docker (PostgreSQL)

```bash
# PostgreSQL ve pgAdmin başlat
docker-compose up -d

# Durum kontrolü
docker-compose ps

# Logları görüntüle
docker-compose logs -f

# Durdur
docker-compose down
```

- PostgreSQL: localhost:5433
- pgAdmin: http://localhost:5050

---

## ✅ Test Komutları

### Backend Test
```bash
# Health check
curl http://localhost:8000/health

# Database test
curl http://localhost:8000/db-test

# API root
curl http://localhost:8000/
```

### Port Kontrolü
```bash
# Backend portunu kontrol et
lsof -i :8000

# Frontend portunu kontrol et
lsof -i :8081

# PostgreSQL portunu kontrol et
lsof -i :5433
```

---

## 🔧 Sorun Giderme

### Port Çakışması
Eğer hala port problemi yaşıyorsanız:

```bash
# Çakışan process'leri bul ve kapat
lsof -i :8000 | grep LISTEN
kill -9 <PID>

# veya backend'i farklı portta başlat
python main.py 9000
```

### Backend Çalışmıyor
```bash
# Process'leri kontrol et
ps aux | grep "python main.py"

# Logları kontrol et
cd api
tail -f *.log  # Eğer log dosyası varsa

# Virtual environment aktif mi?
which python  # /Users/sultan/Desktop/proje/api/venv/bin/python olmalı
```

### Veritabanı Bağlantı Hatası
```bash
# PostgreSQL çalışıyor mu?
docker-compose ps

# .env dosyasını kontrol et
cat api/.env | grep DATABASE_URL

# Doğru değer:
# DATABASE_URL=postgresql://postgres:password@localhost:5433/churn_db
```

---

## 📝 Environment Değişkenleri

`.env` dosyası **api/** klasöründe olmalı:

```bash
cd api

# .env yoksa example'dan kopyala
cp .env.example .env

# Düzenle
nano .env  # veya code .env
```

Gerekli değişkenler:
- `GOOGLE_API_KEY` - Google Gemini API key (chatbot için)
- `DATABASE_URL` - PostgreSQL bağlantı string'i
- `SECRET_KEY` - JWT authentication için
- `TAVILY_API_KEY` - (Opsiyonel) Web arama için

---

## 🎯 Özet - Her Seferinde Yapılacaklar

### 1. PostgreSQL Başlat
```bash
docker-compose up -d
```

### 2. Backend Başlat
```bash
cd api
./start_backend.sh
```

### 3. Frontend Başlat
```bash
cd frontend
npm run dev
```

### 4. Tarayıcıda Aç
- Frontend: http://localhost:8081
- Backend API: http://localhost:8000/swagger

---

## ✨ Tamamlandı!

Artık:
- ✅ Backend **8000** portunda çalışıyor
- ✅ Frontend **8081** portunda çalışıyor
- ✅ Port çakışması sorunu **tamamen çözüldü**
- ✅ Her başlatmada **8000** portunu kullanacak
- ✅ Kolay başlatma scripti hazır

Başarılar! 🚀

