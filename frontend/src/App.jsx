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
  const [workflowStep, setWorkflowStep] = useState(0); // 0=upload, 1=extract, 2=compare, 3=recommend

  const handleDataExtracted = (data) => {
    setExtractedData(data);
    setComparison(null);
    setRecommendation(null);
    setWorkflowStep(1); // Move to extraction step
  };

  const handleComparisonComplete = (comparisonData, recommendationData) => {
    setComparison(comparisonData);
    setRecommendation(recommendationData);
    setWorkflowStep(3); // Move to recommendation step
  };

  const handleReset = () => {
    setExtractedData([]);
    setComparison(null);
    setRecommendation(null);
    setWorkflowStep(0);
  };

  // Get current workflow step display
  const getWorkflowStatus = () => {
    const steps = [
      { number: 1, title: 'Upload Files', status: workflowStep >= 0 },
      { number: 2, title: 'Extract Data', status: workflowStep >= 1 },
      { number: 3, title: 'Compare Vendors', status: workflowStep >= 2 },
      { number: 4, title: 'AI Recommendation', status: workflowStep >= 3 }
    ];
    return steps;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 Smart Quotation Intelligence System</h1>
        <p>AI-Powered Vendor Comparison & Recommendation</p>
      </header>

      {/* Workflow Status Bar */}
      <div className="workflow-container">
        <div className="workflow-steps">
          {getWorkflowStatus().map((step, idx) => (
            <React.Fragment key={step.number}>
              <div className={`workflow-step ${step.status ? 'active' : ''} ${workflowStep >= step.number ? 'completed' : ''}`}>
                <div className="step-circle">{step.number}</div>
                <div className="step-title">{step.title}</div>
              </div>
              {idx < 3 && <div className={`workflow-arrow ${step.status ? 'active' : ''}`}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

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
