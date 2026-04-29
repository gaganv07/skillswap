# SkillSwap Connect - Production-Ready

**Tagline**: "Learn what you need. Teach what you know."

A **production-grade** full-stack skill-swapping platform for connecting people to exchange knowledge and skills.

**Status**: ✅ **PRODUCTION-READY** - All security, logging, error handling, and testing requirements implemented.

---

## 🚀 Quick Start (One Command)

```bash
npm install && npm run install-all && npm run dev
```

Then open: **http://localhost:5173** 🎉

**See [RUN.md](./RUN.md) for detailed run instructions.**

---

## 📚 Documentation

Choose your starting point:

| Document | Purpose |
|----------|---------|
| **[START_HERE.md](./START_HERE.md)** | 30-second quick start |
| **[RUN.md](./RUN.md)** | How to run the project |
| **[SETUP.md](./SETUP.md)** | Complete setup guide with troubleshooting |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | What's implemented, feature checklist |
| **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** | Deployment, scaling, monitoring |
| **[backend/SECURITY_GUIDE.md](./backend/SECURITY_GUIDE.md)** | Security implementation details |

---

## 📦 What's Included

- **Backend**: Node.js + Express + MongoDB with:
  - ✅ JWT authentication with token refresh
  - ✅ Rate limiting (express-rate-limit)
  - ✅ Security headers (Helmet)
  - ✅ Input validation (express-validator)
  - ✅ CORS with origin whitelist
  - ✅ Global error handling
  - ✅ Comprehensive logging (Morgan + Winston)
  - ✅ Database indexing & query optimization
  - ✅ Pagination for all list endpoints

- **Frontend**: React + Vite with environment-based API configuration
- **Mobile**: React Native + Expo with auto token refresh and error handling
- **Docker**: Full containerization for production deployment
- **Tests**: Jest + Supertest with API and unit test coverage
- **Documentation**: Complete deployment, security, and configuration guides

## ⚡ Quick Start Methods

### Method 1: All Services Together (Recommended)
```bash
npm install && npm run install-all && npm run dev
```

Starts: Backend (5000) + Frontend (5173) + Mobile (8081)

### Method 2: Individual Services
```bash
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only  
npm run dev:mobile       # Mobile only
```

### Method 3: Docker
```bash
npm run docker:up
```

---

## 🌐 Access Points

| Service | URL | Port |
|---------|-----|------|
| Web Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:5000/api | 5000 |
| Mobile Web | http://localhost:8081 | 8081 |
| API Health | http://localhost:5000/api/health | 5000 |

---

## ⚡ Quick Start (Old Format)

## 🧪 Testing

```bash
cd skillswap-connect/backend
npm test                # All tests
npm run test:unit      # Unit tests only
npm run test:api       # API tests only
```

## 🐳 Docker

```bash
# Production deployment
docker-compose up -d

# Access
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- MongoDB: localhost:27017
```

## 🔒 Security Features

- ✅ Rate limiting: 200 req/15min per IP
- ✅ JWT tokens: 15min access + 7day refresh
- ✅ Token rotation: Old tokens revoked on refresh
- ✅ Password hashing: bcryptjs with salt 10
- ✅ CORS: Whitelist-based origin validation
- ✅ Input validation: All endpoints validated
- ✅ Helmet headers: XSS, clickjacking, MIME sniffing protection
- ✅ Error handling: No sensitive data in responses

## 📊 Production Monitoring

### Health Check
```bash
curl https://api.yourdomain.com/api/health
# Returns uptime, environment, timestamp
```

### Key Metrics
- Response time: < 500ms target
- Error rate: < 0.5% target
- Token refresh: > 99% success target

## 📚 Documentation

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What's implemented, status checklist
- **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** - Deployment, scaling, monitoring
- **[backend/SECURITY_GUIDE.md](./backend/SECURITY_GUIDE.md)** - Security implementation, best practices
- **[frontend/ENVIRONMENT_CONFIG.md](./frontend/ENVIRONMENT_CONFIG.md)** - Frontend configuration
- **[SkillSwapConnect/ENVIRONMENT_CONFIG.md](./SkillSwapConnect/ENVIRONMENT_CONFIG.md)** - Mobile configuration

## 📋 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/skillswap-connect
JWT_SECRET=your_secure_32char_secret
JWT_REFRESH_SECRET=your_different_32char_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

## 🚀 Production Deployment

### 1. Backend (Docker)
```bash
docker build -t skillswap-connect-backend:1.0 -f backend/Dockerfile .
docker run -d \
  -e NODE_ENV=production \
  -e MONGO_URI=<production_uri> \
  -e JWT_SECRET=<strong_secret> \
  -p 5000:5000 \
  skillswap-connect-backend:1.0
```

### 2. Frontend (Vercel)
```bash
vercel --prod
# Set VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 3. Mobile (EAS)
```bash
eas build --platform all --auto-submit
# Update app.config.js with production API URL
```

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Add frontend URL to `CORS_ORIGINS` in `.env` |
| Mobile can't connect | Use `10.0.2.2` for Android emulator, `localhost` for iOS |
| Rate limit errors | Increase `RATE_LIMIT_MAX` in `.env` |
| Tests failing | Ensure MongoDB running: `mongod` |

## 📈 Performance

- Pagination: 10 items default, 100 max
- Query optimization: Lean queries, field selection, indexes
- Mobile: Lazy loading, reduced re-renders, token caching

## ✅ Pre-Production Checklist

- [ ] JWT secrets are strong (32+ chars)
- [ ] CORS_ORIGINS restricted to your domains
- [ ] HTTPS enabled everywhere
- [ ] MongoDB backups configured
- [ ] Rate limiting tuned for your traffic
- [ ] Monitoring/logging set up
- [ ] Environment variables externalized
- [ ] Tests passing
- [ ] Security audit completed

## 📞 Support

See **[PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)** for:
- Detailed deployment steps
- Monitoring & scaling
- Backup & recovery
- Incident response

See **[backend/SECURITY_GUIDE.md](./backend/SECURITY_GUIDE.md)** for:
- Authentication details
- Input validation rules
- Error handling patterns
- Security best practices

---

**Last Updated**: April 24, 2026  
**System Status**: ✅ Production-Ready (v1.0.0)  
**License**: MIT

### API endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/match`
- `POST /api/swap`
- `GET /api/swap`
- `GET /api/swap/:id`
- `PUT /api/swap/:id`
- `GET /api/chat/conversations`
- `GET /api/chat/:userId`
- `POST /api/chat`
- `POST /api/review`
- `GET /api/review/:userId`
- `GET /api/review/my`

## Frontend

From `frontend/`:

- `npm run dev` - start the React app with Vite
- `npm run build` - build the frontend for production

## Notes

- Use `localStorage` to persist auth token and user data for the frontend.
- The frontend expects the backend API at `http://localhost:5000/api` by default.
- Customize `.env` values before running Docker or local development.
