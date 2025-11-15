# Deployment Guide for Railway

## Quick Deployment Steps

### 1. Prepare Your MongoDB Database

You have two options:

**Option A: Use Railway's MongoDB Plugin**
1. Go to your Railway project
2. Click "New" → "Database" → "Add MongoDB"
3. Railway will automatically set the `MONGODB_URI` variable

**Option B: Use MongoDB Atlas (Recommended for production)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to Railway environment variables

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials → API Key
5. Restrict the API key (optional but recommended):
   - HTTP referrers: Your Railway domain
   - API restrictions: Maps JavaScript API

### 3. Deploy to Railway

**Method 1: Using Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project (or create new)
railway link

# Set environment variables
railway variables set MONGODB_URI="your-mongodb-uri"
railway variables set JWT_SECRET="your-random-secret-key"
railway variables set NODE_ENV="production"
railway variables set GOOGLE_MAPS_API_KEY="your-google-maps-key"

# Deploy
railway up
```

**Method 2: Using GitHub Integration**

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. In Railway Dashboard:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy

3. Add environment variables in Railway dashboard:
   - Go to your project → Variables
   - Add all required variables

### 4. Environment Variables for Railway

Set these in your Railway project settings:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visit-tracker
JWT_SECRET=use-a-long-random-string-here-min-32-characters
NODE_ENV=production
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
CLIENT_URL=https://your-app.up.railway.app
```

**Generate a secure JWT_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. Domain Configuration

After deployment, Railway will give you a domain like: `your-app.up.railway.app`

Update your environment variables:
- Set `CLIENT_URL` to your Railway domain
- Add your domain to Google Maps API restrictions

### 6. Create First Admin User

After deployment, create your first admin user:

```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

Or use Postman/Insomnia with:
- URL: `https://your-app.up.railway.app/api/auth/register`
- Method: POST
- Body (JSON):
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "role": "admin"
}
```

### 7. Verify Deployment

1. Visit your Railway app URL
2. You should see the login page
3. Login with your admin credentials
4. Test creating a new user
5. Test recording a visit (allow camera and location permissions)

## Troubleshooting

### Build Fails

- Check the build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- For MongoDB Atlas: ensure IP whitelist includes `0.0.0.0/0` (all IPs)
- Check database user permissions

### Camera/Location Not Working

- Ensure you're accessing the app via HTTPS (Railway provides this automatically)
- Browser permissions are required for camera and geolocation
- Some browsers require user interaction before accessing camera

### Google Maps Not Loading

- Verify API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled in Google Cloud (required for Maps API)
- Check browser console for specific error messages

### Images Not Displaying

- Check if `uploads` directory is writable
- Verify image URLs are correct in the database
- Check Railway logs for file upload errors

## Monitoring

1. **Railway Dashboard**: View logs and metrics
2. **MongoDB Atlas**: Monitor database usage
3. **Google Cloud Console**: Track API usage and quotas

## Scaling

Railway automatically handles scaling, but you can:
- Upgrade your plan for more resources
- Monitor usage in the dashboard
- Set up alerts for resource limits

## Security Checklist

- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Enable HTTPS (automatic on Railway)
- ✅ Restrict Google Maps API key
- ✅ Use MongoDB Atlas with IP whitelist
- ✅ Regular security updates (`npm audit`)
- ✅ Implement rate limiting (future enhancement)
- ✅ Regular database backups

## Backup Strategy

1. **MongoDB Atlas**: Automatic backups included
2. **Railway Postgres** (if using): Enable backups in settings
3. **Application Code**: Keep in GitHub

## Updates and Maintenance

To update your deployed app:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Railway will automatically redeploy when you push to GitHub (if using GitHub integration).

Or using CLI:
```bash
railway up
```

## Cost Estimates

- **Railway**: Free tier available, $5/month for hobby plan
- **MongoDB Atlas**: Free tier (512MB), $9/month for 2GB
- **Google Maps API**: $200 free credit/month (covers ~28,000 map loads)

## Support

If you encounter issues:
1. Check Railway build and runtime logs
2. Review MongoDB connection logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
