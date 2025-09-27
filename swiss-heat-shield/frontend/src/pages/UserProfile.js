import React, { useState, useEffect } from 'react';
import { User, Save, Shield } from 'lucide-react';
import { heatShieldAPI } from '../services/api';

const UserProfile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    age: '',
    location: 'zurich',
    vulnerability_level: 'medium',
    health_conditions: [],
    occupation: '',
    preferred_notifications: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const swissCities = [
    { value: 'zurich', label: 'Zürich' },
    { value: 'basel', label: 'Basel' },
    { value: 'geneva', label: 'Geneva' },
    { value: 'bern', label: 'Bern' },
    { value: 'lausanne', label: 'Lausanne' },
    { value: 'lucerne', label: 'Lucerne' }
  ];

  const healthConditions = [
    'cardiovascular',
    'respiratory',
    'diabetes',
    'kidney_disease',
    'pregnant',
    'elderly_65plus',
    'none'
  ];

  const notificationTypes = [
    'email',
    'sms',
    'push',
    'phone'
  ];

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e, array, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Generate user ID if new user
      if (!formData.user_id) {
        formData.user_id = `user_${Date.now()}`;
      }

      // Convert age to number
      const userData = {
        ...formData,
        age: parseInt(formData.age)
      };

      await heatShieldAPI.createUser(userData);

      // Save to localStorage and update state
      localStorage.setItem('heatShieldUser', JSON.stringify(userData));
      setUser(userData);

      setMessage('Profile saved successfully! You will now receive personalized recommendations.');
    } catch (error) {
      setMessage(`Error saving profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-form">
        <div className="card-header">
          <User className="card-icon" style={{ color: '#3498db' }} />
          <h3>User Profile</h3>
        </div>

        <p style={{ marginBottom: '2rem', color: '#7f8c8d' }}>
          Create your profile to receive personalized heatwave recommendations and risk assessments.
        </p>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
              min="1"
              max="120"
              placeholder="Enter your age"
            />
          </div>

          <div className="form-group">
            <label>Primary Location</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              {swissCities.map(city => (
                <option key={city.value} value={city.value}>
                  {city.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Vulnerability Level</label>
            <select
              name="vulnerability_level"
              value={formData.vulnerability_level}
              onChange={handleInputChange}
              required
            >
              <option value="low">Low - Generally healthy adult</option>
              <option value="medium">Medium - Some health considerations</option>
              <option value="high">High - Multiple risk factors or elderly</option>
            </select>
          </div>

          <div className="form-group">
            <label>Health Conditions (select all that apply)</label>
            <div className="checkbox-group">
              {healthConditions.map(condition => (
                <div key={condition} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={condition}
                    value={condition}
                    checked={formData.health_conditions.includes(condition)}
                    onChange={(e) => handleCheckboxChange(e, healthConditions, 'health_conditions')}
                  />
                  <label htmlFor={condition}>
                    {condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Occupation</label>
            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              required
            >
              <option value="">Select occupation</option>
              <option value="office">Office worker</option>
              <option value="construction">Construction worker</option>
              <option value="agriculture">Agriculture/farming</option>
              <option value="outdoor">Outdoor worker</option>
              <option value="healthcare">Healthcare worker</option>
              <option value="education">Education</option>
              <option value="retail">Retail</option>
              <option value="retired">Retired</option>
              <option value="student">Student</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Preferred Notification Methods</label>
            <div className="checkbox-group">
              {notificationTypes.map(type => (
                <div key={type} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={type}
                    value={type}
                    checked={formData.preferred_notifications.includes(type)}
                    onChange={(e) => handleCheckboxChange(e, notificationTypes, 'preferred_notifications')}
                  />
                  <label htmlFor={type}>
                    {type.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save size={20} style={{ marginRight: '0.5rem' }} />
                Save Profile
              </>
            )}
          </button>
        </form>

        {user && (
          <div className="profile-summary" style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'rgba(52, 152, 219, 0.1)',
            borderRadius: '8px'
          }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} />
              Profile Active
            </h4>
            <p>
              You are registered as <strong>{user.name}</strong> from{' '}
              <strong>{swissCities.find(c => c.value === user.location)?.label}</strong>.
              You will receive personalized recommendations based on your profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;