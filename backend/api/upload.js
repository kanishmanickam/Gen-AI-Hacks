const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { extractDataFromFile } = require('../utils/universalDataExtractor');
const { extractQuotationData, analyzeData } = require('../services/aiService');

module.exports = async (req, res) => {
  // Enable CORS
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })(req, res, async () => {
    if (req.method === 'GET' && req.url.endsWith('/formats')) {
      // GET /api/upload/formats
      return res.status(200).json({
        supportedFormats: [
          { extension: '.pdf', name: 'PDF Document', description: 'Text extraction from PDFs' },
          { extension: '.xlsx/.xls', name: 'Excel Spreadsheet', description: 'Extract rows, columns, and sheets' },
          { extension: '.csv', name: 'CSV File', description: 'Comma-separated values with column headers' },
          { extension: '.docx/.doc', name: 'Word Document', description: 'Text extraction from Word files' },
          { extension: '.txt', name: 'Text File', description: 'Plain text files' },
          { extension: '.json', name: 'JSON', description: 'Structured JSON data' }
        ],
        maxFileSize: '50MB',
        maxFilesPerRequest: 20,
        notes: 'All files are automatically analyzed and processed based on their format'
      });
    }

    // Handle file upload
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExts = ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.doc', '.txt', '.json'];
        if (allowedExts.includes(ext)) {
          cb(null, true);
        } else {
          cb(new Error('File type not supported'));
        }
      }
    });

    upload.array('files', 20)(req, res, async () => {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const isAnalyzeMode = req.url.includes('/analyze');
      const results = [];

      for (const file of req.files) {
        try {
          const extracted = await extractDataFromFile(file);
          
          if (isAnalyzeMode) {
            let analysis = null;
            if (extracted.isStructured) {
              analysis = await analyzeData(extracted.data, file.originalname);
            } else {
              analysis = await extractQuotationData(extracted.content);
            }
            results.push({
              ...extracted,
              analysis,
              success: true
            });
          } else {
            results.push({
              ...extracted,
              success: true
            });
          }
        } catch (error) {
          results.push({
            fileName: file.originalname,
            success: false,
            error: error.message
          });
        }
      }

      res.json({
        message: isAnalyzeMode ? 'AI analysis completed' : 'Files processed',
        summary: {
          totalFiles: req.files.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        },
        results
      });
    });
  });
};
