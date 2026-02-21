# Gen AI Hacks - Universal File Processing System

A full-stack AI-powered application that processes and analyzes multiple file formats (PDF, Excel, CSV, Word, JSON, Text) with Gemini AI integration.

## Features

- **6+ File Format Support**: Process PDF, Excel, CSV, Word, JSON, and Text files
- **Two Processing Modes**:
  - Extract: Fast data extraction
  - Analyze: AI-powered insights with Gemini
- **Batch Processing**: Upload up to 20 files at once
- **Drag & Drop UI**: Intuitive React-based interface
- **Automatic Format Detection**: Intelligent file type handling
- **Fallback Mechanisms**: Graceful error recovery

## Tech Stack

### Frontend
- React 18
- Vite 5
- Axios

### Backend
- Node.js
- Express.js
- Gemini AI API
- File parsers: pdf-parse, xlsx, csv-parser, mammoth

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/kanishmanickam/Gen-AI-Hacks.git
cd Gen-AI-Hacks
```

2. Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

3. Configure environment variables

Backend (.env):
```
OPENAI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

4. Start servers

Backend:
```bash
cd backend
npm start
```

Frontend (new terminal):
```bash
cd frontend
npm run dev
```

Access at `http://localhost:3000`

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository connected

### Steps

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Set Environment Variables**
```bash
vercel env add OPENAI_API_KEY
# Enter your Gemini API key when prompted
```

3. **Deploy**
```bash
vercel --prod
```

Or use Vercel Dashboard:
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable `OPENAI_API_KEY`
4. Deploy

### Production URL
After deployment, your app will be available at: `https://gen-ai-hacks.vercel.app`

## API Endpoints

### POST /api/upload
Extract data from files (fast mode)

**Request:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "files=@file1.pdf" \
  -F "files=@file2.xlsx"
```

### POST /api/upload/analyze
AI analysis with insights

**Request:**
```bash
curl -X POST http://localhost:5000/api/upload/analyze \
  -F "files=@data.csv"
```

### GET /api/upload/formats
List supported formats

**Response:**
```json
{
  "supportedFormats": [...],
  "maxFileSize": "50MB",
  "maxFilesPerRequest": 20
}
```

## File Format Support

| Format | Extension | Features |
|--------|-----------|----------|
| PDF | `.pdf` | Text extraction with binary fallback |
| Excel | `.xlsx`, `.xls` | Multi-sheet, row/column metadata |
| CSV | `.csv` | Row-by-row parsing, header detection |
| Word | `.docx`, `.doc` | Text extraction |
| JSON | `.json` | Structured data parsing |
| Text | `.txt` | Plain text processing |

## Limitations

- Max file size: 50 MB
- Max files per request: 20
- Processing timeout: 120 seconds
- API rate limits depend on Gemini tier

## Troubleshooting

### CORS Errors
Update `CORS_ORIGIN` in `.env` or `vercel.env`

### File Upload Fails
- Check file size (max 50MB)
- Verify file format is supported
- Check browser console for error details

### API Key Issues
- Ensure `OPENAI_API_KEY` is set
- Verify API key has correct permissions
- Check Vercel environment variables

## Project Structure

```
Gen-AI-Hacks/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   │   └── upload.js
│   ├── services/
│   │   └── aiService.js
│   └── utils/
│       └── universalDataExtractor.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── FileUpload.jsx
│           ├── ComparisonTable.jsx
│           └── Recommendation.jsx
├── vercel.json
└── .gitignore
```

## License

MIT

## Support

For issues or questions, please create a GitHub issue or contact the maintainers.

---

**Deployed at:** https://gen-ai-hacks.vercel.app
