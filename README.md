# Alpine Trail Guardian

A hackathon prototype exploring how a React interface and a retrieval-based assistant could present Alpine weather and safety information. I worked on this for the Swiss Re challenge, *AI for Resilience against Extreme Weather Events*.

The repo contains a React frontend, a FastAPI RAG service configured for Apertus, and a separate heatwave demo under `swiss-heat-shield/`.

## What is here

- `frontend/` — weather, risk, route, assistant, and emergency-panel components
- `services/rag-service/` — chat API, knowledge retrieval, and model-loading code
- `scripts/` — startup and API test helpers
- `swiss-heat-shield/` — a separate React/FastAPI heatwave prototype

The frontend runs with demo mode enabled in the main Compose file. This checkout also references `services/weather-monitor`, `services/alert-engine`, and `gateway`, which are not included. The full-stack Compose command therefore needs those missing components before it can run as described in the original draft.

## Work on the RAG service

Use Python 3.11+ and set `HF_TOKEN` if required for the configured model. From the repository root:

```bash
cd services/rag-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8001
```

The service exposes:

- http://localhost:8001/docs — API documentation
- http://localhost:8001/health — readiness and model-loading information
- http://localhost:8001/models/status — model and knowledge-base status

Model loading requires a download and enough memory for the configured model. I have not included measured startup or response-time benchmarks here.

## API examples

```bash
curl http://localhost:8001/health

curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What information is in the knowledge base?"}'

curl "http://localhost:8001/knowledge/search?query=weather&limit=3"
```

## Frontend development

```bash
cd frontend
npm install
REACT_APP_RAG_URL=http://localhost:8001 npm start
```

The frontend development address is http://localhost:3000. Some panels depend on demo data or services outside this checkout.

## Project notes

This is a prototype, with incomplete integrations and no validated prediction accuracy. It does not coordinate with rescue services or provide verified live hazard information.

- [RAG setup notes](README3.md)
- [Scope and implementation notes](README4.md)
- [Heatwave demo](swiss-heat-shield/README.md)
