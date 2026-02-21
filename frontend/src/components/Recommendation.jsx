/**
 * Recommendation Component
 * Displays AI-generated vendor recommendation with intelligent reasoning
 */

import React from 'react';
import './Recommendation.css';

const Recommendation = ({ recommendation }) => {
  if (!recommendation) {
    return null;
  }

  // Handle error / info-only cases
  if (recommendation.error || recommendation.message) {
    return (
      <div className="recommendation-container">
        <h2>🤖 AI Recommendation</h2>
        <div className="info-message">
          {recommendation.error || recommendation.message}
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-container">
      <div className="rec-header-bar">
        <h2>🤖 AI Recommendation</h2>
        <span className="rec-tag">Intelligent Analysis</span>
      </div>
      
      <div className="recommendation-card">
        {/* Recommended vendor banner */}
        <div className="recommended-vendor">
          <div className="trophy-icon">🏆</div>
          <div className="vendor-info">
            <div className="label">Recommended Vendor</div>
            <div className="vendor-name">{recommendation.recommendedVendor}</div>
          </div>
          <div className="verdict-badge">✅ Best Choice</div>
        </div>

        {/* Why this vendor - the key reasoning */}
        <div className="reason-section">
          <h3>💡 Why This Vendor?</h3>
          <p className="reason-text">{recommendation.reason}</p>
        </div>

        {/* Decision logic (new field) */}
        {recommendation.reasoning && (
          <div className="reasoning-section">
            <h3>🧠 Decision Logic</h3>
            <p className="reasoning-text">{recommendation.reasoning}</p>
          </div>
        )}

        {/* Key factors */}
        {recommendation.keyFactors && recommendation.keyFactors.length > 0 && (
          <div className="factors-section">
            <h3>🔑 Key Decision Factors</h3>
            <ul className="factors-list">
              {recommendation.keyFactors.map((factor, index) => (
                <li key={index}>
                  <span className="factor-icon">✓</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Savings info */}
        {recommendation.savingsInfo && recommendation.savingsInfo !== 'N/A' && (
          <div className="savings-section">
            <div className="savings-icon">💵</div>
            <div className="savings-text">{recommendation.savingsInfo}</div>
          </div>
        )}

        {/* Market analysis grid (new field) */}
        {recommendation.analysis && (
          <div className="market-analysis-section">
            <h3>📊 Market Analysis</h3>
            <div className="market-grid">
              {recommendation.analysis.cheapestVendor && (
                <div className="market-card">
                  <div className="market-label">Cheapest Vendor</div>
                  <div className="market-value">{recommendation.analysis.cheapestVendor}</div>
                  <div className="market-sub">
                    {recommendation.analysis.cheapestPrice != null
                      ? `${Number(recommendation.analysis.cheapestPrice).toLocaleString()}`
                      : ''}
                  </div>
                </div>
              )}
              {recommendation.analysis.fastestVendor && (
                <div className="market-card">
                  <div className="market-label">Fastest Delivery</div>
                  <div className="market-value">{recommendation.analysis.fastestVendor}</div>
                  <div className="market-sub">{recommendation.analysis.fastestDelivery} days</div>
                </div>
              )}
              {recommendation.analysis.averagePrice && (
                <div className="market-card">
                  <div className="market-label">Market Avg. Price</div>
                  <div className="market-value">
                    {Number(recommendation.analysis.averagePrice).toLocaleString()}
                  </div>
                </div>
              )}
              {recommendation.analysis.averageDelivery && (
                <div className="market-card">
                  <div className="market-label">Market Avg. Delivery</div>
                  <div className="market-value">{recommendation.analysis.averageDelivery} days</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>Note:</strong> This recommendation is AI-generated based on extracted data. 
        Verify all figures before making final procurement decisions.
      </div>
    </div>
  );
};

export default Recommendation;
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendation.savingsInfo && (
          <div className="savings-section">
            <div className="savings-icon">💡</div>
            <div className="savings-text">{recommendation.savingsInfo}</div>
          </div>
        )}
      </div>

      <div className="disclaimer">
        <strong>Note:</strong> This recommendation is generated by AI based on the extracted data. 
        Please verify all information before making final procurement decisions.
      </div>
    </div>
  );
};

export default Recommendation;
