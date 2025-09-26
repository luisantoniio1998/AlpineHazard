import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Phone, MapPin } from 'lucide-react';

const EmergencyAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate receiving emergency alerts
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Weather Warning - Zermatt Area',
        message: 'Sudden temperature drop expected. Current conditions becoming dangerous for high-altitude hiking.',
        location: 'Zermatt, Valais',
        severity: 'medium',
        timestamp: new Date(),
        actions: [
          { type: 'shelter', text: 'Find Shelter', location: 'Monte Rosa Hütte (2km)' },
          { type: 'emergency', text: 'Call Rescue', phone: '1414' }
        ]
      }
    ];

    // Show alert after 3 seconds to simulate real-time
    const timer = setTimeout(() => {
      if (Math.random() > 0.5) { // 50% chance to show demo alert
        setAlerts(mockAlerts);
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    if (alerts.length <= 1) {
      setIsVisible(false);
    }
  };

  const handleEmergencyCall = (phone) => {
    if (window.confirm(`Call Swiss Alpine Rescue (${phone})?`)) {
      window.open(`tel:${phone}`);
    }
  };

  if (!isVisible || alerts.length === 0) return null;

  return (
    <div className="emergency-alerts">
      {alerts.map(alert => (
        <div key={alert.id} className={`alert alert-${alert.severity}`}>
          <div className="alert-container">
            <div className="alert-header">
              <div className="alert-icon">
                <AlertTriangle size={24} />
              </div>
              <div className="alert-info">
                <h3 className="alert-title">{alert.title}</h3>
                <div className="alert-location">
                  <MapPin size={16} />
                  {alert.location}
                </div>
              </div>
              <button
                className="alert-close"
                onClick={() => dismissAlert(alert.id)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="alert-content">
              <p className="alert-message">{alert.message}</p>

              <div className="alert-actions">
                {alert.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`alert-action btn-${action.type}`}
                    onClick={() => {
                      if (action.type === 'emergency') {
                        handleEmergencyCall(action.phone);
                      } else if (action.type === 'shelter') {
                        alert(`Navigating to ${action.location}`);
                      }
                    }}
                  >
                    {action.type === 'emergency' && <Phone size={16} />}
                    {action.type === 'shelter' && <MapPin size={16} />}
                    {action.text}
                    {action.location && <span className="action-detail">({action.location})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="alert-timestamp">
              Alert issued: {alert.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .emergency-alerts {
          position: fixed;
          top: 80px;
          left: 0;
          right: 0;
          z-index: 1000;
          pointer-events: none;
        }

        .alert {
          pointer-events: all;
          margin: 0 1rem 1rem 1rem;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
          backdrop-filter: blur(10px);
        }

        .alert-high {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: 2px solid #fca5a5;
          color: white;
        }

        .alert-medium {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 2px solid #fcd34d;
          color: white;
        }

        .alert-low {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border: 2px solid #7dd3fc;
          color: white;
        }

        .alert-container {
          padding: 1.5rem;
        }

        .alert-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .alert-icon {
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.75rem;
          border-radius: 50%;
          backdrop-filter: blur(10px);
        }

        .alert-info {
          flex: 1;
        }

        .alert-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .alert-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .alert-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s;
        }

        .alert-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .alert-message {
          font-size: 1rem;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
          opacity: 0.95;
        }

        .alert-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .alert-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(5px);
        }

        .alert-action:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .btn-emergency {
          border-color: #fef2f2 !important;
          background: rgba(239, 68, 68, 0.8) !important;
        }

        .btn-emergency:hover {
          background: rgba(239, 68, 68, 1) !important;
        }

        .action-detail {
          font-size: 0.875rem;
          opacity: 0.8;
          font-weight: 400;
        }

        .alert-timestamp {
          font-size: 0.75rem;
          opacity: 0.7;
          text-align: right;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          padding-top: 0.75rem;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .emergency-alerts {
            top: 60px;
          }

          .alert {
            margin: 0 0.5rem 0.5rem 0.5rem;
          }

          .alert-container {
            padding: 1rem;
          }

          .alert-actions {
            flex-direction: column;
          }

          .alert-action {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default EmergencyAlerts;