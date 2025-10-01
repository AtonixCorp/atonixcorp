FROM node:18-alpine AS builder

# Create app directory
WORKDIR /app

# Install dependencies and build static assets
COPY package*.json ./
RUN npm install --silent --no-audit --no-fund
COPY . ./
RUN npm run build

FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 for nginx
EXPOSE 80

# Use default nginx command
CMD ["nginx", "-g", "daemon off;"]