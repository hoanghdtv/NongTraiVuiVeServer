# Multi-stage build for Nakama with Rollup
FROM node:alpine AS node-builder

WORKDIR /backend

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies for building
RUN npm ci --no-audit --prefer-offline

# Copy build configuration files
COPY tsconfig.json ./
COPY rollup.config.js ./

# Copy source code  
COPY src/ src/

# Clean any previous builds
RUN npm run clean

# Build with Rollup for production
RUN npm run build

# Production stage with Nakama
FROM registry.heroiclabs.com/heroiclabs/nakama:3.23.0

# Copy built JavaScript modules from Rollup
COPY --from=node-builder /backend/build/*.js /nakama/data/modules/build/

# Copy Nakama server configuration
COPY local.yml /nakama/data/

# Health check for Nakama server
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD ["/nakama/nakama", "healthcheck"]

# Expose Nakama ports
EXPOSE 7349 7350 7351

# Start Nakama server
CMD ["/nakama/nakama", "--config", "/nakama/data/local.yml"]
