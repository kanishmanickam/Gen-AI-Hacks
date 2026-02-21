/**
 * ComparisonTable Component - Enhanced UI
 * Displays vendor comparison with detailed metrics and value analysis
 */

import React, { useState } from 'react';
import axios from 'axios';
import './ComparisonTable.css';

const ComparisonTable = ({ data, comparison, onCompare, loading }) => {
  const [comparing, setComparing] = useState(false);

  const handleCompare = async () => {
    setComparing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/compare', { quotations: data }, { timeout: 30000 });
      console.log('Comparison response:', response.data);
      const comparisonData = response.data.comparison || response.data;
      const recommendationData = response.data.recommendation;
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

  const validData = data.filter(item => item.success !== false && item.vendor);

  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    const prices = validData.filter(v => v.price > 0).map(v => v.price);
    const deliveries = validData.filter(v => v.delivery_days > 0).map(v => v.delivery_days);
    
    const minPrice = Math.min(...prices) || 0;
    const maxPrice = Math.max(...prices) || 0;
    const minDelivery = Math.min(...deliveries) || 0;
    const maxDelivery = Math.max(...deliveries) || 0;
    
    const vendors = validData.map(v => ({
      ...v,
      costPerDay: v.price && v.delivery_days ? (v.price / v.delivery_days).toFixed(0) : 0,
      priceFromMin: v.price ? ((v.price - minPrice) / (minPrice || 1) * 100).toFixed(1) : 0,
      valueScore: calculateValueScore(v, prices, deliveries)
    })).sort((a, b) => a.valueScore - b.valueScore)
      .map((v, idx) => ({...v, rank: idx + 1}));

    return {
      minPrice, maxPrice,
      avgPrice: prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(0) : 0,
      priceRange: maxPrice - minPrice,
      minDelivery, maxDelivery,
      avgDelivery: deliveries.length ? (deliveries.reduce((a, b) => a + b, 0) / deliveries.length).toFixed(1) : 0,
      vendors
    };
  };

  const calculateValueScore = (vendor, prices, deliveries) => {
    if (!vendor.price || !vendor.delivery_days) return 999;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDel = Math.min(...deliveries);
    const maxDel = Math.max(...deliveries);
    const priceNorm = ((vendor.price - minPrice) / (maxPrice - minPrice || 1)) * 50;
    const delNorm = ((vendor.delivery_days - minDel) / (maxDel - minDel || 1)) * 50;
    return priceNorm + delNorm;
  };

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

  const metrics = calculateMetrics();

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
      {/* Header */}
      <div className="comparison-header">
        <div className="header-content">
          <h2>📊 Vendor Comparison Analysis</h2>
          <p className="subtitle">Comparing {validData.length} vendor quotation(s)</p>
        </div>
        <button onClick={handleCompare} disabled={comparing || loading} className="btn btn-compare">
          {comparing ? (
            <><span className="spinner-small"></span> Analyzing...</>
          ) : (
            '🤖 Get AI Recommendation'
          )}
        </button>
      </div>

      {/* Market Overview Metrics */}
      <div className="metrics-panel">
        <h3>📈 Market Overview</h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-label">Lowest Price</div>
            <div className="metric-value">{metrics.minPrice.toLocaleString()}</div>
            <div className="metric-sub">Range: {metrics.priceRange.toLocaleString()}</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-label">Average Price</div>
            <div className="metric-value">{metrics.avgPrice.toLocaleString()}</div>
            <div className="metric-sub">Market median</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⚡</div>
            <div className="metric-label">Fastest Delivery</div>
            <div className="metric-value">{metrics.minDelivery}</div>
            <div className="metric-sub">{metrics.maxDelivery - metrics.minDelivery} day range</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📅</div>
            <div className="metric-label">Average Delivery</div>
            <div className="metric-value">{metrics.avgDelivery}</div>
            <div className="metric-sub">days</div>
          </div>
        </div>
      </div>

      {/* Extracted Fields Info */}
      <div className="extracted-fields-info">
        <div className="info-box">
          <h4>📋 Extracted Field Details</h4>
          <div className="fields-grid">
            <div className="field-item">
              <span className="field-label">Vendor</span>
              <span className="field-type">Company name</span>
            </div>
            <div className="field-item">
              <span className="field-label">Price</span>
              <span className="field-type">Total quotation amount</span>
            </div>
            <div className="field-item">
              <span className="field-label">Delivery</span>
              <span className="field-type">Days to delivery</span>
            </div>
            <div className="field-item">
              <span className="field-label">Cost/Day</span>
              <span className="field-type">Price efficiency metric</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Vendor Name</th>
              <th>Total Price</th>
              <th>Price Diff</th>
              <th>Cost/Day</th>
              <th>Delivery Time</th>
              <th>Tax/GST</th>
              <th>Value Score</th>
              <th>File Source</th>
            </tr>
          </thead>
          <tbody>
            {metrics.vendors.map((item, index) => (
              <tr key={index} className={`rank-${item.rank} ${item.rank === 1 ? 'best-value' : ''}`}>
                <td className="rank-cell">
                  <span className="rank-badge">#{item.rank}</span>
                </td>
                <td className="vendor-name">
                  <strong>{item.vendor || 'N/A'}</strong>
                  {item.rank === 1 && <span className="best-badge">🏆 Best Value</span>}
                </td>
                <td className={`price-cell ${getHighlight(item, 'price')}`}>
                  {item.price > 0 ? (
                    <>
                      <span className="currency">{item.currency || '$'}</span>
                      <span className="amount">{item.price.toLocaleString()}</span>
                      {getHighlight(item, 'price') && <span className="lowest-badge">💰 Lowest</span>}
                    </>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td className="price-diff">
                  {item.priceFromMin >= 0 ? (
                    <span className={item.priceFromMin == 0 ? 'best' : 'higher'}>
                      {item.priceFromMin == 0 ? 'Base' : `+${item.priceFromMin}%`}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="cost-per-day">
                  {item.costPerDay > 0 ? item.costPerDay : 'N/A'}
                </td>
                <td className={`delivery-cell ${getHighlight(item, 'delivery')}`}>
                  {item.delivery_days > 0 ? (
                    <>
                      <span>{item.delivery_days} days</span>
                      {getHighlight(item, 'delivery') && <span className="fastest-badge">⚡ Fastest</span>}
                    </>
                  ) : (
                    <span className="not-available">N/A</span>
                  )}
                </td>
                <td className="tax-cell">{item.tax || 'N/A'}</td>
                <td className="value-score">
                  <div className="score-bar">
                    <div className="score-fill" style={{width: Math.max(20, 100 - (item.rank * 25)) + '%'}}></div>
                  </div>
                  <span className="score-label">{Math.max(20, 100 - (item.rank * 25))}%</span>
                </td>
                <td className="file-cell">
                  <span className="file-badge">{item.fileName}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison Summary */}
      {comparison && (
        <div className="comparison-summary">
          <h3>🎯 Quick Comparison Summary</h3>
          <div className="summary-cards">
            {comparison.lowestPrice && (
              <div className="summary-card">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <div className="card-label">Lowest Price</div>
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
                <div className="card-detail">Analyzed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendation Card */}
      {comparison?.recommendation && (
        <div className="ai-recommendation">
          <div className="recommendation-header">
            <h3>🤖 AI-Powered Recommendation</h3>
            <span className="badge-success">Intelligent Analysis</span>
          </div>
          <div className="recommendation-card">
            <div className="rec-vendor-badge">
              <span className="rec-vendor">{comparison.recommendation.recommendedVendor}</span>
              <span className="rec-icon">✅ Recommended</span>
            </div>
            <div className="rec-reason">
              <h4>💡 Why This Vendor?</h4>
              <p className="rec-text">{comparison.recommendation.reason}</p>
            </div>
            {comparison.recommendation.reasoning && (
              <div className="rec-reasoning">
                <h4>🧠 Decision Logic</h4>
                <p className="rec-logic">{comparison.recommendation.reasoning}</p>
              </div>
            )}
            {comparison.recommendation.keyFactors && comparison.recommendation.keyFactors.length > 0 && (
              <div className="rec-factors">
                <h4>🔑 Key Factors</h4>
                <ul>
                  {comparison.recommendation.keyFactors.map((factor, idx) => (
                    <li key={idx}><span className="factor-icon">✓</span>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
            {comparison.recommendation.savingsInfo && (
              <div className="rec-savings">
                <span className="savings-icon">💵</span>
                <span className="savings-text">{comparison.recommendation.savingsInfo}</span>
              </div>
            )}
            {comparison.recommendation.analysis && (
              <div className="rec-analysis">
                <h4>📊 Market Context</h4>
                <div className="analysis-grid">
                  {comparison.recommendation.analysis.averagePrice && (
                    <div className="analysis-item">
                      <span className="analysis-label">Average Price</span>
                      <span className="analysis-value">{parseFloat(comparison.recommendation.analysis.averagePrice).toLocaleString()}</span>
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
