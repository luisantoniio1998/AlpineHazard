import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, Thermometer, AlertTriangle, Users, MapPin } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Alerts from './pages/Alerts';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already registered
    const savedUser = localStorage.getItem('heatShieldUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo">
              <Shield className="logo-icon" />
              <div className="logo-text">
                <h1>Swiss Heat Shield AI</h1>
                <p>AI for Resilience against Extreme Weather</p>
              </div>
            </div>
            <nav className="nav-menu">
              <Link to="/" className="nav-link">
                <Thermometer size={20} />
                Dashboard
              </Link>
              <Link to="/alerts" className="nav-link">
                <AlertTriangle size={20} />
                Alerts
              </Link>
              <Link to="/profile" className="nav-link">
                <Users size={20} />
                Profile
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/alerts" element={<Alerts user={user} />} />
            <Route path="/profile" element={<UserProfile user={user} setUser={setUser} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Swiss Re Hackathon 2025</h4>
              <p>AI for Resilience against Extreme Weather Events</p>
            </div>
            <div className="footer-section">
              <h4>Data Sources</h4>
              <p>MeteoSwiss • Swiss Federal Statistical Office • OpenStreetMap</p>
            </div>
            <div className="footer-section">
              <h4>Emergency</h4>
              <p>Medical: 144 • Police: 117 • Fire: 118</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;