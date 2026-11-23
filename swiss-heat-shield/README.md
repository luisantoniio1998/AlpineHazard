# Swiss Heat Shield

The heatwave prototype from our Swiss Re hackathon work. It pairs a React interface with a FastAPI backend to explore location-based alerts, user profiles, and parametric-trigger logic.

## What the code does

- Generates sample weather values for a set of Swiss cities.
- Calculates a risk score using temperature thresholds.
- Produces example recommendations from profile fields.
- Stores users, alerts, and triggers in memory.
- Checks example parametric triggers against the simulated temperature.

Despite the `MeteoSwissAPI` class name, the current implementation generates temperatures locally. The risk score is rule-based, and the fixed confidence value is not a measured prediction accuracy. The trigger endpoint simulates a payout amount; it does not issue payments.

## Files

- `backend/main.py` — API, sample weather, risk scoring, and trigger logic
- `backend/requirements.txt` — Python dependencies
- `frontend/` — React dashboard, alert, and user-profile views

This is hackathon code. It has no live weather feed, persistent database, or operational insurance integration.

See the [main project README](../README.md) for the wider Alpine Trail Guardian prototype.
