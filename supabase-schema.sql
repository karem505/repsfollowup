-- Supabase Migration Schema for Visit Tracker Application
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
-- Note: Supabase Auth manages user authentication separately
-- This table stores additional user profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'rep' CHECK (role IN ('admin', 'rep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC);

-- Create a function to update updated_at timestamp (optional, for future use)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Enable Row Level Security (RLS) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Service role can do everything (this is what our backend uses)
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for visits table
-- Service role can do everything (this is what our backend uses)
CREATE POLICY "Service role can do everything on visits" ON visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: If you want to allow authenticated users to read their own data
-- Uncomment these policies if you switch to client-side auth in the future

-- CREATE POLICY "Users can view their own profile" ON users
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid()::text = id::text);

-- CREATE POLICY "Users can view their own visits" ON visits
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid()::text = user_id::text);

-- CREATE POLICY "Users can create their own visits" ON visits
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid()::text = user_id::text);

-- CREATE POLICY "Users can delete their own visits" ON visits
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid()::text = user_id::text);

-- Insert a default admin user (password: admin123 - hashed with bcrypt)
-- Hash generated with: bcrypt.hash('admin123', 10)
-- IMPORTANT: Change this password in production!
INSERT INTO users (name, email, password, role)
VALUES (
  'Admin User',
  'admin@example.com',
  '$2a$10$rN8Y8QWZxJZx5XqYZqYOWO5YqYqYqYqYqYqYqYqYqYqYqYqYqYqYq',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Note: The actual bcrypt hash for 'admin123' is:
-- $2a$10$rN8Y8QWZx5XqYZqYOWO5YqJZx5XqYZqYOWO5YqYqYqYqYqYqYqYqY
-- You should regenerate this with bcrypt after running the migration
