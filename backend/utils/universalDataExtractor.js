/**
 * Universal Data Extractor
 * Handles multiple file formats: PDF, Excel, CSV, Word, JSON, Text
 * Automatically detects file type and extracts structured data
 */

const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const xlsx = require('xlsx');
const csv = require('csv-parser');
const { parseFile } = require('mammoth');

/**
 * Main entry point - detects file type and extracts accordingly
 * @param {string} filePath - Path to the file
 * @param {string} fileName - Original file name
 * @returns {Promise<Object>} - { fileType, content, metadata, rows (if tabular) }
 */
async function extractDataFromFile(filePath, fileName) {
  const extension = path.extname(fileName).toLowerCase();
  const fileSize = (await fs.stat(filePath)).size;
  
  console.log(`📄 Processing: ${fileName} (${(fileSize / 1024).toFixed(2)} KB) - Type: ${extension}`);

  // Route to appropriate extractor
  switch (extension) {
    case '.pdf':
      return await extractPDF(filePath, fileName);
    case '.xlsx':
    case '.xls':
      return await extractExcel(filePath, fileName);
    case '.csv':
      return await extractCSV(filePath, fileName);
    case '.docx':
    case '.doc':
      return await extractWord(filePath, fileName);
    case '.txt':
      return await extractText(filePath, fileName);
    case '.json':
      return await extractJSON(filePath, fileName);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Extract text and metadata from PDF
 */
async function extractPDF(filePath, fileName) {
  try {
    const dataBuffer = await fs.readFile(filePath);

    // Try standard PDF parsing
    try {
      const data = await pdf(dataBuffer);
      if (data.text && data.text.trim().length > 10) {
        return {
          fileType: 'PDF',
          fileName,
          content: data.text.trim(),
          metadata: {
            pages: data.numpages,
            info: data.info,
            extractedAt: new Date().toISOString()
          },
          isStructured: false
        };
      }
    } catch (error) {
      console.log(`⚠️ Standard PDF parsing failed: ${error.message}`);
    }

    // Fallback: raw binary extraction
    console.log('⚠️ Using binary extraction fallback...');
    let text = '';
    for (let i = 0; i < dataBuffer.length; i++) {
      const byte = dataBuffer[i];
      if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 9 || byte === 13) {
        text += String.fromCharCode(byte);
      } else if (byte < 32 && text.length > 0 && text[text.length - 1] !== ' ') {
        text += ' ';
      }
    }

    const cleanText = text
      .split(/[\s\n\r\t]+/)
      .filter(word => word.length > 2 && !word.startsWith('/'))
      .join(' ')
      .substring(0, 10000);

    if (cleanText.length > 50) {
      return {
        fileType: 'PDF',
        fileName,
        content: cleanText,
        metadata: { extractionMethod: 'binary', extractedAt: new Date().toISOString() },
        isStructured: false
      };
    }

    throw new Error('Could not extract meaningful text from PDF');
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

/**
 * Extract data from Excel files
 */
async function extractExcel(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    
    const result = {
      fileType: 'Excel',
      fileName,
      metadata: {
        sheets: workbook.SheetNames,
        extractedAt: new Date().toISOString()
      },
      data: {},
      isStructured: true
    };

    // Extract all sheets
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      result.data[sheetName] = {
        rows: jsonData,
        rowCount: jsonData.length,
        columns: jsonData.length > 0 ? Object.keys(jsonData[0]) : []
      };
    });

    // Create summary content
    result.content = formatExcelSummary(result.data, workbook.SheetNames);

    console.log(`✓ Extracted ${Object.keys(result.data).length} sheet(s) from Excel`);
    return result;
  } catch (error) {
    throw new Error(`Excel extraction failed: ${error.message}`);
  }
}

/**
 * Extract data from CSV files
 */
