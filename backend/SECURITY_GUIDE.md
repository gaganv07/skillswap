# Security Implementation Guide

## Overview
This document outlines all security measures implemented in SkillSwap Connect and best practices for maintaining a secure system in production.

## 1. Authentication & Authorization

### JWT Token Strategy
The system uses a dual-token approach for enhanced security:

- **Access Token**: 15-minute expiration, used for API requests
- **Refresh Token**: 7-day expiration, securely stored in database with hash

```javascript
// Token validation enforces type checking
exports.auth = asyncHandler(async (req, res, next) => {
  const decoded = jwt.verify(token, env.jwtSecret);
  
  // Verify token type is 'access'
  if (decoded.type !== 'access') {
    throw new AppError('Invalid access token', 401);
  }
  
  // Continue with authentication
});
```

### Token Rotation
On each refresh, the old token is revoked and new tokens are issued:

```javascript
const rotateRefreshToken = async (user, refreshToken) => {
  // Verify existing token exists and is not expired
  const tokenExists = (user.refreshTokens || []).some(
    (entry) => entry.tokenHash === hashedToken && entry.expiresAt > new Date()
  );
  
  // Remove old token and issue new ones
  user.refreshTokens = user.refreshTokens.filter(
    (entry) => entry.tokenHash !== hashedToken
  );
  
  return issueAuthTokens(user);
};
```

### Password Security
- **Hashing Algorithm**: bcryptjs with salt rounds 10
- **Minimum Length**: 6 characters (enforced via validator)
- **Never Stored in Cookies**: Uses Authorization header only
- **Never Logged**: Sensitive data filtered from logs

## 2. Input Validation

### Express-Validator Rules
All user inputs are validated before reaching business logic:

```javascript
// Authentication
registerValidator: [
  body('name').trim().isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail(),
  body('password').isLength({ min: 6 }),
  body('passwordConfirm').custom((value, { req }) => 
    value === req.body.password
  ),
]

// Pagination
[
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]
```

### Key Validation Points
1. **Email**: RFC 5322 compliant format
2. **Password**: Minimum 6 characters, must confirm
3. **Skills**: Trimmed, max 50 characters
4. **Pagination**: Limited to 1-100 items per page
5. **Bio**: Maximum 500 characters

### Data Sanitization
- HTML/script injection prevented via `xss` package
- MongoDB injection prevented via parameterized queries
- File uploads validated by type and size

## 3. CORS Configuration

### Origin Whitelist
```javascript
const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
};
```

### Configuration
- **Development**: `localhost:3000`, `localhost:5173`
- **Staging**: `staging.skillswapconnect.com`
- **Production**: `skillswapconnect.com`, `app.skillswapconnect.com`

Environment-based CORS prevents unauthorized frontend access.

## 4. HTTP Security Headers (Helmet)

### Headers Applied
```javascript
app.use(helmet());
```

This automatically sets:
- `Content-Security-Policy`: Restricts resource loading
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Strict-Transport-Security`: Enforces HTTPS
- `X-XSS-Protection`: Legacy XSS protection

## 5. Rate Limiting

### Configuration
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // Max 200 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Applied To
- All `/api` routes
- Prevents: Brute force, DDoS, credential stuffing, spam

### Bypass for Trusted Services
```javascript
// For internal services or specific IPs
const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
app.use(skip: (req) => trustedIPs.includes(req.ip), apiLimiter);
```

## 6. Data Protection

### At Rest
- **MongoDB**: Enable encryption at rest (WiredTiger)
- **Environment Variables**: Use secure key management (AWS Secrets Manager, HashiCorp Vault)
- **Backups**: Encrypted before storage

### In Transit
- **HTTPS/TLS 1.3**: All API communications
- **Certificate Pinning**: Recommended for mobile apps
- **Secure Headers**: HSTS enabled

### Sensitive Data Handling
```javascript
// Password field excluded from queries
const user = await User.findById(userId).select('+password');

// Refresh tokens excluded from responses
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  return obj;
};
```

## 7. Database Security

### MongoDB Best Practices

#### Connection
```bash
# Connection string with authentication
mongodb+srv://user:password@cluster.mongodb.net/skillswap-connect?authSource=admin&ssl=true
```

#### Access Control
- Use role-based access control (RBAC)
- Create application user with minimal permissions
- Use separate users for read/write/admin

#### Indexes for Security
```javascript
// Prevent duplicate emails
userSchema.index({ email: 1 }, { unique: true });

