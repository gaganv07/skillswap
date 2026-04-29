# 🚀 How to Run SkillSwap Connect

## ⚡ Fastest Way (One Command)

```bash
npm install && npm run install-all && npm run dev
```

**That's it!** This will:
- Install all dependencies
- Start Backend (http://localhost:5000)
- Start Frontend (http://localhost:5173)  
- Start Mobile (http://localhost:8081)

Open your browser to **http://localhost:5173** 🎉

---

## 📋 Before You Start

Ensure you have:

```bash
# Check Node.js
node -v          # Should be v18+

# Check npm
npm -v          # Should be v9+

# Check MongoDB (optional if using local DB)
mongod --version
```

---

## 🎯 Three Ways to Run

### Method 1: All Services Together (Recommended)

```bash
npm install && npm run install-all && npm run dev
```

**Logs will show:**
```
backend  | Server running on port 5000
frontend | VITE v5.4.0  ready in XXX ms
mobile   | Metro Bundler ready
```

---

### Method 2: Run Services Separately

**Terminal 1 - Backend API**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend Web**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Mobile App (Optional)**
```bash
cd mobile
npm install
npm start
```

---

### Method 3: Run Individually

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Mobile only
npm run dev:mobile

# Backend production
npm run start:backend
```

---

## 📱 Access Points

Once running, access the app at:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend (Web) | http://localhost:5173 | Main app |
| Backend API | http://localhost:5000/api | API endpoints |
| Health Check | http://localhost:5000/api/health | Server status |
| Mobile (Web) | http://localhost:8081 | Mobile in browser |
| Mobile (Expo) | Scan QR code | Expo Go app |

---

## ✅ Verify Everything Works

### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "message": "API is healthy",
    "database": { "isConnected": true }
  }
}
```

### 2. Check Frontend Loads
Open: http://localhost:5173

Should show: **SkillSwap Connect** app with "Learn what you need. Teach what you know."

### 3. Test Login/Signup
1. Go to http://localhost:5173/register
2. Create account
3. Should redirect to dashboard

---

## 🛑 Stop Running Services

**To stop all services:**

Press `Ctrl+C` in the terminal running `npm run dev`

Or kill individual processes:

```bash
# Mac/Linux
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

---

## 🆘 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "EADDRINUSE: address already in use :::5000"
**Solution:** Another app is using port 5000
```bash
# Kill process on port 5000
# Mac/Linux: lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
# Windows: netstat -ano | findstr :5000
```

### Issue: "Cannot find module 'mongoose'"
**Solution:** Reinstall dependencies
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "MongoDB connection failed"
**Solution:** Start MongoDB
```bash
# Mac (with Homebrew)
brew services start mongodb-community

# Windows
# Open Services > MongoDB > Start

# Or use MongoDB Atlas (cloud)
# Update backend/.env:
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/skillswap-connect
```

### Issue: "Port 5173 already in use"
**Solution:** Change Vite port in frontend/.env
```env
VITE_PORT=5174
```

### Issue: Mobile won't connect to backend
**Solution:** Update mobile/.env with your computer's IP
```env
# Find your IP
# Mac/Linux: ifconfig | grep inet
# Windows: ipconfig

# Update mobile/.env
API_BASE_URL=http://192.168.X.X:5000/api
```

---

## 🔧 Environment Setup

If you need to customize:

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap-connect
JWT_SECRET=your_secret_key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_PROXY_TARGET=http://localhost:5000
```

**Mobile (.env)**
```env
API_BASE_URL=http://127.0.0.1:5000/api
```

---

## 📊 Project Structure After Running

```
Backend:  localhost:5000     (Express API)
Frontend: localhost:5173     (React)
Mobile:   localhost:8081     (Expo)
Database: localhost:27017    (MongoDB)
```

---

## 🎯 What to Test

1. **Signup** - Create new account at /register
2. **Login** - Login with credentials at /login
3. **Dashboard** - View matches and recommendations
4. **Matches** - Browse potential skill swap partners
5. **Chat** - Message other users (real-time)
6. **Profile** - Update your skills and bio
7. **API Health** - http://localhost:5000/api/health

---

## 📚 More Information

- **Detailed Setup**: See SETUP.md
- **API Reference**: See BACKEND_API.md
- **Troubleshooting**: See TROUBLESHOOTING.md
- **Quick Start**: See START_HERE.md

---

## 🎉 You're Ready!

Run this command and enjoy SkillSwap Connect:

```bash
npm install && npm run install-all && npm run dev
```

Then open: **http://localhost:5173**

Happy learning! 🚀
