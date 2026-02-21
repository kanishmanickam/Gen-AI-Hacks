@echo off
REM Quick Deploy Script for Gen AI Hacks
REM This script automates the Vercel deployment process

echo.
echo ========================================
echo   Gen AI Hacks - Quick Deploy Script
echo ========================================
echo.

REM Check if Vercel is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [1/5] Installing Vercel CLI...
    call npm install -g vercel
) else (
    echo [1/5] Vercel CLI found ✓
)

echo.
echo [2/5] Checking git status...
cd /d "%~dp0"
git status

echo.
echo [3/5] Committing changes if any...
git add -A
git commit -m "deploy: auto-commit before deployment" 2>nul
git push origin main 2>nul

echo.
echo [4/5] Linking Vercel project...
vercel link --confirm

echo.
echo [5/5] Deploying to production...
vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your app is now live at: https://gen-ai-hacks.vercel.app
echo.
echo Next steps:
echo   1. Go to Vercel dashboard
echo   2. Add GEMINI_API_KEY environment variable
echo   3. Redeploy or wait for auto-deployment
echo.
pause
