import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WeatherDashboard from './components/WeatherDashboard';
import RouteTracker from './components/RouteTracker';
import AIAssistant from './components/AIAssistant';
import EmergencyAlerts from './components/EmergencyAlerts';
import { Mountain, CloudRain, MapPin, Shield, Menu } from 'lucide-react';
import './App.css';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Test API connection
    const testConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('demo');
        }
      } catch (error) {
        console.log('API not available, running in demo mode');
        setConnectionStatus('demo');
      }
    };

    testConnection();
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Header */}
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <Mountain className="logo-icon" />
                <h1>Alpine Trail Guardian</h1>
              </div>

              {/* Connection Status */}
              <div className={`status-indicator ${connectionStatus}`}>
                <div className="status-dot"></div>
                {connectionStatus === 'connected' ? 'Live Data' : 'Demo Mode'}
              </div>

              {/* Mobile menu button */}
              <button
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu />
              </button>
            </div>

            {/* Navigation */}
            <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
              <Link to="/" className="nav-link">
                <CloudRain size={20} />
                Weather
              </Link>
              <Link to="/route" className="nav-link">
                <MapPin size={20} />
                Route Tracker
              </Link>
              <Link to="/ai" className="nav-link">
                <Shield size={20} />
                AI Assistant
              </Link>
            </nav>
          </div>
        </header>

        {/* Emergency Alerts Banner */}
        <EmergencyAlerts />

        {/* Main Content */}
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route path="/" element={<WeatherDashboard />} />
              <Route path="/route" element={<RouteTracker />} />
              <Route path="/ai" element={<AIAssistant />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Alpine Trail Guardian</h3>
                <p>AI-powered safety for Swiss Alpine adventures</p>
              </div>
              <div className="footer-section">
                <h4>Swiss Re Hackathon 2025</h4>
                <p>Building resilience against extreme weather events</p>
              </div>
              <div className="footer-section">
                <h4>Emergency</h4>
                <p>Swiss Alpine Rescue: <strong>1414</strong></p>
                <p>European Emergency: <strong>112</strong></p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;