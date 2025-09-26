import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  Eye,
  Droplets,
  Mountain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const WeatherDashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState('zermatt');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Swiss Alpine Locations
  const locations = {
    zermatt: { name: 'Zermatt', elevation: '1620m', lat: 46.0207, lon: 7.7491 },
    jungfraujoch: { name: 'Jungfraujoch', elevation: '3454m', lat: 46.5475, lon: 7.9825 },
    verbier: { name: 'Verbier', elevation: '1500m', lat: 46.0964, lon: 7.2281 },
    stmoritz: { name: 'St. Moritz', elevation: '1856m', lat: 46.4908, lon: 9.8355 },
    interlaken: { name: 'Interlaken', elevation: '568m', lat: 46.6863, lon: 7.8632 }
  };

  useEffect(() => {
    fetchWeatherData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWeatherData, 30000);
    return () => clearInterval(interval);
  }, [selectedLocation]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const location = locations[selectedLocation];
      const response = await fetch(`/api/weather/current/${location.lat}/${location.lon}`);

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        // Demo mode with mock data
        setWeatherData(generateMockWeatherData(location));
      }
    } catch (error) {
      console.log('Using demo weather data');
      setWeatherData(generateMockWeatherData(locations[selectedLocation]));
    }

    setLoading(false);
    setLastUpdate(new Date());
  };

  const generateMockWeatherData = (location) => {
    const baseTemp = Math.random() * 20 - 5; // -5°C to 15°C
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      location: location.name,
      elevation: location.elevation,
      current: {
        temperature: Math.round(baseTemp),
        condition: condition,
        humidity: Math.round(Math.random() * 40 + 40), // 40-80%
        windSpeed: Math.round(Math.random() * 25 + 5), // 5-30 km/h
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        visibility: Math.round(Math.random() * 20 + 10), // 10-30 km
        pressure: Math.round(Math.random() * 50 + 980), // 980-1030 hPa
        feelsLike: Math.round(baseTemp - Math.random() * 5)
      },
      forecast: Array.from({ length: 24 }, (_, i) => ({
        hour: new Date(Date.now() + i * 60 * 60 * 1000).getHours(),
        temperature: Math.round(baseTemp + (Math.random() - 0.5) * 8),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        precipitation: Math.random() * 5
      })),
      risks: {
        avalanche: Math.random() > 0.7 ? 'moderate' : 'low',
        frost: baseTemp < 0 ? 'high' : 'low',
        visibility: Math.random() > 0.8 ? 'poor' : 'good',
        wind: Math.random() > 0.6 ? 'strong' : 'normal'
      }
    };
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      sunny: <Sun className="weather-icon sunny" />,
      cloudy: <Cloud className="weather-icon cloudy" />,
      rainy: <CloudRain className="weather-icon rainy" />,
      snowy: <Cloud className="weather-icon snowy" />,
      windy: <Wind className="weather-icon windy" />
    };
    return icons[condition] || icons.cloudy;
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'var(--alpine-safe)',
      moderate: 'var(--alpine-warning)',
      high: 'var(--alpine-danger)',
      poor: 'var(--alpine-danger)',
      good: 'var(--alpine-safe)',
      normal: 'var(--alpine-safe)',
      strong: 'var(--alpine-warning)'
    };
    return colors[risk] || 'var(--alpine-rock)';
  };

  if (loading) {
    return (
      <div className="weather-dashboard">
        <div className="spinner"></div>
        <p>Loading weather data...</p>
      </div>
    );
  }

  return (
    <div className="weather-dashboard">
      {/* Location Selector */}
      <div className="card">
        <h2>Swiss Alpine Weather</h2>
        <div className="location-selector">
          {Object.entries(locations).map(([key, location]) => (
            <button
              key={key}
              className={`location-btn ${selectedLocation === key ? 'active' : ''}`}
              onClick={() => setSelectedLocation(key)}
            >
              <Mountain size={16} />
              {location.name}
              <span className="elevation">{location.elevation}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Current Weather */}
      <div className="grid grid-2">
        <div className="card current-weather">
          <div className="current-header">
            <div>
              <h3>{weatherData.location}</h3>
              <p className="elevation">{weatherData.elevation} elevation</p>
            </div>
            {getWeatherIcon(weatherData.current.condition)}
          </div>

          <div className="temperature-display">
            <span className="temp-main">{weatherData.current.temperature}°C</span>
            <span className="temp-feels">Feels like {weatherData.current.feelsLike}°C</span>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <Droplets size={16} />
              <span>Humidity: {weatherData.current.humidity}%</span>
            </div>
            <div className="detail-item">
              <Wind size={16} />
              <span>{weatherData.current.windSpeed} km/h {weatherData.current.windDirection}</span>
            </div>
            <div className="detail-item">
              <Eye size={16} />
              <span>Visibility: {weatherData.current.visibility} km</span>
            </div>
            <div className="detail-item">
              <Thermometer size={16} />
              <span>Pressure: {weatherData.current.pressure} hPa</span>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="card risk-assessment">
          <h3>Current Risks</h3>
          <div className="risk-grid">
            <div className="risk-item">
              <div className="risk-header">
                <Mountain size={16} />
                <span>Avalanche</span>
              </div>
              <div
                className="risk-level"
                style={{ backgroundColor: getRiskColor(weatherData.risks.avalanche) }}
              >
                {weatherData.risks.avalanche}
              </div>
            </div>

            <div className="risk-item">
              <div className="risk-header">
                <Thermometer size={16} />
                <span>Frost Risk</span>
              </div>
              <div
                className="risk-level"
                style={{ backgroundColor: getRiskColor(weatherData.risks.frost) }}
              >
                {weatherData.risks.frost}
              </div>
            </div>

            <div className="risk-item">
              <div className="risk-header">
                <Eye size={16} />
                <span>Visibility</span>
              </div>
              <div
                className="risk-level"
                style={{ backgroundColor: getRiskColor(weatherData.risks.visibility) }}
              >
                {weatherData.risks.visibility}
              </div>
            </div>

            <div className="risk-item">
              <div className="risk-header">
                <Wind size={16} />
                <span>Wind</span>
              </div>
              <div
                className="risk-level"
                style={{ backgroundColor: getRiskColor(weatherData.risks.wind) }}
              >
                {weatherData.risks.wind}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-hour Forecast */}
      <div className="card">
        <h3>24-Hour Forecast</h3>
        <div className="forecast-scroll">
          {weatherData.forecast.map((hour, index) => (
            <div key={index} className="forecast-hour">
              <div className="forecast-time">
                {hour.hour.toString().padStart(2, '0')}:00
              </div>
              {getWeatherIcon(hour.condition)}
              <div className="forecast-temp">{hour.temperature}°C</div>
              {hour.precipitation > 0 && (
                <div className="forecast-precip">
                  <Droplets size={12} />
                  {hour.precipitation.toFixed(1)}mm
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      <div className="update-status">
        <CheckCircle size={16} />
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>

      <style jsx>{`
        .weather-dashboard {
          max-width: 1200px;
          margin: 0 auto;
        }

        .location-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .location-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }

        .location-btn:hover {
          border-color: var(--alpine-blue);
          background: #f8fafc;
        }

        .location-btn.active {
          border-color: var(--alpine-blue);
          background: var(--alpine-blue);
          color: white;
        }

        .elevation {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .current-weather {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
        }

        .current-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
        }

        .current-header h3 {
          margin: 0;
          font-size: 1.5rem;
        }

        .weather-icon {
          width: 48px;
          height: 48px;
        }

        .weather-icon.sunny { color: #fbbf24; }
        .weather-icon.cloudy { color: #9ca3af; }
        .weather-icon.rainy { color: #3b82f6; }
        .weather-icon.snowy { color: #e5e7eb; }
        .weather-icon.windy { color: #6b7280; }

        .temperature-display {
          text-align: center;
          margin: 2rem 0;
        }

        .temp-main {
          display: block;
          font-size: 4rem;
          font-weight: 700;
          line-height: 1;
        }

        .temp-feels {
          font-size: 1rem;
          opacity: 0.8;
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .risk-assessment h3 {
          margin: 0 0 1rem 0;
        }

        .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .risk-item {
          text-align: center;
        }

        .risk-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .risk-level {
          padding: 0.5rem;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
        }

        .forecast-scroll {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding: 1rem 0;
        }

        .forecast-hour {
          flex-shrink: 0;
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          background: #f8fafc;
          min-width: 80px;
        }

        .forecast-time {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .forecast-temp {
          font-weight: 600;
          margin: 0.5rem 0;
        }

        .forecast-precip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--alpine-blue);
        }

        .update-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          color: var(--alpine-safe);
          border-radius: 8px;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .location-selector {
            justify-content: center;
          }

          .location-btn {
            flex: 1;
            min-width: 120px;
          }

          .temp-main {
            font-size: 3rem;
          }

          .weather-details {
            grid-template-columns: 1fr;
          }

          .risk-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherDashboard;