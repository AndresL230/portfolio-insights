import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import {
  PortfolioLineChart,
  SectorPieChart,
  HoldingsBarChart,
  PerformanceBarChart,
  StockHistoryChart
} from './components/Charts';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// API service functions
const api = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

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
  },

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
};

// Navigation Component
const Navigation = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'insights', label: 'Insights' },
    { id: 'settings', label: 'Settings' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>Stock Portfolio Insights</h2>
      </div>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// Simple Chart Components (using CSS for basic visualization)
const LineChart = ({ data }) => (
  <div className="chart-container">
    <h4>Portfolio Value Over Time</h4>
    <div className="line-chart">
      <svg viewBox="0 0 400 200" className="chart-svg">
        <path
          d="M 0 150 Q 100 120 150 100 Q 200 80 250 110 Q 300 95 400 85"
          stroke="#666"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 0 150 Q 100 120 150 100 Q 200 80 250 110 Q 300 95 400 85 L 400 200 L 0 200 Z"
          fill="url(#gradient)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ccc" />
            <stop offset="100%" stopColor="#f0f0f0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="chart-label">Months</div>
    </div>
  </div>
);

const PieChart = ({ data }) => (
  <div className="chart-container">
    <h4>Sector Allocation</h4>
    <div className="pie-chart">
      <svg viewBox="0 0 200 200" className="pie-svg">
        <circle cx="100" cy="100" r="80" fill="#e0e0e0" />
        <path d="M 100 20 A 80 80 0 0 1 180 100 L 100 100 Z" fill="#999" />
        <path d="M 180 100 A 80 80 0 0 1 100 180 L 100 100 Z" fill="#666" />
      </svg>
      <div className="chart-label">Sectors</div>
    </div>
  </div>
);

const BarChart = ({ data, title }) => (
  <div className="chart-container">
    <h4>{title}</h4>
    <div className="bar-chart">
      {[65, 45, 35, 55, 40, 70, 50].map((height, index) => (
        <div key={index} className="bar" style={{ height: `${height}%` }}></div>
      ))}
      <div className="chart-label">Tickers</div>
    </div>
  </div>
);

// Home Page Component with interactive charts
const HomePage = ({ metrics, onGetStarted, portfolioHistory, sectorData, holdings }) => (
  <div className="page-content">
    <div className="welcome-section">
      <h1>Welcome to Your Stock Portfolio</h1>
      <p>Analyze your investments and track performance</p>
      <button className="get-started-btn" onClick={onGetStarted}>
        Get Started
      </button>
    </div>

    <div className="portfolio-summary-section">
      <h2>Portfolio Summary</h2>
      <p>Overview of your portfolio performance</p>

      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Total Portfolio Value</div>
          <div className="summary-value">${metrics.total_value?.toLocaleString() || '0'}</div>
          <div className={`summary-change ${metrics.gain_loss_percentage >= 0 ? 'positive' : 'negative'}`}>
            {metrics.gain_loss_percentage >= 0 ? '+' : ''}{metrics.gain_loss_percentage?.toFixed(2) || '0'}%
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Gain/Loss</div>
          <div className="summary-value">${metrics.total_gain_loss?.toLocaleString() || '0'}</div>
          <div className={`summary-change ${metrics.gain_loss_percentage >= 0 ? 'positive' : 'negative'}`}>
            {metrics.gain_loss_percentage >= 0 ? '+' : ''}{metrics.gain_loss_percentage?.toFixed(2) || '0'}%
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Best Performer</div>
          <div className="summary-value">{metrics.best_performer?.ticker || 'N/A'}</div>
          <div className="summary-change positive">{metrics.best_performer?.return_pct ? `+${metrics.best_performer.return_pct}%` : '--'}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Worst Performer</div>
          <div className="summary-value">{metrics.worst_performer?.ticker || 'N/A'}</div>
          <div className="summary-change negative">{metrics.worst_performer?.return_pct ? `${metrics.worst_performer.return_pct}%` : '--'}</div>
        </div>
      </div>
    </div>

    <div className="portfolio-visuals-section">
      <h2>Portfolio Visuals</h2>
      <p>Visual representation of portfolio performance</p>

      <div className="charts-grid">
        <PortfolioLineChart data={portfolioHistory} />
        <SectorPieChart data={sectorData} />
        <HoldingsBarChart data={holdings} />
      </div>
    </div>
  </div>
);

// Holdings Page Component
const HoldingsPage = ({ holdings, onAddStock, onDeleteHolding, onRefreshPrices, isLoading }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    shares: '',
    purchase_date: ''
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const calculateHoldingMetrics = (holding) => {
    const marketValue = holding.shares * holding.current_price;
    const cost = holding.shares * holding.buy_price;
    const gainLoss = marketValue - cost;
    const returnPercentage = (gainLoss / cost) * 100;
    return { marketValue, cost, gainLoss, returnPercentage };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddStock({
        ticker: formData.ticker.trim().toUpperCase(),
        shares: parseFloat(formData.shares),
        purchase_date: formData.purchase_date
      });
      setFormData({ ticker: '', shares: '', purchase_date: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Your Holdings</h1>
        <p>Manage your stock holdings effectively</p>
        <button 
          className="add-holding-btn"
          onClick={() => setShowAddForm(true)}
        >
          Add Holding
        </button>
      </div>

      {/* Performance Overview Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Performance Overview</h3>
        </div>
        
        <div className="table-container">
          <table className="performance-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Shares</th>
                <th>Current Price</th>
                <th>Gain/Loss (%)</th>
                <th>Gain/Loss ($)</th>
                <th>Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const { marketValue, gainLoss, returnPercentage } = calculateHoldingMetrics(holding);
                return (
                  <tr key={holding.id}>
                    <td className="ticker-cell">{holding.ticker}</td>
                    <td>{holding.shares}</td>
                    <td>{formatCurrency(holding.current_price)}</td>
                    <td className={returnPercentage >= 0 ? 'positive' : 'negative'}>
                      {formatPercentage(returnPercentage)}
                    </td>
                    <td className={gainLoss >= 0 ? 'positive' : 'negative'}>
                      {formatCurrency(gainLoss)}
                    </td>
                    <td className="total-value">{formatCurrency(marketValue)}</td>
                    <td>
                      <button
                        onClick={() => onDeleteHolding(holding.id)}
                        className="delete-btn"
                        title="Delete holding"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Position Details Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>Position Details</h3>
        </div>
        
        <div className="table-container">
          <table className="details-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company Name</th>
                <th>Buy Price</th>
                <th>Purchase Date</th>
                <th>Sector</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.id}>
                  <td className="ticker-cell">{holding.ticker}</td>
                  <td>{getCompanyName(holding.ticker)}</td>
                  <td>{formatCurrency(holding.buy_price)}</td>
                  <td>{holding.purchase_date || 'N/A'}</td>
                  <td>{holding.sector}</td>
                  <td className="notes-cell">{getNotes(holding.ticker)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Holding Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="add-holding-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Holding</h2>
            <form onSubmit={handleSubmit} className="add-holding-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Ticker</label>
                  <input
                    type="text"
                    placeholder="Enter Ticker Symbol"
                    value={formData.ticker}
                    onChange={(e) => setFormData({...formData, ticker: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Number of Shares</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Enter Number of Shares (e.g., 10.5)"
                    value={formData.shares}
                    onChange={(e) => setFormData({...formData, shares: e.target.value})}
                    required
                    min="0.001"
                  />
                  <small>Decimal values allowed</small>
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    required
                  />
                  <small>Price will be fetched automatically</small>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Insights Page Component
const InsightsPage = ({ holdings, sectorData }) => (
  <div className="page-content">
    <div className="page-header">
      <h1>Your Portfolio Advisor</h1>
      <p>Get personalized insights and suggestions to improve your portfolio.</p>
      <button className="advisor-btn">Ask the Advisor</button>
    </div>

    {/* AI Suggestion Panel */}
    <div className="ai-suggestions">
      <h2>AI Suggestion Panel</h2>
      <p>Recommendations based on your holdings</p>
      
      <div className="suggestions-grid">
        <div className="suggestion-item">
          <div className="suggestion-content">
            <h4>Over-Concentration in Tech Sector</h4>
            <p>Consider diversifying into other sectors</p>
          </div>
          <div className="recommendation">
            <strong>Recommendation:</strong><br />
            Add stocks in Healthcare, Consumer Goods.
          </div>
        </div>
        
        <div className="suggestion-item">
          <div className="suggestion-content">
            <h4>High Volatility</h4>
            <p>Some stocks showing high risk due to market conditions</p>
          </div>
          <div className="recommendation">
            <strong>Consider balancing with stable assets.</strong>
          </div>
        </div>
      </div>
    </div>

    {/* Performance Insights */}
    <div className="performance-insights">
      <h2>Performance Insights</h2>
      <div className="insights-grid">
        <div className="insight-item">
          <div className="insight-label">Total Return</div>
          <div className="insight-value">15%</div>
          <div className="insight-change">+2%</div>
        </div>
        <div className="insight-item">
          <div className="insight-label">Average Holding Time</div>
          <div className="insight-value">6 months</div>
        </div>
      </div>
    </div>

    {/* Diversification Visuals */}
    <div className="diversification-section">
      <h2>Diversification Visuals</h2>
      <div className="charts-row">
        <PieChart />
        <BarChart title="Stock Weight by Ticker" />
      </div>
    </div>

    {/* Risk Flags */}
    <div className="risk-flags">
      <h2>Risk Flags</h2>
      <p>Key risks currently in your portfolio</p>
      
      <div className="risk-items">
        <div className="risk-item">
          <div className="risk-content">
            <h4>Over-Concentration</h4>
            <p>Too much investment in one specific portfolio</p>
          </div>
        </div>
        
        <div className="risk-item">
          <div className="risk-content">
            <h4>No Dividends</h4>
            <p>Consider adding dividend-paying stocks</p>
          </div>
        </div>
        
        <div className="risk-item">
          <div className="risk-content">
            <h4>Overtrading</h4>
            <p>Excessive buy/trading activity</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Helper functions
const getCompanyName = (ticker) => {
  const companies = {
    'AAPL': 'Apple Inc.',
    'TSLA': 'Tesla Inc.',
    'MSFT': 'Microsoft Corp.',
    'JPM': 'JPMorgan Chase',
    'NVDA': 'NVIDIA Corp.',
    'GOOGL': 'Alphabet Inc.'
  };
  return companies[ticker] || `${ticker} Corp.`;
};

const getNotes = (ticker) => {
  const notes = {
    'AAPL': 'Long-term hold',
    'TSLA': 'High volatility',
    'MSFT': 'Dividend stock',
    'JPM': 'Bank exposure',
    'NVDA': 'AI growth play',
    'GOOGL': 'Tech diversification'
  };
  return notes[ticker] || 'Standard holding';
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [holdings, setHoldings] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [sectorData, setSectorData] = useState([]);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    loadPortfolioData();
    loadSectorData();
    loadPortfolioHistory();
  }, []);

  // Set up real-time price polling (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refresh - don't show loading state
      refreshPricesQuietly();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Updated loadPortfolioData function as requested
  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      // Load basic portfolio data
      const portfolioData = await api.get('/portfolio');
      setHoldings(portfolioData.holdings || []);
      
      // Load detailed metrics (including best/worst performers)
      const metricsData = await api.get('/portfolio-metrics');
      
      // Combine the data
      setMetrics({
        ...portfolioData.metrics,
        ...metricsData
      });
      
      setError('');
    } catch (err) {
      setError('Failed to load portfolio data. Make sure the Flask server is running.');
      console.error('Error loading portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSectorData = async () => {
    try {
      const data = await api.get('/sector-breakdown');
      setSectorData(data);
    } catch (err) {
      console.error('Error loading sector data:', err);
    }
  };

  const loadPortfolioHistory = async () => {
    try {
      const data = await api.get('/portfolio-history?days=30');
      setPortfolioHistory(data);
    } catch (err) {
      console.error('Error loading portfolio history:', err);
    }
  };

  // Silent refresh for real-time polling (doesn't show loading state)
  const refreshPricesQuietly = async () => {
    try {
      const data = await api.post('/refresh-prices', {});
      setHoldings(data.holdings || []);
      setMetrics(prev => ({ ...prev, ...data.metrics }));
      await loadSectorData();
      await loadPortfolioHistory();
    } catch (err) {
      console.error('Background price refresh failed:', err);
    }
  };

  const handleAddStock = async (stockData) => {
    try {
      setIsLoading(true);
      await api.post('/holdings', stockData);
      await loadPortfolioData();
      await loadSectorData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add stock');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHolding = async (holdingId) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
      try {
        setIsLoading(true);
        await api.delete(`/holdings/${holdingId}`);
        await loadPortfolioData();
        await loadSectorData();
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to delete holding');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRefreshPrices = async () => {
    try {
      setIsLoading(true);
      const data = await api.post('/refresh-prices', {});
      setHoldings(data.holdings || []);
      setMetrics(prev => ({ ...prev, ...data.metrics }));
      await loadSectorData();
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to refresh prices');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            metrics={metrics}
            onGetStarted={() => setCurrentPage('portfolio')}
            portfolioHistory={portfolioHistory}
            sectorData={sectorData}
            holdings={holdings}
          />
        );
      case 'portfolio':
        return (
          <HoldingsPage
            holdings={holdings}
            onAddStock={handleAddStock}
            onDeleteHolding={handleDeleteHolding}
            onRefreshPrices={handleRefreshPrices}
            isLoading={isLoading}
          />
        );
      case 'insights':
        return (
          <InsightsPage
            holdings={holdings}
            sectorData={sectorData}
          />
        );
      case 'settings':
        return (
          <div className="page-content">
            <h1>Settings</h1>
            <p>Portfolio settings and preferences</p>
          </div>
        );
      default:
        return (
          <HomePage
            metrics={metrics}
            onGetStarted={() => setCurrentPage('portfolio')}
            portfolioHistory={portfolioHistory}
            sectorData={sectorData}
            holdings={holdings}
          />
        );
    }
  };

  return (
    <div className="app">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      <footer className="app-footer">
        <div className="footer-links">
          <a href='https://linkedin.com/in/andres-lopez23/' target='blank'>Created By Andres Lopez</a>
          <a href='https://github.com/AndresL230' target='blank'>Check out my Github!</a>
        </div>
      </footer>
    </div>
  );
};

export default App;