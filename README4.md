# Alpine Trail Guardian — scope notes

This project came from the Swiss Re hackathon challenge, *AI for Resilience against Extreme Weather Events*. The idea was to bring weather, location, and reference information together in an Alpine-focused interface.

## What the repository contains

The React app has weather, risk, route-tracking, assistant, and emergency-panel components. The FastAPI service provides chat and knowledge-search endpoints, with model and embedding configuration for a RAG workflow.

The separate `swiss-heat-shield/` folder explores a heatwave use case with simulated weather, threshold-based risk scores, user profiles, and parametric-trigger examples.

## What remains incomplete

The main Compose file references weather-monitor, alert-engine, and gateway directories that are not in the checkout. The UI and documentation should therefore be read as prototype work, not evidence of a deployed end-to-end service.

The original pitch also discussed live weather and avalanche feeds, emergency coordination, and insurance integrations. Those ideas are not demonstrated as working integrations here. There are no measured accuracy, uptime, rescue-response, or accident-reduction results in this repo.

## Where to start

Use the [main README](README.md) for the file layout and local development commands, or the [RAG setup notes](README3.md) for the assistant service.
