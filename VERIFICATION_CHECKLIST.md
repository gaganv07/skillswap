# ✅ SkillSwap Connect - Verification Checklist

## Pre-Installation

- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] MongoDB running or MongoDB Atlas configured
- [ ] Git installed (optional)
- [ ] All ports available: 5000, 5173, 8081, 27017

---

## Installation Verification

### Step 1: Clone/Prepare Project
- [ ] Project folder accessible at `c:\Users\LENOVO\Downloads\Quick Share\skillswap-connect`
- [ ] `.env` files exist in backend, frontend, mobile
- [ ] All `package.json` files present

### Step 2: Install Dependencies
```bash
npm install && npm run install-all
```
- [ ] Root dependencies installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed  
- [ ] Mobile dependencies installed
- [ ] No critical npm warnings

### Step 3: Environment Configuration
- [ ] `backend/.env` has MONGO_URI configured
- [ ] `backend/.env` has JWT_SECRET and JWT_REFRESH_SECRET
- [ ] `frontend/.env` has VITE_API_URL
- [ ] `mobile/.env` has API_BASE_URL
- [ ] All `.env` files are not tracked by git

---

## Service Startup Verification

### Backend Service
```bash
npm run dev:backend
```
- [ ] Server starts without errors
- [ ] Listens on port 5000
- [ ] MongoDB connection successful
- [ ] Logs show: "Server running on port 5000"
- [ ] No "Cannot find module" errors

### Frontend Service
```bash
npm run dev:frontend
```
- [ ] Vite dev server starts
- [ ] Listens on port 5173
- [ ] Logs show: "VITE v5.4.0 ready"
- [ ] No compilation errors
- [ ] Can access http://localhost:5173

### Mobile Service
```bash
npm run dev:mobile
```
- [ ] Expo dev server starts
- [ ] Listens on port 8081
- [ ] Logs show "Metro Bundler ready"
- [ ] QR code displayed for Expo Go

---

## API Verification

### Health Check
```bash
curl http://localhost:5000/api/health
```

Response should contain:
```json
{
  "success": true,
  "data": {
    "message": "API is healthy",
    "database": { "isConnected": true }
  }
}
```

- [ ] Status code 200
- [ ] Success field is true
- [ ] Database connection shows true
- [ ] Timestamp present

---

## Frontend UI Verification

Open: http://localhost:5173

### Home/Login Page
- [ ] Page loads without errors
- [ ] SkillSwap logo visible
- [ ] Tagline visible: "Learn what you need. Teach what you know."
- [ ] Register and Login links present
- [ ] Responsive on mobile view

### Registration Flow
- [ ] Navigate to /register
- [ ] Form renders correctly
- [ ] Can enter: Name, Email, Password
- [ ] Password confirmation field works
- [ ] Submit button functional
- [ ] Error handling works

### Login Flow
- [ ] Navigate to /login
- [ ] Form renders correctly
- [ ] Can enter: Email, Password
- [ ] Submit button functional
- [ ] Error messages display correctly

### Dashboard Page
- [ ] After login, redirects to dashboard
- [ ] User welcome message displays
- [ ] Matches section loads
- [ ] Navigation menu shows all links

### Navigation
- [ ] Navbar displays at top
- [ ] Logo links to home
- [ ] All navigation links work:
  - [ ] Dashboard
  - [ ] Matches
  - [ ] Chat
  - [ ] Profile
  - [ ] Logout

---

## Backend API Endpoints

### Authentication
- [ ] `POST /api/auth/register` - creates user
- [ ] `POST /api/auth/login` - returns tokens
- [ ] `GET /api/auth/me` - returns current user
- [ ] `POST /api/auth/refresh` - refreshes token

### Users
- [ ] `GET /api/users` - lists all users
- [ ] `GET /api/users/:id` - gets user profile
- [ ] `PUT /api/users/:id` - updates profile

### Matches
- [ ] `GET /api/match` - returns matched users

