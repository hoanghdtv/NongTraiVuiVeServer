# Build stage
FROM node:22 AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:22

ENV PORT 2567

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (for both dev and prod)
RUN npm ci

# Copy built files from builder stage
COPY --from=builder /usr/src/app/build ./build

# Copy source files for development mode
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

EXPOSE 2567

# Run based on NODE_ENV - will use npm start
CMD [ "npm", "start" ]