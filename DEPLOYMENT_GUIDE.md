# Deployment Guide - Gen AI Hacks

Your AI-powered quotation comparison system is ready to deploy! Follow one of these methods.

---

## **Method 1: One-Click Vercel Deploy (EASIEST) 🚀**

Click this button to deploy directly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkanishmanickam%2FGen-AI-Hacks&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&envLink=https%3A%2F%2Faistudio.google.com%2Fapp%2Fapikey&project-name=gen-ai-hacks&repository-name=Gen-AI-Hacks)

**What happens:**
1. Vercel clones your repository
2. Builds both frontend (React) and backend (Node.js)
3. Deploys to `https://gen-ai-hacks.vercel.app`

**After deploying:**
- Add your Gemini API key to Vercel environment variables
- Go to Project Settings → Environment Variables
- Add: `GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI`
- Redeploy

---

## **Method 2: Manual Vercel CLI Deploy**

**Prerequisites:**
- Vercel account: https://vercel.com (free)
- Vercel CLI already installed ✅

**Steps:**

```powershell
cd "c:\Users\Kanis\Downloads\Gen Ai Hacks"

# Link to Vercel account
vercel link

# Add API key as environment variable
vercel env add GEMINI_API_KEY

# When prompted, enter: AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI

# Deploy to production
vercel --prod
```

**Output will show:**
```
✅ Production: https://gen-ai-hacks.vercel.app
```

---

## **Method 3: GitHub + Vercel Dashboard (No CLI)**

**Steps:**

1. Go to **https://vercel.com/dashboard**

2. Click **"Add New..."** → **"Project"**

3. Select **"Import Git Repository"**
   - Paste: `https://github.com/kanishmanickam/Gen-AI-Hacks`

4. Vercel auto-detects:
   - Framework: Vite + Node.js
   - Root Directory: (leave blank)
   - Build Command: (auto-detected)

5. Click **"Environment Variables"**
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI`

6. Click **"Deploy"**

7. Wait 2-3 minutes for build to complete

**Your app will be live at:** `https://gen-ai-hacks.vercel.app`

---

## **Method 4: Deploy Backend & Frontend Separately**

### **Backend on Railway.app**

1. Go to https://railway.app
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select `Gen-AI-Hacks` repository
4. Configure:
   - Root Directory: `backend`
   - Environment Variable:
     - `GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI`
5. Deploy

**You'll get backend URL:** `https://your-app.railway.app`

### **Frontend on Vercel**

1. Go to https://vercel.com
2. Import repository
3. Configure:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL=https://your-app.railway.app`
5. Deploy

---

## **Method 5: Deploy to Netlify (Frontend) + Heroku (Backend)**

### **Backend on Heroku**

```powershell
# Install Heroku CLI
# Then:

heroku create gen-ai-hacks-api
heroku config:set GEMINI_API_KEY=AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI -a gen-ai-hacks-api
git push heroku main
```

### **Frontend on Netlify**

1. Go to https://netlify.com
2. Drag & drop the `frontend/dist` folder
3. Set Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Set Environment Variable:
   - `VITE_API_URL=https://gen-ai-hacks-api.herokuapp.com`

---

## **Post-Deployment Checklist**

After deploying, verify everything works:

- [ ] Frontend loads at your domain
- [ ] Can upload PDF/Excel/CSV files
- [ ] Files are processed and extracted
- [ ] AI recommendation generates
- [ ] Comparison table displays metrics
- [ ] Value scoring and ranking shows correctly
- [ ] No console errors in browser DevTools

---

## **Environment Variables Reference**

| Variable | Value | Required |
|----------|-------|----------|
| `GEMINI_API_KEY` | `AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI` | ✅ Yes |
| `PORT` | `5000` | No (auto-set) |
| `CORS_ORIGIN` | `https://gen-ai-hacks.vercel.app` | No |
| `NODE_ENV` | `production` | No (auto-set) |

---

## **Troubleshooting**

### **"API key not configured" error**
- Check Vercel/Railway environment variables
- Verify `GEMINI_API_KEY` is set correctly
- Redeploy after adding variables

### **"Cannot find module" error**
- Make sure `npm install` runs during build
- Check `package.json` has all dependencies
- Vercel should auto-detect and install

### **Backend responding with 500 error**
- Check server logs in Vercel/Railway dashboard
- Verify API key is valid
- Check CORS settings in `vercel.json`

### **Frontend can't reach backend API**
- Verify backend URL in frontend `.env`
- Check CORS headers in backend
- Ensure backend is fully deployed

---

## **Architecture Deployed**

```
Your App Domain
    ↓
┌─────────────────────┐
│  Frontend (Vercel)  │
│   React 18 + Vite   │
│   localhost:3000    │
└──────────┬──────────┘
           ↓
┌─────────────────────────┐
│   Backend (Vercel/Rail) │
│  Node.js + Express      │
│   localhost:5000        │
│  /api/* routes          │
└──────────┬──────────────┘
           ↓
┌─────────────────────┐
│  Gemini AI API      │
│  Google Cloud       │
└─────────────────────┘
```

---

## **Quick Redeploy**

To redeploy after code changes:

```powershell
# Push to GitHub (auto-triggers Vercel)
git add .
git commit -m "your message"
git push origin main

# Or manually redeploy:
vercel --prod
```

---

## **Support**

- Repository: https://github.com/kanishmanickam/Gen-AI-Hacks
- Vercel Docs: https://vercel.com/docs
- Gemini API: https://ai.google.dev/

