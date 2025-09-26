"""
Alpine Trail Guardian - RAG Service with Apertus Swiss AI
FastAPI service that provides intelligent Alpine safety guidance using:
- Apertus 8B Swiss AI model from Hugging Face
- RAG with Swiss Alpine knowledge base
- Vector embeddings for contextual retrieval
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import logging
from contextlib import asynccontextmanager

from .rag_system import AlpineRAGSystem
from .models import ChatRequest, ChatResponse, HealthResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global RAG system instance
rag_system: Optional[AlpineRAGSystem] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup the RAG system"""
    global rag_system

    logger.info("Initializing Alpine RAG System with Apertus...")

    try:
        # Initialize RAG system
        rag_system = AlpineRAGSystem()
        await rag_system.initialize()
        logger.info("RAG System initialized successfully")

        yield  # Application runs here

    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        # Continue with mock responses
        yield

    finally:
        # Cleanup
        if rag_system:
            await rag_system.cleanup()
        logger.info("RAG System cleanup completed")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Alpine Trail Guardian RAG Service",
    description="AI-powered Swiss Alpine safety guidance using Apertus Swiss AI model",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    status = "healthy" if rag_system and rag_system.is_ready() else "initializing"

    return HealthResponse(
        status=status,
        model_loaded=rag_system.is_model_loaded() if rag_system else False,
        knowledge_base_size=rag_system.get_knowledge_base_size() if rag_system else 0,
        version="1.0.0"
    )

@app.post("/chat", response_model=ChatResponse)
async def chat_with_alpine_ai(request: ChatRequest):
    """
    Chat with the Alpine AI assistant using Apertus + RAG
    """
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        logger.info(f"Processing query: {request.message[:100]}...")

        # Get response from RAG system
        response = await rag_system.get_response(
            query=request.message,
            context=request.context,
            location=request.location,
            activity_type=request.activity_type
        )

        return ChatResponse(
            message=response.message,
            sources=response.sources,
            confidence=response.confidence,
            response_time=response.response_time,
            model_used="apertus-8b-instruct",
            location_context=request.location
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/chat/stream")
async def stream_chat_response(request: ChatRequest):
    """
    Stream chat responses for real-time interaction
    """
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        # Return streaming response
        return rag_system.stream_response(
            query=request.message,
            context=request.context,
            location=request.location,
            activity_type=request.activity_type
        )

    except Exception as e:
        logger.error(f"Error streaming chat response: {e}")
        raise HTTPException(status_code=500, detail=f"Streaming error: {str(e)}")

@app.get("/knowledge/search")
async def search_knowledge_base(
    query: str,
    limit: int = 5,
    location: Optional[str] = None,
    activity_type: Optional[str] = None
):
    """
    Search the Alpine knowledge base directly
    """
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        results = await rag_system.search_knowledge(
            query=query,
            limit=limit,
            filters={
                "location": location,
                "activity_type": activity_type
            }
        )

        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }

    except Exception as e:
        logger.error(f"Error searching knowledge base: {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")

@app.post("/knowledge/update")
async def update_knowledge_base(background_tasks: BackgroundTasks):
    """
    Update the knowledge base with latest Alpine safety information
    """
    if not rag_system:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        # Add background task to update knowledge base
        background_tasks.add_task(rag_system.update_knowledge_base)

        return {
            "status": "update_started",
            "message": "Knowledge base update initiated in background"
        }

    except Exception as e:
        logger.error(f"Error updating knowledge base: {e}")
        raise HTTPException(status_code=500, detail=f"Update error: {str(e)}")

@app.get("/models/status")
async def get_model_status():
    """
    Get current model and system status
    """
    if not rag_system:
        return {"status": "not_initialized"}

    return {
        "apertus_model": {
            "loaded": rag_system.is_model_loaded(),
            "model_name": "swiss-ai/Apertus-8B-Instruct-2509",
            "model_size": "8B parameters",
            "language_support": "Swiss German, French, Italian, Romansh + 1000+ languages"
        },
        "embedding_model": {
            "loaded": rag_system.is_embeddings_loaded(),
            "model_name": "sentence-transformers/all-MiniLM-L6-v2",
            "purpose": "Vector embeddings for knowledge retrieval"
        },
        "knowledge_base": {
            "documents": rag_system.get_knowledge_base_size(),
            "last_updated": rag_system.get_last_update_time(),
            "categories": rag_system.get_knowledge_categories()
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )