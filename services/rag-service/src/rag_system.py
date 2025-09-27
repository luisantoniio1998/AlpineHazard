"""
Alpine RAG System - Integration with Apertus Swiss AI Model
Combines Hugging Face Apertus with Swiss Alpine knowledge base
"""

import os
import time
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import json

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModelForSeq2SeqLM, pipeline
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import numpy as np

from .models import RAGResponse, Source, KnowledgeSearchResult, SwissLocation
from .knowledge_base import SwissAlpineKnowledgeBase

logger = logging.getLogger(__name__)

class AlpineRAGSystem:
    """
    RAG system combining Apertus Swiss AI with Alpine knowledge base
    """

    def __init__(self):
        self.apertus_model = None
        self.apertus_tokenizer = None
        self.embedding_model = None
        self.chroma_client = None
        self.knowledge_base = None
        self.collection = None

        # Model configurations - Smaller instruction-following model
        self.apertus_model_name = "google/flan-t5-small"  # Lightweight instruction-tuned for Q&A
        self.embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"

        # System state
        self.is_initialized = False
        self.model_loaded = False
        self.embeddings_loaded = False

        # Performance settings
        self.max_tokens = 512
        self.temperature = 0.7
        self.top_p = 0.9

    async def initialize(self):
        """Initialize the RAG system components"""
        try:
            logger.info("Initializing Alpine RAG System...")

            # Initialize knowledge base first
            await self._initialize_knowledge_base()

            # Initialize embedding model
            await self._initialize_embedding_model()

            # Initialize vector database
            await self._initialize_vector_database()

            # Initialize Apertus model (this may take time)
            await self._initialize_apertus_model()

            self.is_initialized = True
            logger.info("Alpine RAG System initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize RAG system: {e}")
            raise e

    async def _initialize_knowledge_base(self):
        """Initialize Swiss Alpine knowledge base"""
        logger.info("Loading Swiss Alpine knowledge base...")

        self.knowledge_base = SwissAlpineKnowledgeBase()
        await self.knowledge_base.load_knowledge()

        logger.info(f"Knowledge base loaded with {self.knowledge_base.get_document_count()} documents")

    async def _initialize_embedding_model(self):
        """Initialize sentence transformer for embeddings"""
        logger.info(f"Loading embedding model: {self.embedding_model_name}")

        try:
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            self.embeddings_loaded = True
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise e

    async def _initialize_vector_database(self):
        """Initialize ChromaDB for vector storage"""
        logger.info("Initializing vector database...")

        try:
            # Initialize ChromaDB
            self.chroma_client = chromadb.Client(Settings(
                persist_directory="./embeddings",
                anonymized_telemetry=False
            ))

            # Get or create collection
            collection_name = "swiss_alpine_knowledge"
            try:
                self.collection = self.chroma_client.get_collection(collection_name)
                logger.info(f"Loaded existing collection: {collection_name}")
            except:
                self.collection = self.chroma_client.create_collection(
                    name=collection_name,
                    metadata={"description": "Swiss Alpine safety knowledge base"}
                )
                logger.info(f"Created new collection: {collection_name}")

                # Populate collection with knowledge base
                await self._populate_vector_database()

        except Exception as e:
            logger.error(f"Failed to initialize vector database: {e}")
            raise e

    async def _initialize_apertus_model(self):
        """Initialize Apertus Swiss AI model from Hugging Face"""
        logger.info(f"Loading Apertus model: {self.apertus_model_name}")

        try:
            # Get HuggingFace token from environment
            hf_token = os.getenv('HF_TOKEN')

            # Check if CUDA is available
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {device}")

            # Try using pipeline first (often handles newer models better)
            try:
                logger.info("Attempting to load model using pipeline...")
                self.apertus_pipeline = pipeline(
                    "text2text-generation",
                    model=self.apertus_model_name,
                    device=0 if device == "cuda" else -1,
                    trust_remote_code=True,
                    token=hf_token,  # Use 'token' instead of deprecated 'use_auth_token'
                    torch_dtype=torch.float16 if device == "cuda" else torch.float32
                )
                self.model_loaded = True
                self.use_pipeline = True
                logger.info("Apertus model loaded successfully using pipeline")
                return

            except Exception as pipeline_error:
                logger.warning(f"Pipeline loading failed: {pipeline_error}")
                logger.info("Falling back to manual tokenizer/model loading...")
                self.use_pipeline = False

            # Fallback to manual loading
            # Load tokenizer with updated API
            tokenizer_kwargs = {
                "trust_remote_code": True,
                "token": hf_token  # Use 'token' instead of deprecated 'use_auth_token'
            }

            # Try loading with different approaches
            try:
                self.apertus_tokenizer = AutoTokenizer.from_pretrained(
                    self.apertus_model_name,
                    **tokenizer_kwargs
                )
            except Exception as tokenizer_error:
                logger.warning(f"Primary tokenizer loading failed: {tokenizer_error}")
                # Try with legacy=False for newer tokenizers
                tokenizer_kwargs["legacy"] = False
                self.apertus_tokenizer = AutoTokenizer.from_pretrained(
                    self.apertus_model_name,
                    **tokenizer_kwargs
                )

            # Add padding token if not present
            if self.apertus_tokenizer.pad_token is None:
                self.apertus_tokenizer.pad_token = self.apertus_tokenizer.eos_token

            # Load model with appropriate settings
            model_kwargs = {
                "trust_remote_code": True,
                "torch_dtype": torch.float16 if device == "cuda" else torch.float32,
                "device_map": "auto" if device == "cuda" else None,
            }

            # For CPU inference, use smaller precision
            if device == "cpu":
                model_kwargs["torch_dtype"] = torch.float32

            # Load model with updated API
            model_kwargs.update({
                "token": hf_token,  # Use 'token' instead of deprecated 'use_auth_token'
                "trust_remote_code": True
            })

            self.apertus_model = AutoModelForSeq2SeqLM.from_pretrained(
                self.apertus_model_name,
                **model_kwargs
            )

            if device == "cpu":
                self.apertus_model = self.apertus_model.to(device)

            self.model_loaded = True
            logger.info("Apertus model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load Apertus model: {e}")
            logger.info("Continuing with fallback responses...")
            # Don't raise - continue with fallback

    async def _populate_vector_database(self):
        """Populate vector database with knowledge base documents"""
        logger.info("Populating vector database with Swiss Alpine knowledge...")

        documents = self.knowledge_base.get_all_documents()

        # Process documents in batches
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            batch = documents[i:i + batch_size]

            # Extract texts and create embeddings
            texts = [doc['content'] for doc in batch]
            embeddings = self.embedding_model.encode(texts).tolist()

            # Prepare data for ChromaDB
            ids = [f"doc_{i + j}" for j in range(len(batch))]
            metadatas = [{
                'title': doc.get('title', ''),
                'location': doc.get('location', ''),
                'category': doc.get('category', ''),
                'source': doc.get('source', ''),
                'doc_type': doc.get('doc_type', 'general')
            } for doc in batch]

            # Add to collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=texts,
                metadatas=metadatas
            )

        logger.info(f"Populated vector database with {len(documents)} documents")

    async def get_response(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        location: Optional[str] = None,
        activity_type: Optional[str] = None
    ) -> RAGResponse:
        """Get AI response using RAG with Apertus model"""
        start_time = time.time()

        try:
            # 1. Retrieve relevant knowledge
            retrieved_docs = await self._retrieve_knowledge(
                query, location, activity_type
            )

            # 2. Generate response with Apertus
            if self.model_loaded:
                response_text = await self._generate_with_apertus(
                    query, retrieved_docs, context, location
                )
            else:
                # Fallback to context-aware mock response
                response_text = self._generate_fallback_response(
                    query, retrieved_docs, location
                )

            # 3. Calculate confidence and create sources
            sources = self._create_sources(retrieved_docs)
            confidence = self._calculate_confidence(query, retrieved_docs, response_text)

            response_time = time.time() - start_time

            return RAGResponse(
                message=response_text,
                sources=sources,
                confidence=confidence,
                response_time=response_time,
                retrieved_documents=retrieved_docs,
                generation_metadata={
                    "model_used": "apertus-8b" if self.model_loaded else "fallback",
                    "docs_retrieved": len(retrieved_docs),
                    "location_context": location
                }
            )

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return self._create_error_response(str(e), time.time() - start_time)

    async def _retrieve_knowledge(
        self,
        query: str,
        location: Optional[str] = None,
        activity_type: Optional[str] = None,
        limit: int = 5
    ) -> List[KnowledgeSearchResult]:
        """Retrieve relevant knowledge from vector database"""

        # Create embedding for query
        query_embedding = self.embedding_model.encode([query]).tolist()[0]

        # Prepare filters
        where_filter = {}
        if location:
            where_filter["location"] = {"$eq": location}
        if activity_type:
            where_filter["category"] = {"$eq": activity_type}

        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            where=where_filter if where_filter else None,
            include=["documents", "metadatas", "distances"]
        )

        # Convert to KnowledgeSearchResult objects
        retrieved_docs = []
        if results['documents']:
            for i, doc in enumerate(results['documents'][0]):
                retrieved_docs.append(KnowledgeSearchResult(
                    id=results['ids'][0][i],
                    title=results['metadatas'][0][i].get('title', ''),
                    content=doc,
                    metadata=results['metadatas'][0][i],
                    relevance_score=1.0 - results['distances'][0][i],  # Convert distance to similarity
                    document_type=results['metadatas'][0][i].get('doc_type', 'general'),
                    location=results['metadatas'][0][i].get('location'),
                    tags=[]
                ))

        return retrieved_docs

    async def _generate_with_apertus(
        self,
        query: str,
        retrieved_docs: List[KnowledgeSearchResult],
        context: Optional[Dict[str, Any]],
        location: Optional[str]
    ) -> str:
        """Generate response using Apertus model"""

        # Construct prompt with Swiss Alpine context
        prompt = self._build_alpine_prompt(query, retrieved_docs, context, location)

        if hasattr(self, 'use_pipeline') and self.use_pipeline:
            # Use pipeline approach
            try:
                response = self.apertus_pipeline(
                    prompt,
                    max_new_tokens=min(self.max_tokens, 100),  # Limit tokens for speed
                    temperature=self.temperature,
                    top_p=self.top_p,
                    do_sample=True,
                    return_full_text=False,
                    pad_token_id=50256  # Set pad token
                )
                if response and len(response) > 0 and 'generated_text' in response[0]:
                    return response[0]['generated_text'].strip()
                else:
                    return self._generate_fallback_response(query, retrieved_docs, location)
            except Exception as e:
                logger.error(f"Pipeline generation error: {e}")
                return self._generate_fallback_response(query, retrieved_docs, location)

        else:
            # Use manual tokenizer/model approach
            # Tokenize input
            inputs = self.apertus_tokenizer(
                prompt,
                return_tensors="pt",
                truncation=True,
                max_length=2048,
                padding=True
            )

            # Move to appropriate device
            device = next(self.apertus_model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}

            # Generate response
            with torch.no_grad():
                outputs = self.apertus_model.generate(
                    **inputs,
                    max_new_tokens=self.max_tokens,
                    temperature=self.temperature,
                    top_p=self.top_p,
                    do_sample=True,
                    pad_token_id=self.apertus_tokenizer.eos_token_id,
                    eos_token_id=self.apertus_tokenizer.eos_token_id
                )

            # Decode response
            response = self.apertus_tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            )

        return response.strip()

    def _build_alpine_prompt(
        self,
        query: str,
        retrieved_docs: List[KnowledgeSearchResult],
        context: Optional[Dict[str, Any]],
        location: Optional[str]
    ) -> str:
        """Build prompt for Apertus with Swiss Alpine context"""

        # Context information
        context_str = ""
        if location:
            context_str += f"Location: {location}\n"
        if context:
            weather_info = context.get('weather', {})
            if weather_info:
                context_str += f"Weather: {weather_info.get('condition', '')}, {weather_info.get('temperature', '')}°C\n"

        # Retrieved knowledge
        knowledge_str = ""
        for doc in retrieved_docs[:3]:  # Use top 3 most relevant
            knowledge_str += f"- {doc.content}\n"

        # Build complete prompt
        prompt = f"""Du bist ein erfahrener Schweizer Bergführer und Sicherheitsexperte. Beantworte Fragen über Alpine Sicherheit mit präzisen, praktischen Ratschlägen.

Kontext:
{context_str}

Relevante Informationen:
{knowledge_str}

Frage: {query}

Antwort (auf Deutsch oder der gewünschten Sprache):"""

        return prompt

    def _generate_fallback_response(
        self,
        query: str,
        retrieved_docs: List[KnowledgeSearchResult],
        location: Optional[str]
    ) -> str:
        """Generate fallback response when Apertus model not available"""

        if not retrieved_docs:
            return "Entschuldigung, ich kann momentan keine spezifischen Informationen zu Ihrer Anfrage finden. Für Notfälle wählen Sie bitte 1414 (Schweizer Bergrettung)."

        # Use retrieved knowledge to create contextual response
        best_match = retrieved_docs[0]

        response = f"Basierend auf den verfügbaren Informationen:\n\n{best_match.content}\n\n"

        if location:
            response += f"Für {location} empfehle ich zusätzlich, die aktuellen Wetterbedingungen und Lawinenwarnungen zu prüfen.\n\n"

        response += "⚠️ Wichtiger Hinweis: Bei Notfällen kontaktieren Sie sofort die Schweizer Bergrettung unter 1414."

        return response

    def _create_sources(self, retrieved_docs: List[KnowledgeSearchResult]) -> List[Source]:
        """Create source objects from retrieved documents"""
        sources = []
        for doc in retrieved_docs:
            sources.append(Source(
                title=doc.title,
                content=doc.content[:200] + "..." if len(doc.content) > 200 else doc.content,
                relevance_score=doc.relevance_score,
                document_type=doc.document_type,
                location=doc.location
            ))
        return sources

    def _calculate_confidence(
        self,
        query: str,
        retrieved_docs: List[KnowledgeSearchResult],
        response: str
    ) -> float:
        """Calculate confidence score for the response"""
        if not retrieved_docs:
            return 0.3

        # Base confidence on relevance scores
        avg_relevance = sum(doc.relevance_score for doc in retrieved_docs) / len(retrieved_docs)

        # Adjust based on number of relevant docs
        doc_factor = min(len(retrieved_docs) / 3.0, 1.0)

        # Combine factors
        confidence = (avg_relevance * 0.7) + (doc_factor * 0.3)

        return min(max(confidence, 0.0), 1.0)

    def _create_error_response(self, error_msg: str, response_time: float) -> RAGResponse:
        """Create error response"""
        return RAGResponse(
            message="Entschuldigung, es gab einen technischen Fehler. Bei Notfällen wählen Sie 1414.",
            sources=[],
            confidence=0.0,
            response_time=response_time,
            retrieved_documents=[],
            generation_metadata={"error": error_msg}
        )

    # Utility methods
    def is_ready(self) -> bool:
        return self.is_initialized

    def is_model_loaded(self) -> bool:
        return self.model_loaded

    def is_embeddings_loaded(self) -> bool:
        return self.embeddings_loaded

    def get_knowledge_base_size(self) -> int:
        if self.knowledge_base:
            return self.knowledge_base.get_document_count()
        return 0

    def get_last_update_time(self) -> datetime:
        return datetime.now()

    def get_knowledge_categories(self) -> List[str]:
        return ["weather", "avalanche", "hiking", "skiing", "emergency", "equipment"]

    async def cleanup(self):
        """Cleanup resources"""
        if self.apertus_model:
            del self.apertus_model
        if self.embedding_model:
            del self.embedding_model
        torch.cuda.empty_cache() if torch.cuda.is_available() else None