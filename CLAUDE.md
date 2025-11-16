# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile-first visit tracking web application where representatives can record visits with GPS location and photos. Features role-based access control (representatives vs admins) and includes a mock mode for frontend-only testing without a backend.

## Development Commands

### Local Development

**Backend:**
```bash
npm run dev              # Start backend with nodemon (auto-reload)
npm start                # Start backend in production mode
```

**Frontend:**
```bash
npm run client           # Start React dev server (runs from client/ directory)
cd client && npm start   # Alternative: run directly from client directory
```

**Build & Install:**
```bash
npm run install-all      # Install dependencies for both root and client
npm run build            # Build React app for production
```

### Testing with Mock Mode

The app includes a **mock mode** that allows frontend development/testing without a backend:
- Mock mode is **enabled by default** via `localStorage.getItem('mockMode')`
- To toggle: Use the toggle button in the UI or manually set `localStorage.setItem('mockMode', 'false')`
- Mock data is defined in `client/src/utils/mockData.js`
- Mock API implementations are in `client/src/utils/api.js` (lines 80-216)

**Default mock users:**
- Admin: `admin@test.com` / any password
- Rep: `john@test.com` / any password

## Architecture

### Monorepo Structure

```
repsfollowup/
├── server/              # Backend (Node.js/Express)
│   ├── index.js         # Entry point
│   ├── models/          # Mongoose schemas (User, Visit)
│   ├── routes/          # API routes (auth, users, visits)
│   ├── middleware/      # Auth middleware
│   └── config/          # Multer configuration for file uploads
├── client/              # Frontend (React)
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, AdminPanel
│   │   ├── components/  # Navbar, Toast
│   │   ├── contexts/    # AuthContext (role-based access)
│   │   └── utils/       # api.js (mock mode logic), mockData.js
│   └── package.json     # IMPORTANT: react-scripts must be in dependencies
└── uploads/             # User-uploaded photos (gitignored)
```

### Backend (server/)

- **Database**: MongoDB via Mongoose
- **Authentication**: JWT tokens (stored in localStorage on client)
- **File Uploads**: Multer handles image uploads to `/uploads` directory
- **API Routes**:
  - `/api/auth/*` - Login, register, get current user
  - `/api/users/*` - Admin-only user management
  - `/api/visits/*` - Create/read visits (role-based filtering)
- **Static Files**: Serves `/uploads` and React build in production

### Frontend (client/src/)

- **Routing**: React Router v6 with `PrivateRoute` wrapper for auth
- **State Management**: Context API (`AuthContext`) for user session
- **Mock Mode**: Dual API implementation (real vs mock) in `utils/api.js`
  - Checks `localStorage.mockMode` to decide which API to use
  - Mock data stored in localStorage for persistence
- **Role-Based UI**: Different views for admin vs representatives
  - Admins: See all visits, manage users
  - Reps: See only their own visits

### Key Features

1. **Role-Based Access Control**:
   - Implemented in `AuthContext` via `user.role === 'admin'`
   - Routes protected by `PrivateRoute` component with `adminOnly` prop
   - Backend enforces permissions via auth middleware

2. **Mock Mode Toggle**:
   - Controlled by `localStorage.getItem('mockMode')` (default: `'true'`)
   - API layer automatically routes to mock or real backend
   - Allows Netlify static deployments without a backend

3. **Image Handling**:
   - Backend: Multer saves to `/uploads` directory
   - Frontend: FormData with `multipart/form-data` for uploads
   - Mock mode: Uses placeholder Unsplash images

## Environment Variables

### Root `.env` (Backend)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/visit-tracker
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-key
```

### `client/.env` (Frontend)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-key
```

**Note**: If `REACT_APP_API_URL` is not set, the app defaults to mock mode.

## Deployment Configurations

### Netlify (Frontend Only - Mock Mode)
- Builds from `client/` directory
- **Critical**: `react-scripts` must be in `dependencies` (not `devDependencies`)
  - Netlify sets `NODE_ENV=production` which skips `devDependencies`
- Configured in `netlify.toml`:
  - Build: `npm install && npm run build`
  - Publish: `build/`
  - Redirects all routes to `index.html` for React Router

### Railway (Full Stack)
- Template deployment with auto-provisioned MongoDB
- Runs `npm run railway-build` which builds both backend and frontend
- Serves React build from backend in production mode
- Environment variables auto-configured by Railway template

### Render (Backend) + Netlify (Frontend)
- Separate deployments for frontend and backend
- Requires MongoDB Atlas for database
- Frontend env must point to backend URL

## Common Development Patterns

### Adding a New API Endpoint

1. Create route handler in `server/routes/`
2. Add route to `server/index.js`
3. Implement real API call in `client/src/utils/api.js`
4. Create corresponding mock implementation
5. Update `client/src/utils/mockData.js` if needed

### Adding a New Page

1. Create component in `client/src/pages/`
2. Add route to `client/src/App.js` `<Routes>` section
3. Use `<PrivateRoute>` wrapper if authentication required
4. Set `adminOnly={true}` if admin access only

### Database Schema Changes

- Models are in `server/models/`
- After modifying schemas, consider updating mock data in `client/src/utils/mockData.js`
- MongoDB is schema-less but Mongoose enforces the schema

## Important Notes

- **Mock Mode Default**: New users see mock data by default. This is intentional for demo purposes.
- **react-scripts Location**: Must be in `client/package.json` `dependencies` for Netlify builds.
- **Upload Directory**: The `/uploads` folder must exist and be writable by the Node.js process.
- **CORS Configuration**: Backend CORS is set to `process.env.CLIENT_URL` or `*` (wildcard).
- **JWT Storage**: Tokens stored in localStorage (not httpOnly cookies) for simplicity.
- **Google Maps API**: Optional - app works without it but map features disabled.
