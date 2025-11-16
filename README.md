# Visit Tracker Web App

A mobile-first web application for tracking representative visits to clients with location and photo capture.

## 🚀 Quick Deploy

Deploy this application to Railway with one click:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

For detailed Railway deployment instructions, see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

## Features

### For Representatives
- 📍 Record visits with location capture (GPS)
- 📷 Take photos using device camera or upload images
- 📋 View personal visit history
- 🗺️ View visit locations on Google Maps

### For Admins
- 👥 User management (add/remove users, assign roles)
- 📊 View all representatives' visit history
- 🗺️ Access to all location data and photos
- 🔐 Role-based access control

## Tech Stack

**Backend:**
- Node.js & Express
- MongoDB (Database)
- JWT Authentication
- Multer for file uploads

**Frontend:**
- React 18
- React Router v6
- Google Maps API
- Geolocation API
- MediaDevices API (Camera)

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local installation or cloud service like MongoDB Atlas)
- Google Maps API key

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/visit-tracker
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### Local Development

1. Install dependencies:
```bash
npm install
cd client && npm install
cd ..
```

2. Start the backend server:
```bash
npm run dev
```

3. In a new terminal, start the frontend:
```bash
npm run client
```

4. Access the app at `http://localhost:3000`

### Creating the First Admin User

You can create the first admin user by making a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

Or use a tool like Postman/Insomnia.

## Deployment Options

### Option 1: Railway (Recommended - One-Click Deploy)

Railway provides the easiest deployment with automatic MongoDB setup:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

**See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for complete Railway deployment guide.**

### Option 2: Netlify + Render

**Prerequisites:**
- Netlify account (for frontend hosting)
- Backend hosting service (Render or similar)
- MongoDB Atlas account (for database)
- Google Maps API key

### Quick Deployment Guide

**Frontend (Netlify):**
1. Go to [Netlify](https://www.netlify.com/) and create an account
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - Base directory: `client`
   - Build command: `npm install && npm run build`
   - Publish directory: `build`
5. Add environment variables in Netlify dashboard:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

**Backend (Render recommended):**
1. Go to [Render](https://render.com/) and create an account
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   ```
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-secure-random-string
   NODE_ENV=production
   CLIENT_URL=https://your-app-name.netlify.app
   PORT=10000
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

**For detailed deployment instructions**, see [DEPLOYMENT.md](./DEPLOYMENT.md)

### Post-Deployment

1. Get your Netlify frontend URL and backend URL
2. Update `CLIENT_URL` in backend with Netlify URL
3. Update `REACT_APP_API_URL` in Netlify with backend API URL
4. Create the first admin user using the `/api/auth/register` endpoint

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Visits
- `POST /api/visits` - Create new visit
- `GET /api/visits/my-visits` - Get current user's visits
- `GET /api/visits/all` - Get all visits (admin only)
- `GET /api/visits/user/:userId` - Get specific user's visits (admin only)
- `DELETE /api/visits/:id` - Delete visit

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected routes
- File upload validation
- Input sanitization

## Browser Permissions Required

- **Location**: For capturing GPS coordinates
- **Camera**: For taking photos of visit locations

## Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface
- Camera access with rear-facing camera preference
- Optimized image upload and preview

## Support

For issues and questions, please create an issue in the repository.

## License

ISC
