# Visit Tracker Web App

A mobile-first web application for tracking representative visits to clients with location and photo capture.

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
- MongoDB with Mongoose
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
- MongoDB instance (local or cloud like MongoDB Atlas)
- Google Maps API key

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
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

## Railway Deployment

### Prerequisites
- Railway account
- MongoDB Atlas account (for production database)
- Google Maps API key

### Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Add MongoDB database:
   - Go to Railway dashboard
   - Add a new service > Database > MongoDB
   - Copy the connection string

5. Set environment variables in Railway:
   - Go to your project settings
   - Add these variables:
     ```
     MONGODB_URI=your-railway-mongodb-connection-string
     JWT_SECRET=your-secure-random-string
     NODE_ENV=production
     CLIENT_URL=your-railway-app-url
     GOOGLE_MAPS_API_KEY=your-google-maps-api-key
     ```

6. Deploy:
```bash
railway up
```

### Post-Deployment

1. Get your Railway app URL from the dashboard
2. Update `CLIENT_URL` environment variable with your Railway app URL
3. Create the first admin user using the `/api/auth/register` endpoint

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
