import React, { useState } from 'react';
import { SectorPieChart, PerformanceBarChart } from '../components/Charts';
import { calculateAverageHoldingTime, calculateTotalReturn } from '../utils/calculations';
import api from '../services/api';

const InsightsPage = ({ holdings, sectorData }) => {
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  const fetchAIInsights = async () => {
    try {
      setLoadingInsights(true);
      setInsightsError('');
      const data = await api.getAIInsights();
      setAiInsights(data.insights);
    } catch (error) {
      setInsightsError(error.message);
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Your Portfolio Advisor</h1>
        <p>Get personalized insights and suggestions to improve your portfolio.</p>
        <button
          className="advisor-btn"
          onClick={fetchAIInsights}
          disabled={loadingInsights}
        >
          {loadingInsights ? 'Analyzing Portfolio...' : 'Ask the Advisor'}
        </button>
      </div>

      {/* AI Insights Display */}
      {aiInsights && (
        <div className="ai-suggestions">
          <h2>AI-Powered Portfolio Analysis</h2>
          <div className="ai-insights-content">
            <pre style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-primary)',
              lineHeight: '1.6',
              color: 'var(--color-text-secondary)',
              background: 'rgba(20, 20, 30, 0.5)',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {aiInsights}
            </pre>
          </div>
        </div>
      )}

      {insightsError && (
        <div className="error-banner" style={{ marginBottom: '2rem' }}>
          <span>Warning: {insightsError}</span>
          <button onClick={() => setInsightsError('')} className="error-close">×</button>
        </div>
      )}

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
            <div className="insight-value">{calculateTotalReturn(holdings)}%</div>
            <div className={`insight-change ${calculateTotalReturn(holdings) >= 0 ? 'positive' : 'negative'}`}>
              {calculateTotalReturn(holdings) >= 0 ? '+' : ''}{calculateTotalReturn(holdings)}%
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-label">Average Holding Time</div>
            <div className="insight-value">{calculateAverageHoldingTime(holdings)}</div>
          </div>
        </div>
      </div>

      {/* Diversification Visuals */}
      <div className="diversification-section">
        <h2>Diversification Visuals</h2>
        <div className="charts-row">
          <SectorPieChart data={sectorData} />
          <PerformanceBarChart data={holdings} />
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
};

export default InsightsPage;
