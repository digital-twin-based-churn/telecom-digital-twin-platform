# Dijital İkiz Tabanlı Churn Önleme Sistemi

AI destekli telekomünikasyon sektörü için dijital ikiz platformu. Müşteri analizi, ağ optimizasyonu ve kampanya simülasyonu özellikleri.


##  Proje Özeti: 
Telekomünikasyon sektöründe müşteri kaybı (churn), şirketlerin kârlılığını doğrudan etkileyen en kritik sorunlardan biridir.
Bu proje, yalnızca müşterilerin ayrılma olasılığını tahmin etmekle kalmaz; her abone için kişiselleştirilmiş bir dijital ikiz (digital twin) oluşturarak, farklı pazarlama stratejilerini bu sanal modeller üzerinde simüle eder.Böylece, gerçek müşteriler üzerinde uygulanmadan önce her stratejinin etkisi test edilebilir, risk azaltılır ve pazarlama kaynakları en verimli şekilde kullanılır.

##  Proje Amacı:
telekom operatörlerinin müşteri sadakatini artırmasını, hedefli kampanyalar geliştirmesini ve gelir kaybını önlemesini sağlamayı amaçlar.
Dijital ikiz yaklaşımıyla her müşterinin geçmiş davranışları, kullanım alışkanlıkları ve etkileşim geçmişi analiz edilir.
Bu sayede sistem yalnızca “kim ayrılabilir”i değil, aynı zamanda “neden ayrılabilir” ve “nasıl tutulabilir” sorularına da yanıt verir.

##  Sistem Mimarisi: 
### 1️⃣ Veri KAYNAGI
Her bir dosyada 1 milyon veri vardır toplamda 10 milyon veri ile çalışılmıştır.
https://drive.google.com/drive/folders/1eCzX_xP4rxu8pmYO0lFQI4X0rQyk8R-V?usp=drive_link

### Features

* **id**: Müşteri IDsi
* **age**: Müşterinin yaşı
* **tenure**: Müşterinin operatörde geçirdiği toplam süre (ay cinsinden)
* **service_type**: Ön Ödemeli, Peşin Ödemeli veya Geniş Bant internet müşterisi
* **avg_call_duration**: Ortalama sesli görüşme süresi (saniye)
* **data_usage**: GB Upload + Download
* **roaming_usage**: Ortalama roaming sesli görüşme süresi
* **monthly_charge**: Aylık ortalama fatura
* **overdue_payments**: Ödemesi geçen fatura adedi
* **auto_payment**: Otomatik ödeme talimatı
* **avg_top_up_count**: Ön yüklemeli abone için aylık yükleme sayısı ortalaması
* **call_drops**: Şebekede yaşadığı sesli görüşme kesilmesi
* **customer_support_calls**: Toplam çağrı merkezi araması
* **satisfaction_score**: Müşteri çağrı merkezi değerlendirme skoru
* **apps**: Müşterinin kullandığı diğer servislerimiz
    * İzleGo
    * RitimGo
    * CüzdanX
    * HızlıPazar
    * Konuşalım
* **churn**: bool

Projemizde kullanılan veri kümesi, her satırda bağımsız bir JSON nesnesi içeren Json Line (JSONL) formatında yapılandırılmıştır. Bu format, özellikle milyonlarca kayıttan oluşan büyük veri setlerinde yüksek performans sağlamıştır; çünkü her satır ayrı bir JSON nesnesi olarak saklandığından, veriler dağıtık sistemlerde paralel olarak işlenebilmiştir.
Bu yapı sayesinde PySpark ile veriler tek bir makineye yüklenmeden, birden fazla çekirdek veya işlemci üzerinde parçalı (distributed) okuma işlemi gerçekleştirilmiştir. Böylece veri okuma süresi önemli ölçüde kısaltılmış, bellek kullanımı optimize edilmiş ve büyük hacimli verilerin verimli bir şekilde işlenmesi sağlanmıştır.

Veri analizine başlandığında, genel churn (abonelik iptali) oranının %0.133 olduğu belirlenmiştir. Bu oldukça düşük bir oran olup, veri setinin doğası gereği dengesiz (imbalanced) bir yapıda olduğunu görmekteyiz.Aynı dengesizlik, service türlerinde de vardır.
Prepaid müşterilerinde churn oranı %1.87,
Broadband müşterilerinde %0.286,
Postpaid müşterilerinde %1.85 olarak hesaplanmıştır.

