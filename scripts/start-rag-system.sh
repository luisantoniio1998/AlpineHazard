#!/bin/bash

# Alpine Trail Guardian - RAG System Startup Script
# Starts the complete system with Apertus Swiss AI

set -e

echo "🏔️ Alpine Trail Guardian - RAG System Startup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please edit .env file and add your Hugging Face token${NC}"
    echo -e "${BLUE}💡 Get your token from: https://huggingface.co/settings/tokens${NC}"
    exit 1
fi

# Load environment variables
source .env

# Check for Hugging Face token
if [ -z "$HF_TOKEN" ] || [ "$HF_TOKEN" = "your_huggingface_token_here" ]; then
    echo -e "${RED}❌ Hugging Face token not configured${NC}"
    echo -e "${BLUE}💡 Please set HF_TOKEN in .env file${NC}"
    echo -e "${BLUE}💡 Get your token from: https://huggingface.co/settings/tokens${NC}"
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

# Create required directories
echo -e "${BLUE}📁 Creating required directories...${NC}"
mkdir -p data logs

# Check available RAM
echo -e "${BLUE}🔍 Checking system requirements...${NC}"
TOTAL_RAM=$(free -g | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 8 ]; then
    echo -e "${YELLOW}⚠️  Warning: Less than 8GB RAM detected (${TOTAL_RAM}GB available)${NC}"
    echo -e "${YELLOW}   Apertus 8B model may run slowly or fail to load${NC}"
    echo -e "${BLUE}💡 Consider using a machine with more RAM for optimal performance${NC}"
fi

# Check for GPU
if command -v nvidia-smi &> /dev/null; then
    echo -e "${GREEN}🚀 NVIDIA GPU detected - will use GPU acceleration${NC}"
    GPU_AVAILABLE=true
else
    echo -e "${YELLOW}💻 No GPU detected - will use CPU inference${NC}"
    echo -e "${BLUE}💡 GPU acceleration significantly improves performance${NC}"
    GPU_AVAILABLE=false
fi

# Show startup options
echo ""
echo -e "${BLUE}🎯 Startup Options:${NC}"
echo "1. Full system (RAG + Frontend + All services)"
echo "2. RAG service only (for development)"
echo "3. Frontend only (with mock data)"

read -p "Select option (1-3): " OPTION

case $OPTION in
    1)
        echo -e "${GREEN}🚀 Starting complete Alpine Trail Guardian system...${NC}"
        SERVICE_TARGET=""
        ;;
    2)
        echo -e "${GREEN}🔬 Starting RAG service only...${NC}"
        SERVICE_TARGET="rag-service"
        ;;
    3)
        echo -e "${GREEN}🌐 Starting frontend only...${NC}"
        SERVICE_TARGET="frontend"
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

# Pre-download models (optional)
if [ "$OPTION" = "1" ] || [ "$OPTION" = "2" ]; then
    echo ""
    read -p "Pre-download Apertus model? This will take 15-30 minutes but improves startup time (y/N): " DOWNLOAD_MODEL

    if [ "$DOWNLOAD_MODEL" = "y" ] || [ "$DOWNLOAD_MODEL" = "Y" ]; then
        echo -e "${BLUE}📥 Pre-downloading Apertus model...${NC}"
        echo -e "${YELLOW}This will download ~16GB of model data${NC}"

        # Create Python script to download model
        cat > /tmp/download_apertus.py << EOF
import os
from huggingface_hub import snapshot_download
from transformers import AutoTokenizer, AutoModelForCausalLM

os.environ['HF_TOKEN'] = '$HF_TOKEN'

print("Downloading Apertus 8B model...")
try:
    snapshot_download(
        repo_id="swiss-ai/Apertus-8B-Instruct-2509",
        cache_dir="./models",
        token='$HF_TOKEN'
    )
    print("✅ Model downloaded successfully")
except Exception as e:
    print(f"❌ Download failed: {e}")
    exit(1)
EOF

        python3 /tmp/download_apertus.py || echo -e "${YELLOW}⚠️  Pre-download failed, will download during startup${NC}"
        rm /tmp/download_apertus.py
    fi
fi

# Start services
echo ""
echo -e "${GREEN}🐳 Starting Docker services...${NC}"

# Build and start
if [ -z "$SERVICE_TARGET" ]; then
    docker-compose up --build -d
else
    docker-compose up --build -d $SERVICE_TARGET
fi

# Show service status
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose ps

# Wait for services to be ready
echo ""
echo -e "${BLUE}⏳ Waiting for services to initialize...${NC}"

# Check RAG service
if [ "$OPTION" = "1" ] || [ "$OPTION" = "2" ]; then
    echo -n "RAG Service: "
    for i in {1..60}; do
        if curl -s http://localhost:8001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Ready${NC}"
            break
        fi
        echo -n "."
        sleep 5
    done

    if [ $i -eq 60 ]; then
        echo -e "${RED}❌ Timeout${NC}"
        echo "Check logs: docker-compose logs rag-service"
    fi
fi

# Check frontend
if [ "$OPTION" = "1" ] || [ "$OPTION" = "3" ]; then
    echo -n "Frontend: "
    for i in {1..30}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
    done

    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Timeout${NC}"
        echo "Check logs: docker-compose logs frontend"
    fi
fi

# Show access URLs
echo ""
echo -e "${GREEN}🎉 Alpine Trail Guardian is running!${NC}"
echo "=================================="

if [ "$OPTION" = "1" ] || [ "$OPTION" = "3" ]; then
    echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:3000"
fi

if [ "$OPTION" = "1" ] || [ "$OPTION" = "2" ]; then
    echo -e "${BLUE}🤖 RAG API:${NC} http://localhost:8001"
    echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8001/docs"
fi

if [ "$OPTION" = "1" ]; then
    echo -e "${BLUE}🌉 API Gateway:${NC} http://localhost:8080"
fi

echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo "• View logs: docker-compose logs -f [service-name]"
echo "• Stop system: docker-compose down"
echo "• Restart: docker-compose restart [service-name]"
echo "• System status: docker-compose ps"

if [ "$OPTION" = "1" ] || [ "$OPTION" = "2" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Note: Apertus model loading may take 5-15 minutes on first run${NC}"
    echo -e "${BLUE}💡 Monitor progress: docker-compose logs -f rag-service${NC}"
fi

echo ""
echo -e "${GREEN}Happy hiking! 🏔️${NC}"