/**
 * Universal Upload Route Handler
 * Handles multiple file types: PDF, Excel, CSV, Word, Text, JSON
 * Automatically detects format and extracts data
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { extractDataFromFile } = require('../utils/universalDataExtractor');
const { extractQuotationData, analyzeData } = require('../services/aiService');

const router = express.Router();

// Configure multer for multiple file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.xlsx', '.xls', '.csv', '.docx', '.doc', '.txt', '.json'];

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for various file types
  }
});

/**
 * POST /api/upload
 * Upload and extract data from any supported file type
 */
router.post('/', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`📤 Received ${req.files.length} file(s)`);

    const results = [];
    
    for (const file of req.files) {
      try {
        console.log(`\n📄 Processing: ${file.originalname}`);
        
        // Extract data using universal extractor
        const extractedData = await extractDataFromFile(file.path, file.originalname);
        
        // For PDF files with text content, use AI to extract quotation fields
        let quotationData = null;
        if (extractedData.fileType === 'PDF' && extractedData.content && !extractedData.isStructured) {
          try {
            console.log(`🤖 Using AI to extract quotation fields from PDF...`);
            quotationData = await extractQuotationData(extractedData.content, file.originalname);
          } catch (aiError) {
            console.warn('AI extraction failed, using raw data:', aiError.message);
          }
        }
        
        // Use AI-extracted data if available, otherwise use raw extracted data
        const finalData = quotationData || extractedData;
        
        results.push({
          fileName: file.originalname,
          fileType: extractedData.fileType,
          filePath: file.path,
          fileSize: file.size,
          ...finalData,
          success: true
        });
        
      } catch (error) {
        console.error(`❌ Error processing ${file.originalname}:`, error.message);
        results.push({
          fileName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    // Summary statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      message: 'Files uploaded and processed',
      summary: {
        totalFiles: results.length,
        successful,
        failed
      },
      results: results
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/analyze
 * Upload files and perform AI analysis/extraction
 */
router.post('/analyze', upload.array('files', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log(`📤 Analyzing ${req.files.length} file(s) with AI`);

    const analysisResults = [];
    
    for (const file of req.files) {
      try {
        console.log(`🤖 AI Analysis: ${file.originalname}`);
        
        // Extract raw data
        const extractedData = await extractDataFromFile(file.path, file.originalname);
        
        // Determine analysis type based on file type and structure
        let analysis = {};
        
        if (extractedData.isStructured && extractedData.data) {
          // For structured data (Excel, CSV, JSON)
          analysis = await analyzeData(extractedData, file.originalname);
        } else {
          // For unstructured data (PDF, Word, Text) — extract quotation fields directly
          const quotationData = await extractQuotationData(
            extractedData.content,
            file.originalname
          );
          // Flatten quotation fields into analysis so frontend can read vendor, price, etc. directly
          analysis = {
            ...quotationData,
            analysisType: 'Quotation Extraction',
            fileType: extractedData.fileType,
          };
        }
        
        analysisResults.push({
          fileName: file.originalname,
          fileType: extractedData.fileType,
          isStructured: extractedData.isStructured,
          // Spread analysis fields to top level so ComparisonTable can access vendor, price, etc.
          ...analysis,
          analysis: analysis,
          success: true
        });
        
      } catch (error) {
        console.error(`❌ Error analyzing ${file.originalname}:`, error.message);
        analysisResults.push({
          fileName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    const successful = analysisResults.filter(r => r.success).length;
    
    res.json({
      message: 'AI analysis completed',
      summary: {
        totalFiles: analysisResults.length,
        successful,
        failed: analysisResults.length - successful
      },
      results: analysisResults
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/upload/formats
 * Get list of supported file formats
 */
router.get('/formats', (req, res) => {
  res.json({
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
});

module.exports = router;
