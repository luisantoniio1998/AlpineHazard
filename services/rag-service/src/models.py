"""
Pydantic models for the Alpine RAG Service API
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatRequest(BaseModel):
    """Request model for chat interactions"""
    message: str = Field(..., description="User's message/question")
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional context (weather, location, activity)"
    )
    location: Optional[str] = Field(
        default=None,
        description="Swiss location (e.g., Zermatt, Jungfraujoch)"
    )
    activity_type: Optional[str] = Field(
        default=None,
        description="Activity type (hiking, skiing, mountaineering)"
    )
    language: Optional[str] = Field(
        default="en",
        description="Response language (en, de, fr, it, rm)"
    )
    session_id: Optional[str] = Field(
        default=None,
        description="Session ID for conversation continuity"
    )

class Source(BaseModel):
    """Source information for retrieved knowledge"""
    title: str
    content: str
    url: Optional[str] = None
    relevance_score: float
    document_type: str  # safety_guide, weather_data, emergency_protocol, etc.
    location: Optional[str] = None

class ChatResponse(BaseModel):
    """Response model for chat interactions"""
    message: str = Field(..., description="AI assistant's response")
    sources: List[Source] = Field(
        default=[],
        description="Knowledge sources used to generate response"
    )
    confidence: float = Field(
        ge=0.0, le=1.0,
        description="Confidence score of the response"
    )
    response_time: float = Field(
        description="Response generation time in seconds"
    )
    model_used: str = Field(
        description="AI model used for generation"
    )
    location_context: Optional[str] = Field(
        default=None,
        description="Location context used for response"
    )
    suggestions: Optional[List[str]] = Field(
        default=None,
        description="Follow-up question suggestions"
    )

class HealthResponse(BaseModel):
    """Health check response"""
    status: str  # healthy, initializing, error
    model_loaded: bool
    knowledge_base_size: int
    version: str
    uptime: Optional[str] = None
    last_update: Optional[datetime] = None

class KnowledgeSearchResult(BaseModel):
    """Result from knowledge base search"""
    id: str
    title: str
    content: str
    metadata: Dict[str, Any]
    relevance_score: float
    document_type: str
    location: Optional[str] = None
    tags: List[str] = []

class RAGResponse(BaseModel):
    """Internal RAG system response model"""
    message: str
    sources: List[Source]
    confidence: float
    response_time: float
    retrieved_documents: List[KnowledgeSearchResult]
    generation_metadata: Dict[str, Any]

class SwissLocation(BaseModel):
    """Swiss Alpine location data"""
    name: str
    canton: str
    elevation: int
    coordinates: Dict[str, float]  # {"lat": 46.0207, "lon": 7.7491}
    risk_categories: List[str]  # avalanche, weather, technical
    emergency_contacts: Dict[str, str]
    nearest_rescue_stations: List[str]

class WeatherContext(BaseModel):
    """Weather context for AI responses"""
    location: str
    temperature: float
    conditions: str  # sunny, cloudy, snowy, etc.
    wind_speed: float
    visibility: float
    avalanche_risk: str  # low, moderate, high
    weather_warnings: List[str]

class ActivityContext(BaseModel):
    """Activity context for personalized responses"""
    activity_type: str  # hiking, skiing, mountaineering
    difficulty_level: str  # beginner, intermediate, advanced, expert
    group_size: int
    equipment_available: List[str]
    experience_level: str
    duration_planned: str  # e.g., "day_trip", "multi_day"

class EmergencyAlert(BaseModel):
    """Emergency alert data structure"""
    alert_id: str
    severity: str  # low, medium, high, critical
    alert_type: str  # weather, avalanche, equipment, medical
    title: str
    message: str
    location: str
    recommended_actions: List[str]
    emergency_contacts: List[str]
    issued_at: datetime
    expires_at: Optional[datetime] = None