# Supabase Setup Guide

This guide will help you migrate from MongoDB to Supabase.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Step 1: Create Database Schema

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the entire contents of `supabase-schema.sql` into the editor
5. Click "Run" to execute the migration
6. Verify that the `users` and `visits` tables were created in the "Table Editor"

## Step 2: Set Up Storage Bucket for Images

1. Go to "Storage" in the left sidebar
2. Click "Create a new bucket"
3. Name the bucket: `visit-images`
4. Set it as a **public bucket** (so images can be accessed via URL)
5. Click "Create bucket"

### Configure Storage Policies

After creating the bucket, you need to set up storage policies:

1. Click on the `visit-images` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Create the following policies:

#### Policy 1: Public Read Access
- **Policy Name**: Public read access
- **Allowed operations**: SELECT
- **Target roles**: public
- **Policy definition**: `true` (allows anyone to read/view images)

#### Policy 2: Service Role Full Access
- **Policy Name**: Service role full access
- **Allowed operations**: ALL
- **Target roles**: service_role
- **Policy definition**: `true` (allows backend to upload/delete images)

Or use this SQL to create policies quickly:

```sql
-- Storage policies for visit-images bucket
-- Allow public to read images
CREATE POLICY "Public can view visit images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'visit-images');

-- Allow service role to upload images
CREATE POLICY "Service role can upload visit images" ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'visit-images');

-- Allow service role to delete images
CREATE POLICY "Service role can delete visit images" ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'visit-images');
```

## Step 3: Get Your Supabase Credentials

1. Go to "Project Settings" (gear icon in the left sidebar)
2. Click on "API" section
3. Copy the following values:

   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (for client-side, if needed)
   - **service_role key**: `eyJhbGc...` (for backend - KEEP THIS SECRET!)

## Step 4: Update Environment Variables

Update your `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep these existing variables
PORT=5000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**IMPORTANT**: Never commit your `SUPABASE_SERVICE_ROLE_KEY` to version control!

## Step 5: Update .env.example

Update `.env.example` to reflect the new Supabase variables:

```env
PORT=5000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Step 6: Create Default Admin User

After running the schema migration, you need to create an admin user with a proper password hash.

Run this script to generate a bcrypt hash for your admin password:

```javascript
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'your-secure-password';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash:', hash);
}

generateHash();
```

Then update the admin user in Supabase:

```sql
UPDATE users
SET password = 'your-generated-bcrypt-hash'
WHERE email = 'admin@example.com';
```

## Step 7: Deploy to Production

### Environment Variables for Production

In your production environment (Netlify, Render, Railway, etc.), set these environment variables:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
PORT=10000
```

## Differences from MongoDB

| Feature | MongoDB | Supabase |
|---------|---------|----------|
| Database | NoSQL (Documents) | PostgreSQL (Relational) |
| Primary Key | ObjectId | UUID |
| File Storage | Local filesystem | Supabase Storage |
| Relationships | Manual references | Foreign keys with CASCADE |
| Schema | Flexible | Strict with migrations |
| Authentication | Custom JWT | Can use Supabase Auth or custom JWT |

## Migration Checklist

- [ ] Create Supabase project
- [ ] Run `supabase-schema.sql` migration
- [ ] Create `visit-images` storage bucket
- [ ] Configure storage policies
- [ ] Copy Supabase URL and service role key
- [ ] Update `.env` file
- [ ] Generate and update admin user password
- [ ] Test user registration
- [ ] Test user login
- [ ] Test visit creation with image upload
- [ ] Test visit retrieval
- [ ] Deploy to production with new environment variables

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in your `.env` file
- Restart your server after updating environment variables

### Issue: "Row Level Security policy violation"
- Check that RLS policies are correctly set up for both tables
- Make sure you're using the `service_role` key, not the `anon` key

### Issue: "Image upload fails"
- Verify the `visit-images` bucket exists
- Check storage policies allow service role to INSERT
- Ensure bucket is set to public for image URLs to work

### Issue: "Cannot connect to database"
- Verify your Supabase URL is correct
- Check that your project is not paused (Supabase pauses inactive projects)
- Verify network connectivity

## Benefits of Supabase

1. **Managed PostgreSQL**: No need to manage database servers
2. **Built-in Storage**: S3-compatible object storage for images
3. **Real-time subscriptions**: Can add real-time features in the future
4. **Auto-generated APIs**: REST and GraphQL APIs available
5. **Row Level Security**: Better security with PostgreSQL RLS
6. **Better scaling**: Automatic scaling and backups
7. **No ephemeral storage issues**: Files persist across deployments
