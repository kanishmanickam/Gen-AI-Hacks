/**
 * Alternative PDF Text Extraction using pdfjs-dist
 * More robust than pdf-parse for handling malformed PDFs
 */

const pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
const fs = require('fs').promises;

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.js');

/**
 * Extract text from PDF using pdfjs-dist
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromPDFWithPDFJS(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    
    // Load the PDF with lenient parsing
    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(dataBuffer),
      disableStream: true,
      disableAutoFetch: false,
      ignoreErrors: true  // Ignore parsing errors and try to continue
    }).promise;

    console.log(`📖 PDF loaded: ${pdf.numPages} pages`);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.log(`⚠️  Could not extract page ${pageNum}: ${pageError.message}`);
        // Continue with next page
      }
    }

    if (fullText.length > 10) {
      console.log(`✓ Extracted ${fullText.length} characters from PDF using pdfjs-dist`);
      return fullText;
    } else {
      throw new Error('No text extracted from PDF');
    }
  } catch (error) {
    console.error('pdfjs-dist extraction error:', error.message);
    throw new Error(`Failed to extract text with pdfjs-dist: ${error.message}`);
  }
}

module.exports = { extractTextFromPDFWithPDFJS };
