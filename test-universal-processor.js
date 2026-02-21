#!/usr/bin/env node

/**
 * Test Script for Universal File Processing
 * Tests the system with multiple file types
 */

require('dotenv').config({ path: require('path').join(__dirname, 'backend/.env') });

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE = 'http://localhost:5000/api/upload';

async function testFileProcessing() {
  console.log('\n🧪 Universal File Processing Test Suite\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Check supported formats
    console.log('\n1️⃣ Checking supported formats...');
    try {
      const formatsResponse = await axios.get(`${API_BASE}/formats`);
      console.log('✅ Supported formats:');
      formatsResponse.data.supportedFormats.forEach(format => {
        console.log(`   • ${format.extension} - ${format.name}`);
      });
    } catch (error) {
      console.log('❌ Could not fetch formats:', error.message);
    }

    // Test 2: Test with existing PDF uploads
    console.log('\n2️⃣ Testing PDF extraction from uploads...');
    try {
      const uploadsDir = path.join(__dirname, 'backend/uploads');
      const files = await fs.readdir(uploadsDir);
      const pdfFiles = files.filter(f => f.endsWith('.pdf')).slice(0, 2);
      
      if (pdfFiles.length > 0) {
        console.log(`   Found ${pdfFiles.length} PDF files to test`);
        
        // Create FormData for upload
        const FormData = require('form-data');
        const form = new FormData();
        
        for (const file of pdfFiles) {
          const filePath = path.join(uploadsDir, file);
          form.append('files', await fs.readFile(filePath), file);
        }

        const response = await axios.post(`${API_BASE}`, form, {
          headers: form.getHeaders(),
          timeout: 30000
        });

        console.log(`✅ PDF extraction successful:`);
        console.log(`   Total files: ${response.data.summary.totalFiles}`);
        console.log(`   Successful: ${response.data.summary.successful}`);
        console.log(`   Failed: ${response.data.summary.failed}`);

        if (response.data.results[0]) {
          const result = response.data.results[0];
          console.log(`\n   📊 First file details:`);
          console.log(`      Name: ${result.fileName}`);
          console.log(`      Type: ${result.fileType}`);
          console.log(`      Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
          console.log(`      Content length: ${result.content?.length || 0} chars`);
        }
      } else {
        console.log('⚠️  No PDF files found in uploads folder');
      }
    } catch (error) {
      console.log('❌ PDF test failed:', error.message);
    }

    // Test 3: Test API with sample JSON file
    console.log('\n3️⃣ Testing JSON file processing...');
    try {
      const sampleJson = {
        vendors: [
          { name: 'Vendor A', price: 1000, delivery: 5, rating: 4.5 },
          { name: 'Vendor B', price: 1200, delivery: 3, rating: 4.8 },
          { name: 'Vendor C', price: 950, delivery: 7, rating: 4.2 }
        ]
      };

      // Create temporary JSON file
      const tempJsonPath = path.join(__dirname, 'temp-test.json');
      await fs.writeFile(tempJsonPath, JSON.stringify(sampleJson, null, 2));

      const FormData = require('form-data');
      const form = new FormData();
      form.append('files', await fs.readFile(tempJsonPath), 'test-data.json');

      const response = await axios.post(`${API_BASE}/analyze`, form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      console.log('✅ JSON analysis successful:');
      if (response.data.results[0]) {
        const result = response.data.results[0];
        console.log(`   File: ${result.fileName}`);
        console.log(`   Type: ${result.fileType}`);
        console.log(`   Structured: ${result.isStructured}`);
        if (result.analysis) {
          console.log(`   Summary: ${result.analysis.analysis?.summary || 'N/A'}`);
        }
      }

      // Cleanup
      await fs.unlink(tempJsonPath);
    } catch (error) {
      console.log('❌ JSON test failed:', error.message);
    }

    // Test 4: Test with CSV data
    console.log('\n4️⃣ Testing CSV file processing...');
    try {
      const csvContent = `Vendor,Price,DeliveryDays,Rating
Vendor A,1000,5,4.5
Vendor B,1200,3,4.8
Vendor C,950,7,4.2
Vendor D,1100,4,4.6`;

      const tempCsvPath = path.join(__dirname, 'temp-test.csv');
      await fs.writeFile(tempCsvPath, csvContent);

      const FormData = require('form-data');
      const form = new FormData();
      form.append('files', await fs.readFile(tempCsvPath), 'test-data.csv');

      const response = await axios.post(`${API_BASE}`, form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      console.log('✅ CSV extraction successful:');
      if (response.data.results[0]) {
        const result = response.data.results[0];
        console.log(`   File: ${result.fileName}`);
        console.log(`   Type: ${result.fileType}`);
        console.log(`   Rows: ${result.data?.rows?.length || 'N/A'}`);
        console.log(`   Columns: ${result.data?.columns?.join(', ') || 'N/A'}`);
      }

      // Cleanup
      await fs.unlink(tempCsvPath);
    } catch (error) {
      console.log('❌ CSV test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test suite error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test suite completed!\n');
}

// Run tests
testFileProcessing().catch(console.error);
