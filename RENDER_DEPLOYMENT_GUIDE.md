# Render Deployment Configuration for SkillSwap Connect Backend

This guide helps deploy the backend to Render.com

## Pre-Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string ready (with password-encoded username)
- [ ] Cloudinary account configured (optional)
- [ ] OpenAI API key ready (optional)
- [ ] JWT secrets generated securely
- [ ] Frontend domain known for CORS

## Deployment Steps

### 1. Connect GitHub Repository
- Go to https://dashboard.render.com
- Click "New" → "Web Service"
- Connect your GitHub repository
- Select the `skillswap-connect` repository

### 2. Configure Build Settings
- **Name**: `skillswap-connect-api` (or your preferred name)
- **Environment**: Node
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 3. Add Environment Variables
Click "Advanced" → "Add Environment Variable" for each:

**Critical (Required):**
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap-connect
JWT_SECRET=your_secure_random_string_min_32_chars
JWT_REFRESH_SECRET=your_different_secure_random_string_min_32_chars
PORT=5000
```

**CORS Configuration:**
```
CORS_ORIGINS=https://your-vercel-frontend.vercel.app,https://your-domain.com
```

**Optional Features:**
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_api_key
```

**Logging & Rate Limiting:**
```
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### 4. Generate Secure JWT Secrets
Run this locally to generate secure random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Run twice and use different values for JWT_SECRET and JWT_REFRESH_SECRET.

### 5. Database Connection
1. Get MongoDB Atlas connection string
2. Format: `mongodb+srv://username:password@cluster-name.mongodb.net/skillswap-connect`
3. Make sure:
   - Database name is `skillswap-connect`
   - IP is whitelisted (or use 0.0.0.0/0 for any)
   - Username/password are URL-encoded if special characters exist

### 6. Deploy
- Click "Create Web Service"
- Render will automatically deploy on git push to main
- Check "Logs" tab to verify deployment

### 7. Verify Deployment
```bash
curl https://your-service-name.onrender.com/api/health
```
Should return: `{"status":"OK"}`

## Post-Deployment

### Health Check
- Test health endpoint: `/api/health`
- Test auth: `POST /api/auth/login` with test credentials

### Monitor Logs
- Check Logs tab regularly for errors
- Monitor metrics on Dashboard

### Update Frontend
- Update `VITE_API_URL` in frontend environment to:
  ```
  VITE_API_URL=https://your-service-name.onrender.com/api
  ```
- Update CORS on backend if frontend domain changes

## Troubleshooting

**Deployment Failed:**
- Check Build & Deploy logs
- Verify environment variables are set
- Ensure MongoDB connection string is correct

**Connection Timeout:**
- Verify MongoDB IP whitelist
- Check MONGO_URI format
- Test connection locally first

**CORS Errors:**
- Check frontend domain matches CORS_ORIGINS
- Include protocol (https/http)
- Separate multiple origins with commas

**Port Issues:**
- Render assigns port dynamically
- Don't hardcode port in code (use `process.env.PORT`)
- Server startup logs show actual port