// Speed up searches (reduce query time = reduce exposure)
userSchema.index({ 'skillsOffered.skill': 1 });
userSchema.index({ 'rating.average': -1 });
```

## 8. Logging & Monitoring

### Morgan (HTTP Logs)
```javascript
app.use(morgan(env.isProduction ? 'combined' : 'dev', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));
```

### Winston (Application Logs)
```javascript
const logger = createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
  ),
  transports: [new transports.Console()],
});
```

### What NOT to Log
```javascript
// ❌ Never log
- API keys, tokens, passwords
- Credit card numbers, sensitive PII
- Refresh tokens
- Internal system paths
- Database connection strings

// ✅ Safe to log
- Request method and path
- Response status code
- User ID (not credentials)
- Error messages (without sensitive data)
- Performance metrics
```

## 9. Error Handling

### Standard Error Response
```javascript
{
  success: false,
  data: null,
  message: "User not found",
  error: null  // Or specific error details in dev only
}
```

### Information Disclosure Prevention
```javascript
// Production: Generic messages
if (env.isProduction) {
  return errorResponse(res, {
    message: 'An error occurred',
    error: null
  });
}

// Development: Detailed error traces
if (!env.isProduction) {
  return errorResponse(res, {
    message: err.message,
    error: err.stack
  });
}
```

## 10. API Security Best Practices

### Endpoint Protection
```javascript
// Public endpoints (no auth required)
router.post('/auth/register', validate, register);
router.post('/auth/login', validate, login);
router.get('/api/health', healthCheck);

// Protected endpoints (auth required)
router.put('/users/:id', auth, validate, updateProfile);
router.post('/swap', auth, validate, createSwapRequest);

// Admin endpoints (role-based)
router.delete('/users/:id', auth, adminOnly, deleteUser);
```

### Query Injection Prevention
```javascript
// ❌ Vulnerable
const users = await User.find(JSON.parse(req.query.filter));

// ✅ Safe
const filter = {};
if (req.query.search) {
  filter.$or = [
    { name: { $regex: req.query.search, $options: 'i' } },
    { bio: { $regex: req.query.search, $options: 'i' } },
  ];
}
const users = await User.find(filter);
```

### SSRF Prevention
```javascript
// ❌ Vulnerable: User can control URL
const response = await fetch(req.body.imageUrl);

// ✅ Safe: Whitelist allowed domains
const allowedDomains = ['cdn.example.com', 'images.example.com'];
const url = new URL(req.body.imageUrl);
if (!allowedDomains.includes(url.hostname)) {
  throw new AppError('Invalid image source', 400);
}
```

## 11. Mobile App Security

### Secure Storage
```javascript
// ✅ Use SecureStore for tokens
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('authToken', token);

// ❌ Don't use
AsyncStorage.setItem('authToken', token);  // Unencrypted!
```

### API Configuration
```javascript
// ✅ Use environment-based URLs
const API_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// ❌ Don't hardcode
const API_URL = 'http://actual-server-ip:5000/api';
```

### Certificate Pinning
Implement for production (prevents MITM attacks):
```javascript
import { CertificatePinner } from 'react-native-certificate-pinning';

CertificatePinner.setEnabled(true);
CertificatePinner.addPublicKeyPinningProvider(
  'api.skillswapconnect.com',
  publicKeys
);
```

## 12. Security Checklist

### Pre-Production
- [ ] All environment variables configured
- [ ] JWT secrets are cryptographically random
- [ ] CORS whitelist restricted to legitimate domains
- [ ] HTTPS certificate valid and updated
- [ ] Database backup and encryption enabled
- [ ] Rate limiting tested and configured
- [ ] Password hashing implemented (bcryptjs)
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Logging excludes sensitive data
- [ ] Security headers (Helmet) enabled
- [ ] CSRF token implemented for state-changing requests
- [ ] SQL/NoSQL injection tests passed
- [ ] XSS protection verified
- [ ] Dependency vulnerabilities resolved (`npm audit`)

### Ongoing
- [ ] Weekly dependency updates checked
- [ ] Monthly security headers audit
- [ ] Quarterly penetration testing
- [ ] Incident response plan documented
- [ ] Security logs monitored
- [ ] Access control reviewed quarterly

## 13. Incident Response

### Security Incident Protocol
1. **Isolate**: Disconnect affected systems
2. **Assess**: Determine scope and impact
3. **Notify**: Alert affected users if needed
4. **Remediate**: Fix vulnerability
5. **Test**: Verify fix doesn't break functionality
6. **Deploy**: Roll out fix to production
7. **Monitor**: Watch for related incidents

### Emergency Contacts
- **Security Team**: security@company.com
- **DevOps**: devops@company.com
- **Legal**: legal@company.com (for data breach notification)

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- MongoDB Security: https://docs.mongodb.com/manual/security/
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
