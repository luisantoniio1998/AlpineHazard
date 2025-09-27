import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WeatherDashboard from './components/WeatherDashboard';
import RouteTracker from './components/RouteTracker';
import AIAssistant from './components/AIAssistant';
import EmergencyAlerts from './components/EmergencyAlerts';
import EmergencyPanel from './components/EmergencyPanel';
import RiskAssessment from './components/RiskAssessment';
import { Mountain, CloudRain, MapPin, Shield, Menu, Target } from 'lucide-react';
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
                <div className="logo-text">
                  <h1>Alpine Trail Guardian</h1>
                  <span className="powered-by">Powered by Swiss Re AI</span>
                </div>
              </div>

              {/* Swiss Re Partnership */}
              <div className="partnership-badge">
                <img src="/src/img/swiss-re-logo.svg" alt="Swiss Re" className="partner-logo" />
                <span className="partnership-text">Official Hackathon Partner</span>
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
              <Link to="/risk" className="nav-link">
                <Target size={20} />
                Risk Assessment
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
              <Route path="/risk" element={<RiskAssessment />} />
              <Route path="/route" element={<RouteTracker />} />
              <Route path="/ai" element={<AIAssistant />} />
            </Routes>
          </div>
        </main>

        {/* Emergency Panel - Floating Button */}
        <EmergencyPanel />

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Alpine Trail Guardian</h3>
                <p>AI-powered safety for Swiss Alpine adventures</p>
              </div>
              <div className="footer-section swiss-re-section">
                <div className="swiss-re-branding">
                  <img src="/src/img/swiss-re-logo.svg" alt="Swiss Re" className="footer-logo" />
                  <div className="branding-text">
                    <h4>Swiss Re AI Week Hackathon 2024</h4>
                    <p><strong>AI for Resilience against Extreme Weather Events</strong></p>
                    <p>Challenge Focus: Avalanche × People & Health</p>
                    <p className="swiss-re-motto">"We make the world more resilient"</p>
                  </div>
                </div>
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