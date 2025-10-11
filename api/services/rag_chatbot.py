import os
import asyncio
from typing import List, Dict, Any
from datetime import datetime
import logging

import google.generativeai as genai
from langchain.prompts import PromptTemplate
from langchain.schema import Document
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

try:
    from services.telecom_scraper import get_live_campaigns
except ImportError:
    get_live_campaigns = None
    logger.warning("Telecom scraper not available")

# Import config
from config import settings

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGChatbot:
    def __init__(self):
        """Initialize the RAG chatbot with simplified setup"""
        self.llm = None
        self.agent = None
        self.vectorstore = None
        self.embeddings = None
        self.retriever = None
        self.qa_chain = None
        self.search_tool = None  # Add search_tool attribute
        self.tavily_client = None  # Web search client
        
        # Initialize components
        self._initialize_llm()
        self._initialize_embeddings()
        self._initialize_vectorstore()
        self._initialize_web_search()
        self._initialize_qa_chain()
        
        logger.info("RAG components initialized successfully")

    def _initialize_llm(self):
        """Initialize the language model with Google Gemini"""
        try:
            # Get Google API key from config
            google_api_key = settings.GOOGLE_API_KEY
            
            if not google_api_key or google_api_key.strip() == "":
                logger.warning("No valid Google API key found. Chatbot will work in offline mode.")
                logger.info("Please add your Google Gemini API key to .env file: GOOGLE_API_KEY=AIzaSy...")
                logger.info("Get your free key at: https://makersuite.google.com/app/apikey")
                self.llm = None
                return
            
            # Configure Google Gemini API
            logger.info("Initializing Google Gemini")
            genai.configure(api_key=google_api_key)
            
            # Initialize Gemini model (using latest flash model)
            self.llm = genai.GenerativeModel('gemini-2.0-flash-exp')
            logger.info("Google Gemini initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize Google Gemini: {e}")
            self.llm = None

    def _initialize_embeddings(self):
        """Initialize embedding model for vectorstore"""
        try:
            logger.info("Initializing embeddings model (this may take a minute on first run)...")
            # Use a small, fast model for Turkish language support
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            logger.info("Embeddings model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {e}")
            self.embeddings = None

    def _initialize_vectorstore(self):
        """Initialize ChromaDB vectorstore"""
        try:
            if not self.embeddings:
                logger.warning("Embeddings not available, skipping vectorstore initialization")
                self.vectorstore = None
                return
            
            logger.info("Initializing ChromaDB vectorstore...")
            # Create or load ChromaDB
            self.vectorstore = Chroma(
                collection_name="telecom_knowledge_base",
                embedding_function=self.embeddings,
                persist_directory="./chroma_db"
            )
            
            # Create retriever
            self.retriever = self.vectorstore.as_retriever(
                search_kwargs={"k": 3}  # Return top 3 most relevant documents
            )
            
            logger.info(f"ChromaDB vectorstore initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vectorstore: {e}")
            self.vectorstore = None
            self.retriever = None

    def _initialize_web_search(self):
        """Initialize web search client"""
        try:
            tavily_api_key = settings.TAVILY_API_KEY
            
            if not tavily_api_key or tavily_api_key.strip() == "" or "DummyKey" in tavily_api_key:
                logger.warning("No valid Tavily API key found. Web search will be disabled.")
                self.tavily_client = None
                return
            
            # Initialize Tavily client
            logger.info("Initializing Tavily web search client")
            if TavilyClient:
                self.tavily_client = TavilyClient(api_key=tavily_api_key)
                self.search_tool = self.tavily_client  # Also set search_tool
            else:
                self.tavily_client = None
            logger.info("Tavily web search client initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize Tavily client: {e}")
            self.tavily_client = None

    def _initialize_qa_chain(self):
        """Initialize the QA chain"""
        try:
            # Simple prompt template
            prompt_template = """
            Sen Türkçe konuşan yardımcı bir AI asistanısın. 
            Kullanıcının sorularını Türkçe olarak yanıtla.
            
            Soru: {question}
            
            Yanıt:
            """
            
            self.prompt = PromptTemplate(
                template=prompt_template,
                input_variables=["question"]
            )
            
            logger.info("QA chain initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize QA chain: {e}")

    async def chat(self, message: str) -> str:
        """Handle chat messages with Gemini AI response and web search"""
        try:
            logger.info(f"Processing chat message: {message}")
            
            # Check if we need web search or live scraping
            needs_web_search = self._should_search_web(message)
            web_results = []
            scraped_campaigns = []
            
            # Check if this is a campaign comparison query
            message_lower = message.lower()
            is_campaign_query = any(word in message_lower for word in ["kampanya", "karşılaştır", "paket", "tarife", "fiyat"])
            
            # Use LIVE SCRAPING for campaign queries - ALWAYS use scraping for campaigns
            if is_campaign_query and get_live_campaigns is not None:
                logger.info("=" * 80)
                logger.info("🔍 LIVE SCRAPING BAŞLATILIYOR!")
                logger.info("=" * 80)
                logger.info(f"📝 Sorgu: {message}")
                logger.info("🌐 Operatör sitelerine gidiliyor: Turkcell, Vodafone, Türk Telekom")
                logger.info("⏳ Lütfen bekleyin, siteler taranıyor...")
                
                try:
                    scraped_campaigns = await asyncio.to_thread(get_live_campaigns)
                    logger.info(f"✅ BAŞARILI! {len(scraped_campaigns)} kampanya çekildi!")
                    logger.info("")
                    logger.info("📋 ÇEKILEN KAMPANYALAR:")
                    logger.info("-" * 80)
                    for camp in scraped_campaigns:
                        logger.info(f"   🏢 {camp['operator']}")
                        logger.info(f"   📦 Kampanya: {camp['name']}")
                        logger.info(f"   💰 Fiyat: {camp['price']}")
                        logger.info(f"   📶 İnternet: {camp['internet']}")
                        logger.info(f"   📞 Dakika: {camp['minutes']}")
                        logger.info(f"   💬 SMS: {camp['sms']}")
                        logger.info(f"   🔗 Kaynak: {camp['source']}")
                        if 'note' in camp:
                            logger.info(f"   ⚠️  Not: {camp['note']}")
                        logger.info("-" * 80)
                except Exception as e:
                    logger.error(f"❌ Scraping hatası: {e}")
                    import traceback
                    logger.error(traceback.format_exc())
                    scraped_campaigns = []
            else:
                if is_campaign_query:
                    logger.warning("⚠️ Kampanya sorgusu tespit edildi ama get_live_campaigns None!")
                    logger.warning(f"get_live_campaigns type: {type(get_live_campaigns)}")
            
            # Fallback to web search if scraping failed or not a campaign query
            if needs_web_search and not scraped_campaigns and self.tavily_client and self.llm:
                logger.info("Performing web search for current information")
                web_results = self.search_web(message, max_results=5)
            
            # Simple response generation
            if self.llm:
                try:
                    # Create a telecom-focused prompt with scraped campaigns or web search results
                    web_context = ""
                    
                    # Priority 1: Use scraped campaigns (most accurate)
                    if scraped_campaigns:
                        web_context = "\n\n🔴 CANLI SİTE VERİLERİ (Web Scraping ile çekildi):\n\n"
                        for campaign in scraped_campaigns:
                            web_context += f"**{campaign['operator']}**\n"
                            web_context += f"  - Kampanya: {campaign['name']}\n"
                            web_context += f"  - Fiyat: {campaign['price']}\n"
                            web_context += f"  - İnternet: {campaign['internet']}\n"
                            web_context += f"  - Dakika: {campaign['minutes']}\n"
                            web_context += f"  - SMS: {campaign['sms']}\n"
                            if 'note' in campaign:
                                web_context += f"  - Not: {campaign['note']}\n"
                            web_context += f"  - Kaynak: {campaign['source']}\n\n"
                    
                    # Priority 2: Use web search results (fallback)
                    elif web_results:
                        web_context = "\n\nGüncel Web Arama Sonuçları:\n"
                        for i, result in enumerate(web_results, 1):
                            web_context += f"{i}. {result['title']}\n   {result['content'][:200]}...\n   Kaynak: {result['url']}\n\n"
                    
                    # Basit selamlaşma kontrolü
                    is_greeting = any(word in message.lower() for word in ["merhaba", "selam", "hello", "hi", "hey"])
                    
                    # Kampanya/paket karşılaştırması kontrolü
                    needs_table = any(word in message.lower() for word in [
                        "kampanya", "paket", "tarife", "karşılaştır", "fiyat", 
                        "turkcell", "vodafone", "türk telekom"
                    ])
                    
                    if is_greeting:
                        # Selamlaşma için kısa yanıt
                        telecom_prompt = f"""
                        Kullanıcı sana selam verdi: {message}
                        
                        Kısa ve samimi bir şekilde karşılık ver (maksimum 2-3 cümle).
                        Kendini tanıt: Türk telekomünikasyon sektörü konusunda yardımcı bir AI asistanısın.
                        Nasıl yardımcı olabileceğini kısaca sor.
                        """
                    elif needs_table:
                        # Kampanya karşılaştırması - TABLO ZORUNLU
                        if scraped_campaigns:
                            telecom_prompt = f"""
                            Sen Türk telekomünikasyon sektörü uzmanısın.
                            
                            Kullanıcı sorusu: {message}
                            
                            🔴 CANLI VERİLER: Aşağıdaki veriler BUGÜN operatörlerin resmi sitelerinden web scraping ile çekildi:
                            {web_context}
                            
                            ÇOK ÖNEMLİ - YUKARI YUKARIDAKI CANLI VERİLERİ KULLAN:
                            1. Yukarıdaki CANLI verileri AYNEN kullan - hiçbir şey uydurma!
                            2. Her operatör için yukarıdaki bilgileri tabloya aktar
                            3. Tablo formatı (Markdown):
                            
                            | Operatör | Kampanya Adı | Fiyat (TL/ay) | İnternet | Dakika | SMS | Özellikler |
                            |----------|--------------|---------------|----------|--------|-----|------------|
                            | Turkcell | ... | ... | ... | ... | ... | ... |
                            | Vodafone | ... | ... | ... | ... | ... | ... |
                            | Türk Telekom | ... | ... | ... | ... | ... | ... |
                            
                            4. Tablo ÜSTÜne şu notu ekle: "🔴 CANLI VERİLER: Aşağıdaki bilgiler operatörlerin resmi sitelerinden anlık olarak çekilmiştir."
                            
                            5. Tablonun ALTINA MUTLAKA her kampanyanın kendi linkini ekle:
                               
                               **📌 Kampanya Detay Linkleri:**
                               
                               Her kampanya için yukarıdaki CANLI VERİLER bölümünde belirtilen "Kaynak" URL'lerini kullan.
                               Format: 
                               - [Operatör] - [Kampanya Adı]: [Kaynak URL]
                               
                               Örnek:
                               - Turkcell Yeni Müşteri Paketi: https://www.turkcell.com.tr/kampanya/...
                               - Vodafone Red Paket: https://www.vodafone.com.tr/kampanya/...
                               
                               ⚠️ Fiyatlar değişebilir. Her kampanyanın detayı için yukarıdaki kendi linkine tıklayın.
                            """
                        else:
                            telecom_prompt = f"""
                            Sen Türk telekomünikasyon sektörü uzmanısın.
                            
                            Kullanıcı sorusu: {message}
                            {web_context}
                            
                            ÇOK ÖNEMLİ - MUTLAKA TABLO KULLAN VE FİYAT ZORUNLU:
                            1. Yanıtını SADECE tablo formatında ver
                            2. MUTLAKA 3 operatörü karşılaştır: Turkcell, Vodafone, Türk Telekom
                            3. FİYAT bilgisi ZORUNLUDUR - her operatör için mutlaka fiyat ekle (TL cinsinden)
                            4. Web arama sonuçlarından fiyat bilgilerini DİKKATLİCE çıkar
                            5. Tablo formatı (Markdown):
                            
                            | Operatör | Kampanya Adı | Fiyat (TL) | İnternet | Dakika | SMS | Özellikler |
                            |----------|--------------|------------|----------|--------|-----|------------|
                            | Turkcell | [kampanya adı] | [XX TL/ay] | [XX GB] | [XXXX dk] | [XXX] | [özellikler] |
                            | Vodafone | [kampanya adı] | [XX TL/ay] | [XX GB] | [XXXX dk] | [XXX] | [özellikler] |
                            | Türk Telekom | [kampanya adı] | [XX TL/ay] | [XX GB] | [XXXX dk] | [XXX] | [özellikler] |
                            
                            6. Eğer fiyat yoksa "Fiyat belirtilmemiş" yaz
                            7. Tablo ÜSTÜne kısa 1-2 cümle ekle
                            8. Tablonun ALTINA kaynak/tarih/not ekle
                            """
                    else:
                        # Normal soru için kısa yanıt
                        telecom_prompt = f"""
                        Sen Türk telekomünikasyon sektörü konusunda uzman bir AI asistanısın.
                        
                        Kullanıcı sorusu: {message}
                        {web_context}
                        
                        KURALLAR:
                        1. Kısa ve öz yanıt ver (maksimum 300 kelime)
                        2. Basit sorulara basit yanıt ver
                        3. Gereksiz detaya girme, sadece sorulan şeyi yanıtla
                        """
                    
                    # Use Google Gemini to generate response with token limit
                    if is_greeting:
                        max_tokens = 500  # Selamlaşma kısa
                    elif needs_table:
                        max_tokens = 1500  # Tablo için daha fazla
                    else:
                        max_tokens = 1000  # Normal sorular
                    
                    response = self.llm.generate_content(
                        telecom_prompt,
                        generation_config=genai.types.GenerationConfig(
                            max_output_tokens=max_tokens,
                            temperature=0.7,
                        )
                    )
                    return response.text if response.text else "Üzgünüm, yanıt oluşturulamadı."
                    
                except Exception as e:
                    logger.error(f"Error generating Gemini response: {e}")
                    return f"Üzgünüm, şu anda bir hata oluştu: {str(e)}"
            else:
                # Offline mode - provide helpful responses without API
                return self._get_offline_response(message)
                
        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return f"Üzgünüm, bir hata oluştu: {str(e)}"

    def _should_search_web(self, message: str) -> bool:
        """Determine if the message requires web search for current information"""
        message_lower = message.lower()
        
        # Keywords that suggest need for current information
        current_info_keywords = [
            "güncel", "son", "yeni", "bugün", "şu an", "mevcut", "aktuel",
            "fiyat", "tarife", "kampanya", "promosyon", "indirim",
            "haber", "duyuru", "açıklama", "basın", "medya"
        ]
        
        return any(keyword in message_lower for keyword in current_info_keywords)

    def _get_offline_response(self, message: str) -> str:
        """Provide offline responses when Google Gemini API key is not available"""
        message_lower = message.lower()
        
        # Greeting responses
        if any(word in message_lower for word in ["merhaba", "selam", "hello", "hi"]):
            return "Merhaba! Ben Türk telekomünikasyon sektörü hakkında bilgi verebilen bir asistanım. Şu anda offline modda çalışıyorum. Google Gemini API anahtarı ekleyerek (.env dosyasına GOOGLE_API_KEY) akıllı yanıtlar alabilirsiniz. Key almak için: https://makersuite.google.com/app/apikey"
        
        # Company specific responses
        elif any(word in message_lower for word in ["turkcell", "vodafone", "türk telekom"]):
            return "Türk telekomünikasyon sektöründe Turkcell, Vodafone ve Türk Telekom ana oyuncular. Daha detaylı bilgi için Google Gemini API anahtarı gerekiyor."
        
        # Technology responses
        elif any(word in message_lower for word in ["5g", "fiber", "internet", "mobil"]):
            return "5G, fiber internet ve mobil teknolojiler hakkında detaylı bilgi verebilirim. Google Gemini modelinin aktif olması gerekiyor."
        
        # Campaign/pricing responses
        elif any(word in message_lower for word in ["kampanya", "fiyat", "tarife", "promosyon", "indirim"]):
            return "Kampanya ve fiyat bilgileri için Google Gemini modelinin aktif olması gerekiyor. .env dosyasına GOOGLE_API_KEY ekleyin."
        
        # Current news responses
        elif any(word in message_lower for word in ["güncel", "son", "yeni", "bugün", "haber"]):
            return "Güncel haberler için hem Google Gemini hem de Tavily Web Search API anahtarlarının yapılandırılması gerekiyor."
        
        # Default response
        else:
            return "⚠️ OFFLINE MOD: Chatbot şu anda offline modda. Akıllı yanıtlar için .env dosyasına Google Gemini API key ekleyin: GOOGLE_API_KEY=AIzaSy... | Key almak için: https://makersuite.google.com/app/apikey"

    async def get_response(self, message: str) -> str:
        """Alias for chat method to maintain compatibility with router"""
        return await self.chat(message)

    def add_documents(self, documents: List[Document]):
        """Add documents to the ChromaDB knowledge base"""
        try:
            if not self.vectorstore:
                logger.warning("Vectorstore not available. Cannot add documents.")
                return
            
            logger.info(f"Adding {len(documents)} documents to ChromaDB knowledge base")
            # Add documents to ChromaDB
            self.vectorstore.add_documents(documents)
            logger.info(f"Successfully added {len(documents)} documents to knowledge base")
        except Exception as e:
            logger.error(f"Error adding documents: {e}")

    def search_documents(self, query: str, k: int = 5) -> List[Document]:
        """Search documents in ChromaDB vectorstore"""
        try:
            if not self.vectorstore:
                logger.warning("Vectorstore not available. Cannot search documents.")
                return []
            
            logger.info(f"Searching vectorstore for: {query}")
            # Search in ChromaDB
            results = self.vectorstore.similarity_search(query, k=k)
            logger.info(f"Found {len(results)} relevant documents")
            return results
        except Exception as e:
            logger.error(f"Error searching documents: {e}")
            return []

    def search_web(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Tavily API"""
        try:
            if not self.tavily_client:
                logger.warning("Tavily client not available")
                return []
            
            logger.info(f"Searching web for: {query}")
            
            # Enhance query for better price results
            enhanced_query = query
            if any(word in query.lower() for word in ["kampanya", "fiyat", "tarife"]):
                enhanced_query = f"{query} fiyat ücret 2025"
            
            # Perform web search with advanced depth for better results
            search_results = self.tavily_client.search(
                query=enhanced_query,
                search_depth="advanced",  # Changed from basic to advanced
                max_results=max_results,
                include_answer=True,
                include_raw_content=False
            )
            
            # Format results
            formatted_results = []
            for result in search_results.get('results', []):
                formatted_results.append({
                    'title': result.get('title', ''),
                    'url': result.get('url', ''),
                    'content': result.get('content', ''),
                    'score': result.get('score', 0)
                })
            
            logger.info(f"Found {len(formatted_results)} web search results")
            logger.info(f"Results: {[r['title'] for r in formatted_results]}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return []

    def get_knowledge_base_info(self) -> Dict[str, Any]:
        """Get information about the knowledge base"""
        doc_count = 0
        if self.vectorstore:
            try:
                doc_count = self.vectorstore._collection.count()
            except:
                doc_count = 0
        
        return {
            "status": "google_gemini_with_vectorstore",
            "model": "gemini-2.0-flash-exp",
            "embedding_model": "paraphrase-multilingual-MiniLM-L12-v2",
            "llm_available": self.llm is not None,
            "vectorstore_available": self.vectorstore is not None,
            "web_search_available": self.tavily_client is not None,
            "document_count": doc_count,
            "message": "Google Gemini + ChromaDB VectorStore + Tavily aktif" if self.llm and self.vectorstore else "Offline mod"
        }

    async def get_competitor_analysis(self) -> str:
        """Get competitor analysis for Turkish telecom market"""
        try:
            analysis_prompt = """
            Türk telekomünikasyon pazarındaki ana rakipler hakkında detaylı analiz yap ve 
            sonuçları tablo formatında sun:
            
            ÖNEMLİ: Yanıtını MUTLAKA tablo formatında sun. Markdown tablo kullan:
            
            ## Pazar Payları
            | Şirket | Pazar Payı | Müşteri Sayısı | Büyüme Oranı |
            |--------|------------|----------------|--------------|
            | Turkcell | %45 | 25M | +5% |
            
            ## Paket Karşılaştırması  
            | Şirket | En Popüler Paket | Fiyat | İnternet | Dakika |
            |--------|------------------|-------|----------|--------|
            | Turkcell | Superonline | 80 TL | 50 GB | Sınırsız |
            
            ## Teknoloji Yatırımları
            | Şirket | 5G Kapsama | Fiber Altyapı | IoT Projeleri |
            |--------|------------|---------------|---------------|
            | Turkcell | %60 | 15M hane | 500K cihaz |
            
            Her şirket için detaylı, güncel ve analitik bir değerlendirme sun.
            Tablo formatında bilgi sunmayı unutma!
            """
            
            if self.llm:
                response = self.llm.generate_content(
                    analysis_prompt,
                    generation_config=genai.types.GenerationConfig(
                        max_output_tokens=2000,  # Analiz için daha fazla token
                        temperature=0.7,
                    )
                )
                return response.text if response.text else "Analiz oluşturulamadı."
            else:
                return "Google Gemini modeli mevcut değil. Lütfen .env dosyasında GOOGLE_API_KEY ayarlayın."
                
        except Exception as e:
            logger.error(f"Error in competitor analysis: {e}")
            return f"Analiz sırasında hata oluştu: {str(e)}"

    async def update_knowledge_base(self):
        """Update the knowledge base with latest information"""
        try:
            logger.info("Updating knowledge base...")
            # For now, just log the update attempt
            # In a full implementation, this would fetch and process new documents
            logger.info("Knowledge base update completed (simplified mode)")
        except Exception as e:
            logger.error(f"Error updating knowledge base: {e}")

# Global instance
rag_chatbot = RAGChatbot()