### 2️⃣  Feature Selection

Her özellik (feature), tüm hizmet türleri (service type) için aynı derecede anlamlı değildir. Telekomünikasyon sektöründe müşterilerin davranışları, kullandıkları hizmet türüne göre önemli farklılıklar göstermektedir.
Bu nedenle, modelleme sürecinde her service_type için yalnızca o segmente ait anlamlı ve etkili özellikler kullanılmış, ilişkisiz değişkenler bilinçli olarak veri setinden çıkarılmıştır.
Örneğin, avg_top_up_count (ortalama yükleme sayısı) yalnızca Prepaid müşteriler için geçerlidir; çünkü faturalı (Postpaid) kullanıcılar yükleme işlemi yapmamaktadır.
Benzer biçimde, auto_payment (otomatik ödeme talimatı) yalnızca Postpaid ve Broadband müşterilerde anlam taşımaktadır.
Ayrıca, avg_call_duration, call_drops ve roaming_usage gibi sesli iletişim temelli değişkenler, sadece mobil hizmet kullanıcılarını temsil ettiği için Broadband segmentinde dikkate alınmamıştır.Buna karşılık, age, tenure, data_usage, satisfaction_score ve monthly_charge gibi genel davranışsal ve finansal göstergeler tüm segmentlerde ortak olarak kullanılmıştır.

Sonuç olarak, özellik seçimi (feature selection) süreci, hem iş mantığına uygunluk (business relevancy) hem de istatistiksel katkı (predictive significance) dikkate alınarak optimize edilmiştir.
Bu yaklaşım sayesinde her hizmet segmenti (Prepaid, Postpaid, Broadband) için oluşturulan modeller, kendi müşteri dinamiklerine uygun daha doğru, güvenilir ve açıklanabilir tahminler üretebilmiştir.


Each feature is only relevant for a subset of **Service Type**. You can find the relevancy in following table.


|                                      | Prepaid | Postpaid | Broadband |
|--------------------------------------|:-------:|:--------:|:---------:|
| app (as `size (app)`)                |    x    |    x     |     x     |
| avg_call_duration                    |    x    |    x     |           |
| avg_top_up_count                     |    x    |          |           |
| call_drops                           |    x    |    x     |           |
| roaming_usage                        |    x    |    x     |           |
| auto_payment                         |         |    x     |     x     |
| tenure                               |    x    |    x     |     x     |
| age                                  |    x    |    x     |     x     |
| customer_support_calls               |    x    |    x     |     x     |
| satisfaction_score                   |    x    |    x     |     x     |
| data_usage                           |    x    |    x     |     x     |
| monthly_charge                       |    x    |    x     |     x     |
| overdue_payments                     |         |    x     |     x     |
| **churn** (Target, as `cast("int")`) |    x    |    x     |     x     |




### 3️⃣   Model Training
3 ayrı model kurulmuş olup detayını yazacagım.


### 4️⃣ Model Evaluation


### 5️⃣ Explainable AI / XAI
LIME kullanılarak modelin nasıl yorumlandığını anltılıp.Her bir müşterinin churn kararına etki eden faktörleri gösterilmiştir.

### 6️⃣ Agent-Based Dijital İkiz Modelleme
Bu projede ki en yenilikçi yönü, her müşterinin geçmiş davranış verilerine dayanarak oluşturulan kişiselleştirilmiş dijital ikiz (Digital Twin) modelleridir. Dijital ikiz, gerçek bir müşterinin sanal bir yansıması olarak tasarlanmıştır ve o müşterinin geçmiş etkileşimlerini, hizmet kullanım alışkanlıklarını, finansal davranışlarını ve memnuniyet düzeylerini temsil eder. Bu yapı sayesinde sistem, gerçek müşteriye herhangi bir müdahalede bulunmadan önce, planlanan pazarlama stratejilerinin olası etkilerini bu dijital ikizler üzerinde test edebilmekte yani bir anlamda “sanal laboratuvar ortamı” oluşturmaktadır.

