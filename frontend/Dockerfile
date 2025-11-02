FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies and build static assets
# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies with fallback to npm install if npm ci fails
# This handles cases where package-lock.json might be out of sync
RUN npm ci --legacy-peer-deps 2>/dev/null || npm install --legacy-peer-deps

COPY . ./
RUN CI=false npm run build

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for nginx
EXPOSE 80

# Use default nginx command
CMD ["nginx", "-g", "daemon off;"]
