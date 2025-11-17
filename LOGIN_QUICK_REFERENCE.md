# Login Failure - Quick Reference Guide

## Immediate Troubleshooting Steps

### Step 1: Check Environment Variables
```bash
# Verify these are set:
echo "JWT_SECRET: $JWT_SECRET"
echo "DATABASE_URL: $DATABASE_URL"
echo "CLIENT_URL: $CLIENT_URL"
```

**CRITICAL**: If any are empty, login will fail.

### Step 2: Check Database Connection
```bash
# Try connecting to your database
psql $DATABASE_URL -c "SELECT version();"
```

If this fails, your DATABASE_URL is wrong.

### Step 3: Check Backend Startup
```bash
npm start
# Should see:
# ✓ Successfully connected to PostgreSQL database
# ✓ Database schema initialized successfully
# Server running on port 5000
```

If you don't see these messages, check environment variables.

### Step 4: Check Frontend API URL
In browser console:
```javascript
console.log(process.env.REACT_APP_API_URL)
// Should output your backend URL, NOT "http://localhost:5000/api"
```

---

## Common Errors & Fixes

### Error: "ECONNREFUSED"
**Cause**: Can't connect to database  
**Fix**: Check DATABASE_URL and ensure PostgreSQL is running

### Error: "password authentication failed"
**Cause**: DATABASE_URL has wrong credentials  
**Fix**: Verify credentials or regenerate in Railway

### Error: "CORS error" in browser console
**Cause**: CLIENT_URL not set or misconfigured  
**Fix**: Set CLIENT_URL in backend environment

### Error: "Invalid email or password"
**Cause**: Either user doesn't exist or password is wrong  
**Fix**: Create a test user via `/api/auth/register`

### Error: Login button stays "Signing in..."
**Cause**: Frontend can't reach backend  
**Fix**: Check REACT_APP_API_URL and backend is running

### Error: "Invalid authentication token"
**Cause**: JWT_SECRET changed or not set  
**Fix**: Ensure JWT_SECRET is consistent across all instances

---

## Required Files & Paths

| File | Purpose | Status |
|------|---------|--------|
| `/server/routes/auth.js` | Login endpoint | ✓ Looks good |
| `/server/middleware/auth.js` | JWT verification | ⚠️ Missing JWT_SECRET check |
| `/server/models/User.js` | User database operations | ✓ Looks good |
| `/server/config/database.js` | PostgreSQL connection | ✓ Looks good |
| `/client/src/utils/api.js` | Frontend API client | ⚠️ Missing REACT_APP_API_URL check |
| `/client/src/pages/Login.js` | Login form | ✓ Looks good |

---

## Environment Variable Checklist

### Local Development (.env file)
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/visit_tracker
JWT_SECRET=test-secret-key-at-least-16-chars
CLIENT_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
```

### Railway Production
```
PORT=${{PORT}}  (auto)
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=generate-random-secure-string
CLIENT_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
REACT_APP_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
```

---

## Testing Login Flow

### 1. Register a test user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

### 2. Login with that user
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Should return:
```json
{
  "user": {"id": "...", "name": "Test User", "email": "test@example.com", "role": "admin"},
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Test protected endpoint with token
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Should return your user data.

---

## Critical Issues in Code

### Issue 1: Missing JWT_SECRET validation
**Location**: `/server/middleware/auth.js:13`  
**Problem**: If JWT_SECRET is undefined, jwt.verify() fails silently  
**Risk**: CRITICAL - Login stops working without clear error message

**Fix**: Add at server startup:
```javascript
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

### Issue 2: CORS misconfiguration
**Location**: `/server/index.js:15`  
**Problem**: If CLIENT_URL not set, CORS defaults to '*' which breaks credential requests  
**Risk**: HIGH - Login fails with mysterious CORS error

**Fix**: Set CLIENT_URL in all environments

### Issue 3: Frontend API URL hardcoded to localhost
**Location**: `/client/src/utils/api.js:4`  
**Problem**: In production, defaults to http://localhost:5000/api  
**Risk**: HIGH - Login fails with 404 in production deployment

**Fix**: Ensure REACT_APP_API_URL is passed during build

---

## Railway-Specific Issues

### DATABASE_URL Must Use Service Reference
**Wrong**:
```
DATABASE_URL=postgresql://postgres:password@rail.proxy.rlwy.net:5432/railway
```

**Right**:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### React Build Args
The Dockerfile must pass build arguments:
```dockerfile
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build
```

And Railway must pass them:
```json
{
  "buildCommand": "npm install && cd client && REACT_APP_API_URL=... npm run build"
}
```

---

## When to Check Each Component

| Symptom | Check First |
|---------|------------|
| Server won't start | DATABASE_URL, JWT_SECRET |
| Login API returns 500 | JWT_SECRET, check server logs |
| CORS error in browser | CLIENT_URL, check headers |
| "Loading..." forever | REACT_APP_API_URL, check network tab |
| "Invalid email/password" | Database has users, credentials correct |
| "Invalid authentication token" | JWT_SECRET hasn't changed |

---

## Key Code Snippets

### How Login Works
1. Frontend sends `POST /api/auth/login` with email & password
2. Backend queries database for user by email
3. Backend compares password with bcrypt
4. Backend generates JWT token signed with JWT_SECRET
5. Backend returns token + user data
6. Frontend stores token in localStorage
7. Frontend redirects to dashboard

### Where It Can Fail
- **Step 2**: Database not connected → DATABASE_URL problem
- **Step 4**: JWT_SECRET undefined → login fails
- **Step 5**: Server error → check logs
- **Step 6**: Network error → CORS problem or REACT_APP_API_URL wrong
- **Step 7**: Token invalid → JWT_SECRET changed

