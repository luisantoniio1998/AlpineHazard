/**
 * Swiss Heat Shield AI - API Service
 * Handles communication with backend API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class HeatShieldAPI {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Weather endpoints
  async getWeather(location) {
    return this.get(`/weather/${location}`);
  }

  // Risk assessment endpoints
  async getRisk(location) {
    return this.get(`/risk/${location}`);
  }

  // Alert endpoints
  async getAlerts(location) {
    return this.get(`/alerts/${location}`);
  }

  // User management endpoints
  async createUser(userData) {
    return this.post('/users', userData);
  }

  async getUser(userId) {
    return this.get(`/users/${userId}`);
  }

  // Recommendations endpoint
  async getRecommendations(userId, location) {
    return this.get(`/recommendations/${userId}/${location}`);
  }

  // Parametric insurance endpoints
  async createParametricTrigger(triggerData) {
    return this.post('/parametric/trigger', triggerData);
  }

  async checkParametricTrigger(triggerId) {
    return this.get(`/parametric/check/${triggerId}`);
  }
}

export const heatShieldAPI = new HeatShieldAPI();