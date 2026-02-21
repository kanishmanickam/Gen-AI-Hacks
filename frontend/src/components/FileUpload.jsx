/**
 * FileUpload Component
 * Handles multiple file types: PDF, Excel, CSV, Word, Text, JSON
 * Supports drag-and-drop and file selection
 */

import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = ({ onDataExtracted, onLoading, onReset }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('analyze'); // 'analyze' or 'extract'
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-excel': '.xls',
    'text/csv': '.csv',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/json': '.json'
  };

  const isAllowedFile = (file) => {
    return ALLOWED_TYPES[file.type] || 
           ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.doc', '.txt', '.json'].some(ext => 
             file.name.toLowerCase().endsWith(ext)
           );
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(isAllowedFile);
    
    if (validFiles.length !== files.length) {
      setError(`Some files were rejected. Only PDF, Excel, CSV, Word, Text, and JSON files are allowed`);
    } else {
      setError(null);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(isAllowedFile);
    
    if (validFiles.length !== files.length) {
      setError(`Some files were rejected. Only PDF, Excel, CSV, Word, Text, and JSON files are allowed`);
    } else {
      setError(null);
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUploadAndAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);
    onLoading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      console.log(`${uploadMode === 'analyze' ? 'Analyzing' : 'Extracting'} data from files...`);
      
      const endpoint = uploadMode === 'analyze' 
        ? 'http://localhost:5000/api/upload/analyze'
        : 'http://localhost:5000/api/upload';

      const response = await axios.post(
        endpoint,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 120 second timeout for larger files
        }
      );

      console.log('Response:', response.data);

      if (response.data.results) {
        // Transform the results to ensure proper format
        const transformedResults = response.data.results.map(result => {
          // If analyze mode, the extracted data is in analysis object
          if (result.analysis && typeof result.analysis === 'object') {
            return {
              ...result.analysis,
              fileName: result.fileName,
              success: result.success
            };
          }
          // If extract mode or already in correct format
          return result;
        }).filter(r => r.success !== false); // Filter out failed extractions
        
        console.log('Transformed results:', transformedResults);
        onDataExtracted(transformedResults);
      }

    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onReset();
  };

  return (
    <div className="file-upload-container">
      <h2>📤 Upload & Analyze Files</h2>
      <p className="upload-subtitle">Supports PDF, Excel, CSV, Word, Text, and JSON</p>
      
      <div 
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.xlsx,.xls,.csv,.docx,.doc,.txt,.json"
          multiple
          onChange={handleFileSelect}
          id="file-input"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <span className="upload-icon">📁</span>
          <span>Click to select files or drag and drop</span>
          <span className="upload-hint">PDF, Excel, CSV, Word, Text, JSON</span>
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({selectedFiles.length})</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-type-icon">
                  {file.name.endsWith('.pdf') ? '📄' : 
                   file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? '📊' :
                   file.name.endsWith('.csv') ? '📋' :
                   file.name.endsWith('.docx') || file.name.endsWith('.doc') ? '📝' :
                   file.name.endsWith('.json') ? '{  }' : '📁'}
                </span>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="remove-btn"
                  disabled={uploading}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="upload-mode-selector">
        <label>
          <input
            type="radio"
            name="mode"
            value="analyze"
            checked={uploadMode === 'analyze'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={uploading}
          />
          🤖 Analyze with AI
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="extract"
            checked={uploadMode === 'extract'}
            onChange={(e) => setUploadMode(e.target.value)}
            disabled={uploading}
          />
          📊 Extract Data
        </label>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="button-group">
        <button
          onClick={handleUploadAndAnalyze}
          disabled={selectedFiles.length === 0 || uploading}
          className="btn btn-primary"
        >
          {uploading ? (
            <>
              <span className="spinner-small"></span>
              Processing...
            </>
          ) : (
            <>
              {uploadMode === 'analyze' ? '🤖 Analyze with AI' : '📊 Extract Data'}
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={uploading}
          className="btn btn-secondary"
        >
          Reset
        </button>
      </div>

      <div className="info-box">
        <strong>ℹ️ Instructions:</strong>
        <ul>
          <li>Select multiple vendor quotation PDF files</li>
          <li>Click "Upload & Extract Data" to process with AI</li>
          <li>Wait for AI to extract key information</li>
          <li>Compare and get recommendations</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;
