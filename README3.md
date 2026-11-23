# RAG service setup notes

These notes cover the assistant service in Alpine Trail Guardian. See the [main README](README.md) for the project’s current scope and the missing full-stack components.

## Local setup

You need Python 3.11+ and the packages in `services/rag-service/requirements.txt`. Model access may also require a Hugging Face token.

From the repository root:

```bash
cd services/rag-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Set `HF_TOKEN` in your shell if the model requires it, then start the API:

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

On Windows, use `.venv\Scripts\activate` instead of the Unix activation command.

## Using Docker for the service

The main Compose file defines a standalone `rag-service` build:

```bash
docker-compose up --build rag-service
```

To inspect or stop it:

```bash
docker-compose logs -f rag-service
docker-compose stop rag-service
```

This targets the RAG service only. The full Compose setup references services that are absent from the repository.

## Check the API

```bash
curl http://localhost:8001/health
curl http://localhost:8001/models/status
curl "http://localhost:8001/knowledge/search?query=weather&limit=3"
```

The interactive API documentation is at http://localhost:8001/docs. Check model status as well as the HTTP response: a running API is not enough to show that model loading completed.

## When startup fails

- Authentication error during model download: check the token and the account’s model access.
- Out-of-memory error: check the model configuration and available memory, including Docker’s memory allocation.
- Port conflict: stop the process using port `8001` or change the service port.
- Empty search results: inspect knowledge-base loading in the service logs.

## Stored data

The Compose configuration uses `rag-models` and `rag-embeddings` volumes. Removing those volumes also removes cached models and embeddings. A normal container restart does not need that reset.
