# Alpine RAG System - Setup & Startup Guide

## Quick Start

```bash
# Clone and navigate to the project
cd alpinegeorisk

# Run the startup script
./scripts/start-rag-system.sh
```

## Prerequisites

### System Requirements

**Minimum Requirements:**
- **RAM:** 8GB (16GB recommended for optimal performance)
- **Storage:** 20GB free space (for models and data)
- **CPU:** Modern multi-core processor
- **Network:** Stable internet connection for model downloads

**Recommended Setup:**
- **RAM:** 16GB+
- **GPU:** NVIDIA GPU with 8GB+ VRAM (optional but significantly improves performance)
- **Storage:** SSD with 30GB+ free space
- **OS:** Linux, macOS, or Windows with WSL2

### Software Dependencies

1. **Docker & Docker Compose**
   ```bash
   # Install Docker Desktop (includes Compose)
   # Or on Linux:
   sudo apt install docker.io docker-compose
   ```

2. **Python 3.11+ (for development)**
   ```bash
   python --version  # Should be 3.11 or higher
   ```

3. **Git**
   ```bash
   git --version
   ```

## Environment Setup

### 1. Hugging Face Token

You need a Hugging Face token to access the Apertus model:

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token

### 2. Environment Configuration

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` and set your token:
```bash
# Required: Hugging Face token for Apertus model access
HF_TOKEN=your_actual_token_here

# Optional: Adjust these if needed
PYTHON_ENV=development
TRANSFORMERS_CACHE=/app/models
TORCH_HOME=/app/models
```

## Installation & Startup

### Option 1: Automated Startup (Recommended)

Run the interactive startup script:
```bash
chmod +x scripts/start-rag-system.sh
./scripts/start-rag-system.sh
```

The script will:
- Check system requirements
- Validate your Hugging Face token
- Offer startup options:
  1. **Full system** (RAG + Frontend + All services)
  2. **RAG service only** (for development)
  3. **Frontend only** (with mock data)
- Optionally pre-download the Apertus model
- Start the selected services
- Show access URLs and helpful commands

### Option 2: Manual Docker Setup

Start all services:
```bash
docker-compose up --build -d
```

Start specific services:
```bash
# RAG service only
docker-compose up --build -d rag-service

# Frontend only
docker-compose up --build -d frontend
```

### Option 3: Development Setup

For local development without Docker:

1. **Setup Python environment:**
   ```bash
   cd services/rag-service
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

2. **Set environment variables:**
   ```bash
   export HF_TOKEN=your_token_here
   export PYTHONPATH=.
   ```

3. **Start the RAG service:**
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
   ```

## Service Access

After startup, services will be available at:

- **Frontend:** http://localhost:3000
- **RAG API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs
- **API Gateway:** http://localhost:8080 (full system only)

## First Run - Model Loading

### Initial Setup Time
The first run will take **15-30 minutes** because:
1. **Apertus 8B model download:** ~16GB
2. **Sentence transformer download:** ~90MB
3. **Knowledge base embedding:** 2-5 minutes
4. **Model initialization:** 5-10 minutes

### Monitoring Progress
Watch the initialization process:
```bash
# Monitor RAG service logs
docker-compose logs -f rag-service

# Check all service status
docker-compose ps
```

### GPU vs CPU Performance
- **With GPU:** Model loads in 2-5 minutes, responses in 1-3 seconds
- **Without GPU:** Model loads in 5-15 minutes, responses in 5-15 seconds

## Troubleshooting

### Common Issues

**1. Hugging Face Token Error**
```
Error: Failed to load Apertus model: 401 Unauthorized
```
**Solution:** Check your HF_TOKEN in `.env` file and ensure it has read permissions.

**2. Out of Memory**
```
Error: CUDA out of memory / RuntimeError: [enforce fail at alloc_cpu.cpp]
```
**Solutions:**
- Increase Docker memory limit to 8GB+
- Close other applications to free RAM
- Use CPU-only mode by removing GPU acceleration

**3. Model Download Timeout**
```
Error: Connection timeout during model download
```
**Solutions:**
- Check internet connection stability
- Pre-download model using the startup script option
- Use a different network if corporate firewall blocks Hugging Face

**4. Port Already in Use**
```
Error: Port 8001 is already in use
```
**Solution:** Stop other services or change ports in `docker-compose.yml`

### Health Checks

**Check system status:**
```bash
# Service health
curl http://localhost:8001/health

