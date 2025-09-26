# Alpine Trail Guardian 🏔️

**AI-Powered Swiss Alpine Safety System** powered by Apertus Swiss AI model

Built for the Swiss Re Hackathon - "AI for Resilience against Extreme Weather Events"

## 🚀 Quick Start with Apertus RAG

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (recommended for Apertus AI model)
- [Hugging Face account](https://huggingface.co/join) with access token

### 1. Clone & Setup
```bash
git clone <repository-url>
cd alpine-trail-guardian

# Copy environment template
cp .env.example .env

# Add your Hugging Face token to .env
# Get token from: https://huggingface.co/settings/tokens
```

### 2. Start the RAG System
```bash
# Interactive startup script
./scripts/start-rag-system.sh

# Or manually start full system
docker-compose up --build

# Or start just the RAG service
docker-compose up --build rag-service
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **RAG API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs

## 🧠 Apertus Swiss AI Integration

### **RAG System Features**
- **Model**: swiss-ai/Apertus-8B-Instruct-2509 (Switzerland's open AI model)
- **Languages**: Swiss German, French, Italian, Romansh + 1000+ languages
- **Knowledge Base**: 50+ curated Swiss Alpine safety documents
- **Vector Search**: ChromaDB with semantic embeddings
- **Context Awareness**: Weather, location, and activity-specific responses

### **AI Capabilities**
🌤️ **Weather Analysis** - Real-time risk assessment with MeteoSwiss integration
🥾 **Route Planning** - AI-guided path recommendations based on current conditions
🚨 **Emergency Guidance** - Step-by-step crisis response protocols in multiple languages
🎒 **Equipment Advice** - Context-aware gear recommendations for Swiss conditions
📍 **Location Intelligence** - Swiss-specific mountain knowledge and hazards

## 🏗️ RAG Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway    │    │  Weather Service│
│   React PWA     │◄──►│   Routing/Auth   │◄──►│   MeteoSwiss    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         └───────────────────────┼─────────────────────────────┐
                                 │                             │
                   ┌─────────────▼─────────────────────────────▼───┐
                   │           RAG Service (Port 8001)           │
                   │  ┌─────────────────────────────────────────┐ │
                   │  │     Apertus 8B Swiss AI Model          │ │
                   │  │   (swiss-ai/Apertus-8B-Instruct)       │ │
                   │  └─────────────────────────────────────────┘ │
                   │  ┌─────────────────────────────────────────┐ │
                   │  │     Swiss Alpine Knowledge Base        │ │
                   │  │   • Weather Safety (Föhn, Whiteout)    │ │
                   │  │   • Avalanche Protocols (SLF)          │ │
                   │  │   • Emergency Procedures (REGA)        │ │
                   │  │   • Equipment Guidelines (SAC)         │ │
                   │  │   • Location-Specific Hazards          │ │
                   │  └─────────────────────────────────────────┘ │
                   │  ┌─────────────────────────────────────────┐ │
                   │  │       Vector Database (ChromaDB)       │ │
                   │  │   • Sentence Transformers              │ │
                   │  │   • Semantic Search                    │ │
                   │  │   • Context Retrieval                  │ │
                   │  └─────────────────────────────────────────┘ │
                   └─────────────────────────────────────────────┘
```

## 💬 Chat with Apertus

### **Example Queries**
```
User: "I want to hike from Zermatt to Matterhorn Base Camp tomorrow. What should I know?"

Apertus: "🎯 Route Analysis: Zermatt to Matterhorn Base Camp

**Current Conditions:**
• ✅ Weather: Partly cloudy, -2°C at base, -8°C at elevation
• ⚠️ Avalanche Risk: Moderate (Level 3/5) above 2500m
• ✅ Trail Status: Open with caution advisories

**Safety Recommendations:**
1. Start Early - Begin before 7 AM to avoid afternoon weather changes
2. Essential Gear - Avalanche beacon, probe, shovel above Schwarzsee
3. Checkpoints - Report at Furi Station (3.2km) and Schwarzsee (7.8km)

📞 Emergency: Swiss Alpine Rescue 1414"
```

### **Multilingual Support**
Ask in any language - Apertus responds in Swiss German, French, Italian, Romansh, or English:

```
Deutsch: "Wie ist die aktuelle Lawinengefahr in Verbier?"
Français: "Quels équipements pour une randonnée hivernale?"
Italiano: "Condizioni meteo per scialpinismo?"
Rumantsch: "Che temp che fa sin la muntogna?"
```

## 🎛️ RAG Service API

### **Chat Endpoint**
```bash
POST http://localhost:8001/chat
Content-Type: application/json

{
  "message": "What equipment do I need for winter hiking?",
  "context": {
    "weather": {
      "location": "Zermatt",
      "temperature": -5,
      "condition": "snowy"
    },
    "activity": {
      "type": "hiking",
      "difficulty": "intermediate"
    }
  },
  "location": "Zermatt",
  "activity_type": "hiking",
  "language": "en"
}
```

### **System Status**
```bash
GET http://localhost:8001/health
GET http://localhost:8001/models/status
```

### **Knowledge Search**
```bash
GET http://localhost:8001/knowledge/search?query=avalanche&location=Verbier
```

## 🛠️ Development Setup

### **RAG Service Development**
```bash
cd services/rag-service

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export HF_TOKEN=your_hugging_face_token
export APERTUS_MODEL=swiss-ai/Apertus-8B-Instruct-2509

# Run locally
uvicorn src.main:app --reload --port 8001
```

### **Frontend with RAG Integration**
```bash
cd frontend

# Install dependencies
npm install

# Set RAG service URL
export REACT_APP_RAG_URL=http://localhost:8001

# Start development server
npm start
```

## ⚡ Performance & Hardware

### **Recommended Setup**
- **CPU**: 4+ cores for optimal Apertus inference
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: NVIDIA GPU with 8GB+ VRAM for fast inference
- **Storage**: 20GB free space for model cache

### **Performance Benchmarks**
- **GPU (RTX 4090)**: 2-4 seconds per response
- **CPU (M2 Max)**: 5-10 seconds per response
- **CPU (Intel i7)**: 8-15 seconds per response

### **Model Loading Times**
- **First startup**: 5-15 minutes (downloads 16GB model)
- **Subsequent starts**: 30-60 seconds (cached)
- **Memory usage**: 6-8GB RAM for Apertus 8B

## 🔧 Configuration

### **Environment Variables**
```bash
# Required - Hugging Face token for Apertus access
HF_TOKEN=hf_your_token_here

# Model Configuration
APERTUS_MODEL=swiss-ai/Apertus-8B-Instruct-2509
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# API Configuration
REACT_APP_RAG_URL=http://localhost:8001
PYTHON_ENV=development

# Performance Tuning
TRANSFORMERS_CACHE=/app/models
TORCH_HOME=/app/models
```

### **Docker Resource Limits**
```yaml
rag-service:
  deploy:
    resources:
      limits:
        memory: 8G
        cpus: '4'
      reservations:
        memory: 4G
        cpus: '2'
```

## 🧪 Testing the RAG System

### **Manual Testing**
```bash
# Test health endpoint
curl http://localhost:8001/health

# Test chat endpoint
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the avalanche risk in Zermatt today?"}'

# Test knowledge search
curl "http://localhost:8001/knowledge/search?query=emergency&limit=3"
```

### **Frontend Integration Test**
1. Open http://localhost:3000
2. Navigate to AI Assistant
3. Send a message about Swiss mountain safety
4. Verify response shows Apertus model information
5. Check for source citations from knowledge base

## 📊 Swiss Alpine Knowledge Base

### **Content Categories**
- **Weather Safety**: Föhn winds, whiteout conditions, alpine storms
- **Avalanche Protocols**: SLF bulletins, LVS equipment, rescue procedures
- **Emergency Procedures**: REGA protocols, first aid, communication
- **Equipment Guidelines**: SAC recommendations, altitude-specific gear
- **Location Guides**: Zermatt, Jungfraujoch, Verbier, St. Moritz
- **Activity Safety**: Hiking, skiing, mountaineering best practices

### **Data Sources**
- Swiss Alpine Club (SAC) safety guidelines
- SLF Institut avalanche research
- MeteoSwiss weather patterns
- REGA rescue protocols
- Swiss mountain guide expertise
- Official tourism safety information

## 🚨 Emergency Features

### **Emergency Integration**
- **Direct Calling**: 1414 (REGA), 112 (European Emergency)
- **Location Sharing**: GPS coordinates for rescue teams
- **Offline Procedures**: Cached emergency protocols
- **Multi-language**: Emergency instructions in all Swiss languages

### **Real-time Alerts**
- **Weather Warnings**: Sudden condition changes
- **Avalanche Updates**: Live SLF bulletin integration
- **Route Hazards**: Dynamic risk assessment
- **Equipment Failures**: Safety equipment checks

## 🌍 Swiss Re Hackathon Impact

### **Problem Addressed**
Traditional weather warnings lack personalized, AI-driven guidance for real-time mountain safety decisions.

### **Our Innovation**
- **Swiss AI First**: First application of Apertus for Alpine safety
- **RAG Technology**: Combines AI with specialized Swiss mountain knowledge
- **Real-time Intelligence**: Live weather + AI analysis for immediate decisions
- **Swiss Compliance**: Follows Swiss data protection and safety standards

### **Expected Outcomes**
- **Reduced Accidents**: AI-powered early warnings and route guidance
- **Better Preparedness**: Personalized equipment and route recommendations
- **Faster Rescue**: Integration with Swiss emergency services
- **Knowledge Democratization**: Expert mountain knowledge accessible to all

## 📞 Support & Emergency

### **Emergency Numbers (Switzerland)**
- **1414** - Swiss Alpine Rescue (REGA) - 24/7
- **112** - European Emergency Number
- **117** - Police
- **144** - Medical Emergency

### **Technical Support**
- **RAG API Issues**: Check logs with `docker-compose logs rag-service`
- **Model Loading Problems**: Ensure 8GB+ RAM and valid HF_TOKEN
- **Performance Issues**: Consider GPU acceleration or reduce model size

## 🙏 Acknowledgments

- **Swiss AI Initiative** for creating and open-sourcing Apertus
- **ETH Zurich & EPFL** for Apertus development
- **Swiss Re** for the hackathon opportunity
- **Hugging Face** for model hosting and transformers library
- **MeteoSwiss** for weather data APIs
- **SLF Institut** for avalanche expertise
- **Swiss Alpine Club** for safety guidelines
- **REGA** for emergency protocols

---

**Powered by Apertus Swiss AI 🇨🇭 | Built for Swiss Alpine Safety 🏔️**

*"Intelligent safety for every Alpine adventure"*