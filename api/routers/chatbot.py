from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import logging

from services.rag_chatbot import rag_chatbot
from auth import get_current_user
from schemas import UserResponse as User

router = APIRouter(prefix="/chatbot", tags=["chatbot"])
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: str
    sources: Optional[List[str]] = None

class CompetitorAnalysisRequest(BaseModel):
    update_data: bool = False

class CompetitorAnalysisResponse(BaseModel):
    analysis: str
    last_updated: str
    sources_count: int

@router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(
    chat_message: ChatMessage,
    background_tasks: BackgroundTasks
):
    """
    Chat with the RAG-powered telecom expert bot
    """
    try:
        logger.info(f"Chat request: {chat_message.message}")
        logger.info(f"RAGChatbot type: {type(rag_chatbot)}")
        logger.info(f"RAGChatbot methods: {[m for m in dir(rag_chatbot) if not m.startswith('_')]}")
        logger.info(f"Has get_response: {hasattr(rag_chatbot, 'get_response')}")
        
        # Get response from RAG chatbot
        response = await rag_chatbot.get_response(chat_message.message)
        
        # Update knowledge base in background if needed
        if "güncel" in chat_message.message.lower() or "yeni" in chat_message.message.lower():
            background_tasks.add_task(rag_chatbot.update_knowledge_base)
        
        return ChatResponse(
            response=response,
            conversation_id=chat_message.conversation_id or "default",
            timestamp=datetime.now().isoformat(),
            sources=["Web Search", "Knowledge Base"]
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@router.post("/competitor-analysis", response_model=CompetitorAnalysisResponse)
async def get_competitor_analysis(
    request: CompetitorAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive competitor analysis for Turkish telecom market
    """
    try:
        logger.info(f"Competitor analysis request from user {current_user.email}")
        
        # Update data if requested
        if request.update_data:
            background_tasks.add_task(rag_chatbot.update_knowledge_base)
        
        # Get analysis
        analysis = await rag_chatbot.get_competitor_analysis()
        
        return CompetitorAnalysisResponse(
            analysis=analysis,
            last_updated=datetime.now().isoformat(),
            sources_count=5  # Number of sources used
        )
        
    except Exception as e:
        logger.error(f"Error in competitor analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@router.post("/update-knowledge")
async def update_knowledge_base(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger knowledge base update
    """
    try:
        logger.info(f"Knowledge base update request from user {current_user.email}")
        
        # Add to background tasks
        background_tasks.add_task(rag_chatbot.update_knowledge_base)
        
        return {"message": "Knowledge base update started", "status": "success"}
        
    except Exception as e:
        logger.error(f"Error updating knowledge base: {e}")
        raise HTTPException(status_code=500, detail=f"Update error: {str(e)}")

@router.get("/health")
async def chatbot_health():
    """
    Check chatbot service health
    """
    try:
        # Test basic functionality
        test_response = await rag_chatbot.get_response("Test mesajı")
        
        return {
            "status": "healthy",
            "llm_connected": rag_chatbot.llm is not None,
            "vectorstore_connected": rag_chatbot.vectorstore is not None,
            "search_tool_connected": rag_chatbot.search_tool is not None,
            "test_response_length": len(test_response)
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Import datetime
from datetime import datetime
