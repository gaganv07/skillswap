# 🚀 RENDER DEPLOYMENT GUIDE

## Prerequisites

Before deploying to Render, ensure you have:

1. **MongoDB Database** (MongoDB Atlas recommended)
2. **Environment Variables** configured
3. **Dependencies** installed

## Step 1: Environment Variables

Set these in your Render dashboard under "Environment":

### Required Variables
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap-connect
JWT_SECRET=your_super_secret_jwt_key_here
```

### Optional Variables (for full functionality)
```
OPENAI_API_KEY=sk-your-openai-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Other Variables
```
NODE_ENV=production
PORT=10000
CORS_ORIGINS=https://your-frontend-domain.com
```

## Step 2: Render Configuration

### Service Settings
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Advanced Settings
- **Health Check Path**: `/api/health`
- **Health Check Timeout**: 30 seconds

## Step 3: Pre-Deployment Testing

Run the deployment test locally:

```bash
npm run test:deployment
```

This will validate:
- ✅ Environment variables
- ✅ Module imports
- ✅ Database connection
- ✅ Server creation
- ✅ Socket.IO setup

## Step 4: Deploy

1. Push your code to GitHub
2. Connect your Render service to the repository
3. Deploy

## Step 5: Monitor Logs

After deployment, check the logs for:

```
🔍 VALIDATING ENVIRONMENT VARIABLES...
📋 ENVIRONMENT STATUS:
✅ MONGO_URI: Set
✅ JWT_SECRET: Set
🚀 STARTING SKILLSWAP CONNECT SERVER...
📡 Connecting to MongoDB...
✅ MongoDB connected successfully
🌐 HTTP server created
🔌 Setting up Socket.IO...
✅ Socket.IO configured
☁️ Setting up Cloudinary...
✅ Cloudinary configured
🎉 SERVER STARTED SUCCESSFULLY
📍 Running on port 10000
```

## Troubleshooting

### Exit Code 1 Errors

**Missing Environment Variables:**
```
❌ MONGO_URI environment variable is required
```
**Solution**: Add the missing variables in Render dashboard

**Database Connection Failed:**
```
❌ Database connection failed
```
**Solution**: Check MONGO_URI format and network access

**Port Already in Use:**
```
❌ Server startup error: listen EADDRINUSE
```
**Solution**: Render assigns PORT automatically, don't hardcode it

### Common Issues

1. **CORS Errors**: Update `CORS_ORIGINS` with your frontend URL
2. **Socket.IO Not Working**: Ensure HTTP server is used (not app.listen)
3. **Media Upload Failing**: Check Cloudinary credentials
4. **AI Features Not Working**: Verify OpenAI API key

## Health Check

Your app includes a health endpoint at `/api/health` that returns:
```json
{
  "status": "OK"
}
```

## Production Optimizations

The server includes:
- ✅ Global error handling
- ✅ Graceful shutdown
- ✅ Connection pooling
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ CORS protection
- ✅ Request logging

## Support

If deployment fails:
1. Check Render logs
2. Run `npm run test:deployment` locally
3. Verify all environment variables
4. Ensure MongoDB is accessible from Render's IP ranges