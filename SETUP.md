# SkillSwap Connect - Complete Setup & Run Guide

## Project Overview

SkillSwap Connect is a **production-ready full-stack platform** for skill exchange, built with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + Tailwind CSS
- **Mobile**: React Native + Expo
- **Tagline**: "Learn what you need. Teach what you know."

---

## 📋 Prerequisites

Before you start, ensure you have installed:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (running locally or remote connection)
   - Local: Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
   - Connection string format: `mongodb://localhost:27017/skillswap-connect`

3. **Git** (optional, for version control)

---

## 🚀 Quick Start (One Command)

From the root directory, run:

```bash
npm install && npm run install-all && npm run dev
```

This will:
1. ✅ Install root dependencies (concurrently)
2. ✅ Install backend, frontend, and mobile dependencies
3. ✅ Start all three services in parallel:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`
   - Mobile: `http://localhost:8081`

---

## 📁 Project Structure

```
skillswap-connect/
├── backend/                    # Express API Server
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, error handling
│   │   ├── services/          # JWT token service
│   │   ├── socket/            # WebSocket setup
│   │   ├── validators/        # Input validation
│   │   ├── config/            # Database, logger, env
│   │   ├── utils/             # Helpers
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server entry point
│   ├── tests/                 # Jest unit & API tests
│   ├── .env                   # Environment variables
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client (Axios)
│   │   ├── assets/            # Images, logos
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Tailwind CSS
│   ├── .env                   # Vite environment
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind config
│   └── package.json
│
├── mobile/                     # React Native + Expo
│   ├── src/
│   │   ├── screens/           # Mobile screens
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API client
│   │   ├── utils/             # Helpers
│   │   ├── Navigation.js      # App navigation
│   │   └── assets/            # Images, logos
│   ├── .env                   # Environment config
│   ├── app.config.js          # Expo configuration
│   └── package.json
│
├── docker-compose.yml         # Docker setup
├── package.json              # Root scripts
└── .env                      # Root environment
```

---

## 🔧 Environment Variables Setup

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap-connect
JWT_SECRET=development_jwt_secret_change_in_production
JWT_REFRESH_SECRET=development_refresh_secret_change_in_production
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:8081
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_PROXY_TARGET=http://localhost:5000
```

### Mobile (.env)
```env
API_BASE_URL=http://127.0.0.1:5000/api
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
```

**Note for Mobile Testing:**
- **Web/iOS Simulator**: Use `http://localhost:5000/api`
- **Android Emulator**: Use `http://10.0.2.2:5000/api`
- **Physical Device**: Use `http://<YOUR_COMPUTER_IP>:5000/api`

---

## 🎯 Available Commands

### From Root Directory

```bash
# Install all dependencies
npm install && npm run install-all

# Start all services (backend + frontend + mobile)
npm run dev

# Start individual services
npm run dev:backend      # Backend only (port 5000)
npm run dev:frontend     # Frontend only (port 5173)
npm run dev:mobile       # Mobile only (Expo, port 8081)

# Docker commands
npm run docker:up        # Start all services with Docker
npm run docker:down      # Stop all Docker services
npm run docker:logs      # View Docker logs

# Testing
npm test                 # Run backend tests

# Build for production
npm run build            # Build backend and frontend
```

### Individual Service Commands

```bash
# Backend
cd backend
npm install
npm run dev              # Development
npm start                # Production
npm test                 # Run tests

# Frontend
cd frontend
npm install
npm run dev              # Development
npm run build            # Build for production
npm run preview          # Preview production build

# Mobile
cd mobile
npm install
npm start                # Start Expo dev server
npm run web              # Run in web browser
npm run android          # Run on Android emulator
npm run ios              # Run on iOS simulator
```

---

## ✅ Testing the Setup

### 1. Backend is Running
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "data": {
    "message": "API is healthy",
    "uptime": 123.45,
    "environment": "development",
    "database": { "isConnected": true }
  }
}
```

### 2. Frontend is Running
Open browser: `http://localhost:5173`

### 3. Mobile is Running
- Web: `http://localhost:8081` (in browser)
- Expo: Scan QR code with Expo Go app

---

## 🧪 User Flow Testing

### 1. **Signup**
- Navigate to `http://localhost:5173/register`
- Fill in: Name, Email, Password
- Click "Register"
- Should redirect to Dashboard

### 2. **Login**
- Navigate to `http://localhost:5173/login`
- Enter registered email & password
- Click "Login"
- Should access Dashboard

### 3. **Profile**
- Go to `/profile` page
- View user information
- Upload skills

### 4. **Matches**
- Go to `/matches` page
- View matched users
- See skill offerings

### 5. **Chat**
- Go to `/chat` page
- Start conversation with matched user
- Send/receive messages (real-time via WebSocket)

