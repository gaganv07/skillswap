# Frontend Environment Configuration

## Overview
The frontend uses Vite and supports environment-based API URL configuration through `.env` files.

## Environment Files

### Development (.env.development)
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_LOG_LEVEL=debug
```

### Staging (.env.staging)
```bash
VITE_API_BASE_URL=https://staging-api.skillswapconnect.com/api
VITE_LOG_LEVEL=info
```

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.skillswapconnect.com/api
VITE_LOG_LEVEL=warn
```

## Usage in Code

Import environment variables in your API client:
```javascript
// src/config/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});
```

## Building for Different Environments

```bash
# Development
npm run dev

# Staging build
VITE_API_BASE_URL=https://staging-api.skillswapconnect.com/api npm run build

# Production build
npm run build  # Uses .env.production

# Preview production build locally
npm run preview
```

## Deployment to CDN

### Vercel
```bash
vercel --env-file .env.production
```

### Netlify
```bash
netlify deploy --prod --dir=dist
```

### AWS S3 + CloudFront
```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

## API Interceptors

The frontend API client includes:

### Request Interceptor
- Automatically adds JWT token from localStorage
- Adds CORS headers
- Sets proper Content-Type

### Response Interceptor
- Handles 401 errors (token refresh)
- Parses standard API response format
- Converts API errors to user-friendly messages

## Error Handling Strategy

```javascript
// src/services/errorHandler.js
export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 429) {
    // Rate limited
    showAlert('Too many requests. Please wait before retrying.');
  } else if (error.response?.status >= 500) {
    // Server error
    showAlert('Server error. Please try again later.');
  } else {
    // Client error
    showAlert(error.response?.data?.message || 'An error occurred');
  }
};
```

## Performance Optimization

### Code Splitting
```javascript
// Routes.jsx - Lazy load pages
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

export const Routes = () => (
  <Suspense fallback={<Loading />}>
    {/* Routes */}
  </Suspense>
);
```

### Image Optimization
- Use WebP format with JPEG fallback
- Lazy load images using `loading="lazy"`
- Use CDN for image serving

### Bundle Analysis
```bash
# Install vite-plugin-visualizer
npm install -D vite-plugin-visualizer

# Generate bundle report
npm run build
# View dist/stats.html
```

## CSP (Content Security Policy)

Add to `index.html` for production:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://api.skillswapconnect.com;">
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing Environment Configuration

```bash
# .env.test
VITE_API_BASE_URL=http://localhost:3001/api-mock
```

Use MSW (Mock Service Worker) for API mocking in tests:
```javascript
// src/mocks/handlers.js
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ success: true });
  }),
];
```
