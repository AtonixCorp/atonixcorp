<<<<<<< HEAD
FROM node:18-alpine AS builder
=======
FROM node:18-slim AS builder
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb

# Create app directory
WORKDIR /app

# Install dependencies and build static assets
<<<<<<< HEAD
COPY package*.json ./
RUN npm install --silent --no-audit --no-fund
COPY . ./
RUN npm run build
=======
# Copy package files first to leverage Docker cache
COPY package*.json ./
# Use npm ci for reproducible installs (uses package-lock.json if present)
# keep CI=true for install caching behavior but override during build to avoid
# react-scripts treating warnings as errors in CI mode.
RUN CI=true npm ci --silent --no-audit --no-fund
COPY . ./
RUN CI=false npm run build
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for nginx
EXPOSE 80

# Use default nginx command
<<<<<<< HEAD
CMD ["nginx", "-g", "daemon off;"]
=======
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> 12bd998bda7cee255affa733e542706dbab8dcfb
