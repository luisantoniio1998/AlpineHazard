"""
Swiss Heat Shield AI - Backend API
AI for Resilience against Extreme Weather Events
Swiss Re Hackathon 2025
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import numpy as np
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Swiss Heat Shield AI",
    description="AI-powered heatwave early warning system for Switzerland",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class UserProfile(BaseModel):
    user_id: str
    name: str
    age: int
    location: str
    vulnerability_level: str  # low, medium, high
    health_conditions: List[str]
    occupation: str
    preferred_notifications: List[str]

class HeatwaveAlert(BaseModel):
    alert_id: str
    location: str
    severity: str  # yellow, orange, red
    temperature_max: float
    temperature_feels_like: float
    duration_hours: int
    start_time: datetime
    end_time: datetime
    recommendations: List[str]
    cooling_centers: List[Dict[str, Any]]

class ParametricTrigger(BaseModel):
    trigger_id: str
    user_id: str
    location: str
    temperature_threshold: float
    duration_threshold: int  # hours
    payout_amount: float
    trigger_conditions: str
    is_triggered: bool

# Swiss cities and MeteoSwiss station mapping
SWISS_CITIES = {
    "zurich": {"lat": 47.3769, "lon": 8.5417, "station": "ZUR"},
    "basel": {"lat": 47.5596, "lon": 7.5886, "station": "BAS"},
    "geneva": {"lat": 46.2044, "lon": 6.1432, "station": "GVE"},
    "bern": {"lat": 46.9481, "lon": 7.4474, "station": "BER"},
    "lausanne": {"lat": 46.5197, "lon": 6.6323, "station": "LAU"},
    "lucerne": {"lat": 47.0502, "lon": 8.3093, "station": "LUZ"},
}

# Global storage (in production, use proper database)
users_db = {}
alerts_db = {}
triggers_db = {}

class MeteoSwissAPI:
    """Integration with MeteoSwiss Open Data API"""

    BASE_URL = "https://data.geo.admin.ch/ch.meteoschweiz.messwerte-aktuell"

    @staticmethod
    async def get_current_temperature(location: str) -> Dict[str, float]:
        """Get current temperature for a Swiss location"""
        try:
            if location.lower() not in SWISS_CITIES:
                raise HTTPException(status_code=400, detail=f"Location {location} not supported")

            # For MVP, simulate MeteoSwiss data with realistic Swiss temperatures
            # In production, use actual MeteoSwiss API
            city_data = SWISS_CITIES[location.lower()]

            # Simulate realistic Swiss temperatures based on season and location
            base_temp = 22.0  # Summer average
            variation = np.random.normal(0, 3)  # Natural variation
            current_temp = base_temp + variation

            # Calculate heat index (feels like temperature)
            humidity = 60 + np.random.normal(0, 10)  # Swiss summer humidity
            feels_like = MeteoSwissAPI._calculate_heat_index(current_temp, humidity)

            return {
                "temperature": round(current_temp, 1),
                "feels_like": round(feels_like, 1),
                "humidity": round(humidity, 1),
                "location": location,
                "timestamp": datetime.now().isoformat(),
                "station": city_data["station"]
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

    @staticmethod
    def _calculate_heat_index(temp_c: float, humidity: float) -> float:
        """Calculate heat index (feels like temperature)"""
        # Convert to Fahrenheit for heat index calculation
        temp_f = temp_c * 9/5 + 32

        # Heat index formula (simplified)
        if temp_f < 80:
            return temp_c

        hi = (0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (humidity * 0.094)))

        if hi >= 80:
            # More complex formula for higher temperatures
            hi = (-42.379 + 2.04901523 * temp_f + 10.14333127 * humidity
                  - 0.22475541 * temp_f * humidity - 6.83783e-3 * temp_f**2
                  - 5.481717e-2 * humidity**2 + 1.22874e-3 * temp_f**2 * humidity
                  + 8.5282e-4 * temp_f * humidity**2 - 1.99e-6 * temp_f**2 * humidity**2)

        # Convert back to Celsius
        return (hi - 32) * 5/9

class HeatwavePredictor:
    """AI model for heatwave prediction and risk assessment"""

    @staticmethod
    def predict_heatwave_risk(current_temp: float, feels_like: float, location: str) -> Dict[str, Any]:
        """Predict heatwave risk based on current conditions"""

        # Define risk thresholds (Swiss-specific)
        risk_score = 0
        severity = "green"

        if feels_like >= 32:
            risk_score += 40
        if feels_like >= 35:
            risk_score += 30
        if feels_like >= 38:
            risk_score += 30

        if current_temp >= 30:
            risk_score += 20
        if current_temp >= 33:
            risk_score += 25
        if current_temp >= 36:
            risk_score += 25

        # Location-specific adjustments
        if location.lower() in ["basel", "geneva"]:  # Typically warmer areas
            risk_score += 10

        # Determine severity
        if risk_score >= 80:
            severity = "red"
        elif risk_score >= 60:
            severity = "orange"
        elif risk_score >= 40:
            severity = "yellow"
        else:
            severity = "green"

        return {
            "risk_score": min(risk_score, 100),
            "severity": severity,
            "prediction_confidence": 0.85,
            "factors": {
                "temperature": current_temp,
                "feels_like": feels_like,
                "location_factor": location
            }
        }

class RecommendationEngine:
    """Generate personalized health recommendations"""

    @staticmethod
    def generate_recommendations(user: UserProfile, alert: HeatwaveAlert) -> List[str]:
        """Generate personalized recommendations based on user profile and alert"""
        recommendations = []

        # Base recommendations for all users
        base_recs = [
            "Stay hydrated - drink water every 15-20 minutes",
            "Avoid outdoor activities between 11 AM and 4 PM",
            "Wear light-colored, loose-fitting clothing",
            "Seek air-conditioned spaces during peak heat"
        ]
        recommendations.extend(base_recs)

        # Age-specific recommendations
        if user.age >= 65:
            recommendations.extend([
                "Check in with family/neighbors regularly",
                "Keep curtains closed during day",
                "Take cool showers or baths",
                "Monitor for signs of heat exhaustion"
            ])
        elif user.age <= 12:
            recommendations.extend([
                "Supervise children closely outdoors",
                "Apply sunscreen every 2 hours",
                "Provide frequent water breaks"
            ])

        # Health condition specific
        if "cardiovascular" in user.health_conditions:
            recommendations.append("Consult doctor before outdoor exercise")
        if "respiratory" in user.health_conditions:
            recommendations.append("Monitor air quality and avoid polluted areas")

        # Occupation specific
        if user.occupation in ["construction", "agriculture", "outdoor"]:
            recommendations.extend([
                "Schedule work for early morning/late evening",
                "Take frequent breaks in shade",
                "Use cooling towels and electrolyte replacement"
            ])

        # Severity-specific urgent actions
        if alert.severity == "red":
            recommendations.extend([
                "🚨 URGENT: Seek immediate cooling if feeling unwell",
                "Consider relocating to cooling center",
                "Emergency contacts ready: 144 (medical), 117 (police)"
            ])

        return recommendations[:10]  # Limit to top 10 recommendations

# API Endpoints

@app.get("/")
async def root():
    return {
        "service": "Swiss Heat Shield AI",
        "status": "operational",
        "version": "1.0.0",
        "description": "AI-powered heatwave early warning system for Switzerland"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "supported_cities": list(SWISS_CITIES.keys())
    }

@app.post("/users")
async def create_user(user: UserProfile):
    """Register a new user"""
    users_db[user.user_id] = user.model_dump()
    return {"message": "User registered successfully", "user_id": user.user_id}

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get user profile"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]

@app.get("/weather/{location}")
async def get_weather(location: str):
    """Get current weather for a location"""
    weather_data = await MeteoSwissAPI.get_current_temperature(location)
    return weather_data

@app.get("/risk/{location}")
async def get_heatwave_risk(location: str):
    """Get heatwave risk assessment for a location"""
    weather_data = await MeteoSwissAPI.get_current_temperature(location)
    risk_data = HeatwavePredictor.predict_heatwave_risk(
        weather_data["temperature"],
        weather_data["feels_like"],
        location
    )

    return {
        "location": location,
        "current_weather": weather_data,
        "risk_assessment": risk_data,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/alerts/{location}")
async def get_alerts(location: str):
    """Get active heatwave alerts for a location"""
    weather_data = await MeteoSwissAPI.get_current_temperature(location)
    risk_data = HeatwavePredictor.predict_heatwave_risk(
        weather_data["temperature"],
        weather_data["feels_like"],
        location
    )

    if risk_data["severity"] in ["yellow", "orange", "red"]:
        alert = HeatwaveAlert(
            alert_id=f"alert_{location}_{int(datetime.now().timestamp())}",
            location=location,
            severity=risk_data["severity"],
            temperature_max=weather_data["temperature"],
            temperature_feels_like=weather_data["feels_like"],
            duration_hours=6,  # Predicted duration
            start_time=datetime.now(),
            end_time=datetime.now() + timedelta(hours=6),
            recommendations=[],
            cooling_centers=[]
        )

        alerts_db[alert.alert_id] = alert.model_dump()
        return alert

    return {"message": "No active alerts", "location": location}

@app.get("/recommendations/{user_id}/{location}")
async def get_personalized_recommendations(user_id: str, location: str):
    """Get personalized recommendations for a user and location"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    user = UserProfile(**users_db[user_id])

    # Get current alert
    try:
        alert_response = await get_alerts(location)
        if "alert_id" in alert_response:
            alert = HeatwaveAlert(**alert_response)
            recommendations = RecommendationEngine.generate_recommendations(user, alert)
            return {
                "user_id": user_id,
                "location": location,
                "alert_severity": alert.severity,
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat()
            }
    except:
        pass

    return {
        "user_id": user_id,
        "location": location,
        "alert_severity": "green",
        "recommendations": ["No specific recommendations - conditions are normal"],
        "timestamp": datetime.now().isoformat()
    }

@app.post("/parametric/trigger")
async def create_parametric_trigger(trigger: ParametricTrigger):
    """Create a parametric insurance trigger"""
    triggers_db[trigger.trigger_id] = trigger.model_dump()
    return {"message": "Parametric trigger created", "trigger_id": trigger.trigger_id}

@app.get("/parametric/check/{trigger_id}")
async def check_parametric_trigger(trigger_id: str):
    """Check if parametric trigger conditions are met"""
    if trigger_id not in triggers_db:
        raise HTTPException(status_code=404, detail="Trigger not found")

    trigger = ParametricTrigger(**triggers_db[trigger_id])
    weather_data = await MeteoSwissAPI.get_current_temperature(trigger.location)

    # Check if conditions are met
    is_triggered = weather_data["feels_like"] >= trigger.temperature_threshold

    trigger.is_triggered = is_triggered
    triggers_db[trigger_id] = trigger.model_dump()

    return {
        "trigger_id": trigger_id,
        "is_triggered": is_triggered,
        "current_temperature": weather_data["feels_like"],
        "threshold": trigger.temperature_threshold,
        "payout_amount": trigger.payout_amount if is_triggered else 0,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)