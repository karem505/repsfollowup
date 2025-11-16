# Railway Deployment Guide

This project is configured as a Railway template for easy one-click deployment.

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-url)

## What Gets Deployed

When you deploy this template, Railway will automatically:

1. **Create a MongoDB Database**: A managed MongoDB instance
2. **Deploy the Web Application**: Your Node.js/Express backend + React frontend
3. **Configure Environment Variables**: Automatically set up database connections
4. **Build the Application**: Install dependencies and build the React frontend

## Environment Variables

The following environment variables are automatically configured:

### Auto-Generated
- `MONGODB_URI` - Connected to the MongoDB service
- `JWT_SECRET` - Randomly generated secure token
- `PORT` - Assigned by Railway
- `NODE_ENV` - Set to "production"

### Required Manual Input
- `GOOGLE_MAPS_API_KEY` - You'll be prompted to enter this during deployment
  - Get your API key from: https://console.cloud.google.com/google/maps-apis

### Optional
- `CLIENT_URL` - Automatically set to your Railway domain

## Post-Deployment Steps

### 1. Get Your Application URL
After deployment completes, Railway will provide you with a URL like:
```
https://your-app-name.up.railway.app
```

### 2. Update CLIENT_URL (if needed)
The CLIENT_URL environment variable should be automatically set to your Railway domain. If you need to update it:

1. Go to your Railway project dashboard
2. Click on the "web" service
3. Navigate to "Variables" tab
4. Update `CLIENT_URL` to your deployed domain

### 3. Set Up Google Maps API Key

If you didn't enter it during deployment:

1. Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. In Railway dashboard, go to Variables
3. Add or update `GOOGLE_MAPS_API_KEY`

### 4. Create Admin User

You'll need to create an admin user to access the application:

1. Use the Railway CLI or your application's registration endpoint
2. Or manually create a user in the MongoDB dashboard

## Manual Deployment (Alternative)

If you want to deploy manually instead of using the template:

### Prerequisites
- Railway account ([sign up here](https://railway.app))
- Railway CLI (optional but recommended)

### Steps

1. **Install Railway CLI** (optional)
   ```bash
   npm i -g @railway/cli
   ```

2. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd repsfollowup
   ```

3. **Login to Railway**
   ```bash
   railway login
   ```

4. **Initialize a new project**
   ```bash
   railway init
   ```

5. **Add MongoDB Plugin**
   ```bash
   railway add
   # Select "MongoDB" from the list
   ```

6. **Set environment variables**
   ```bash
   railway variables set JWT_SECRET=your-secure-random-string
   railway variables set GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   railway variables set NODE_ENV=production
   ```

7. **Deploy**
   ```bash
   railway up
   ```

8. **Get your URL**
   ```bash
   railway domain
   ```

## Project Structure

```
.
├── server/              # Express backend
│   ├── index.js        # Main server file
│   ├── routes/         # API routes
│   └── models/         # MongoDB models
├── client/             # React frontend
│   ├── src/           # React source code
│   └── public/        # Static assets
├── railway.json       # Railway deployment config
├── railway.toml       # Railway build config
└── template.yaml      # Railway template definition
```

## Build Process

Railway automatically runs:

1. `npm install` - Install backend dependencies
2. `cd client && npm install` - Install frontend dependencies
3. `cd client && npm run build` - Build React production bundle
4. `npm start` - Start the Express server

The Express server serves both the API and the built React application.

## Database Connection

The MongoDB connection is automatically configured through the `MONGODB_URI` environment variable, which Railway sets based on the MongoDB service.

## Troubleshooting

### Build Failures

If your build fails:

1. Check the build logs in Railway dashboard
2. Ensure all dependencies are listed in `package.json`
3. Verify that `client/package.json` has all frontend dependencies

### Runtime Errors

1. Check the deployment logs in Railway dashboard
2. Verify all environment variables are set correctly
3. Ensure MongoDB service is running

### Database Connection Issues

1. Verify `MONGODB_URI` is set in environment variables
2. Check that MongoDB service is running in Railway dashboard
3. Review connection logs in the deployment logs

## Local Development

To run locally after cloning:

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local values
   ```

3. **Run MongoDB locally**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest

   # Or install MongoDB locally
   ```

4. **Run development server**
   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Support

For Railway-specific issues:
- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Railway Help Center](https://help.railway.app)

For application issues:
- Check the repository's GitHub Issues
