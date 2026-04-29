# Vercel Deployment Configuration for SkillSwap Connect Frontend

This guide helps deploy the frontend to Vercel.

## Pre-Deployment Checklist

- [ ] Backend deployed on Render (get the URL)
- [ ] Frontend code committed to GitHub
- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel

## Deployment Steps

### 1. Connect GitHub to Vercel
- Go to https://vercel.com/dashboard
- Click "Add New..." → "Project"
- Select your GitHub repository (`skillswap-connect`)
- Authorize Vercel access

### 2. Configure Project Settings

**Framework Preset:** React
**Root Directory:** `./frontend`

### 3. Environment Variables
Add these in "Environment Variables":

```
VITE_API_URL=https://your-render-backend.onrender.com/api
```

### 4. Build Settings
These should be auto-detected:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy
- Click "Deploy"
- Vercel will:
  - Install dependencies
  - Build the project
  - Deploy to CDN
  - Provide a production URL

### 6. Verify Deployment
- Visit the provided URL
- Test user registration
- Test API calls (should go to backend)
- Check browser console for errors

## Environment-Specific URLs

### Development (Local)
```
VITE_API_URL=http://localhost:5000/api
```

### Staging
```
VITE_API_URL=https://staging-backend.onrender.com/api
```

### Production
```
VITE_API_URL=https://production-backend.onrender.com/api
```

## Custom Domain

### 1. Add Domain
- In Vercel project Settings → Domains
- Click "Add" → Enter your domain
- Follow DNS configuration

### 2. Update Backend CORS
Add your domain to backend CORS_ORIGINS:
```
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com,https://your-render-backend.onrender.com/api
```

## Deployment Strategy

### Automatic Deployments
Every push to `main` automatically deploys to production.

### Preview Deployments
Every pull request gets a unique preview URL.

### Manual Redeploy
- Dashboard → Project → Deployments tab
- Click three dots on deployment
- Select "Redeploy"

## Monitoring

### Check Deployment Status
- Vercel Dashboard shows deployment status
- Click deployment to see build logs
- Check "Analytics" for performance

### Monitor Errors
- Check browser console (F12)
- Check Network tab for API calls
- Review backend logs on Render

## Troubleshooting

**Build Failed:**
- Check build logs in Vercel Dashboard
- Verify all dependencies in `frontend/package.json`
- Test build locally: `npm run build`

**White Screen / 404:**
- Check if dist/ folder is created
- Verify Output Directory setting
- Clear browser cache and reload

**API Not Connecting:**
- Verify VITE_API_URL is correct
- Check backend is running on Render
- Check CORS settings on backend
- Test backend health: `curl https://backend-url/api/health`

**Environment Variables Not Working:**
- Restart deployment after changing env vars
- Verify variable names exactly match code
- Ensure VITE_ prefix for frontend variables

**Performance Issues:**
- Check Network tab in DevTools
- Look for slow API responses
- Monitor backend logs on Render