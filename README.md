
http://34.76.26.71:8080/
## ‼️ Giriş bilgileri
MAİL: admin@example.com


SIFRE: Admin123!
# Dijital İkiz Tabanlı Churn Önleme Sistemi

AI destekli telekomünikasyon sektörü için dijital ikiz platformu. Müşteri analizi, ağ optimizasyonu ve kampanya simülasyonu özellikleri.


##  Proje Özeti: 
Telekomünikasyon sektöründe müşteri kaybı (churn), şirketlerin kârlılığını doğrudan etkileyen en kritik sorunlardan biridir.
Bu proje, yalnızca müşterilerin ayrılma olasılığını tahmin etmekle kalmaz; her abone için kişiselleştirilmiş bir dijital ikiz (digital twin) oluşturarak, farklı pazarlama stratejilerini bu sanal modeller üzerinde simüle eder.Böylece, gerçek müşteriler üzerinde uygulanmadan önce her stratejinin etkisi test edilebilir, risk azaltılır ve pazarlama kaynakları en verimli şekilde kullanılır.

##  Proje Amacı:
telekom operatörlerinin müşteri sadakatini artırmasını, hedefli kampanyalar geliştirmesini ve gelir kaybını önlemesini sağlamayı amaçlar.
Dijital ikiz yaklaşımıyla her müşterinin geçmiş davranışları, kullanım alışkanlıkları ve etkileşim geçmişi analiz edilir.
Bu sayede sistem yalnızca “kim ayrılabilir”i değil, aynı zamanda “neden ayrılabilir” ve “nasıl tutulabilir” sorularına da yanıt verir.
<img width="498" height="269" alt="image" src="https://github.com/user-attachments/assets/751b6432-1188-4dcc-b044-1644a1f6e886" />
<img width="498" height="225" alt="image" src="https://github.com/user-attachments/assets/e480ab48-b914-4b9b-a71e-db74177041bc" />


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


### 3️⃣   Model Training
Model eğitimi sürecinde çoklu servis türü yaklaşımı benimsenmiş ve her servis türü için özel feature engineering ve optimize edilmiş algoritma seçimi yapılmıştır. Postpaid servisi için Gradient Boosting Trees (GBT) algoritması tercih edilmiş, 28 özellik ile en kapsamlı feature set oluşturulmuş ve log dönüşümleri, ratio özellikleri, binary flaglar ve etkileşim özellikleri eklenmiştir. Prepaid ve Broadband servisleri için RandomForest algoritması kullanılmış, Prepaid için 12 özellik, Broadband için 9 özellik ile servis-özel feature engineering uygulanmıştır.Feature selection sürecinde recursive feature elimination (RFE), feature importance analizi ve correlation analysis yapılmış, multicollinearity kontrolü gerçekleştirilmiş ve variance threshold uygulanmıştır. Missing value handling için median imputation stratejisi benimsenmiş, outlier detection ile IQR method ve Z-score analizi yapılmış, data quality kontrolü ile duplicate detection ve data validation süreçleri uygulanmıştır. Hyperparameter tuning için GridSearchCV ve RandomizedSearchCV kullanılmış, GBT için n_estimators: 100-500, max_depth: 3-10, learning_rate: 0.01-0.3, RandomForest için n_estimators: 50-300, max_depth: 5-20, min_samples_split: 2-10 parametreleri optimize edilmiştir.
Cross-validation ile 5-fold stratified doğrulama yapılmış, train-validation-test split oranları 70-15-15 olarak belirlenmiş ve temporal validation ile time-based splitting uygulanmıştır. Model training sürecinde PySpark MLlib kullanılmış, VectorAssembler ile feature vectorization, Imputer ile missing value handling ve StandardScaler ile feature scaling gerçekleştirilmiştir. Training time optimizasyonu için parallel processing, memory management ve resource allocation ayarları yapılmış, model persistence ile pickle ve MLlib formatında model kaydetme işlemleri gerçekleştirilmiştir. Model evaluation sürecinde AUC-ROC, AUC-PR, Accuracy, Precision, Recall, F1-Score metrikleri hesaplanmış ve business impact analizi yapılmıştır. Final model seçiminde ensemble methods değerlendirilmiş, model stacking ve voting classifiers test edilmiş ve best performing model production'a alınmıştır.


