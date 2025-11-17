# Fixing PostgreSQL Authentication Error in Railway

If you're seeing the error **"password authentication failed for user 'postgres'"**, this guide will help you fix it.

## The Problem

This error occurs when your application can't authenticate with the PostgreSQL database. In Railway, this typically happens when:

1. The `DATABASE_URL` environment variable isn't properly linked to your PostgreSQL service
2. You're using hardcoded credentials instead of Railway's service references
3. The PostgreSQL service credentials have changed

## The Solution

### Step 1: Verify PostgreSQL Service is Running

1. Go to your Railway dashboard
2. Open your project
3. Check that you have a **Postgres** service running (it should have a purple icon)
4. If you don't have one, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**

### Step 2: Link DATABASE_URL to PostgreSQL Service

This is the most important step:

1. In your Railway dashboard, click on your **web service** (not the Postgres service)
2. Go to the **"Variables"** tab
3. Look for `DATABASE_URL`
4. **Delete it if it exists** (click the trash icon)
5. Click **"+ New Variable"**
6. Add a new variable:
   - **Variable Name**: `DATABASE_URL`
   - **Value**: Click the dropdown and select **"Reference"**
   - Select: `Postgres` → `DATABASE_URL`
   - It should show: `${{Postgres.DATABASE_URL}}`

**Important**: The value should be `${{Postgres.DATABASE_URL}}`, NOT a hardcoded connection string.

### Step 3: Verify Other Required Variables

Make sure these variables are also set in your web service:

```
NODE_ENV=production
PORT=${{PORT}}  (Railway sets this automatically)
CLIENT_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
REACT_APP_API_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api
JWT_SECRET=<generate-a-random-secret>
```

### Step 4: Redeploy

1. After setting the variables, Railway should automatically redeploy
2. If not, click **"Deploy"** → **"Redeploy"**
3. Watch the deployment logs for the new connection messages

### Step 5: Verify the Fix

Check your deployment logs. You should see:

```
Connecting to PostgreSQL...
Environment: production
Database URL format: postgresql://postgres:****@<host>:<port>/<database>
Initializing database schema...
✓ Database connection test successful
✓ UUID extension enabled
✓ Users table ready
✓ Visits table ready
✓ Database indexes created
✓ Database schema initialized successfully
```

If you still see errors, the logs will now show helpful diagnostics.

## Common Mistakes to Avoid

### ❌ Don't Do This:
```
DATABASE_URL=postgresql://postgres:password@host:5432/railway
```
This hardcodes credentials that will become invalid.

### ✅ Do This Instead:
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
This dynamically references the PostgreSQL service.

## Alternative: Using Railway CLI

If you prefer using the Railway CLI:

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Set the DATABASE_URL reference
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'

# Verify variables
railway variables

# Redeploy
railway up
```

## Troubleshooting

### Still Getting Authentication Errors?

1. **Check PostgreSQL service status**:
   - Go to Postgres service → Metrics
   - Ensure it's running and healthy

2. **Regenerate PostgreSQL credentials** (last resort):
   - Go to Postgres service → Settings
   - Click "Restart" to regenerate credentials
   - The new DATABASE_URL will be automatically updated
   - Your web service will pick up the new reference

3. **Check logs for specific error codes**:
   - `28P01`: Authentication failed (wrong password/username)
   - `ENOTFOUND`: Can't find database host
   - `ECONNREFUSED`: Database not accepting connections

### Database Connection Test

To manually test your database connection in Railway:

1. Open your web service
2. Go to **"Settings"** → **"Deploy"** → **"Run"**
3. Enter this command:
   ```bash
   node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()', (err, res) => { console.log(err, res.rows); pool.end(); });"
   ```

If this works, your DATABASE_URL is correctly configured.

## Understanding Railway Service References

Railway uses service references to automatically manage credentials:

- `${{Postgres.DATABASE_URL}}` - Full PostgreSQL connection string
- `${{Postgres.PGHOST}}` - PostgreSQL host
- `${{Postgres.PGPORT}}` - PostgreSQL port
- `${{Postgres.PGUSER}}` - PostgreSQL username
- `${{Postgres.PGPASSWORD}}` - PostgreSQL password
- `${{Postgres.PGDATABASE}}` - PostgreSQL database name

Always use `${{Postgres.DATABASE_URL}}` as it includes all connection parameters with SSL configuration.

## Updated Code Features

The updated `server/config/database.js` now includes:

1. **Better logging**: Shows connection attempts with masked passwords
2. **Error diagnostics**: Provides specific help for authentication errors
3. **Connection testing**: Tests connection before schema initialization
4. **Helpful error messages**: Guides you to fix common issues

## Need More Help?

- Check Railway deployment logs: Service → Deployments → Latest → Logs
- Railway Documentation: https://docs.railway.app/databases/postgresql
- Railway Discord: https://discord.gg/railway

## Summary

The key fix is ensuring your `DATABASE_URL` environment variable in Railway references the PostgreSQL service:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Not a hardcoded connection string. This ensures your app always has the correct, up-to-date credentials.
