# 🌐 Telekomünikasyon Dijital İkiz Platformu

AI destekli telekomünikasyon sektörü için dijital ikiz platformu. Müşteri analizi, ağ optimizasyonu ve kampanya simülasyonu özellikleri.

## 🚀 Hızlı Başlangıç

### 1️⃣ Environment Dosyasını Ayarlayın

```bash
# Backend .env dosyası oluşturun
cd api
cp .env.example .env
# Ardından .env dosyasını düzenleyip API key'lerinizi ekleyin
```

### 2️⃣ Backend'i Başlatın

```bash
# Virtual environment oluşturun (ilk seferde)
cd api
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Backend'i başlatın
python main.py 8000
```

Backend: http://localhost:8000  
API Docs: http://localhost:8000/swagger

### 3️⃣ Frontend'i Başlatın

```bash
# Bağımlılıkları yükleyin (ilk seferde)
cd frontend
npm install

# Frontend'i başlatın
npm run dev
```

Frontend: http://localhost:8080

### 4️⃣ Docker (Opsiyonel - PostgreSQL)

```bash
# PostgreSQL ve pgAdmin başlatın
docker-compose up -d
```

- PostgreSQL: Port 5433
- pgAdmin: http://localhost:5050 (admin@gmail.com / admin123)

---

## 🔑 API Key'leri Nasıl Alınır?

### Google Gemini API (ANA AI MODELİ - ÜCRETSİZ) ⭐
**Model:** Gemini 2.0 Flash (Ücretsiz)

**Nasıl alınır (Çok Kolay - 2 Dakika!):**
1. 🔗 https://makersuite.google.com/app/apikey adresine gidin
2. Google hesabınızla giriş yapın
3. **"Create API Key"** butonuna tıklayın
4. Key'i kopyalayın (AIzaSy... ile başlar)
5. `.env` dosyasına ekleyin:
   ```bash
   GOOGLE_API_KEY=AIzaSy...your-actual-key...
   ```

**Özellikler:**
- ✅ Tamamen ÜCRETSIZ (aylık 1500 request)
- ✅ GPT-4 seviyesinde performans
- ✅ Mükemmel Türkçe desteği
- ✅ Hızlı yanıt süresi (Flash model)
- ✅ Google hesabı ile 2 dakikada key alırsınız

### Tavily API (Web Arama - Opsiyonel)
1. https://tavily.com adresine gidin
2. Ücretsiz hesap oluşturun (email ile)
3. API key alın
4. `.env` dosyasına ekleyin:
   ```bash
   TAVILY_API_KEY=tvly-...
   ```

**Not:** Web arama, güncel kampanya ve fiyat bilgileri için kullanılır.

---

## 📁 Proje Yapısı

```
proje/
├── api/                    # Backend (FastAPI)
│   ├── main.py            # Ana uygulama
│   ├── routers/           # API endpoint'leri
│   │   ├── auth.py        # Kimlik doğrulama
│   │   └── chatbot.py     # AI chatbot
│   ├── services/          # İş mantığı
│   │   └── rag_chatbot.py # RAG chatbot servisi
│   ├── .env.example       # Environment örneği
│   └── requirements.txt   # Python bağımlılıkları
│
├── frontend/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/         # Sayfalar
│   │   ├── components/    # UI bileşenleri
│   │   └── services/      # API servisleri
│   └── package.json       # Node bağımlılıkları
│
├── docker-compose.yml     # Docker yapılandırması
└── README.md             # Bu dosya
```

---

## 🎯 Özellikler

- ✅ **AI Chatbot**: ZhipuAI GLM / Google Gemini destekli akıllı sohbet
- ✅ **Web Arama**: Tavily API ile güncel bilgi erişimi
- ✅ **Kimlik Doğrulama**: JWT tabanlı güvenli giriş
- ✅ **Veritabanı**: SQLite (varsayılan) / PostgreSQL (Docker)
- ✅ **Modern UI**: React + Vite + Tailwind CSS + shadcn/ui
- ✅ **API Dokümantasyonu**: Swagger UI

---

## 🛠️ Teknolojiler

**Backend:**
- FastAPI
- SQLAlchemy
- JWT Authentication
- LangChain
- Google Gemini / ZhipuAI

**Frontend:**
- React 18
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui

**Database:**
- SQLite (development)
- PostgreSQL (production)

**AI:**
- Google Gemini 2.0 Flash (Main AI Engine)
- Tavily Web Search (Optional - Real-time data)

---

## 📖 API Endpoint'leri

### Authentication
- `POST /auth/register` - Yeni kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/me` - Mevcut kullanıcı bilgisi

### Chatbot
- `POST /api/chatbot/chat` - AI ile sohbet
- `GET /api/chatbot/health` - Chatbot durumu
- `POST /api/chatbot/competitor-analysis` - Rakip analizi

### Health Check
- `GET /health` - Sistem sağlık kontrolü
- `GET /db-test` - Veritabanı bağlantı testi

---

## 🔧 Geliştirme

### Backend Geliştirme
```bash
cd api
source venv/bin/activate
python main.py 8000
```

### Frontend Geliştirme
```bash
cd frontend
npm run dev
```

### Linting
```bash
# Frontend
cd frontend
npm run lint
```

---

## 🐳 Docker Komutları

```bash
# Servisleri başlat
docker-compose up -d

# Servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f

# Veritabanını sıfırla
docker-compose down -v
docker-compose up -d
```

---

## 📝 Environment Değişkenleri

Tüm environment değişkenlerini görmek için:
- `api/.env.example` dosyasına bakın

---

## ❓ Sorun Giderme

### Chatbot "Offline Mode" diyor
- `.env` dosyasında geçerli bir API key olduğundan emin olun
- Backend'i yeniden başlatın

### CORS Hatası
- Frontend ve Backend URL'lerinin `.env` içinde doğru olduğundan emin olun
- Tarayıcı cache'ini temizleyin (Ctrl+Shift+Delete)

### Port Zaten Kullanımda
```bash
# Port'u kullanan process'i bulun
lsof -i :8000  # Backend
lsof -i :8080  # Frontend

# Process'i sonlandırın
kill -9 <PID>
```

---

## 📄 Lisans

Bu proje eğitim amaçlıdır.

---

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📧 İletişim

Sorularınız için issue açabilirsiniz.

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**

