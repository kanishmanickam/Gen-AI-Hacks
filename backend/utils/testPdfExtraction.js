/**
 * Test PDF extraction to diagnose issues
 */

const { extractTextFromPDF } = require('./pdfExtractor');
const fs = require('fs').promises;
const path = require('path');

async function testExtraction() {
  const uploadsDir = path.join(__dirname, '../uploads');
  const files = await fs.readdir(uploadsDir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf')).slice(0, 3); // Test first 3

  console.log(`\n🧪 Testing improved PDF extraction on ${pdfFiles.length} files...\n`);

  for (const filename of pdfFiles) {
    const filePath = path.join(uploadsDir, filename);
    console.log(`\n📄 File: ${filename}`);
    console.log(`📊 Size: ${(await fs.stat(filePath)).size} bytes`);
    
    try {
      const text = await extractTextFromPDF(filePath);
      console.log(`\n   📝 Extracted text preview:`);
      console.log(`   ${text.substring(0, 300).replace(/\n/g, '\n   ')}`);
      console.log(`   ...\n`);
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
    }
  }
}

testExtraction().catch(console.error);
