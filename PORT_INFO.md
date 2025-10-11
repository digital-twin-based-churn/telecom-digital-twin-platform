# 🔌 Port Yapılandırması

## 📍 Kullanılan Portlar

| Servis | Port | URL | Açıklama |
|--------|------|-----|----------|
| **Frontend** | `8080` | http://localhost:8080 | React + Vite (Kullanıcı arayüzü) |
| **Backend API** | `8000` | http://localhost:8000 | FastAPI (REST API) |
| **API Docs** | `8000` | http://localhost:8000/docs | Swagger UI |
| **PostgreSQL** | `5432` | localhost:5432 | Veritabanı |
| **pgAdmin** | `5050` | http://localhost:5050 | Veritabanı yönetim arayüzü |

---

## ⚠️ ÖNEMLİ!

### Browser'da Nereye Gitmeli?

```
✅ DOĞRU: http://localhost:8080
❌ YANLIŞ: http://localhost:8000
```

**Neden?**
- `8080` → Frontend (React uygulaması)
- `8000` → Backend API (sadece veri servisi)

Frontend, backend'e otomatik olarak bağlanır. Sen sadece `8080` portunu kullan!

---

## 🚀 Başlatma

### Hızlı Başlatma (Tümü):
```bash
bash START_ALL.sh
```

### Manuel Başlatma:

#### 1. Docker (PostgreSQL + pgAdmin):
```bash
docker-compose up -d
```

#### 2. Backend (Port 8000):
```bash
cd api
source venv/bin/activate
python main.py 8000
```

#### 3. Frontend (Port 8080):
```bash
cd frontend
npm run dev
```

---

## 🛑 Durdurma

### Hızlı Durdurma:
```bash
bash STOP_ALL.sh
```

### Manuel Durdurma:
```bash
# Backend durdur
lsof -ti:8000 | xargs kill -9

# Frontend durdur
lsof -ti:8080 | xargs kill -9

# Docker durdur
docker-compose down
```

---

## 🧪 Port Kontrolü

### Hangi portlar kullanımda?
```bash
lsof -i:8000  # Backend
lsof -i:8080  # Frontend
lsof -i:5432  # PostgreSQL
```

### Port çakışması mı var?
```bash
# Port 8000'i temizle
lsof -ti:8000 | xargs kill -9

# Port 8080'i temizle
lsof -ti:8080 | xargs kill -9
```

---

## 🎯 Kullanım Senaryoları

### 1. Chatbot Kullanımı
```
1. Browser'ı aç
2. http://localhost:8080 adresine git
3. Giriş yap veya kayıt ol
4. Chatbot'u kullanmaya başla!
```

### 2. API Test
```bash
# Backend sağlık kontrolü
curl http://localhost:8000/health

# API dokümantasyonu
open http://localhost:8000/docs
```

### 3. Veritabanı Yönetimi
```
Browser: http://localhost:5050
Email: admin@admin.com
Password: admin
```

---

## ❓ Sorun Giderme

### "Port already in use" hatası?
```bash
# İlgili portu temizle
lsof -ti:8080 | xargs kill -9
```

### Backend'e bağlanamıyor?
```bash
# Backend çalışıyor mu?
curl http://localhost:8000/health

# Çalışmıyorsa başlat
cd api && source venv/bin/activate && python main.py 8000
```

### Frontend açılmıyor?
```bash
# Port 8080 kullanımda mı?
lsof -i:8080

# Frontend'i yeniden başlat
cd frontend && npm run dev
```

---

## 📊 Mimari Akış

```
Browser (http://localhost:8080)
        ↓
    Frontend (React)
        ↓ API Calls
    Backend (FastAPI - Port 8000)
        ↓
    PostgreSQL (Port 5432)
```

**Özet:** Sen sadece `8080`'i kullan, geri kalan her şey otomatik! 🎉