# Model status
curl http://localhost:8001/models/status

# Knowledge base info
curl http://localhost:8001/knowledge/categories
```

**Test chat functionality:**
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the emergency numbers in Switzerland?"}'
```

### Performance Optimization

**1. Enable GPU Support (NVIDIA)**
```bash
# Install NVIDIA Docker support
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-docker2
sudo systemctl restart docker
```

**2. Increase Docker Resources**
- Memory: 8GB minimum, 16GB recommended
- CPU: All available cores
- Disk: 30GB+ for models and cache

**3. Pre-download Models**
Run the startup script and choose the pre-download option to avoid startup delays.

## System Management

### Starting and Stopping

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart rag-service

# View logs
docker-compose logs -f rag-service
```

### Data Persistence

**Persistent Volumes:**
- `rag-models`: Downloaded AI models
- `rag-embeddings`: Vector database
- `logs`: Application logs

**Backup Important Data:**
```bash
# Backup models (large files)
docker run --rm -v alpinegeorisk_rag-models:/data -v $(pwd):/backup alpine tar czf /backup/models-backup.tar.gz -C /data .

# Backup embeddings
docker run --rm -v alpinegeorisk_rag-embeddings:/data -v $(pwd):/backup alpine tar czf /backup/embeddings-backup.tar.gz -C /data .
```

### Updates and Maintenance

**Update system:**
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d
```

**Clear cache (if having issues):**
```bash
# Remove all containers and volumes
docker-compose down -v

# Remove cached models (will re-download)
docker volume rm alpinegeorisk_rag-models alpinegeorisk_rag-embeddings

# Restart fresh
docker-compose up --build -d
```

## Development Workflow

### Code Changes

**Backend Changes (Python):**
```bash
# The container auto-reloads with uvicorn --reload
# Just save your changes and they'll be reflected immediately
docker-compose logs -f rag-service
```

**Frontend Changes (React):**
```bash
# React also auto-reloads
# Changes appear in browser automatically
docker-compose logs -f frontend
```

### Testing

**Manual API Testing:**
```bash
# Test knowledge search
curl "http://localhost:8001/knowledge/search?query=avalanche&limit=3"

# Test chat with context
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What should I do in bad weather?",
    "location": "Zermatt",
    "activity_type": "hiking"
  }'
```

**Run test script:**
```bash
./scripts/test-rag-service.sh
```

## Performance Expectations

### Response Times
- **Knowledge retrieval:** 0.5-1 second
- **AI generation (GPU):** 2-5 seconds
- **AI generation (CPU):** 5-15 seconds
- **Complete response:** 3-10 seconds

### Memory Usage
- **RAG service (with model):** 6-8GB RAM
- **Vector database:** 100-500MB RAM
- **Total system:** 8-12GB RAM

### Model Accuracy
- **High confidence responses:** Official Swiss safety protocols
- **Medium confidence:** Synthesized recommendations
- **Fallback responses:** When AI model unavailable

---

## Support

**Issues with the system?**
1. Check service logs: `docker-compose logs [service-name]`
2. Verify system requirements are met
3. Ensure Hugging Face token is valid
4. Try restarting: `docker-compose restart`

**Need help?**
- Check health endpoints for status
- Review logs for error messages
- Ensure all prerequisites are installed
- Try manual testing steps

The system is designed to be robust and provide fallback responses even when the AI model isn't available, ensuring continuous operation for safety-critical Alpine guidance.