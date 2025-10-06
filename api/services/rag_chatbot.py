import os
import asyncio
from typing import List, Dict, Any
from datetime import datetime
import logging

import google.generativeai as genai
from langchain.prompts import PromptTemplate
from langchain.schema import Document
try:
    from tavily import TavilyClient
except ImportError:
    TavilyClient = None

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
        self._initialize_web_search()
        self._initialize_qa_chain()
        
        logger.info("RAG components initialized successfully")

    def _initialize_llm(self):
        """Initialize the language model with Google Gemini"""
        try:
            # Get Google API key from config
            google_api_key = settings.GOOGLE_API_KEY
            
            if not google_api_key or google_api_key.strip() == "" or "DummyKey" in google_api_key:
                logger.warning("No valid Google API key found. Chatbot will work in offline mode.")
                self.llm = None
                return
            
            # Configure Gemini API
            logger.info("Initializing Google Gemini LLM")
            genai.configure(api_key=google_api_key)
            
            # Initialize Gemini model
            self.llm = genai.GenerativeModel('gemini-2.5-flash')
            logger.info("Google Gemini LLM initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize Gemini LLM: {e}")
            self.llm = None

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
            
            # Check if we need web search for current information
            needs_web_search = self._should_search_web(message)
            web_results = []
            
            # Disable web search in offline mode to prevent timeouts
            if needs_web_search and self.tavily_client and self.llm:
                logger.info("Performing web search for current information")
                web_results = self.search_web(message, max_results=3)
            
            # Simple response generation
            if self.llm:
                try:
                    # Create a telecom-focused prompt with web search results
                    web_context = ""
                    if web_results:
                        web_context = "\n\nGüncel Web Arama Sonuçları:\n"
                        for i, result in enumerate(web_results, 1):
                            web_context += f"{i}. {result['title']}\n   {result['content'][:200]}...\n   Kaynak: {result['url']}\n\n"
                    
                    telecom_prompt = f"""
                    Sen Türk telekomünikasyon sektörü konusunda uzman bir AI asistanısın. 
                    Kullanıcının sorularını Türkçe olarak yanıtla ve telekomünikasyon sektörü hakkında 
                    detaylı, güncel ve faydalı bilgiler ver.
                    
                    Kullanıcı sorusu: {message}
                    {web_context}
                    
                    ÖNEMLİ: Eğer kullanıcı paket, tarife, kampanya veya fiyat bilgisi istiyorsa, 
                    yanıtını MUTLAKA tablo formatında sun. Markdown tablo kullan:
                    
                    | Paket Adı | Fiyat | İnternet | Dakika | SMS | Özellikler |
                    |-----------|-------|----------|--------|-----|------------|
                    | Paket 1   | 50 TL | 10 GB    | 1000   | 100 | Özellik 1  |
                    
                    Yanıtını Türkçe olarak ver ve telekomünikasyon sektörü odaklı ol.
                    Eğer web arama sonuçları varsa, bunları da dikkate al.
                    Tablo formatında bilgi sunmayı unutma!
                    """
                    
                    # Use Gemini to generate response
                    response = self.llm.generate_content(telecom_prompt)
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
        """Provide offline responses when API key is not available"""
        message_lower = message.lower()
        
        # Greeting responses
        if any(word in message_lower for word in ["merhaba", "selam", "hello", "hi"]):
            return "Merhaba! Ben Türk telekomünikasyon sektörü hakkında bilgi verebilen bir asistanım. Şu anda offline modda çalışıyorum. API anahtarı yapılandırıldığında daha detaylı yanıtlar verebilirim."
        
        # Company specific responses
        elif any(word in message_lower for word in ["turkcell", "vodafone", "türk telekom"]):
            return "Türk telekomünikasyon sektöründe Turkcell, Vodafone ve Türk Telekom ana oyuncular. Her birinin farklı güçlü yanları ve hizmetleri var. Daha detaylı bilgi için API anahtarının yapılandırılması gerekiyor."
        
        # Technology responses
        elif any(word in message_lower for word in ["5g", "fiber", "internet", "mobil"]):
            return "5G, fiber internet ve mobil teknolojiler hakkında sorularınızı yanıtlayabilirim. Şu anda offline modda olduğum için genel bilgiler verebiliyorum."
        
        # Campaign/pricing responses
        elif any(word in message_lower for word in ["kampanya", "fiyat", "tarife", "promosyon", "indirim"]):
            return "Kampanya ve fiyat bilgileri için güncel verilere ihtiyaç var. Şu anda offline modda olduğum için bu bilgileri sağlayamıyorum. API anahtarı yapılandırıldığında güncel kampanya bilgileri verebilirim."
        
        # Current news responses
        elif any(word in message_lower for word in ["güncel", "son", "yeni", "bugün", "haber"]):
            return "Güncel haberler ve son gelişmeler için web arama gerekli. Şu anda offline modda olduğum için güncel bilgileri sağlayamıyorum."
        
        # Default response
        else:
            return "Sorunuzu anlıyorum. Türk telekomünikasyon sektörü hakkında yardımcı olmaya çalışıyorum. Daha detaylı yanıtlar için API anahtarının yapılandırılması gerekiyor."

    async def get_response(self, message: str) -> str:
        """Alias for chat method to maintain compatibility with router"""
        return await self.chat(message)

    def add_documents(self, documents: List[Document]):
        """Add documents to the knowledge base (simplified)"""
        logger.info(f"Adding {len(documents)} documents to knowledge base")
        # For now, just log the documents
        for doc in documents:
            logger.info(f"Document: {doc.page_content[:100]}...")

    def search_documents(self, query: str, k: int = 5) -> List[Document]:
        """Search documents (simplified)"""
        logger.info(f"Searching for: {query}")
        # For now, return empty list
        return []

    def search_web(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Search the web using Tavily API"""
        try:
            if not self.tavily_client:
                logger.warning("Tavily client not available")
                return []
            
            logger.info(f"Searching web for: {query}")
            
            # Perform web search
            search_results = self.tavily_client.search(
                query=query,
                search_depth="basic",
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
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error in web search: {e}")
            return []

    def get_knowledge_base_info(self) -> Dict[str, Any]:
        """Get information about the knowledge base"""
        return {
            "status": "simplified_mode",
            "llm_available": self.llm is not None,
            "vectorstore_available": False,
            "search_available": False,
            "message": "Basitleştirilmiş mod - sadece temel AI yanıtları"
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
                response = self.llm.generate_content(analysis_prompt)
                return response.text if response.text else "Analiz oluşturulamadı."
            else:
                return "AI modeli mevcut değil. Lütfen daha sonra tekrar deneyin."
                
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