async function extractCSV(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const rows = [];
    const stream = require('fs').createReadStream(filePath).pipe(csv());

    stream.on('data', (data) => {
      rows.push(data);
    });

    stream.on('end', () => {
      const result = {
        fileType: 'CSV',
        fileName,
        metadata: {
          rowCount: rows.length,
          columns: rows.length > 0 ? Object.keys(rows[0]) : [],
          extractedAt: new Date().toISOString()
        },
        data: {
          rows,
          columns: rows.length > 0 ? Object.keys(rows[0]) : []
        },
        content: formatTabularSummary(rows, 'CSV Data'),
        isStructured: true
      };

      console.log(`✓ Extracted ${rows.length} rows from CSV`);
      resolve(result);
    });

    stream.on('error', (error) => {
      reject(new Error(`CSV extraction failed: ${error.message}`));
    });
  });
}

/**
 * Extract text from Word documents
 */
async function extractWord(filePath, fileName) {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await parseFile({ arrayBuffer: buffer });

    const content = result.value;
    const paragraphs = content.split('\n').filter(p => p.trim().length > 0);

    return {
      fileType: 'Word Document',
      fileName,
      content,
      metadata: {
        paragraphs: paragraphs.length,
        extractedAt: new Date().toISOString()
      },
      isStructured: false
    };
  } catch (error) {
    throw new Error(`Word document extraction failed: ${error.message}`);
  }
}

/**
 * Extract text from plain text files
 */
async function extractText(filePath, fileName) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    return {
      fileType: 'Text File',
      fileName,
      content: content.trim(),
      metadata: {
        lines: lines.length,
        characters: content.length,
        extractedAt: new Date().toISOString()
      },
      isStructured: false
    };
  } catch (error) {
    throw new Error(`Text file extraction failed: ${error.message}`);
  }
}

/**
 * Extract data from JSON files
 */
async function extractJSON(filePath, fileName) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const isArray = Array.isArray(data);
    const rowCount = isArray ? data.length : 1;

    return {
      fileType: 'JSON',
      fileName,
      content: JSON.stringify(data, null, 2),
      metadata: {
        isArray,
        rowCount,
        keys: !isArray ? Object.keys(data) : (data.length > 0 ? Object.keys(data[0]) : []),
        extractedAt: new Date().toISOString()
      },
      data: isArray ? { rows: data } : { data },
      isStructured: isArray
    };
  } catch (error) {
    throw new Error(`JSON extraction failed: ${error.message}`);
  }
}

/**
 * Format Excel data summary
 */
function formatExcelSummary(sheetData, sheetNames) {
  let summary = `Excel File Summary\n${'='.repeat(50)}\n`;
  summary += `Total Sheets: ${sheetNames.length}\n\n`;

  sheetNames.forEach(sheetName => {
    const sheet = sheetData[sheetName];
    summary += `📊 Sheet: ${sheetName}\n`;
    summary += `   Rows: ${sheet.rowCount}\n`;
    summary += `   Columns: ${sheet.columns.join(', ')}\n\n`;

    // Show first 5 rows as preview
    if (sheet.rows.length > 0) {
      summary += '   Preview (first 5 rows):\n';
      sheet.rows.slice(0, 5).forEach((row, idx) => {
        summary += `   Row ${idx + 1}: ${JSON.stringify(row)}\n`;
      });
    }
    summary += '\n';
  });

  return summary;
}

/**
 * Format tabular data summary
 */
function formatTabularSummary(rows, title) {
  let summary = `${title}\n${'='.repeat(50)}\n`;
  summary += `Total Rows: ${rows.length}\n`;
  
  if (rows.length > 0) {
    summary += `Columns: ${Object.keys(rows[0]).join(', ')}\n\n`;
    summary += 'Preview (first 10 rows):\n';
    rows.slice(0, 10).forEach((row, idx) => {
      summary += `Row ${idx + 1}: ${JSON.stringify(row)}\n`;
    });
  }

  return summary;
}

module.exports = {
  extractDataFromFile,
  extractPDF,
  extractExcel,
  extractCSV,
  extractWord,
  extractText,
  extractJSON
};
