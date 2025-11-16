# Deployment Guide

## 🚀 Quick Start with Mock Mode (Easiest - No Backend Required!)

**NEW:** The app now includes **Mock Mode** which is enabled by default. This allows you to deploy and test the entire application **without needing a backend server or database**!

### Deploy to Netlify in 2 Minutes

1. **Fork this repository** to your GitHub account

2. **Go to Netlify**:
   - Visit [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your forked repository

3. **Deploy**:
   - Netlify auto-detects the `netlify.toml` configuration
   - Click "Deploy site"
   - **That's it!** Your app is live with mock mode enabled

4. **Access your deployed app**:
   - Use the test accounts shown on the login page:
     - **Rep:** `john@example.com` (any password)
     - **Admin:** `admin@example.com` (any password)
   - All features work without a backend!

### What Mock Mode Includes

- ✅ Full authentication flow
- ✅ Representative dashboard with visit tracking
- ✅ Admin panel with user management
- ✅ Persistent data using browser localStorage
- ✅ Sample data with realistic visits and users
- ✅ Navigation between all screens
- ✅ Photo capture and location features

### When to Use Mock Mode

- **Perfect for**: Testing, demos, development, prototyping
- **Limitations**: Data is stored in browser (not shared between users/devices)

### Switching from Mock Mode to Real Backend

To use a real backend instead of mock mode:

1. Deploy the backend (see "Full Stack Deployment" below)
2. In Netlify dashboard:
   - Go to **Site settings** → **Environment variables**
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.com/api`
3. Trigger a new deployment
4. The app will automatically detect the API URL and disable mock mode

---

## Architecture Overview

This application supports two deployment modes:

### Option 1: Mock Mode (Frontend Only)
- **Frontend (React)**: Deployed on Netlify as a static site
- **No backend required** - uses mock data in browser

### Option 2: Full Stack (Production)
- **Frontend (React)**: Deployed on Netlify as a static site
- **Backend (Node.js/Express)**: Deployed on Render, Railway, or any Node.js hosting platform
- **Database**: MongoDB Atlas or Railway MongoDB

---

## Full Stack Deployment (Optional)

### 1. Deploy the Backend

You'll need to deploy the Node.js backend first. Recommended options:

#### Option A: Deploy Backend to Render (Recommended - Free Tier Available)

1. Go to [Render](https://render.com/) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `visit-tracker-api` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid for better performance)

5. Add environment variables in Render dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visit-tracker
   JWT_SECRET=use-a-long-random-string-here-min-32-characters
   NODE_ENV=production
   CLIENT_URL=https://your-app-name.netlify.app
   PORT=10000
   ```

6. Click "Create Web Service"
7. Copy your backend URL (e.g., `https://your-app-name.onrender.com`)

#### Option B: Deploy Backend to Railway

1. Go to [Railway](https://railway.app/) and create an account
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables (same as above)
5. Copy your backend URL

### 2. Prepare Your MongoDB Database

You have two options:

#### Option A: Use MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. In "Network Access", add `0.0.0.0/0` to allow all IPs
5. Get your connection string
6. Add it to your backend environment variables

#### Option B: Use Railway's MongoDB Plugin (if using Railway for backend)

1. In your Railway project, click "New" → "Database" → "Add MongoDB"
2. Railway will automatically set the `MONGODB_URI` variable

### 3. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials → API Key
5. Restrict the API key:
   - HTTP referrers: Your Netlify domain
   - API restrictions: Maps JavaScript API

### 4. Deploy Frontend to Netlify

#### Method 1: Using Netlify Dashboard (Easiest)

1. Go to [Netlify](https://www.netlify.com/) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/build`
   - **Base directory**: `client`
6. Add environment variables:
   - Click "Site settings" → "Environment variables"
   - Add the following:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```
   (Replace `your-backend-url.onrender.com` with your actual backend URL from step 1)

7. Click "Deploy site"
8. Netlify will build and deploy your frontend
9. Copy your Netlify URL (e.g., `https://your-app-name.netlify.app`)

#### Method 2: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize and link to a new site
netlify init

# Set environment variables
netlify env:set REACT_APP_API_URL "https://your-backend-url.onrender.com/api"
netlify env:set REACT_APP_GOOGLE_MAPS_API_KEY "your-google-maps-api-key"

# Deploy
netlify deploy --prod
```

### 5. Update Backend Configuration

After deploying to Netlify, update your backend's `CLIENT_URL` environment variable with your Netlify URL:

- Go to your backend hosting platform (Render/Railway)
- Update the `CLIENT_URL` variable to: `https://your-app-name.netlify.app`
- Redeploy the backend if necessary

### 6. Update Google Maps API Restrictions

1. Go back to Google Cloud Console
2. Edit your API key restrictions
3. Add your Netlify domain to HTTP referrers:
   - `https://your-app-name.netlify.app/*`

### 7. Create First Admin User

After both frontend and backend are deployed, create your first admin user:

```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "role": "admin"
  }'
```

Or use Postman/Insomnia with:
- URL: `https://your-backend-url.onrender.com/api/auth/register`
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

### 8. Verify Deployment

1. Visit your Netlify app URL: `https://your-app-name.netlify.app`
2. You should see the login page
3. Login with your admin credentials
4. Test creating a new user
5. Test recording a visit (allow camera and location permissions)

## Environment Variables Summary

### Backend Environment Variables
Set these in your backend hosting platform (Render/Railway):

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visit-tracker
JWT_SECRET=use-a-long-random-string-here-min-32-characters
NODE_ENV=production
CLIENT_URL=https://your-app-name.netlify.app
PORT=10000
```

**Generate a secure JWT_SECRET:**
```bash
# On Linux/Mac
openssl rand -base64 32

# Or in Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Frontend Environment Variables
Set these in Netlify dashboard:

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Custom Domain (Optional)

### For Netlify (Frontend):
1. Go to "Domain settings" in Netlify dashboard
2. Click "Add custom domain"
3. Follow instructions to configure DNS

### For Backend:
Most hosting platforms support custom domains. Check their documentation.

## Troubleshooting

### Build Fails on Netlify

- Check the build logs in Netlify dashboard
- Ensure all dependencies are in `client/package.json`
- Verify Node.js version compatibility
- Make sure environment variables are set correctly

### CORS Errors

- Verify `CLIENT_URL` in backend matches your Netlify URL exactly
- Check that the backend CORS configuration allows your Netlify domain
- Ensure there are no trailing slashes in URLs

### API Not Connecting

- Verify `REACT_APP_API_URL` is set correctly in Netlify
- Check that backend is running and accessible
- Test backend health endpoint: `https://your-backend-url.onrender.com/api/health`
- Check browser console for specific error messages

### Database Connection Issues

- Verify `MONGODB_URI` is correct
- For MongoDB Atlas: ensure IP whitelist includes `0.0.0.0/0`
- Check database user permissions
- Verify network access settings in MongoDB Atlas

### Camera/Location Not Working

- Ensure you're accessing the app via HTTPS (Netlify provides this automatically)
- Browser permissions are required for camera and geolocation
- Some browsers require user interaction before accessing camera
- Check browser compatibility

### Google Maps Not Loading

- Verify API key is correct in Netlify environment variables
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled in Google Cloud (required for Maps API)
- Verify API key restrictions allow your Netlify domain
- Check browser console for specific error messages

### Images Not Displaying

- Ensure backend `uploads` directory is writable
- Verify image URLs are correct
- For Render: Note that free tier uses ephemeral storage (files are lost on restart)
  - Consider using cloud storage (AWS S3, Cloudinary, etc.) for production

## Automatic Deployments

### Frontend (Netlify):
- Netlify automatically redeploys when you push to your connected Git branch
- Configure in "Site settings" → "Build & deploy"

### Backend (Render/Railway):
- Both platforms support automatic deployments from Git
- Configure in their respective dashboards

## Monitoring

1. **Netlify**: View deployment logs and analytics in dashboard
2. **Backend Hosting**: Check logs in your platform's dashboard
3. **MongoDB Atlas**: Monitor database usage and performance
4. **Google Cloud Console**: Track API usage and quotas

## Cost Estimates

- **Netlify**: Free tier (100GB bandwidth, unlimited sites)
- **Render**: Free tier available, $7/month for paid plans
- **Railway**: Free tier with $5 credit/month, pay-as-you-go after
- **MongoDB Atlas**: Free tier (512MB), $9/month for 2GB
- **Google Maps API**: $200 free credit/month (~28,000 map loads)

## Performance Optimization

1. **Enable Netlify's CDN**: Automatic for all sites
2. **Image Optimization**: Consider using Netlify Image CDN
3. **Caching**: Configure cache headers in your React build
4. **Database Indexing**: Create indexes in MongoDB for better performance

## Security Checklist

- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Enable HTTPS (automatic on Netlify and most platforms)
- ✅ Restrict Google Maps API key to your domains
- ✅ Use MongoDB Atlas with proper IP whitelist
- ✅ Regular security updates (`npm audit`)
- ✅ Implement rate limiting (consider adding to backend)
- ✅ Regular database backups
- ✅ Use environment variables for all secrets (never commit to Git)

## Backup Strategy

1. **MongoDB Atlas**: Automatic backups included in paid tier
2. **Application Code**: Keep in Git version control
3. **Environment Variables**: Document separately in a secure location

## Updates and Maintenance

### Update Frontend:
```bash
# Make your changes to client code
git add .
git commit -m "Update frontend"
git push origin main
# Netlify auto-deploys
```

### Update Backend:
```bash
# Make your changes to server code
git add .
git commit -m "Update backend"
git push origin main
# Render/Railway auto-deploys
```

## Support Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Google Maps Platform**: https://developers.google.com/maps/documentation

## Common Issues

1. **"Failed to fetch" errors**: Backend not running or CORS misconfigured
2. **Blank page after deployment**: Check browser console, likely API URL issue
3. **Images not persisting**: Use cloud storage instead of local file system
4. **Slow performance**: Check database indexes, consider upgrading hosting tier

If you encounter issues:
1. Check deployment logs (both Netlify and backend)
2. Review MongoDB connection logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Test backend API endpoints directly
