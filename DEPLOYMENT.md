# 🚀 Deployment Guide

This guide covers various deployment options for the OTT Streaming Platform.

## 📋 Pre-deployment Checklist

- [ ] Test the application locally
- [ ] Verify all environment variables are set
- [ ] Check that the M3U playlist URL is accessible
- [ ] Ensure CORS is properly configured
- [ ] Test on multiple devices and browsers
- [ ] Optimize bundle size and performance

## 🌐 Vercel (Recommended)

Vercel provides excellent support for full-stack applications with serverless functions.

### Setup Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Configuration

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Variables

Set in Vercel dashboard:
- `NODE_ENV=production`
- `VITE_API_URL=https://your-app.vercel.app`

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001

CMD ["node", "server/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  ott-app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ott-app
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t ott-streaming-platform .

# Run container
docker run -p 3001:3001 -e NODE_ENV=production ott-streaming-platform

# Using Docker Compose
docker-compose up -d
```

## ☁️ AWS Deployment

### AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   eb init
   ```

3. **Create Environment**
   ```bash
   eb create production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

### AWS Lambda + CloudFront

Use the Serverless Framework:

```yaml
# serverless.yml
service: ott-streaming-platform

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  api:
    handler: server/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

resources:
  Resources:
    CloudFrontDistribution:
      Type: AWS::CloudFront::Distribution
      Properties:
        DistributionConfig:
          Origins:
            - DomainName: !GetAtt ApiGatewayRestApi.DomainName
              Id: api
              CustomOriginConfig:
                HTTPPort: 443
                OriginProtocolPolicy: https-only
          DefaultCacheBehavior:
            TargetOriginId: api
            ViewerProtocolPolicy: redirect-to-https
```

## 🌊 Netlify

### Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### Netlify Functions

Create `netlify/functions/api.js`:

```javascript
const express = require('express');
const serverless = require('serverless-http');
const app = require('../../server/index.js');

module.exports.handler = serverless(app);
```

### Redirects

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 Nginx Configuration

For self-hosted deployments:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Static files
    location / {
        root /var/www/ott-streaming-platform/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Performance Optimization

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Or use webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js
```

### Optimization Techniques

1. **Code Splitting**
   ```typescript
   // Lazy load pages
   const Player = lazy(() => import('./pages/Player'));
   const Favorites = lazy(() => import('./pages/Favorites'));
   ```

2. **Image Optimization**
   ```typescript
   // Use WebP format with fallback
   <picture>
     <source srcSet={`${logo}.webp`} type="image/webp" />
     <img src={logo} alt={name} />
   </picture>
   ```

3. **Service Worker Caching**
   ```javascript
   // Cache API responses
   self.addEventListener('fetch', event => {
     if (event.request.url.includes('/api/playlist')) {
       event.respondWith(
         caches.match(event.request).then(response => {
           return response || fetch(event.request);
         })
       );
     }
   });
   ```

## 🔍 Monitoring & Analytics

### Error Tracking

```typescript
// Sentry integration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

```typescript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Analytics

```typescript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href,
});
```

## 🔒 Security Considerations

### Environment Variables

Never commit sensitive data:

```bash
# .env.example
VITE_API_URL=http://localhost:3001
SENTRY_DSN=your_sentry_dsn_here
GA_MEASUREMENT_ID=your_ga_id_here
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  media-src 'self' https:;
  connect-src 'self' https:;
">
```

### HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check server CORS configuration
   - Verify API URL in environment variables
   - Test with browser dev tools

2. **Video Playback Issues**
   - Ensure HLS.js is loaded
   - Check Video.js configuration
   - Test stream URLs manually

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

### Debug Commands

```bash
# Check build output
npm run build 2>&1 | tee build.log

# Test production build locally
npm run preview

# Check bundle size
npm run build -- --analyze

# Lint and fix issues
npm run lint -- --fix
```

## 📈 Scaling Considerations

### CDN Integration

```javascript
// Use CDN for static assets
const CDN_URL = process.env.VITE_CDN_URL || '';

export const getAssetUrl = (path) => {
  return `${CDN_URL}${path}`;
};
```

### Load Balancing

```nginx
upstream ott_backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}

server {
    location /api/ {
        proxy_pass http://ott_backend;
    }
}
```

### Database Integration

For user accounts and analytics:

```javascript
// Redis for session storage
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// PostgreSQL for user data
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

---

Choose the deployment method that best fits your needs and infrastructure. For most use cases, Vercel or Netlify provide the easiest setup with excellent performance.