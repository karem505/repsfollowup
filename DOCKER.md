# Docker Deployment Guide

This guide explains how to deploy the Visit Tracker application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose 2.0 or higher

### Installing Docker

#### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### macOS
Download and install [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)

#### Windows
Download and install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

## Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd repsfollowup
```

### 2. Configure Environment Variables
```bash
cp .env.docker .env
```

Edit `.env` and update the following values:
- `POSTGRES_PASSWORD`: Set a strong password for PostgreSQL
- `JWT_SECRET`: Set a random secure string for JWT token generation
- `GOOGLE_MAPS_API_KEY`: (Optional) Add your Google Maps API key

### 3. Start the Application
```bash
docker-compose up -d
```

This command will:
- Pull the PostgreSQL image
- Build the backend and frontend containers
- Initialize the database with the schema
- Start all services in the background

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### 5. Check Service Status
```bash
docker-compose ps
```

All services should show as "Up" and healthy.

## Docker Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stop the Application
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```
**Warning**: This will delete all database data!

### Restart Services
```bash
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild Images
```bash
# Rebuild all images
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend
```

### Execute Commands in Containers
```bash
# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec postgres psql -U postgres -d visit_tracker

# Run database migrations
docker-compose exec postgres psql -U postgres -d visit_tracker -f /docker-entrypoint-initdb.d/init.sql
```

## Architecture

The Docker setup consists of three main services:

### 1. PostgreSQL Database (`postgres`)
- Image: `postgres:15-alpine`
- Port: 5432
- Volume: `postgres_data` for data persistence
- Auto-initializes schema from `supabase-schema.sql`

### 2. Backend API (`backend`)
- Built from: `Dockerfile.backend`
- Port: 5000
- Technology: Node.js/Express
- Connects to PostgreSQL
- Handles file uploads (persisted in `./uploads` volume)

### 3. Frontend (`frontend`)
- Built from: `Dockerfile.frontend`
- Port: 80
- Technology: React served with Nginx
- Proxies API requests to backend
- Multi-stage build for optimized image size

## Environment Variables

### Database
- `POSTGRES_PASSWORD`: PostgreSQL password (default: postgres123)

### Backend
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: Frontend URL for CORS
- `DATABASE_URL`: Automatically set to connect to the postgres service

### Frontend
- `REACT_APP_API_URL`: Backend API URL (optional)
- `GOOGLE_MAPS_API_KEY`: Google Maps API key (optional)

## Production Deployment

### 1. Update Environment Variables
For production, update your `.env` file:

```bash
# Strong password
POSTGRES_PASSWORD=your-strong-random-password-here

# Random secure JWT secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-random-jwt-key

# Your production domain
CLIENT_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com
```

### 2. Enable SSL/TLS
For production, add a reverse proxy (like Nginx or Traefik) with SSL certificates:

```yaml
# Add to docker-compose.yml
services:
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
      - ./certs:/etc/nginx/certs
```

### 3. Use Docker Secrets (Recommended)
For sensitive data, use Docker secrets instead of environment variables:

```bash
echo "your-password" | docker secret create postgres_password -
echo "your-jwt-secret" | docker secret create jwt_secret -
```

### 4. Regular Backups
Backup your database regularly:

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres visit_tracker > backup_$(date +%Y%m%d).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres visit_tracker < backup_20231216.sql
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
sudo lsof -i :5000
sudo lsof -i :80
```

### Database Connection Issues
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U postgres
```

### Frontend Can't Connect to Backend
1. Check nginx configuration in `nginx.conf`
2. Verify backend is running: `docker-compose ps backend`
3. Check backend health: `curl http://localhost:5000/api/health`

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

### Permission Issues with Uploads
```bash
# Fix upload directory permissions
sudo chmod -R 777 uploads/

# Or set proper ownership
sudo chown -R $USER:$USER uploads/
```

## Performance Optimization

### 1. Limit Resources
Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 2. Enable Caching
The Dockerfiles already use multi-stage builds and layer caching for optimal build performance.

### 3. Use Docker BuildKit
```bash
DOCKER_BUILDKIT=1 docker-compose build
```

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Change default passwords** - Especially in production
3. **Use strong JWT secrets** - Generate with: `openssl rand -base64 32`
4. **Keep images updated** - Regularly rebuild with latest base images
5. **Scan for vulnerabilities** - Use `docker scan` command
6. **Run as non-root** - Consider adding USER directive in Dockerfiles
7. **Limit network exposure** - Only expose necessary ports

## Monitoring

### Health Checks
All services include health checks. Check status:

```bash
docker-compose ps
```

### Resource Usage
```bash
docker stats
```

### Container Inspection
```bash
docker-compose exec backend env
docker inspect visit-tracker-backend
```

## Updating the Application

### Update Code
```bash
git pull origin main
docker-compose up -d --build
```

### Update Dependencies
```bash
# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

## Support

For issues and questions:
- Check logs: `docker-compose logs`
- Review this documentation
- Check Docker documentation: https://docs.docker.com/

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
