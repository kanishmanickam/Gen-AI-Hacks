# 🚀 Deployment Ready - Gen AI Hacks

Your AI-powered quotation comparison system is **fully prepared for deployment**! Choose your preferred hosting platform below.

---

## **🎯 Quickest Deploy (30 seconds)**

Run this PowerShell command to auto-deploy to Vercel:

```powershell
cd "c:\Users\Kanis\Downloads\Gen Ai Hacks"
.\deploy.ps1
```

Or use the batch file:
```cmd
deploy.bat
```

Both scripts will:
1. ✅ Install Vercel CLI (if needed)
2. ✅ Commit your code to GitHub
3. ✅ Link your Vercel account
4. ✅ Deploy to production
5. ✅ Show you the live URL

---

## **📋 Pre-Deployment Checklist**

- ✅ Code pushed to GitHub: https://github.com/kanishmanickam/Gen-AI-Hacks
- ✅ Vercel CLI installed globally
- ✅ Environment variables configured (GEMINI_API_KEY)
- ✅ Frontend React build configured
- ✅ Backend Node.js routes ready
- ✅ vercel.json configured for monorepo

---

## **🌐 Deployment Platforms**

### **1️⃣ Vercel (RECOMMENDED) - Free Tier**

**Best for:** Full-stack apps with Node.js backends

**Speed:** 2-3 minutes
**Cost:** Free (unlimited deployments, 100GB bandwidth)

```powershell
.\deploy.ps1
```

After deployment:
1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add: `GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI`
4. Redeploy or wait for auto-deployment

**Live URL:** `https://gen-ai-hacks.vercel.app`

---

### **2️⃣ Railway.app - Generous Free Tier**

**Best for:** Backend-heavy apps, 5GB/month included

**Speed:** 3-5 minutes
**Cost:** $5 free monthly credit

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set Root Directory: `backend` or leave blank for full monorepo
5. Add environment variable: `GEMINI_API_KEY`
6. Deploy

---

### **3️⃣ Render.com - Free Tier**

**Best for:** Docker-based deployments, good free tier

**Speed:** 4-6 minutes
**Cost:** Free (with limits)

1. Go to https://render.com
2. New → Web Service → Connect GitHub
3. Select repository
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables
7. Deploy

---

### **4️⃣ AWS Amplify - AWS Free Tier**

**Best for:** AWS ecosystem users, CI/CD integration

**Speed:** 5-10 minutes
**Cost:** Free tier eligible

1. Go to AWS Amplify Console
2. Connect GitHub repository
3. Select branch: `main`
4. Build settings auto-detected
5. Add environment variables
6. Deploy

---

## **📦 What Gets Deployed**

### **Frontend (React + Vite)**
```
/frontend/
  ├── src/
  │   ├── components/
  │   │   ├── ComparisonTable.jsx (with metrics, rankings, scoring)
  │   │   ├── ComparisonTable.css (enhanced styling)
  │   │   ├── Recommendation.jsx (with AI reasoning)
  │   │   └── ...
  │   └── App.jsx
  ├── vite.config.js
  └── package.json
```

**Build Output:** `/frontend/dist/` (static files)

### **Backend (Node.js + Express)**
```
/backend/
  ├── server.js (Express server)
  ├── routes/
  │   ├── upload.js (file upload & extraction)
  │   └── compare.js (comparison & AI recommendation)
  ├── services/
  │   └── aiService.js (Gemini API integration)
  ├── utils/
  │   └── universalDataExtractor.js (6+ file formats)
  └── package.json
```

**API Endpoints:**
- `POST /api/upload` - Upload and extract data
- `POST /api/compare` - Compare quotations with AI recommendations

---

## **🔐 Environment Variables**

### **Required**
```
GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI
```

### **Optional** (Auto-set by platform)
```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.vercel.app
```

---

## **✅ Post-Deployment Verification**

After deployment, verify these work:

1. **Frontend loads** → Visit `https://gen-ai-hacks.vercel.app`
2. **Upload file** → Try uploading a PDF or Excel file
3. **Data extraction** → Should show extracted vendor data
4. **Comparison table** → Displays with all metrics (price, delivery, value score)
5. **Ranking system** → Shows vendor rankings #1, #2, etc.
6. **AI recommendation** → Shows why best vendor was chosen
7. **Market analysis** → Displays market context and comparison

---

## **🐛 Troubleshooting**

### **"Gemini API key not configured"**
```
✅ Solution:
1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add GEMINI_API_KEY
4. Redeploy
```

### **"Cannot find module" errors**
```
✅ Solution:
1. Check package.json has all dependencies
2. Wait for npm install during build
3. Check build logs in Vercel/Railway dashboard
```

### **Backend returning 500 errors**
```
✅ Solution:
1. Check server logs in deployment dashboard
2. Verify GEMINI_API_KEY is set
3. Check CORS settings in vercel.json
4. Ensure all routes are exported correctly
```

### **Frontend can't reach API**
```
✅ Solution:
1. Check backend URL in fetch calls
2. Verify CORS headers are enabled
3. Test API directly: /api/health
4. Check deployment logs
```

---

## **📊 Architecture After Deployment**

```
┌─────────────────────────────────────┐
│      Your Custom Domain             │
│   (or vercel-generated URL)         │
└────────────────┬────────────────────┘
                 │
        ┌────────▼────────┐
        │  Vercel Edge    │
        │  (CDN Cache)    │
        └────────┬────────┘
                 │
        ┌────────▼──────────────┐
        │  Vercel Functions     │
        │  - Frontend (Static)  │
        │  - Backend API        │
        └────────┬──────────────┘
                 │
        ┌────────▼────────┐
        │  Gemini API     │
        │  (Google Cloud) │
        └─────────────────┘
```

---

## **🚀 One-Click Vercel Button**

Add this to your README to enable one-click deployments:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkanishmanickam%2FGen-AI-Hacks&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=gen-ai-hacks)
```

---

## **📝 Scripts Available**

**Automated Deployment:**
```powershell
.\deploy.ps1          # PowerShell (recommended)
deploy.bat            # Batch file
```

**Manual Commands:**
```powershell
# Check status
git status

# Commit changes
git add .
git commit -m "message"
git push origin main

# Deploy to Vercel
vercel --prod

# Preview deployment
vercel
```

---

## **📞 Support & Resources**

- **Repository:** https://github.com/kanishmanickam/Gen-AI-Hacks
- **Vercel Docs:** https://vercel.com/docs
- **Railway Docs:** https://docs.railway.app
- **Gemini API:** https://ai.google.dev
- **React Docs:** https://react.dev
- **Node.js Docs:** https://nodejs.org

---

## **🎉 Deployment Checklist**

- [ ] Run deployment script or go to Vercel dashboard
- [ ] Add GEMINI_API_KEY environment variable
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Visit live URL
- [ ] Test file upload
- [ ] Verify comparison table displays
- [ ] Check AI recommendation works
- [ ] Share with team! 🚀

---

**Everything is ready to go! Your app deployment is one command away.** ✨

```powershell
.\deploy.ps1
```

