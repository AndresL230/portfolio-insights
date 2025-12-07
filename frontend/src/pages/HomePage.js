import React from 'react';
import './HomePage.css';
import {
  PortfolioLineChart,
  SectorPieChart,
  HoldingsBarChart
} from '../components/Charts';

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

export default HomePage;
