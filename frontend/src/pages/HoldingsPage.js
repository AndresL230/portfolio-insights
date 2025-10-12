import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { calculateHoldingMetrics } from '../utils/calculations';
import { getCompanyName, getNotes } from '../utils/constants';

const HoldingsPage = ({ holdings, onAddStock, onDeleteHolding, isLoading }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    ticker: '',
    shares: '',
    purchase_date: ''
  });

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

export default HoldingsPage;
