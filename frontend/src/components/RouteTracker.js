import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  TrendingUp,
  Mountain,
  Flag,
  Play,
  Pause,
  Square,
  AlertTriangle,
  CheckCircle,
  Route
} from 'lucide-react';

const RouteTracker = () => {
  const [selectedRoute, setSelectedRoute] = useState('matterhorn-base');
  const [trackingStatus, setTrackingStatus] = useState('stopped'); // stopped, tracking, paused
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeProgress, setRouteProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [weatherAlerts, setWeatherAlerts] = useState([]);

  // Popular Swiss hiking/skiing routes
  const routes = {
    'matterhorn-base': {
      name: 'Matterhorn Base Camp Trail',
      difficulty: 'Moderate',
      distance: '12.4 km',
      elevation: '+847m',
      estimatedTime: '4-5 hours',
      startPoint: 'Zermatt Village',
      endPoint: 'Matterhorn Base Camp',
      type: 'Hiking',
      description: 'Classic alpine trail with stunning Matterhorn views',
      waypoints: [
        { name: 'Zermatt Village', elevation: 1620, distance: 0, lat: 46.0207, lon: 7.7491 },
        { name: 'Furi Station', elevation: 1864, distance: 3.2, lat: 46.0089, lon: 7.7428 },
        { name: 'Schwarzsee', elevation: 2583, distance: 7.8, lat: 45.9989, lon: 7.7297 },
        { name: 'Matterhorn Base Camp', elevation: 2467, distance: 12.4, lat: 45.9963, lon: 7.6586 }
      ]
    },
    'jungfrau-glacier': {
      name: 'Jungfrau Glacier Trail',
      difficulty: 'Advanced',
      distance: '15.8 km',
      elevation: '+1245m',
      estimatedTime: '6-7 hours',
      startPoint: 'Kleine Scheidegg',
      endPoint: 'Jungfraujoch',
      type: 'Alpine Hiking',
      description: 'High-altitude glacier trail requiring experience',
      waypoints: [
        { name: 'Kleine Scheidegg', elevation: 2061, distance: 0, lat: 46.5794, lon: 7.9625 },
        { name: 'Eigergletscher', elevation: 2320, distance: 4.2, lat: 46.5689, lon: 7.9544 },
        { name: 'Mönchsjochhütte', elevation: 3650, distance: 11.5, lat: 46.5544, lon: 7.9756 },
        { name: 'Jungfraujoch', elevation: 3454, distance: 15.8, lat: 46.5475, lon: 7.9825 }
      ]
    },
    'verbier-slopes': {
      name: 'Verbier Off-Piste Descent',
      difficulty: 'Expert',
      distance: '8.2 km',
      elevation: '-1678m',
      estimatedTime: '2-3 hours',
      startPoint: 'Mont Fort Summit',
      endPoint: 'Verbier Village',
      type: 'Skiing',
      description: 'Epic off-piste skiing with avalanche risk',
      waypoints: [
        { name: 'Mont Fort Summit', elevation: 3330, distance: 0, lat: 46.0775, lon: 7.2169 },
        { name: 'Col des Gentianes', elevation: 2894, distance: 2.1, lat: 46.0889, lon: 7.2281 },
        { name: 'La Chaux', elevation: 2260, distance: 5.4, lat: 46.0925, lon: 7.2394 },
        { name: 'Verbier Village', elevation: 1500, distance: 8.2, lat: 46.0964, lon: 7.2281 }
      ]
    }
  };

  useEffect(() => {
    let interval;
    if (trackingStatus === 'tracking') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
        simulateProgress();
        checkWeatherConditions();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [trackingStatus]);

  const simulateProgress = () => {
    setRouteProgress(prev => {
      const newProgress = Math.min(prev + Math.random() * 0.5, 100);

      // Simulate position updates
      const route = routes[selectedRoute];
      const progressDecimal = newProgress / 100;
      const totalWaypoints = route.waypoints.length - 1;
      const currentWaypointIndex = Math.floor(progressDecimal * totalWaypoints);
      const currentWaypoint = route.waypoints[currentWaypointIndex];

      if (currentWaypoint) {
        setCurrentPosition({
          ...currentWaypoint,
          progress: newProgress,
          nextWaypoint: route.waypoints[currentWaypointIndex + 1]
        });
      }

      return newProgress;
    });
  };

  const checkWeatherConditions = () => {
    // Simulate weather condition checks
    if (Math.random() < 0.001) { // 0.1% chance per second
      const alerts = [
        {
          id: Date.now(),
          type: 'weather',
          severity: 'warning',
          message: 'Sudden wind increase detected. Consider seeking shelter.',
          location: currentPosition?.name || 'Current location'
        },
        {
          id: Date.now() + 1,
          type: 'avalanche',
          severity: 'danger',
          message: 'Avalanche risk elevated in your area. Immediate action recommended.',
          location: currentPosition?.name || 'Current location'
        }
      ];

      setWeatherAlerts(prev => [...prev, alerts[Math.floor(Math.random() * alerts.length)]]);
    }
  };

  const startTracking = () => {
    setTrackingStatus('tracking');
    if (routeProgress === 0) {
      const route = routes[selectedRoute];
      setCurrentPosition(route.waypoints[0]);
    }
  };

  const pauseTracking = () => {
    setTrackingStatus('paused');
  };

  const stopTracking = () => {
    setTrackingStatus('stopped');
    setRouteProgress(0);
    setElapsedTime(0);
    setCurrentPosition(null);
    setWeatherAlerts([]);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const dismissAlert = (alertId) => {
    setWeatherAlerts(alerts => alerts.filter(alert => alert.id !== alertId));
  };

  const currentRoute = routes[selectedRoute];

  return (
    <div className="route-tracker">
      {/* Active Alerts */}
      {weatherAlerts.length > 0 && (
        <div className="live-alerts">
          {weatherAlerts.map(alert => (
            <div key={alert.id} className={`live-alert alert-${alert.severity}`}>
              <AlertTriangle size={20} />
              <div className="alert-content">
                <strong>{alert.type.toUpperCase()}:</strong> {alert.message}
                <div className="alert-location">{alert.location}</div>
              </div>
              <button
                className="alert-dismiss"
                onClick={() => dismissAlert(alert.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Route Selection */}
      <div className="card">
        <h2>Alpine Route Tracker</h2>
        <div className="route-selector">
          {Object.entries(routes).map(([key, route]) => (
            <div
              key={key}
              className={`route-card ${selectedRoute === key ? 'active' : ''}`}
              onClick={() => setSelectedRoute(key)}
            >
              <div className="route-header">
                <h3>{route.name}</h3>
                <span className={`difficulty difficulty-${route.difficulty.toLowerCase()}`}>
                  {route.difficulty}
                </span>
              </div>
              <div className="route-stats">
                <div className="stat">
                  <Route size={16} />
                  {route.distance}
                </div>
                <div className="stat">
                  <TrendingUp size={16} />
                  {route.elevation}
                </div>
                <div className="stat">
                  <Clock size={16} />
                  {route.estimatedTime}
                </div>
              </div>
              <p className="route-description">{route.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Controls */}
      <div className="grid grid-2">
        <div className="card tracking-controls">
          <h3>Tracking Controls</h3>
          <div className="control-buttons">
            {trackingStatus === 'stopped' && (
              <button className="btn btn-primary control-btn" onClick={startTracking}>
                <Play size={20} />
                Start Tracking
              </button>
            )}
            {trackingStatus === 'tracking' && (
              <button className="btn btn-warning control-btn" onClick={pauseTracking}>
                <Pause size={20} />
                Pause
              </button>
            )}
            {trackingStatus === 'paused' && (
              <button className="btn btn-primary control-btn" onClick={startTracking}>
                <Play size={20} />
                Resume
              </button>
            )}
            {(trackingStatus === 'tracking' || trackingStatus === 'paused') && (
              <button className="btn btn-danger control-btn" onClick={stopTracking}>
                <Square size={20} />
                Stop
              </button>
            )}
          </div>

          <div className="tracking-stats">
            <div className="stat-item">
              <Clock size={16} />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            <div className="stat-item">
              <Route size={16} />
              <span>Progress: {routeProgress.toFixed(1)}%</span>
            </div>
            {currentPosition && (
              <div className="stat-item">
                <MapPin size={16} />
                <span>At: {currentPosition.name}</span>
              </div>
            )}
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${routeProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Status */}
        <div className="card current-status">
          <h3>Current Status</h3>
          {trackingStatus === 'stopped' ? (
            <div className="status-message">
              <Mountain size={48} />
              <p>Select a route and start tracking</p>
            </div>
          ) : (
            <div className="live-status">
              <div className="status-indicator">
                <div className={`status-dot ${trackingStatus}`}></div>
                <span className="status-text">
                  {trackingStatus === 'tracking' ? 'Live Tracking' : 'Paused'}
                </span>
              </div>

              {currentPosition && (
                <div className="position-info">
                  <div className="position-item">
                    <strong>Current Location:</strong>
                    <span>{currentPosition.name}</span>
                  </div>
                  <div className="position-item">
                    <strong>Elevation:</strong>
                    <span>{currentPosition.elevation}m</span>
                  </div>
                  <div className="position-item">
                    <strong>Distance Covered:</strong>
                    <span>{currentPosition.distance.toFixed(1)} km</span>
                  </div>
                  {currentPosition.nextWaypoint && (
                    <div className="position-item">
                      <strong>Next Waypoint:</strong>
                      <span>{currentPosition.nextWaypoint.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Route Waypoints */}
      <div className="card">
        <h3>Route Waypoints - {currentRoute.name}</h3>
        <div className="waypoints-list">
          {currentRoute.waypoints.map((waypoint, index) => (
            <div
              key={index}
              className={`waypoint ${
                currentPosition && waypoint.name === currentPosition.name ? 'current' : ''
              } ${
                currentPosition && waypoint.distance <= currentPosition.distance ? 'completed' : ''
              }`}
            >
              <div className="waypoint-number">
                {currentPosition && waypoint.distance <= currentPosition.distance ? (
                  <CheckCircle size={20} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="waypoint-info">
                <h4>{waypoint.name}</h4>
                <div className="waypoint-stats">
                  <span>{waypoint.distance} km</span>
                  <span>{waypoint.elevation}m elevation</span>
                </div>
              </div>
              {index === 0 && <Flag className="waypoint-flag start" size={16} />}
              {index === currentRoute.waypoints.length - 1 && (
                <Flag className="waypoint-flag end" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .route-tracker {
          max-width: 1200px;
          margin: 0 auto;
        }

        .live-alerts {
          margin-bottom: 1rem;
        }

        .live-alert {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          animation: slideIn 0.3s ease-out;
        }

        .alert-warning {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }

        .alert-danger {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
        }

        .alert-content {
          flex: 1;
        }

        .alert-location {
          font-size: 0.875rem;
          opacity: 0.8;
          margin-top: 0.25rem;
        }

        .alert-dismiss {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
        }

        .route-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .route-card {
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .route-card:hover {
          border-color: var(--alpine-blue);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .route-card.active {
          border-color: var(--alpine-blue);
          background: #f8fafc;
        }

        .route-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .route-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .difficulty {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .difficulty-moderate {
          background: var(--alpine-warning);
          color: white;
        }

        .difficulty-advanced {
          background: var(--alpine-danger);
          color: white;
        }

        .difficulty-expert {
          background: #7c2d12;
          color: white;
        }

        .route-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--alpine-rock);
        }

        .route-description {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .tracking-controls {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .control-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
        }

        .tracking-stats {
          margin-bottom: 1.5rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .progress-bar {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
        }

        .progress-fill {
          background: white;
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .status-message {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-dot.tracking {
          background: var(--alpine-safe);
        }

        .status-dot.paused {
          background: var(--alpine-warning);
        }

        .status-text {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .position-info {
          space-y: 0.75rem;
        }

        .position-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .waypoints-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .waypoint {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          transition: all 0.2s;
        }

        .waypoint.current {
          border-color: var(--alpine-blue);
          background: #f0f9ff;
        }

        .waypoint.completed {
          border-color: var(--alpine-safe);
          background: #f0fdf4;
        }

        .waypoint-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f3f4f6;
          font-weight: 600;
        }

        .waypoint.current .waypoint-number {
          background: var(--alpine-blue);
          color: white;
        }

        .waypoint.completed .waypoint-number {
          background: var(--alpine-safe);
          color: white;
        }

        .waypoint-info {
          flex: 1;
        }

        .waypoint-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .waypoint-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .waypoint-flag {
          margin-left: auto;
        }

        .waypoint-flag.start {
          color: var(--alpine-safe);
        }

        .waypoint-flag.end {
          color: var(--alpine-danger);
        }

        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .route-selector {
            grid-template-columns: 1fr;
          }

          .control-buttons {
            flex-direction: column;
          }

          .route-stats {
            flex-direction: column;
            gap: 0.5rem;
          }

          .waypoint {
            flex-wrap: wrap;
          }

          .waypoint-flag {
            margin-left: 0;
            order: -1;
          }
        }
      `}</style>
    </div>
  );
};

export default RouteTracker;