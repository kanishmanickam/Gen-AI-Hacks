#!/usr/bin/env pwsh
# Quick Deploy Script for Gen AI Hacks
# Usage: ./deploy.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Gen AI Hacks - Quick Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel is installed
$vercelCmd = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCmd) {
    Write-Host "[1/5] Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "[1/5] Vercel CLI found ✓" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "[3/5] Committing changes if any..." -ForegroundColor Yellow
git add -A
git commit -m "deploy: auto-commit before deployment" 2>$null
git push origin main 2>$null

Write-Host ""
Write-Host "[4/5] Linking Vercel project..." -ForegroundColor Yellow
vercel link --confirm

Write-Host ""
Write-Host "[5/5] Deploying to production..." -ForegroundColor Yellow
Write-Host "This may take 2-3 minutes..." -ForegroundColor Gray
vercel --prod

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Deployment Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your app is now live at: https://gen-ai-hacks.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Go to https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "  2. Select your project" -ForegroundColor Gray
Write-Host "  3. Go to Settings → Environment Variables" -ForegroundColor Gray
Write-Host "  4. Add GEMINI_API_KEY = AIzaSyB4WxEIVJIAaHRxDEJlja1GXdLGXaMs-bI" -ForegroundColor Gray
Write-Host "  5. Redeploy from Vercel dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "Verify your deployment:" -ForegroundColor Yellow
Write-Host "  - Frontend loads at https://gen-ai-hacks.vercel.app" -ForegroundColor Gray
Write-Host "  - Upload a file and test the comparison feature" -ForegroundColor Gray
Write-Host "  - Check browser console for any errors" -ForegroundColor Gray
Write-Host ""
