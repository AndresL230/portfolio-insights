import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import ErrorBanner from './components/ErrorBanner';
import HomePage from './pages/HomePage';
import HoldingsPage from './pages/HoldingsPage';
import InsightsPage from './pages/InsightsPage';
import api from './services/api';

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
      refreshPricesQuietly();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      const portfolioData = await api.getPortfolio();
      setHoldings(portfolioData.holdings || []);

      const metricsData = await api.getPortfolioMetrics();

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
      const data = await api.getSectorBreakdown();
      setSectorData(data);
    } catch (err) {
      console.error('Error loading sector data:', err);
    }
  };

  const loadPortfolioHistory = async () => {
    try {
      const data = await api.getPortfolioHistory(30);
      setPortfolioHistory(data);
    } catch (err) {
      console.error('Error loading portfolio history:', err);
    }
  };

  const refreshPricesQuietly = async () => {
    try {
      const data = await api.refreshPrices();
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
      await api.addHolding(stockData);
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
        await api.deleteHolding(holdingId);
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
      const data = await api.refreshPrices();
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

      <ErrorBanner error={error} onClose={() => setError('')} />

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
