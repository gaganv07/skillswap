# 🚀 START HERE - SkillSwap Connect

## What is This?

SkillSwap Connect is a **platform for learning and teaching skills** - connecting people who want to exchange knowledge with each other.

**Tagline**: "Learn what you need. Teach what you know."

---

## ⚡ Quick Start (30 seconds)

### Option 1: Run Everything at Once

From the project root, run:

```bash
npm install && npm run install-all && npm run dev
```

This starts:
- ✅ Backend API (http://localhost:5000)
- ✅ Frontend Web App (http://localhost:5173)
- ✅ Mobile App (Expo, http://localhost:8081)

### Option 2: Run Services Separately

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - Mobile (optional)
cd mobile
npm install
npm start
```

---

## 🌐 Access the App

1. **Web Frontend**: Open browser → `http://localhost:5173`
2. **Mobile (Web version)**: Open browser → `http://localhost:8081`
3. **Mobile (Expo app)**: Scan QR code with Expo Go app

---

## 📋 Requirements

Before starting, make sure you have:

1. **Node.js** v18+ installed ([Download](https://nodejs.org/))
2. **MongoDB** running ([Local](https://www.mongodb.com/try/download/community) or [Cloud](https://www.mongodb.com/cloud/atlas))

Verify:
```bash
node --version
npm --version
```

---

## 🎯 Test the Features

### 1. Create Account
- Go to `/register`
- Sign up with email & password

### 2. Login
- Go to `/login`
- Use your credentials

### 3. View Dashboard
- See matched users
- View available skills

### 4. Browse Matches
- Go to `/matches`
- See users with complementary skills

### 5. Connect & Chat
- Message users
- Real-time messaging (WebSocket)

### 6. Rate Users
- Leave reviews after swaps
- Build reputation

---

## 📁 What's Inside

```
skillswap-connect/
├── backend/    → Express API Server
├── frontend/   → React Web App
├── mobile/     → React Native App
└── SETUP.md    → Detailed setup guide
```

---

## 🆘 Common Issues

**MongoDB won't connect?**
- Make sure MongoDB is running
- Check connection string in `backend/.env`
- Use MongoDB Atlas cloud for easier setup

**Port 5000/5173 already in use?**
```bash
# Kill the process using the port
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000 | grep LISTEN
```

**Dependencies not installing?**
```bash
npm run install  # Cleans and reinstalls everything
```

---

## 📚 Learn More

- See **SETUP.md** for detailed configuration
- Check **README.md** for project overview
- Review **BACKEND_API.md** for API documentation

---

## 🎉 You're Ready!

Run the one-command startup:

```bash
npm install && npm run install-all && npm run dev
```

Then visit: **http://localhost:5173**

Happy skill swapping! 🚀
