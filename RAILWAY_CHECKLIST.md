# Railway Deployment Checklist

Use this checklist to ensure smooth deployment to Railway.

## Pre-Deployment

- [ ] Ensure you have a Railway account (https://railway.app)
- [ ] Have your Google Maps API key ready (optional)
- [ ] Review the RAILWAY_DEPLOYMENT.md for detailed instructions

## Railway Setup

### 1. Create New Project

- [ ] Go to Railway dashboard
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose this repository
- [ ] Wait for Railway to detect the repository

### 2. Add PostgreSQL Database

- [ ] In your project, click "New"
- [ ] Select "Database" → "Add PostgreSQL"
- [ ] Wait for PostgreSQL service to provision
- [ ] Note: Railway will create a service named "Postgres"

### 3. Configure Environment Variables

Go to your web service → "Variables" tab and add:

#### Required Variables

- [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
  - Click "New Variable" → "Add Reference" → Select "Postgres.DATABASE_URL"

- [ ] `NODE_ENV` = `production`

- [ ] `JWT_SECRET` = `<generate-random-secret>`
  - Generate with: `openssl rand -base64 32`
  - Or let Railway auto-generate

- [ ] `CLIENT_URL` = `https://${{RAILWAY_PUBLIC_DOMAIN}}`

#### Optional Variables

- [ ] `GOOGLE_MAPS_API_KEY` = `<your-api-key>`
  - Only if you want Google Maps integration

#### Auto-Set Variables (Railway handles these)

- [x] `PORT` - Auto-set by Railway
- [x] `REACT_APP_API_URL` - Set via build args in railway.json
- [x] `REACT_APP_GOOGLE_MAPS_API_KEY` - Set via build args in railway.json

### 4. Verify Configuration Files

Ensure these files exist in your repository:

- [x] `Dockerfile` - Multi-stage Docker build
- [x] `railway.json` - Railway deployment config (Docker mode)
- [x] `railway.toml` - Alternative Railway config
- [x] `.dockerignore` - Build optimization
- [x] `RAILWAY_DEPLOYMENT.md` - Detailed deployment guide

### 5. Deploy

- [ ] Railway will automatically detect changes and start building
- [ ] Monitor the build logs in Railway dashboard
- [ ] Wait for build to complete (3-5 minutes first time)
- [ ] Check for any build errors

### 6. Generate Domain

- [ ] Go to your web service → "Settings"
- [ ] Click "Generate Domain"
- [ ] Note your application URL: `https://your-app.railway.app`

### 7. Verify Deployment

- [ ] Visit your application URL
- [ ] Check health endpoint: `https://your-app.railway.app/api/health`
  - Should return: `{"status":"ok","message":"Server is running"}`
- [ ] Check the logs for any errors
- [ ] Verify database connection in logs

### 8. Test Application

- [ ] Visit the frontend
- [ ] Try to register a new user
- [ ] Test login functionality
- [ ] Test visit tracking features
- [ ] Test image upload (if applicable)

## Post-Deployment

### Create Admin User

Using curl:
```bash
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

- [ ] Create admin user
- [ ] Test admin login
- [ ] Verify admin permissions

### Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure Railway metrics
- [ ] Set up monitoring/alerts
- [ ] Enable Railway auto-deploy on push
- [ ] Review Railway usage and costs

## Troubleshooting

If you encounter issues:

### Build Failures

- [ ] Check build logs in Railway dashboard
- [ ] Verify all required files are in repository
- [ ] Check Dockerfile syntax
- [ ] Verify package.json is valid

### Runtime Errors

- [ ] Check deployment logs
- [ ] Verify DATABASE_URL is set correctly
- [ ] Check all environment variables
- [ ] Test health endpoint

### Database Connection Issues

- [ ] Verify PostgreSQL service is running
- [ ] Check DATABASE_URL references Postgres service
- [ ] Review connection logs
- [ ] Test database connectivity

### Frontend Not Loading

- [ ] Verify build completed successfully
- [ ] Check React build in logs
- [ ] Verify REACT_APP_API_URL was set during build
- [ ] Check browser console for errors

## Important Notes

### Environment Variables

1. **REACT_APP_* variables** must be set during BUILD time
   - Already configured in railway.json build args
   - Don't add these to runtime variables

2. **DATABASE_URL** must reference the Postgres service
   - Use: `${{Postgres.DATABASE_URL}}`
   - Don't hardcode the connection string

3. **JWT_SECRET** should be strong and random
   - Generate: `openssl rand -base64 32`
   - Keep it secret!

### Security

- [ ] Verify JWT_SECRET is strong and unique
- [ ] Ensure DATABASE_URL is not exposed in logs
- [ ] Check CORS settings (CLIENT_URL)
- [ ] Review security headers
- [ ] Keep dependencies updated

### Performance

- [ ] Monitor Railway metrics
- [ ] Check response times
- [ ] Review database query performance
- [ ] Monitor memory usage
- [ ] Check for any performance bottlenecks

## Success Criteria

Your deployment is successful when:

- [x] Build completes without errors
- [x] Health check endpoint returns 200 OK
- [x] Database connection is established
- [x] Frontend loads correctly
- [x] API endpoints respond properly
- [x] User registration works
- [x] Login/authentication works
- [x] All features function as expected

## Support

If you need help:

1. Check the detailed guide: `RAILWAY_DEPLOYMENT.md`
2. Review Railway docs: https://docs.railway.app
3. Join Railway Discord: https://discord.gg/railway
4. Check application logs in Railway dashboard
5. Review GitHub issues for similar problems

## Deployment Complete! 🚀

Once all items are checked, your Visit Tracker application is successfully deployed on Railway!

Next steps:
- Share the URL with your team
- Set up monitoring
- Plan for scaling if needed
- Keep the application updated
