import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, Thermometer } from 'lucide-react';
import { heatShieldAPI } from '../services/api';

const Alerts = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
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
    fetchAllAlerts();
  }, []);

  const fetchAllAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const alertPromises = swissCities.map(async (city) => {
        try {
          const response = await heatShieldAPI.getAlerts(city.value);
          return {
            ...response,
            cityLabel: city.label,
            cityValue: city.value
          };
        } catch (err) {
          // If no alerts for this city, return null
          return {
            message: 'No active alerts',
            location: city.value,
            cityLabel: city.label,
            cityValue: city.value,
            severity: 'green'
          };
        }
      });

      const results = await Promise.all(alertPromises);
      setAlerts(results.filter(Boolean));
    } catch (err) {
      setError(`Failed to fetch alerts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'red':
        return <AlertTriangle size={24} style={{ color: '#e74c3c' }} />;
      case 'orange':
        return <AlertTriangle size={24} style={{ color: '#e67e22' }} />;
      case 'yellow':
        return <AlertTriangle size={24} style={{ color: '#f39c12' }} />;
      default:
        return <Thermometer size={24} style={{ color: '#27ae60' }} />;
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'red': return 'High Risk';
      case 'orange': return 'Moderate Risk';
      case 'yellow': return 'Low Risk';
      default: return 'Normal';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading alerts...</div>;
  }

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>Heatwave Alerts - Switzerland</h2>
        <p>Real-time heatwave risk assessment for major Swiss cities</p>
        <button
          onClick={fetchAllAlerts}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          Refresh Alerts
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="alerts-grid">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.cityValue}-${index}`}
            className={`alert-card severity-${alert.severity || 'green'}`}
          >
            <div className="alert-header">
              <div className="alert-title">
                <MapPin size={20} style={{ marginRight: '0.5rem' }} />
                {alert.cityLabel}
              </div>
              <div className="alert-severity-container">
                {getSeverityIcon(alert.severity || 'green')}
                <span className={`alert-severity ${alert.severity || 'green'}`}>
                  {getSeverityLabel(alert.severity || 'green')}
                </span>
              </div>
            </div>

            {alert.alert_id ? (
              // Active alert
              <div className="alert-content">
                <div className="alert-metrics">
                  <div className="metric">
                    <strong>Max Temperature:</strong> {alert.temperature_max}°C
                  </div>
                  <div className="metric">
                    <strong>Feels Like:</strong> {alert.temperature_feels_like}°C
                  </div>
                  <div className="metric">
                    <strong>Duration:</strong> {alert.duration_hours} hours
                  </div>
                </div>

                <div className="alert-timing">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Clock size={16} />
                    <strong>Active Period:</strong>
                  </div>
                  <div>Start: {formatDateTime(alert.start_time)}</div>
                  <div>End: {formatDateTime(alert.end_time)}</div>
                </div>

                {alert.recommendations && alert.recommendations.length > 0 && (
                  <div className="alert-recommendations">
                    <strong>Immediate Actions:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                      {alert.recommendations.slice(0, 3).map((rec, recIndex) => (
                        <li key={recIndex} style={{ marginBottom: '0.25rem' }}>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              // No active alert
              <div className="alert-content">
                <div style={{ textAlign: 'center', color: '#27ae60', padding: '1rem' }}>
                  <p>✅ No heatwave alerts</p>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                    Current conditions are normal. Stay hydrated and monitor updates.
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Information Panel */}
      <div className="info-panel" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '2rem',
        marginTop: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <h3>Understanding Heat Risk Levels</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }}>
          <div className="risk-info">
            <div style={{ color: '#27ae60', fontWeight: 'bold' }}>🟢 Normal (Green)</div>
            <p>Comfortable temperatures, no special precautions needed.</p>
          </div>
          <div className="risk-info">
            <div style={{ color: '#f39c12', fontWeight: 'bold' }}>🟡 Low Risk (Yellow)</div>
            <p>Warm conditions. Stay hydrated and limit outdoor exposure.</p>
          </div>
          <div className="risk-info">
            <div style={{ color: '#e67e22', fontWeight: 'bold' }}>🟠 Moderate Risk (Orange)</div>
            <p>Hot conditions. Avoid outdoor activities 11 AM - 4 PM.</p>
          </div>
          <div className="risk-info">
            <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>🔴 High Risk (Red)</div>
            <p>Dangerous heat. Seek cooling immediately if unwell.</p>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '8px' }}>
          <h4>Emergency Contacts</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            <div>📞 <strong>Medical:</strong> 144</div>
            <div>🚔 <strong>Police:</strong> 117</div>
            <div>🚒 <strong>Fire:</strong> 118</div>
            <div>🌍 <strong>Europe Emergency:</strong> 112</div>
          </div>
        </div>

        {user && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', borderRadius: '8px' }}>
            <p>
              💡 <strong>Personalized recommendations</strong> are available on your dashboard
              based on your profile (age: {user.age}, vulnerability: {user.vulnerability_level}).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;