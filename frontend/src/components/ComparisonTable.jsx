/**
 * ComparisonTable Component
 * Displays extracted vendor data in a comparison table
 */

import React, { useState } from 'react';
import axios from 'axios';
import './ComparisonTable.css';

const ComparisonTable = ({ data, comparison, onCompare, loading }) => {
  const [comparing, setComparing] = useState(false);

  const handleCompare = async () => {
    setComparing(true);
    
    try {
      const response = await axios.post(
        'http://localhost:5000/api/compare',
        { quotations: data },
        { timeout: 30000 }
      );

      console.log('Comparison response:', response.data);
      onCompare(response.data.comparison, response.data.recommendation);

    } catch (err) {
      console.error('Comparison error:', err);
      alert('Failed to generate comparison: ' + (err.response?.data?.error || err.message));
    } finally {
      setComparing(false);
    }
  };

  const validData = data.filter(item => item.success !== false && item.vendor);

  if (validData.length === 0) {
    return (
      <div className="comparison-container">
        <div className="error-message">
          No valid quotation data to display. Please check the uploaded PDFs.
        </div>
      </div>
    );
  }

  const getHighlight = (item, field) => {
    if (!comparison) return '';
    
    if (field === 'price' && comparison.lowestPrice) {
      return item.vendor === comparison.lowestPrice.vendor ? 'highlight-best' : '';
    }
    
    if (field === 'delivery' && comparison.fastestDelivery) {
      return item.vendor === comparison.fastestDelivery.vendor ? 'highlight-best' : '';
    }
    
    return '';
  };

  return (
    <div className="comparison-container">
      <div className="comparison-header">
        <h2>📊 Vendor Comparison</h2>
        <button
          onClick={handleCompare}
          disabled={comparing || loading}
          className="btn btn-compare"
        >
          {comparing ? (
            <>
              <span className="spinner-small"></span>
              Analyzing...
            </>
          ) : (
            '🤖 Get AI Recommendation'
          )}
        </button>
      </div>

      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Total Price</th>
              <th>Delivery Time</th>
              <th>Tax/GST</th>
              <th>Description</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {validData.map((item, index) => (
              <tr key={index}>
                <td className="vendor-name">
                  <strong>{item.vendor || 'N/A'}</strong>
                </td>
                <td className={`price-cell ${getHighlight(item, 'price')}`}>
                  {item.price > 0 ? (
                    <>
                      <span className="currency">{item.currency || '$'}</span>
                      <span className="amount">{item.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                  {getHighlight(item, 'price') && (
                    <span className="badge">Lowest</span>
                  )}
                </td>
                <td className={`delivery-cell ${getHighlight(item, 'delivery')}`}>
                  {item.delivery_days > 0 ? (
                    <>
                      {item.delivery_days} days
                    </>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                  {getHighlight(item, 'delivery') && (
                    <span className="badge">Fastest</span>
                  )}
                </td>
                <td>{item.tax || 'N/A'}</td>
                <td className="description-cell">
                  {item.description || 'No description'}
                </td>
                <td className="file-cell">
                  <span className="file-badge">{item.fileName}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comparison && (
        <div className="comparison-summary">
          <h3>📈 Quick Summary</h3>
          <div className="summary-cards">
            {comparison.lowestPrice && (
              <div className="summary-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <div className="card-label">Best Price</div>
                  <div className="card-value">{comparison.lowestPrice.vendor}</div>
                  <div className="card-detail">
                    {comparison.lowestPrice.currency || '$'}
                    {comparison.lowestPrice.price.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {comparison.fastestDelivery && (
              <div className="summary-card">
                <div className="card-icon">⚡</div>
                <div className="card-content">
                  <div className="card-label">Fastest Delivery</div>
                  <div className="card-value">{comparison.fastestDelivery.vendor}</div>
                  <div className="card-detail">
                    {comparison.fastestDelivery.delivery_days} days
                  </div>
                </div>
              </div>
            )}

            <div className="summary-card">
              <div className="card-icon">📦</div>
              <div className="card-content">
                <div className="card-label">Total Vendors</div>
                <div className="card-value">{comparison.totalQuotations}</div>
                <div className="card-detail">Compared</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
