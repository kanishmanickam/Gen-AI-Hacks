/**
 * Test the complete upload and extraction flow
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const http = require('http');

// Get first PDF file from uploads
const uploadsDir = path.join(__dirname, '../uploads');
const pdfFiles = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));

if (pdfFiles.length === 0) {
  console.log('❌ No PDF files found in uploads folder');
  process.exit(1);
}

const testPdfPath = path.join(uploadsDir, pdfFiles[0]);
const pdfBuffer = fs.readFileSync(testPdfPath);

console.log(`\n🧪 Testing API endpoint with ${pdfFiles[0]}`);
console.log(`📊 File size: ${pdfBuffer.length} bytes\n`);

// Simulate the extraction process
const { extractTextFromPDF } = require('./pdfExtractor');

extractTextFromPDF(testPdfPath)
  .then(text => {
    console.log(`✅ Text extraction successful!\n`);
    console.log(`📝 Extracted text length: ${text.length} characters`);
    console.log(`\n--- First 500 characters ---`);
    console.log(text.substring(0, 500));
    console.log(`\n--- Testing AI extraction ---\n`);
    
    // Now test the AI extraction with this text
    const aiService = require('../services/aiService');
    return aiService.extractQuotationData(text);
  })
  .then(data => {
    console.log(`✅ AI extraction successful!\n`);
    console.log('📊 Extracted quotation data:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.log(`❌ Error: ${err.message}`);
    process.exit(1);
  });
