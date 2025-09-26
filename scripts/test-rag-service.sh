#!/bin/bash

# Test script for RAG service with Apertus
echo "🤖 Testing Alpine Trail Guardian RAG Service with Apertus"
echo "========================================================"

RAG_URL="http://localhost:8001"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "\n1. ${YELLOW}Testing Health Endpoint...${NC}"
if curl -s "$RAG_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ RAG Service is running${NC}"
    curl -s "$RAG_URL/health" | jq '.' 2>/dev/null || curl -s "$RAG_URL/health"
else
    echo -e "${RED}❌ RAG Service not accessible${NC}"
    echo "Make sure to run: docker-compose up rag-service"
    exit 1
fi

# Test 2: Model Status
echo -e "\n2. ${YELLOW}Checking Apertus Model Status...${NC}"
if curl -s "$RAG_URL/models/status" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Model status endpoint accessible${NC}"
    curl -s "$RAG_URL/models/status" | jq '.' 2>/dev/null || curl -s "$RAG_URL/models/status"
else
    echo -e "${RED}❌ Model status not available${NC}"
fi

# Test 3: Swiss German Query
echo -e "\n3. ${YELLOW}Testing Swiss German Query...${NC}"
SWISS_QUERY='{"message": "Wie isch d Lawinegfahr z Zermatt?", "language": "de", "location": "Zermatt"}'

echo "Sending: $SWISS_QUERY"
RESPONSE=$(curl -s -X POST "$RAG_URL/chat" \
    -H "Content-Type: application/json" \
    -d "$SWISS_QUERY")

if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Swiss German query successful${NC}"
    echo "Response preview:"
    echo "$RESPONSE" | jq -r '.message' 2>/dev/null | head -3 || echo "$RESPONSE" | head -3
else
    echo -e "${RED}❌ Swiss German query failed${NC}"
fi

# Test 4: English Alpine Safety Query
echo -e "\n4. ${YELLOW}Testing Alpine Safety Knowledge...${NC}"
ENGLISH_QUERY='{"message": "What equipment do I need for winter hiking in the Swiss Alps?", "location": "Swiss Alps", "activity_type": "hiking"}'

echo "Sending: What equipment do I need for winter hiking?"
RESPONSE=$(curl -s -X POST "$RAG_URL/chat" \
    -H "Content-Type: application/json" \
    -d "$ENGLISH_QUERY")

if [ $? -eq 0 ] && [ -n "$RESPONSE" ]; then
    echo -e "${GREEN}✅ Alpine safety query successful${NC}"
    echo "Response preview:"
    echo "$RESPONSE" | jq -r '.message' 2>/dev/null | head -3 || echo "$RESPONSE" | head -3

    # Check if sources are included
    SOURCES=$(echo "$RESPONSE" | jq -r '.sources[]?.title' 2>/dev/null)
    if [ -n "$SOURCES" ]; then
        echo -e "${GREEN}✅ Knowledge base sources included${NC}"
        echo "Sources: $SOURCES"
    fi
else
    echo -e "${RED}❌ Alpine safety query failed${NC}"
fi

# Test 5: Knowledge Base Search
echo -e "\n5. ${YELLOW}Testing Knowledge Base Search...${NC}"
SEARCH_RESPONSE=$(curl -s "$RAG_URL/knowledge/search?query=avalanche&limit=3")

if [ $? -eq 0 ] && [ -n "$SEARCH_RESPONSE" ]; then
    echo -e "${GREEN}✅ Knowledge base search working${NC}"
    echo "Found documents:"
    echo "$SEARCH_RESPONSE" | jq -r '.results[]?.title' 2>/dev/null || echo "Search results available"
else
    echo -e "${RED}❌ Knowledge base search failed${NC}"
fi

echo -e "\n🎯 ${GREEN}RAG Service Testing Complete!${NC}"
echo -e "📱 Frontend URL: http://localhost:3000"
echo -e "🤖 RAG API URL: http://localhost:8001"
echo -e "📚 API Docs: http://localhost:8001/docs"

# Performance check
echo -e "\n⏱️  ${YELLOW}Performance Info:${NC}"
echo "Model loading and response times will improve after first few queries."
echo "Typical response time: 3-10 seconds depending on hardware."