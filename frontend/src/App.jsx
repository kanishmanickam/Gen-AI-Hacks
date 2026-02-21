import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ComparisonTable from './components/ComparisonTable';
import Recommendation from './components/Recommendation';
import './styles/App.css';

function App() {
  const [extractedData, setExtractedData] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDataExtracted = (data) => {
    setExtractedData(data);
    setComparison(null);
    setRecommendation(null);
  };

  const handleComparisonComplete = (comparisonData, recommendationData) => {
    setComparison(comparisonData);
    setRecommendation(recommendationData);
  };

  const handleReset = () => {
    setExtractedData([]);
    setComparison(null);
    setRecommendation(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Smart Quotation Intelligence System</h1>
        <p>AI-Powered Vendor Comparison & Recommendation</p>
      </header>

      <main className="app-main">
        <FileUpload 
          onDataExtracted={handleDataExtracted}
          onLoading={setLoading}
          onReset={handleReset}
        />

        {extractedData.length > 0 && (
          <>
            <ComparisonTable 
              data={extractedData}
              comparison={comparison}
              onCompare={handleComparisonComplete}
              loading={loading}
            />

            {recommendation && (
              <Recommendation recommendation={recommendation} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for Gen AI Hackathon 2026 | Powered by OpenAI</p>
      </footer>
    </div>
  );
}

export default App;