### 4️⃣ Model Evaluation
Model evaluation sürecinde kapsamlı performans metrikleri hesaplanmış ve çoklu değerlendirme yaklaşımı benimsenmiştir. Postpaid GBT modeli için AUC-ROC: 0.7792 ile güçlü discriminative performans, AUC-PR: 0.1234 ile imbalanced data'da makul precision-recall dengesi, Accuracy: %98.12 ile yüksek doğruluk oranı elde edilmiştir. Precision: 0.09, Recall: 0.16, F1-Score: 0.115 değerleri ile imbalanced dataset karakteristiği yansıtılmıştır. Prepaid RandomForest modeli AUC-ROC: 0.6613, Accuracy: %98.09 performansı gösterirken, Broadband RandomForest modeli AUC-ROC: 0.5888, Accuracy: %99.70 ile en yüksek doğruluk oranına ulaşmıştır.
Cross-validation ile 5-fold stratified doğrulama gerçekleştirilmiş, confusion matrix analizi ile True Positive Rate, False Positive Rate, Specificity, Sensitivity metrikleri hesaplanmıştır. ROC curves ve Precision-Recall curves ile model performansı görselleştirilmiş, threshold optimization ile business impact analizi yapılmıştır. Feature importance analizi ile en etkili özellikler belirlenmiş, satisfaction_score, monthly_charge, data_usage, tenure, customer_support_calls gibi kritik faktörler öne çıkmıştır. Top-k precision hesaplamaları ile %0.5, %1, %2, %5 eşiklerinde precision değerleri hesaplanmış ve business value analizi yapılmıştır.
Calibration süreci ile Isotonic Regression uygulanarak probability calibration iyileştirilmiş, Brier Score ile calibration quality değerlendirilmiştir. Holdout test set ile final model validation gerçekleştirilmiş, temporal validation ile time-based splitting yapılmış ve model stability testleri uygulanmıştır. Business metrics olarak ROI: %1,629, Korunan Gelir: ₺86.5M, Kampanya Başarı Oranı: %73 gibi endüstriyel değerler elde edilmiştir. Model comparison ile baseline models (Logistic Regression, SVM, Naive Bayes) ile karşılaştırma yapılmış, statistical significance testleri uygulanmış ve confidence intervals hesaplanmıştır.

### 5️⃣ Explainable AI / XAI
LIME kullanılarak modelin nasıl yorumlandığını anltılıp.Her bir müşterinin churn kararına etki eden faktörleri gösterilmiştir.
<img width="454" height="256" alt="image" src="https://github.com/user-attachments/assets/fcd6b439-5cc9-48d3-91d3-3779a1f545df" />


<img width="496" height="181" alt="image" src="https://github.com/user-attachments/assets/4c1fe3a9-97dd-4011-b628-f2e7a77cd7d9" />



### 6️⃣ Agent-Based Dijital İkiz Modelleme
Bu projede ki en yenilikçi yönü, her müşterinin geçmiş davranış verilerine dayanarak oluşturulan kişiselleştirilmiş dijital ikiz (Digital Twin) modelleridir. Dijital ikiz, gerçek bir müşterinin sanal bir yansıması olarak tasarlanmıştır ve o müşterinin geçmiş etkileşimlerini, hizmet kullanım alışkanlıklarını, finansal davranışlarını ve memnuniyet düzeylerini temsil eder. Bu yapı sayesinde sistem, gerçek müşteriye herhangi bir müdahalede bulunmadan önce, planlanan pazarlama stratejilerinin olası etkilerini bu dijital ikizler üzerinde test edebilmekte yani bir anlamda “sanal laboratuvar ortamı” oluşturmaktadır.

