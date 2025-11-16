# PostgreSQL Migration Guide

This application has been migrated from MongoDB to PostgreSQL.

## What Changed

### Database
- **Before**: MongoDB with Mongoose ODM
- **After**: PostgreSQL with node-postgres (pg) driver

### Key Changes

1. **Database Connection**
   - MongoDB connection string replaced with PostgreSQL connection string
   - Environment variable changed from `MONGODB_URI` to `DATABASE_URL`

2. **Models**
   - Converted from Mongoose schemas to plain JavaScript classes
   - Using raw SQL queries with parameterized statements for security
   - UUIDs instead of MongoDB ObjectIds

3. **Data Types**
   - User IDs: `ObjectId` → `UUID`
   - Timestamps: `Date` → `TIMESTAMP WITH TIME ZONE`
   - Nested location object flattened to `latitude` and `longitude` columns

## Setup Instructions

### Local Development

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt-get install postgresql
   sudo systemctl start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   psql postgres

   # Create database
   CREATE DATABASE visit_tracker;

   # Exit
   \q
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and set DATABASE_URL
   # DATABASE_URL=postgresql://localhost:5432/visit_tracker
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

   The database schema will be automatically initialized on first startup.

### Production Deployment

#### Railway

1. Add PostgreSQL service to your project
2. Railway will automatically set the `DATABASE_URL` environment variable
3. Deploy your application
4. The schema will be initialized automatically on first startup

#### Heroku

1. Add PostgreSQL add-on:
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

2. Deploy:
   ```bash
   git push heroku main
   ```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'rep' CHECK (role IN ('admin', 'rep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Visits Table
```sql
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## API Changes

The API endpoints remain the same, but the response format has minor changes:

### User Object
```json
{
  "id": "uuid-string",          // Changed from _id (ObjectId)
  "name": "John Doe",
  "email": "john@example.com",
  "role": "rep",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Visit Object
```json
{
  "id": "uuid-string",           // Changed from _id (ObjectId)
  "user_id": "uuid-string",      // Changed from userId (ObjectId)
  "place_name": "Store Name",
  "latitude": 40.7128,           // Flattened from location.latitude
  "longitude": -74.0060,         // Flattened from location.longitude
  "image_url": "/uploads/...",   // Changed from imageUrl
  "created_at": "2024-01-01T00:00:00.000Z",
  "user_name": "John Doe",       // Joined from users table
  "user_email": "john@example.com" // Joined from users table
}
```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Verify DATABASE_URL format:
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```

3. Check PostgreSQL is accepting connections:
   ```bash
   psql postgresql://localhost:5432/visit_tracker
   ```

### Schema Issues

If tables are not created:

1. Check server logs for errors during startup
2. Manually run schema:
   ```bash
   psql visit_tracker < server/schema.sql
   ```

## Migration from MongoDB

If you have existing data in MongoDB that you need to migrate:

1. Export MongoDB data:
   ```bash
   mongoexport --db=visit-tracker --collection=users --out=users.json
   mongoexport --db=visit-tracker --collection=visits --out=visits.json
   ```

2. Create a migration script to transform and import the data
3. Note: ObjectIds will need to be converted to UUIDs

## Security Notes

- All SQL queries use parameterized statements to prevent SQL injection
- Passwords are hashed using bcrypt (same as before)
- Row-level security can be enabled for additional protection
- SSL connections supported in production

## Support

For issues or questions:
- Check server logs for detailed error messages
- Verify PostgreSQL connection with `psql`
- Ensure all environment variables are set correctly