### Chat
- [ ] `GET /api/chat/conversations` - lists chats
- [ ] `POST /api/chat` - sends message

---

## Database Verification

### MongoDB Connection
```bash
mongosh mongodb://localhost:27017/skillswap-connect
```

- [ ] Connected successfully
- [ ] Database `skillswap-connect` exists
- [ ] Collections exist:
  - [ ] users
  - [ ] swaps
  - [ ] messages
  - [ ] reviews

### Data Integrity
- [ ] Users table has proper schema
- [ ] At least one test user exists
- [ ] User documents have required fields

---

## Error Handling Verification

### Missing Dependencies
```bash
npm run install  # Should resolve
```
- [ ] No "Cannot find module" errors
- [ ] All imports resolve correctly

### Port Conflicts
- [ ] Ports 5000, 5173, 8081 available
- [ ] Or change in `.env` files

### Database Errors
- [ ] MongoDB running
- [ ] Connection string correct
- [ ] No auth errors

### CORS Errors
- [ ] Frontend URL in CORS_ORIGINS
- [ ] Browser console has no CORS warnings

---

## Security Verification

### JWT Authentication
- [ ] Tokens stored in localStorage (frontend)
- [ ] Tokens sent in Authorization header
- [ ] Token refresh working
- [ ] Expired tokens rejected

### CORS
- [ ] Only allowed origins can access
- [ ] Credentials properly configured
- [ ] Preflight requests handled

### Input Validation
- [ ] Empty fields rejected
- [ ] Invalid emails rejected
- [ ] Short passwords rejected

### Rate Limiting
- [ ] Configured on backend
- [ ] Rate limit headers present
- [ ] Excessive requests throttled

---

## Performance Verification

### Response Times
- [ ] API responses < 500ms
- [ ] Frontend renders < 2s
- [ ] No console errors

### Resource Usage
- [ ] Backend memory usage normal
- [ ] Frontend bundle reasonably sized
- [ ] No memory leaks on navigation

---

## Mobile App Verification

### Expo Web
- [ ] Open http://localhost:8081
- [ ] App renders correctly
- [ ] Can navigate screens

### Expo Go (Physical Device)
- [ ] Scan QR code in Expo dev server
- [ ] App opens in Expo Go
- [ ] API calls work with correct IP

---

## One-Command Verification

```bash
npm install && npm run install-all && npm run dev
```

- [ ] All three services start simultaneously
- [ ] No port conflicts
- [ ] Concurrently shows all three logs
- [ ] No critical errors in any log

---

## Final Acceptance Criteria

✅ **All of the following must be true:**

1. [ ] `npm install && npm run install-all && npm run dev` completes successfully
2. [ ] Backend API responds at `http://localhost:5000/api/health`
3. [ ] Frontend loads at `http://localhost:5173`
4. [ ] User can signup and login
5. [ ] Dashboard displays without errors
6. [ ] Navigation works between pages
7. [ ] API calls execute successfully
8. [ ] No "Cannot find module" errors
9. [ ] Database connection successful
10. [ ] Console has no critical errors

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| `npm: command not found` | Install Node.js from nodejs.org |
| `EADDRINUSE` (port in use) | Kill process: `lsof -i :PORT` then `kill -9 PID` |
| `Cannot find module` | Run `npm run install` to clean install |
| `MongoDB not connecting` | Start MongoDB or update connection string |
| `CORS errors` | Add frontend URL to CORS_ORIGINS in .env |
| `Mobile can't reach backend` | Update mobile/.env with correct IP |
| `Port 5173 already in use` | Change VITE_PORT in frontend/.env |

---

## Sign-Off

**Project Status**: ✅ **PRODUCTION-READY**

When all checkboxes are completed:
- ✅ Installation verified
- ✅ All services running
- ✅ Features tested
- ✅ APIs functioning
- ✅ Database connected
- ✅ Security configured

**Ready for production deployment!** 🚀

---

**Date Completed**: _________________  
**Verified By**: _________________  
**Version**: 1.0.0  
**Date**: April 24, 2026
