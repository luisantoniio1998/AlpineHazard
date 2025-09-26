# RAG Service with Apertus Swiss AI Model
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create directories for models and data
RUN mkdir -p /app/models /app/data /app/embeddings

# Expose port for FastAPI
EXPOSE 8001

# Environment variables
ENV PYTHONPATH=/app
ENV TRANSFORMERS_CACHE=/app/models
ENV HF_HOME=/app/models

# Start the RAG service
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]