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
      // Support both enhanced response {comparison, recommendation} and legacy flat response
      const comparisonData = response.data.comparison || response.data;
      const recommendationData = response.data.recommendation;
      // Attach recommendation to comparison so it's available in this component too
      if (comparisonData && recommendationData) {
        comparisonData.recommendation = recommendationData;
      }
      onCompare(comparisonData, recommendationData);

    } catch (err) {
      console.error('Comparison error:', err);
      alert('Failed to generate comparison: ' + (err.response?.data?.error || err.message));
    } finally {
      setComparing(false);
    }
  };

  // Filter valid data - needs a vendor field
  const validData = data.filter(item => item.success !== false && item.vendor);

  if (validData.length === 0) {
    return (
      <div className="comparison-container">
        <div className="error-message">
          ⚠️ No valid quotation data found.
          <br/><br/>
          <small>
            Received {data.length} file(s) — but no <strong>vendor name</strong> was extracted.
            <br/>Try re-uploading with <strong>"Extract Data"</strong> mode, or check that your PDFs contain readable text.
          </small>
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
        <p className="subtitle">Detailed analysis of extracted quotation fields</p>
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

      <div className="extracted-fields-info">
        <div className="info-box">
          <h4>📋 Extracted Fields from PDFs</h4>
          <div className="fields-grid">
            <div className="field-item">
              <span className="field-label">Vendor:</span>
              <span className="field-type">Company name from quotation</span>
            </div>
            <div className="field-item">
              <span className="field-label">Price:</span>
              <span className="field-type">Total quotation amount (numeric)</span>
            </div>
            <div className="field-item">
              <span className="field-label">Delivery:</span>
              <span className="field-type">Days to deliver (numeric)</span>
            </div>
            <div className="field-item">
              <span className="field-label">Tax/GST:</span>
              <span className="field-type">Tax percentage or amount</span>
            </div>
          </div>
        </div>
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
          <h3>📈 Comparison Analysis</h3>
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

      {comparison?.recommendation && (
        <div className="ai-recommendation">
          <div className="recommendation-header">
            <h3>🤖 AI Recommendation</h3>
            <span className="badge-success">Intelligent Analysis</span>
          </div>

          <div className="recommendation-card">
            <div className="rec-vendor-badge">
              <span className="rec-vendor">{comparison.recommendation.recommendedVendor}</span>
              <span className="rec-icon">✅ Recommended</span>
            </div>

            <div className="rec-reason">
              <h4>Why This Vendor?</h4>
              <p className="rec-text">{comparison.recommendation.reason}</p>
            </div>

            {comparison.recommendation.reasoning && (
              <div className="rec-reasoning">
                <h4>Analysis Logic</h4>
                <p className="rec-logic">{comparison.recommendation.reasoning}</p>
              </div>
            )}

            <div className="rec-factors">
              <h4>Key Factors</h4>
              <ul>
                {comparison.recommendation.keyFactors && comparison.recommendation.keyFactors.map((factor, idx) => (
                  <li key={idx}>
                    <span className="factor-icon">✓</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {comparison.recommendation.savingsInfo && (
              <div className="rec-savings">
                <span className="savings-icon">💵</span>
                <span className="savings-text">{comparison.recommendation.savingsInfo}</span>
              </div>
            )}

            {comparison.recommendation.analysis && (
              <div className="rec-analysis">
                <h4>Market Analysis</h4>
                <div className="analysis-grid">
                  {comparison.recommendation.analysis.averagePrice && (
                    <div className="analysis-item">
                      <span className="analysis-label">Average Price</span>
                      <span className="analysis-value">${parseFloat(comparison.recommendation.analysis.averagePrice).toLocaleString()}</span>
                    </div>
                  )}
                  {comparison.recommendation.analysis.averageDelivery && (
                    <div className="analysis-item">
                      <span className="analysis-label">Average Delivery</span>
                      <span className="analysis-value">{comparison.recommendation.analysis.averageDelivery} days</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
