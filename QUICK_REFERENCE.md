# 📌 SkillSwap Connect - Quick Reference Card

## 🚀 START HERE

```bash
npm install && npm run install-all && npm run dev
```

**Then open**: http://localhost:5173

---

## 🌐 Service URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | Web App |
| Backend | http://localhost:5000/api | REST API |
| Mobile | http://localhost:8081 | Expo Web |
| Health | http://localhost:5000/api/health | API Status |

---

## 📁 Key Directories

```
backend/    → Express server (port 5000)
frontend/   → React app (port 5173)
mobile/     → Expo app (port 8081)
```

---

## 🔑 Environment Files

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap-connect
JWT_SECRET=your_secret_here
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:8081
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Mobile (.env)
```env
API_BASE_URL=http://127.0.0.1:5000/api
```

---

## 💻 Individual Service Commands

```bash
# Backend
npm run dev:backend

# Frontend
npm run dev:frontend

# Mobile
npm run dev:mobile
```

---

## 🔧 Docker Commands

```bash
# Start all with Docker
npm run docker:up

# Stop all
npm run docker:down

# View logs
npm run docker:logs
```

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port in use | Kill process: `lsof -i :PORT` |
| MongoDB won't connect | Start MongoDB: `mongod` |
| Module not found | `npm run install` (clean install) |
| CORS error | Check CORS_ORIGINS in .env |

---

## ✅ Verify Setup Works

```bash
# Test API
curl http://localhost:5000/api/health

# Should return JSON with "success": true
```

---

## 📚 Documentation

- **START_HERE.md** - 30-second quick start
- **RUN.md** - How to run the project
- **SETUP.md** - Complete setup & troubleshooting
- **FINAL_SUMMARY.md** - What was fixed

---

## 🎯 Common Tasks

### Create Account
1. Go to http://localhost:5173/register
2. Fill form and signup
3. Auto-login to dashboard

### Login
1. Go to http://localhost:5173/login
2. Enter credentials
3. Access dashboard

### Find Matches
1. Click "Matches" in navbar
2. Browse other users
3. View their skills

### Send Message
1. Click "Chat" in navbar
2. Select user
3. Send message (real-time)

### Rate User
1. Complete a skill swap
2. Go to rating screen
3. Leave review

---

## 📊 Default Credentials (Development)

These work after you create an account:

```
Email: test@example.com
Password: password123
```

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Rate limiting (200 req/15min)
- ✅ CORS protection
- ✅ Encrypted passwords
- ✅ Secure headers

---

## 📱 Tagline

**"Learn what you need. Teach what you know."**

---

## 🚀 Production Deploy

1. Update .env files
2. Change JWT secrets
3. Configure MongoDB Atlas
4. Run: `npm run build`
5. Deploy with Docker or Node.js hosting

---

## 💡 Tips

- Hot reload enabled for all services
- Logs show in console for debugging
- Use browser DevTools for frontend debugging
- Check backend logs for API errors

---

**Version**: 1.0.0  
**Status**: ✅ Production-Ready  
**Last Updated**: April 24, 2026

Print this card and keep it handy! 📌