Dijital İkiz Oluşturma: Bu profilden yola çıkarak, her müşteri için dinamik bir sanal temsilci (agent) oluşturulur. Dijital ikiz, müşterinin gelecekteki davranışlarını olasılıksal biçimde taklit eder. Örneğin, fiyat artışı, kampanya teklifi veya hizmet kalitesindeki değişim gibi durumlara nasıl tepki verebileceğini simüle eder. Simülasyon ve Strateji Testi: Geliştirilen Agent-Based Modeling (ABM) yapısı, bireysel müşteri ikizlerinin etkileşimlerini toplu düzeyde analiz eder. Böylece sistem, “bir kampanya değişikliği 10 bin müşteri üzerinde ne kadar etki yaratır?” gibi sorulara, gerçek veriye dayalı simülasyon sonuçlarıyla yanıt verebilir. Kampanya Optimizasyonu: Gerçek müşterilere kampanya uygulanmadan önce, farklı stratejiler bu ikizler üzerinde test edilir. Bu testler sonucunda, en yüksek memnuniyet – en düşük churn riski kombinasyonu seçilir.


Bu projede sanal Laboratuvar mantığı yapısı oluşturulmuştur. Bu yapıyla da, telekom operatörleri için bir tür “deneme–yanılma yapılmadan karar verme sistemi” olarak çalışır. Her müşterinin dijital ikizi, gerçek sistemden izole edilmiş bir laboratuvar ortamında bulunur. Bu ortamda şirket, kampanya tekliflerini, fiyat değişimlerini veya hizmet iyileştirmelerini önce bu dijital ikizler üzerinde test eder. Gerçek müşteri memnuniyetini olumsuz etkilemeden, hangi stratejinin churn’ü azalttığı veya hangi grubun risk altında olduğu önceden tespit edilir. Bu sayede hem pazarlama bütçesi optimize edilmiş olunur.

### 7️⃣ Telekominasyon Chatbot 

Kullanıcıların sisteme doğal dilde sorular yöneltebildiği, churn tahminleri ve dijital ikiz senaryolarını sorgulayabildiği akıllı asistan modülüdür. RAG (Retrieval-Augmented Generation) mimarisiyle çalışır; veritabanından anlamca en ilgili bilgiyi getirir ve LLM  ile açıklamalı, doğal bir yanıt oluşturur. Bu yapı sayesinde kullanıcılar kod veya sorgu yazmadan, model çıktılarıyla etkileşime geçebilir.
Telekomisyondaki rakiplerin sunduğu avantajlar scraping yapılarak çekilmiştir.Telekominnasyonla ilgili haberler,churn onleme stratejileri,sesli komut gibi özelliklerle genişletilmiştir.


8️⃣...devam edilecek


##  Hızlı Başlangıç

### 1️⃣ Environment Dosyasını Ayarlayın

```bash
# Backend .env dosyası oluşturun
cd api
cp .env.example .env
# Ardından .env dosyasını düzenleyip API key'lerinizi ekleyin
```

### 2️⃣ Backend'i Başlatın

**Yöntem 1: Başlatma Scripti (Önerilen)**
```bash
cd api
./start_backend.sh
```

**Yöntem 2: Manuel Başlatma**
```bash
# Virtual environment oluşturun (ilk seferde)
cd api
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# Backend'i başlatın (varsayılan port: 8000)
python main.py
```

**Backend Bilgileri:**
- Backend: http://localhost:8000  
- API Docs: http://localhost:8000/swagger
- Health Check: http://localhost:8000/health
- **Not:** Backend varsayılan olarak 8000 portunda çalışır (frontend 8081'de)

### 3️⃣ Frontend'i Başlatın

```bash
# Bağımlılıkları yükleyin (ilk seferde)
cd frontend
npm install

# Frontend'i başlatın
npm run dev
```

Frontend: http://localhost:8081 (veya http://localhost:5173)

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
lsof -i :8081  # Frontend

# Process'i sonlandırın
kill -9 <PID>
```

### Port Çakışması
- **Backend:** Port 8000 (varsayılan)
- **Frontend:** Port 8081 veya 5173 (Vite varsayılanı)
- Eğer port çakışması yaşıyorsanız, backend'i farklı bir portta başlatabilirsiniz:
  ```bash
  python main.py 9000  # 9000 portunda başlatır
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