### 6. **Reviews**
- Go to `/reviews` or rating screen
- Leave review for completed swaps

---

## 🐳 Docker Setup (Optional)

If you have Docker installed:

```bash
# Start all services with Docker
npm run docker:up

# This starts:
# - MongoDB (port 27017)
# - Backend (port 5000)
# - Frontend (port 5173)
```

---

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
# Clean and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules mobile/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json mobile/package-lock.json
npm run install
npm run install-all
npm run dev
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
# macOS: brew services list
# Windows: Services > MongoDB
# Linux: systemctl status mongod

# Or use MongoDB Atlas (cloud):
# Update MONGO_URI in backend/.env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/skillswap-connect
```

### Port Already in Use
```bash
# Find process using port (macOS/Linux)
lsof -i :5000    # Backend
lsof -i :5173    # Frontend
lsof -i :8081    # Mobile

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001        # Backend
VITE_PORT=5174   # Frontend
```

### Expo Mobile App Issues
```bash
# Clear Expo cache
expo start --clear

# Reset project
rm -rf node_modules && npm install

# Tunnel for remote testing
expo start --tunnel
```

---

## 📱 Features Implemented

✅ **Authentication**
- User signup/login with JWT
- Token refresh mechanism
- Secure password hashing

✅ **User Management**
- Profile creation and updates
- Skill management
- Rating system

✅ **Matching**
- Smart user matching based on skills
- Match discovery

✅ **Skill Swaps**
- Create swap requests
- Accept/decline requests
- Swap history

✅ **Real-time Chat**
- WebSocket-based messaging
- One-to-one conversations
- Message history

✅ **Reviews & Ratings**
- User ratings
- Review system
- Rating aggregation

✅ **Security**
- Rate limiting
- CORS protection
- Input validation
- Error handling
- Global error middleware

✅ **API Documentation**
- `/api/health` - Health check endpoint
- All endpoints documented with examples

---

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **CORS** - Configured for allowed origins
- **Helmet** - Security headers
- **Rate Limiting** - 200 requests per 15 minutes
- **Input Validation** - Express-validator
- **Password Hashing** - bcryptjs
- **Error Handling** - No sensitive data exposure

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Matches
- `GET /api/match` - Get matched users

### Swap Requests
- `GET /api/swap` - Get my swap requests
- `POST /api/swap` - Create new swap request
- `GET /api/swap/:id` - Get swap request details
- `PUT /api/swap/:id` - Update swap request

### Chat
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/:userId` - Get messages with user
- `POST /api/chat` - Send message

### Reviews
- `GET /api/review` - Get my reviews
- `GET /api/review/:userId` - Get user reviews
- `POST /api/review` - Create review

### Health
- `GET /api/health` - API health status

---

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first Tailwind CSS
- **Skill Swap Logo** - Teal & dark blue branding
- **Tagline** - "Learn what you need. Teach what you know."
- **Smooth Navigation** - React Router for SPA
- **Loading States** - Proper UX feedback
- **Error Messages** - User-friendly error display
- **Dark Mode Ready** - Tailwind CSS utilities included

---

## 📦 Deployment

### Production Build

```bash
# Build all services
npm run build

# Backend (Node.js)
cd backend
npm run start:prod

# Frontend (Static hosting)
# Serve the frontend/dist folder with Nginx, Apache, or Vercel

# Mobile (Expo)
# Build for iOS: expo build:ios
# Build for Android: eas build --platform android
```

### Environment for Production

Update `.env` files for production:

```env
# backend/.env
NODE_ENV=production
JWT_SECRET=<STRONG_RANDOM_SECRET>
JWT_REFRESH_SECRET=<STRONG_RANDOM_SECRET>
MONGO_URI=<PRODUCTION_MONGO_CONNECTION>
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

---

## 🆘 Support

If you encounter issues:

1. Check the Troubleshooting section above
2. Verify all prerequisites are installed
3. Check environment variable configuration
4. Review backend logs for errors
5. Clear cache and reinstall: `npm run install`
6. Check database connection with `curl http://localhost:5000/api/health`

---

## 📝 Additional Notes

- **API Response Format**: All endpoints return `{ success: boolean, data: {}, message: string }`
- **Authentication**: Send JWT token in `Authorization: Bearer <token>` header
- **Content-Type**: All requests should have `Content-Type: application/json`
- **Timeouts**: API requests timeout after 15 seconds
- **Development**: Hot reload enabled for all services

---

## ✨ Start Building!

Your SkillSwap Connect platform is ready! Run:

```bash
npm install && npm run install-all && npm run dev
```

Then open `http://localhost:5173` to start using the app.

Happy skill swapping! 🚀
