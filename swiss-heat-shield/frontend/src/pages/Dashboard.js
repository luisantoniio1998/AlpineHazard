import React, { useState, useEffect } from 'react';
import { Thermometer, AlertTriangle, MapPin, TrendingUp } from 'lucide-react';
import { heatShieldAPI } from '../services/api';

const Dashboard = ({ user }) => {
  const [location, setLocation] = useState('zurich');
  const [weatherData, setWeatherData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const swissCities = [
    { value: 'zurich', label: 'Zürich' },
    { value: 'basel', label: 'Basel' },
    { value: 'geneva', label: 'Geneva' },
    { value: 'bern', label: 'Bern' },
    { value: 'lausanne', label: 'Lausanne' },
    { value: 'lucerne', label: 'Lucerne' }
  ];

  useEffect(() => {
    if (location) {
      fetchData();
    }
  }, [location, user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch weather and risk data
      const [weatherResponse, riskResponse] = await Promise.all([
        heatShieldAPI.getWeather(location),
        heatShieldAPI.getRisk(location)
      ]);

      setWeatherData(weatherResponse);
      setRiskData(riskResponse);

      // Fetch personalized recommendations if user is logged in
      if (user) {
        const recsResponse = await heatShieldAPI.getRecommendations(user.user_id, location);
        setRecommendations(recsResponse.recommendations || []);
      }
    } catch (err) {
      setError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (severity) => {
    switch (severity) {
      case 'red': return 'risk-red';
      case 'orange': return 'risk-orange';
      case 'yellow': return 'risk-yellow';
      default: return 'risk-green';
    }
  };

  const getRiskLabel = (severity) => {
    switch (severity) {
      case 'red': return 'High Risk';
      case 'orange': return 'Moderate Risk';
      case 'yellow': return 'Low Risk';
      default: return 'No Risk';
    }
  };

  if (loading) {
    return <div className="loading">Loading heat shield data...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="location-selector">
        <label>
          <MapPin size={20} style={{ marginRight: '0.5rem' }} />
          Select Location:
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          {swissCities.map(city => (
            <option key={city.value} value={city.value}>
              {city.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard">
        {/* Current Weather */}
        <div className="dashboard-card">
          <div className="card-header">
            <Thermometer className="card-icon" style={{ color: '#e74c3c' }} />
            <h3>Current Weather</h3>
          </div>
          {weatherData && (
            <div className="weather-data">
              <div className="weather-metric">
                <div className="value">{weatherData.temperature}°C</div>
                <div className="label">Temperature</div>
              </div>
              <div className="weather-metric">
                <div className="value">{weatherData.feels_like}°C</div>
                <div className="label">Feels Like</div>
              </div>
              <div className="weather-metric">
                <div className="value">{weatherData.humidity}%</div>
                <div className="label">Humidity</div>
              </div>
              <div className="weather-metric">
                <div className="value">{weatherData.station}</div>
                <div className="label">Station</div>
              </div>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div className="dashboard-card">
          <div className="card-header">
            <AlertTriangle className="card-icon" style={{ color: '#f39c12' }} />
            <h3>Heatwave Risk</h3>
          </div>
          {riskData && (
            <>
              <div className={`risk-indicator ${getRiskColor(riskData.risk_assessment.severity)}`}>
                <div className="risk-score">{riskData.risk_assessment.risk_score}</div>
                <div className="risk-level">{getRiskLabel(riskData.risk_assessment.severity)}</div>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', textAlign: 'center' }}>
                Prediction Confidence: {Math.round(riskData.risk_assessment.prediction_confidence * 100)}%
              </div>
            </>
          )}
        </div>

        {/* Health Recommendations */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <TrendingUp className="card-icon" style={{ color: '#27ae60' }} />
            <h3>Personalized Recommendations</h3>
          </div>
          {recommendations.length > 0 ? (
            <ul className="recommendations-list">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className={rec.includes('🚨') ? 'urgent-recommendation' : ''}
                >
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
              {user ?
                'No specific recommendations at this time. Stay hydrated!' :
                'Create a profile to get personalized health recommendations'
              }
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {weatherData && riskData && (
        <div className="quick-stats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <div className="stat-card dashboard-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Location</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {swissCities.find(c => c.value === location)?.label}
            </p>
          </div>
          <div className="stat-card dashboard-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Last Updated</h4>
            <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {new Date(weatherData.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div className="stat-card dashboard-card" style={{ textAlign: 'center', padding: '1rem' }}>
            <h4>Risk Level</h4>
            <p style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: riskData.risk_assessment.severity === 'red' ? '#e74c3c' :
                     riskData.risk_assessment.severity === 'orange' ? '#e67e22' :
                     riskData.risk_assessment.severity === 'yellow' ? '#f39c12' : '#27ae60'
            }}>
              {getRiskLabel(riskData.risk_assessment.severity)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;