# Railway Production Dockerfile
# Optimized for single-service deployment on Railway
# Serves both React frontend and Node.js backend

# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install dependencies with clean install
RUN npm ci --prefer-offline --no-audit

# Copy client source
COPY client/ ./

# Build argument for API URL (set during build)
ARG REACT_APP_API_URL
ARG REACT_APP_GOOGLE_MAPS_API_KEY

# Build the React app
RUN npm run build

# Stage 2: Production backend with frontend assets
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev --prefer-offline --no-audit

# Copy backend source
COPY server ./server

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/client/build ./client/build

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chmod 755 uploads && \
    chown -R node:node /app

# Switch to non-root user for security
USER node

# Expose port (Railway will override with PORT env var)
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/index.js"]
