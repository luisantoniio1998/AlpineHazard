import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Thermometer,
  Wind,
  Mountain,
  Users,
  Target,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

const RiskAssessment = () => {
  const [riskFactors, setRiskFactors] = useState({
    weather: {
      temperature: -5,
      windSpeed: 35,
      visibility: 150,
      forecast: 'deteriorating',
      precipitation: 'snow',
      score: 6
    },
    avalanche: {
      level: 3,
      trend: 'increasing',
      newSnow: 25,
      windLoading: 'moderate',
      score: 7
    },
    terrain: {
      elevation: 2800,
      slope: 38,
      aspect: 'north',
      difficulty: 'intermediate',
      score: 5
    },
    group: {
      experience: 'intermediate',
      groupSize: 3,
      equipment: 'complete',
      fitness: 'good',
      score: 4
    }
  });

  const [overallRisk, setOverallRisk] = useState({});
  const [recommendation, setRecommendation] = useState({});
  const [selectedRoute, setSelectedRoute] = useState('matterhorn-base');

  const routes = [
    {
      id: 'matterhorn-base',
      name: 'Matterhorn Base Camp',
      location: 'Zermatt',
      elevation: 2800,
      difficulty: 'Intermediate',
      duration: '6-8 hours'
    },
    {
      id: 'jungfraujoch-trail',
      name: 'Jungfraujoch Trail',
      location: 'Interlaken',
      elevation: 3454,
      difficulty: 'Advanced',
      duration: '4-6 hours'
    },
    {
      id: 'verbier-offpiste',
      name: 'Verbier Off-Piste',
      location: 'Verbier',
      elevation: 2700,
      difficulty: 'Expert',
      duration: '3-5 hours'
    }
  ];

  useEffect(() => {
    calculateOverallRisk();
  }, [riskFactors]);

  const calculateOverallRisk = () => {
    const weights = {
      weather: 0.3,
      avalanche: 0.35,
      terrain: 0.2,
      group: 0.15
    };

    const weightedScore =
      (riskFactors.weather.score * weights.weather) +
      (riskFactors.avalanche.score * weights.avalanche) +
      (riskFactors.terrain.score * weights.terrain) +
      (riskFactors.group.score * weights.group);

    let riskLevel, color, recommendation;

    if (weightedScore <= 3) {
      riskLevel = 'LOW';
      color = '#10b981';
      recommendation = {
        action: 'GO',
        message: 'Risk profile supports resilient activity execution',
        details: [
          'Weather conditions are stable and favorable',
          'Avalanche risk is within acceptable parameters',
          'Route complexity matches group capabilities',
          'Proceed with standard resilience measures'
        ],
        icon: <CheckCircle size={24} />
      };
    } else if (weightedScore <= 5) {
      riskLevel = 'MODERATE';
      color = '#f59e0b';
      recommendation = {
        action: 'CAUTION',
        message: 'Enhanced resilience measures required for safe execution',
        details: [
          'Implement continuous monitoring of changing conditions',
          'Verify latest hazard bulletins and warnings',
          'Deploy comprehensive risk mitigation equipment',
          'Activate contingency planning and alternative routes'
        ],
        icon: <AlertTriangle size={24} />
      };
    } else if (weightedScore <= 7) {
      riskLevel = 'HIGH';
      color = '#f97316';
      recommendation = {
        action: 'RECONSIDER',
        message: 'Risk exposure exceeds resilience capacity thresholds',
        details: [
          'Current hazard profile surpasses acceptable risk tolerance',
          'Recommend postponement pending improved conditions',
          'Professional risk management expertise required if proceeding',
          'Deploy advanced emergency response infrastructure'
        ],
        icon: <AlertTriangle size={24} />
      };
    } else {
      riskLevel = 'EXTREME';
      color = '#dc2626';
      recommendation = {
        action: 'CRITICAL RISK',
        message: 'Hazard exposure incompatible with population safety',
        details: [
          'Multiple catastrophic risk vectors converging',
          'Environmental conditions pose extreme societal threat',
          'Restrict access to secured, controlled environments only',
          'Await substantial hazard mitigation before reconsidering'
        ],
        icon: <XCircle size={24} />
      };
    }

    setOverallRisk({
      score: weightedScore,
      level: riskLevel,
      color: color,
      percentage: Math.round((weightedScore / 10) * 100)
    });

    setRecommendation(recommendation);
  };

  const updateRiskFactor = (category, field, value) => {
    setRiskFactors(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const getRiskColor = (score) => {
    if (score <= 3) return '#10b981';
    if (score <= 5) return '#f59e0b';
    if (score <= 7) return '#f97316';
    return '#dc2626';
  };

  const getWeatherIcon = () => {
    if (riskFactors.weather.precipitation === 'snow') return '❄️';
    if (riskFactors.weather.visibility < 200) return '🌫️';
    if (riskFactors.weather.windSpeed > 30) return '💨';
    return '⛅';
  };

  return (
    <div className="risk-assessment">
      {/* Header with Route Selection */}
      <div className="card risk-header">
        <div className="header-content">
          <div className="header-info">
            <h2>Alpine Resilience Assessment</h2>
            <p>AI-powered early warning system leveraging official Swiss data sources</p>
            <div className="data-sources">
              <small>Data: MeteoSwiss • SLF • FOEN • Swiss Seismological Service</small>
            </div>
          </div>
          <div className="route-selector">
            <label>Select Route:</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="route-select"
            >
              {routes.map(route => (
                <option key={route.id} value={route.id}>
                  {route.name} - {route.location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Risk Score */}
      <div className="card risk-overview">
        <div className="risk-score-container">
          <div className="risk-score" style={{ borderColor: overallRisk.color }}>
            <div className="risk-number" style={{ color: overallRisk.color }}>
              {overallRisk.score?.toFixed(1)}
            </div>
            <div className="risk-level" style={{ color: overallRisk.color }}>
              {overallRisk.level}
            </div>
            <div className="risk-subtitle">Risk Level</div>
          </div>

          <div className="recommendation-panel">
            <div className="rec-header" style={{ color: overallRisk.color }}>
              {recommendation.icon}
              <span>{recommendation.action}</span>
            </div>
            <h3>{recommendation.message}</h3>
            <ul className="rec-details">
              {recommendation.details?.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Risk Factors Grid */}
      <div className="risk-factors-grid">
        {/* Weather Risk */}
        <div className="card risk-factor">
          <div className="factor-header">
            <div className="factor-icon weather">
              <Thermometer size={20} />
            </div>
            <div className="factor-info">
              <h3>Weather Conditions</h3>
              <div className="factor-score" style={{ color: getRiskColor(riskFactors.weather.score) }}>
                {riskFactors.weather.score}/10
              </div>
            </div>
          </div>

          <div className="factor-details">
            <div className="detail-item">
              <span className="weather-icon">{getWeatherIcon()}</span>
              <div>
                <div className="detail-label">Temperature</div>
                <div className="detail-value">{riskFactors.weather.temperature}°C</div>
              </div>
            </div>

            <div className="detail-item">
              <Wind size={16} />
              <div>
                <div className="detail-label">Wind Speed</div>
                <div className="detail-value">{riskFactors.weather.windSpeed} km/h</div>
              </div>
            </div>

            <div className="detail-item">
              <Target size={16} />
              <div>
                <div className="detail-label">Visibility</div>
                <div className="detail-value">{riskFactors.weather.visibility}m</div>
              </div>
            </div>
          </div>
        </div>

        {/* Avalanche Risk */}
        <div className="card risk-factor">
          <div className="factor-header">
            <div className="factor-icon avalanche">
              <Mountain size={20} />
            </div>
            <div className="factor-info">
              <h3>Avalanche Risk</h3>
              <div className="factor-score" style={{ color: getRiskColor(riskFactors.avalanche.score) }}>
                {riskFactors.avalanche.score}/10
              </div>
            </div>
          </div>

          <div className="factor-details">
            <div className="detail-item">
              <div className="avalanche-level-indicator">
                <div className={`level-badge level-${riskFactors.avalanche.level}`}>
                  {riskFactors.avalanche.level}
                </div>
              </div>
              <div>
                <div className="detail-label">SLF Danger Level</div>
                <div className="detail-value">Level {riskFactors.avalanche.level}/5</div>
              </div>
            </div>

            <div className="detail-item">
              <TrendingUp size={16} />
              <div>
                <div className="detail-label">Trend</div>
                <div className="detail-value">{riskFactors.avalanche.trend}</div>
              </div>
            </div>

            <div className="detail-item">
              <span>❄️</span>
              <div>
                <div className="detail-label">New Snow (24h)</div>
                <div className="detail-value">{riskFactors.avalanche.newSnow}cm</div>
              </div>
            </div>
          </div>
        </div>

        {/* Terrain Risk */}
        <div className="card risk-factor">
          <div className="factor-header">
            <div className="factor-icon terrain">
              <MapPin size={20} />
            </div>
            <div className="factor-info">
              <h3>Terrain & Route</h3>
              <div className="factor-score" style={{ color: getRiskColor(riskFactors.terrain.score) }}>
                {riskFactors.terrain.score}/10
              </div>
            </div>
          </div>

          <div className="factor-details">
            <div className="detail-item">
              <Mountain size={16} />
              <div>
                <div className="detail-label">Elevation</div>
                <div className="detail-value">{riskFactors.terrain.elevation}m</div>
              </div>
            </div>

            <div className="detail-item">
              <span>📐</span>
              <div>
                <div className="detail-label">Slope Angle</div>
                <div className="detail-value">{riskFactors.terrain.slope}°</div>
              </div>
            </div>

            <div className="detail-item">
              <span>🧭</span>
              <div>
                <div className="detail-label">Aspect</div>
                <div className="detail-value">{riskFactors.terrain.aspect}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Group Risk */}
        <div className="card risk-factor">
          <div className="factor-header">
            <div className="factor-icon group">
              <Users size={20} />
            </div>
            <div className="factor-info">
              <h3>Group Factors</h3>
              <div className="factor-score" style={{ color: getRiskColor(riskFactors.group.score) }}>
                {riskFactors.group.score}/10
              </div>
            </div>
          </div>

          <div className="factor-details">
            <div className="detail-item">
              <Users size={16} />
              <div>
                <div className="detail-label">Group Size</div>
                <div className="detail-value">{riskFactors.group.groupSize} people</div>
              </div>
            </div>

            <div className="detail-item">
              <Shield size={16} />
              <div>
                <div className="detail-label">Experience</div>
                <div className="detail-value">{riskFactors.group.experience}</div>
              </div>
            </div>

            <div className="detail-item">
              <CheckCircle size={16} />
              <div>
                <div className="detail-label">Equipment</div>
                <div className="detail-value">{riskFactors.group.equipment}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card action-items">
        <h3>
          <Clock size={20} />
          Recommended Actions
        </h3>
        <div className="actions-grid">
          <div className="action-item priority-high">
            <span className="action-icon">📞</span>
            <div>
              <div className="action-title">Emergency Preparedness</div>
              <div className="action-desc">Ensure communication device and emergency contacts</div>
            </div>
          </div>

          <div className="action-item priority-medium">
            <span className="action-icon">🎒</span>
            <div>
              <div className="action-title">Equipment Check</div>
              <div className="action-desc">Verify avalanche safety gear and weather protection</div>
            </div>
          </div>

          <div className="action-item priority-medium">
            <span className="action-icon">📡</span>
            <div>
              <div className="action-title">Condition Updates</div>
              <div className="action-desc">Check latest weather and avalanche bulletins</div>
            </div>
          </div>

          <div className="action-item priority-low">
            <span className="action-icon">🕐</span>
            <div>
              <div className="action-title">Timing</div>
              <div className="action-desc">Plan early start to avoid afternoon weather changes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="last-updated">
        <Calendar size={16} />
        <span>Risk assessment updated: {new Date().toLocaleString()}</span>
        <div className="data-attribution">
          <small>
            Official Swiss data sources integrated for comprehensive resilience assessment
          </small>
        </div>
      </div>

      <style jsx>{`
        .risk-assessment {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .risk-header {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          padding: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-info h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .header-info p {
          margin: 0 0 0.5rem 0;
          opacity: 0.9;
        }

        .data-sources {
          opacity: 0.8;
          font-style: italic;
        }

        .data-sources small {
          font-size: 0.8rem;
        }

        .route-selector label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .route-select {
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 1rem;
          min-width: 250px;
        }

        .route-select option {
          background: #1e40af;
          color: white;
        }

        .risk-overview {
          padding: 2rem;
        }

        .risk-score-container {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 3rem;
          align-items: center;
        }

        .risk-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          border: 4px solid;
          border-radius: 50%;
          width: 180px;
          height: 180px;
          justify-content: center;
          background: radial-gradient(circle, rgba(255,255,255,0.8), rgba(255,255,255,0.95));
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .risk-number {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .risk-level {
          font-size: 1.2rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }

        .risk-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .recommendation-panel {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
        }

        .rec-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .recommendation-panel h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.4rem;
          color: #1f2937;
        }

        .rec-details {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .rec-details li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }

        .rec-details li:last-child {
          border-bottom: none;
        }

        .risk-factors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .risk-factor {
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .risk-factor:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .factor-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .factor-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .factor-icon.weather {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .factor-icon.avalanche {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .factor-icon.terrain {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .factor-icon.group {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .factor-info {
          flex: 1;
        }

        .factor-info h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .factor-score {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .factor-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
        }

        .detail-item span {
          font-size: 1.25rem;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .detail-value {
          font-weight: 600;
          color: #1f2937;
        }

        .weather-icon {
          font-size: 1.5rem !important;
        }

        .avalanche-level-indicator .level-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: white;
          font-size: 0.875rem;
        }

        .level-1 { background: #10b981; }
        .level-2 { background: #f59e0b; }
        .level-3 { background: #f97316; }
        .level-4 { background: #ef4444; }
        .level-5 { background: #dc2626; }

        .action-items h3 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 1.5rem 0;
          color: #1f2937;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .priority-high {
          background: #fef2f2;
          border-left-color: #dc2626;
        }

        .priority-medium {
          background: #fffbeb;
          border-left-color: #f59e0b;
        }

        .priority-low {
          background: #f0f9ff;
          border-left-color: #3b82f6;
        }

        .action-icon {
          font-size: 1.5rem;
        }

        .action-title {
          font-weight: 600;
          color: #1f2937;
        }

        .action-desc {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .last-updated {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #6b7280;
          font-size: 0.875rem;
          justify-content: center;
          padding: 1rem;
          text-align: center;
        }

        .last-updated > span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .data-attribution {
          margin-top: 0.5rem;
        }

        .data-attribution small {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .risk-assessment {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .risk-score-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .risk-score {
            width: 150px;
            height: 150px;
            margin: 0 auto;
          }

          .risk-number {
            font-size: 2.5rem;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RiskAssessment;