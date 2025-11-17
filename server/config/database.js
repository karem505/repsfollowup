const { Pool } = require('pg');

// Build PostgreSQL connection configuration
const getPoolConfig = () => {
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/visit_tracker';

  console.log('Connecting to PostgreSQL...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL format:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

  const config = {
    connectionString: databaseUrl,
  };

  // Enable SSL for production (Railway, Heroku, etc.)
  if (process.env.NODE_ENV === 'production') {
    config.ssl = {
      rejectUnauthorized: false, // Required for Railway and most cloud providers
    };
  }

  return config;
};

// Create a PostgreSQL connection pool
const pool = new Pool(getPoolConfig());

// Test database connection
pool.on('connect', () => {
  console.log('✓ Successfully connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('✗ Unexpected error on idle PostgreSQL client:', err.message);
  console.error('Error details:', {
    code: err.code,
    severity: err.severity,
    routine: err.routine,
  });
  process.exit(-1);
});

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');

    // Test connection first
    try {
      await pool.query('SELECT NOW()');
      console.log('✓ Database connection test successful');
    } catch (connError) {
      console.error('✗ Database connection test failed');
      console.error('Connection error:', connError.message);

      if (connError.code === '28P01') {
        console.error('\n⚠️  AUTHENTICATION FAILED');
        console.error('This error typically means:');
        console.error('1. The DATABASE_URL environment variable has incorrect credentials');
        console.error('2. In Railway: Ensure DATABASE_URL is linked to ${{Postgres.DATABASE_URL}}');
        console.error('3. The PostgreSQL user password may have changed');
        console.error('\nTo fix in Railway:');
        console.error('- Go to your service → Variables');
        console.error('- Set DATABASE_URL to reference: ${{Postgres.DATABASE_URL}}');
        console.error('- Redeploy your application\n');
      } else if (connError.code === 'ENOTFOUND' || connError.code === 'ECONNREFUSED') {
        console.error('\n⚠️  DATABASE SERVER NOT REACHABLE');
        console.error('This error typically means:');
        console.error('1. PostgreSQL service is not running');
        console.error('2. The database host in DATABASE_URL is incorrect');
        console.error('3. Network/firewall issues\n');
      }

      throw connError;
    }

    // Enable UUID extension
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✓ UUID extension enabled');

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'rep' CHECK (role IN ('admin', 'rep')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table ready');

    // Create visits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        place_name VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Visits table ready');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_visits_created_at ON visits(created_at DESC)');
    console.log('✓ Database indexes created');

    console.log('✓ Database schema initialized successfully');
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  initializeDatabase,
};
