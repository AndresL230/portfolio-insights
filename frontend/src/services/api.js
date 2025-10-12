/**
 * API Service
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Portfolio endpoints
  async getPortfolio() {
    return this.get('/portfolio');
  }

  async getHoldings() {
    return this.get('/holdings');
  }

  async addHolding(data) {
    return this.post('/holdings', data);
  }

  async deleteHolding(id) {
    return this.delete(`/holdings/${id}`);
  }

  async refreshPrices() {
    return this.post('/refresh-prices', {});
  }

  async getPortfolioMetrics() {
    return this.get('/portfolio-metrics');
  }

  async getPortfolioHistory(days = 30) {
    return this.get(`/portfolio-history?days=${days}`);
  }

  async getSectorBreakdown() {
    return this.get('/sector-breakdown');
  }

  async getAIInsights() {
    return this.post('/ai-insights', {});
  }
}

export default new ApiService();