Dijital İkiz Oluşturma: Bu profilden yola çıkarak, her müşteri için dinamik bir sanal temsilci (agent) oluşturulur. Dijital ikiz, müşterinin gelecekteki davranışlarını olasılıksal biçimde taklit eder. Örneğin, fiyat artışı, kampanya teklifi veya hizmet kalitesindeki değişim gibi durumlara nasıl tepki verebileceğini simüle eder. Simülasyon ve Strateji Testi: Geliştirilen Agent-Based Modeling (ABM) yapısı, bireysel müşteri ikizlerinin etkileşimlerini toplu düzeyde analiz eder. Böylece sistem, “bir kampanya değişikliği 10 bin müşteri üzerinde ne kadar etki yaratır?” gibi sorulara, gerçek veriye dayalı simülasyon sonuçlarıyla yanıt verebilir. Kampanya Optimizasyonu: Gerçek müşterilere kampanya uygulanmadan önce, farklı stratejiler bu ikizler üzerinde test edilir. Bu testler sonucunda, en yüksek memnuniyet – en düşük churn riski kombinasyonu seçilir.


Bu projede sanal Laboratuvar mantığı yapısı oluşturulmuştur. Bu yapıyla da, telekom operatörleri için bir tür “deneme–yanılma yapılmadan karar verme sistemi” olarak çalışır. Her müşterinin dijital ikizi, gerçek sistemden izole edilmiş bir laboratuvar ortamında bulunur. Bu ortamda şirket, kampanya tekliflerini, fiyat değişimlerini veya hizmet iyileştirmelerini önce bu dijital ikizler üzerinde test eder. Gerçek müşteri memnuniyetini olumsuz etkilemeden, hangi stratejinin churn’ü azalttığı veya hangi grubun risk altında olduğu önceden tespit edilir. Bu sayede hem pazarlama bütçesi optimize edilmiş olunur.



<img width="492" height="272" alt="image" src="https://github.com/user-attachments/assets/e9109d11-e2db-407b-a388-436c2d745697" />


<img width="492" height="257" alt="image" src="https://github.com/user-attachments/assets/b8d0158f-43b1-426c-bbaa-d87208efebe2" />


<img width="492" height="276" alt="image" src="https://github.com/user-attachments/assets/e7899a0d-e4c8-483a-8056-99dd5361c297" />



### 7️⃣ Telekominasyon Chatbot 

Kullanıcıların sisteme doğal dilde sorular yöneltebildiği, churn tahminleri ve dijital ikiz senaryolarını sorgulayabildiği akıllı asistan modülüdür. RAG (Retrieval-Augmented Generation) mimarisiyle çalışır; veritabanından anlamca en ilgili bilgiyi getirir ve LLM  ile açıklamalı, doğal bir yanıt oluşturur. Bu yapı sayesinde kullanıcılar kod veya sorgu yazmadan, model çıktılarıyla etkileşime geçebilir.
Telekomisyondaki rakiplerin sunduğu avantajlar scraping yapılarak çekilmiştir.Telekominnasyonla ilgili haberler,churn onleme stratejileri,sesli komut gibi özelliklerle genişletilmiştir.

<img width="454" height="240" alt="image" src="https://github.com/user-attachments/assets/2335f1a1-9f11-4001-b136-02df41066114" />

### 7️⃣ DEMO


https://github.com/user-attachments/assets/76f7c4f0-5798-4d09-9916-9a9542f7e031



##  Kurulum

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

Frontend: http://localhost:8081 veya 8080

### 4️⃣ Docker -Postgresql

```bash
# PostgreSQL ve pgAdmin başlatın
docker-compose up -d
```

- PostgreSQL: Port 5433
- pgAdmin: http://localhost:5050 (admin@gmail.com / admin123)

---

## API Key'leri Nasıl Alınır?

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


### Tavily API (Web Arama)
1. https://tavily.com adresine gidin
2. Ücretsiz hesap oluşturun (email ile)
3. API key alın
4. `.env` dosyasına ekleyin:
   ```bash
   TAVILY_API_KEY=tvly-...
   ```

**Not:** Web arama, güncel kampanya ve fiyat bilgileri için kullanılır.

---

## 🛠️ Teknolojiler

**Backend:**
- PySpark
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
- PostgreSQL 

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


