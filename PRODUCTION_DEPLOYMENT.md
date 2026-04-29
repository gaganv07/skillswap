# Production Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
Ensure all critical environment variables are configured for production:

```bash
# Backend (.env)
NODE_ENV=production
PORT=5000
MONGO_URI=<production_mongodb_connection_string>
JWT_SECRET=<strong_random_secret_min_32_chars>
JWT_REFRESH_SECRET=<different_strong_random_secret>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
```

### Security Checklist
- [ ] JWT secrets are strong (min 32 characters, mix of upper/lower/numbers/symbols)
- [ ] CORS_ORIGINS restricted to legitimate frontend domains only
- [ ] Rate limiting configured appropriately for your scale
- [ ] MongoDB connection uses encrypted connection string
- [ ] Helmet security headers are active
- [ ] HTTPS enforced in production
- [ ] Environment variables never committed to version control

## Backend Deployment

### Docker Deployment
```bash
# Build image
docker build -t skillswap-connect-backend:1.0 -f backend/Dockerfile .

# Run container with environment
docker run -d \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://mongo:27017/skillswap-connect \
  -e JWT_SECRET=your_secret \
  -p 5000:5000 \
  skillswap-connect-backend:1.0
```

### Health Check
All deployments should implement health checks:
```bash
curl https://api.yourdomain.com/api/health
# Expected: { "success": true, "data": { "uptime": 3600, "environment": "production", "timestamp": "2026-04-24T..." } }
```

### Scaling
- Use horizontal scaling (multiple backend instances) behind a load balancer
- Use MongoDB replica sets for data redundancy
- Implement caching layer (Redis) for frequently accessed data
- Use CDN for static assets

## Frontend Deployment

### Web Frontend (.env.production)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### Build & Deploy
```bash
# Build optimized production bundle
npm run build

# Deploy dist/ folder to CDN/hosting (Vercel, Netlify, AWS S3+CloudFront)
```

## Mobile App Deployment

### Configuration
The mobile app reads API URL from `app.config.js`:
```javascript
// app.config.js
export default ({ config }) => ({
  ...config,
  extra: {
    apiBaseUrl: 'https://api.yourdomain.com/api',  // Update for production
  },
});
```

### Release Process
```bash
# Build Android APK
eas build --platform android --auto-submit

# Build iOS IPA
eas build --platform ios --auto-submit

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## Monitoring & Logging

### Logs Location
- Backend logs: Winston logs in Docker containers (stream to centralized logging)
- Morgan HTTP logs: Available in Docker stdout

### Key Metrics to Monitor
- API response times (should be < 200ms for most endpoints)
- Error rates (target < 0.5%)
- Database connection pool usage
- Rate limit hits (indicates abuse or traffic spike)
- Token refresh success rate (should be near 100%)

### Recommended Monitoring Stack
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Prometheus + Grafana
- New Relic or DataDog

## Database Optimization

### MongoDB Indexes (Verified)
The following indexes are already created on the User model:
- `email` (unique)
- `skillsOffered.skill`
- `skillsWanted.skill`
- `rating.average` (descending, for sorting)

### Query Optimization
- Pagination default: 10 items per page, max 100
- Use `.lean()` for read-only queries to reduce memory
- Use `.select()` to exclude unnecessary fields (e.g., password, refreshTokens)

## API Rate Limiting

Current configuration:
- Window: 15 minutes (900,000ms)
- Max requests: 200 per window per IP

Adjust for production load:
```bash
# Light traffic
RATE_LIMIT_MAX=100

# Heavy traffic
RATE_LIMIT_MAX=500

# Real-time services
RATE_LIMIT_MAX=1000
```

## Backup & Recovery

### MongoDB Backup Strategy
```bash
# Daily backups
0 2 * * * mongodump --uri="mongodb://user:pass@host:27017/skillswap-connect" --out /backups/$(date +\%Y\%m\%d)

# Restore from backup
mongorestore --uri="mongodb://user:pass@host:27017" /backups/YYYYMMDD
```

### Data Retention
- User data: Indefinite (unless deleted by user)
- Session tokens: 7 days (JWT_REFRESH_EXPIRES_IN)
- Activity logs: 90 days (recommended)
- Chat messages: 30 days (implement archival)

## Disaster Recovery Plan

### RTO/RPO Targets
- Recovery Time Objective (RTO): 1 hour
- Recovery Point Objective (RPO): 15 minutes

### Failover Strategy
1. Database failover: MongoDB replica set automatic failover
2. API failover: Load balancer routes to healthy instances
3. Frontend failover: CDN serves static assets, API calls fallback to secondary endpoint

## Post-Deployment Verification

```bash
# 1. Health check
curl https://api.yourdomain.com/api/health

# 2. Test authentication
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 3. Test CORS headers
curl -H "Origin: https://yourdomain.com" \
  https://api.yourdomain.com/api/health -v

# 4. Verify rate limiting
for i in {1..250}; do curl https://api.yourdomain.com/api/health; done
# Should see rate limit error after 200 requests
```

## Rollback Plan

1. **Code Rollback**: Revert to previous Docker image tag
2. **Database Rollback**: Restore from previous backup
3. **Configuration Rollback**: Revert environment variables

```bash
# Rollback to previous deployment
docker pull skillswap-connect-backend:0.9
docker stop skillswap-connect-backend
docker run -d --name skillswap-connect-backend skillswap-connect-backend:0.9
```

## Performance Targets

| Endpoint | Target | Notes |
|----------|--------|-------|
| Auth endpoints | < 300ms | Includes password hashing |
| Match finding | < 1s | May include complex calculations |
| User search | < 500ms | With pagination |
| Chat messages | < 200ms | Real-time through Socket.io |
| Profile update | < 500ms | Validation + DB write |

---

**Maintenance Window**: Schedule non-breaking updates during off-peak hours (2-4 AM UTC)
**Support Contact**: Escalate issues to devops@company.com
