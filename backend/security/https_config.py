"""
HTTPS/TLS Configuration for Production Deployment
"""
import os
import ssl
from pathlib import Path

# SSL/TLS Configuration for Nginx (to be used in docker/nginx.conf)
NGINX_SSL_CONFIG = """
# SSL/TLS Configuration for AtonixCorp Platform

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Certificate Configuration
    ssl_certificate /etc/nginx/ssl/your-domain.crt;
    ssl_certificate_key /etc/nginx/ssl/your-domain.key;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/nginx/ssl/chain.crt;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Hide Nginx version
    server_tokens off;
    
    # Root directory
    root /app/static;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static files
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    location /media/ {
        alias /app/media/;
        expires 1y;
        add_header Cache-Control "public";
        add_header X-Content-Type-Options nosniff;
    }
    
    # API and admin routes
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Security headers for API
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
        add_header X-XSS-Protection "1; mode=block" always;
    }
    
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Additional security for admin
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
    }
    
    # Frontend routes (React app)
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # Security.txt
    location /.well-known/security.txt {
        return 200 "Contact: security@atonixcorp.com\nExpires: 2025-12-31T23:59:59.000Z\nEncryption: https://your-domain.com/pgp-key.txt\nPreferred-Languages: en\nCanonical: https://your-domain.com/.well-known/security.txt";
        add_header Content-Type text/plain;
    }
    
    # Block sensitive files
    location ~ /\.(?!well-known) {
        deny all;
    }
    
    location ~ ^/(\.env|\.git|node_modules|package\.json|yarn\.lock|composer\.json|composer\.lock|Dockerfile|docker-compose) {
        deny all;
    }
}
"""

# Let's Encrypt SSL Certificate Setup Script
LETSENCRYPT_SETUP = """#!/bin/bash
# Let's Encrypt SSL Certificate Setup for AtonixCorp Platform

set -e

DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"
NGINX_CONF_DIR="/etc/nginx/conf.d"
SSL_DIR="/etc/nginx/ssl"

echo "Setting up Let's Encrypt SSL certificate for $DOMAIN"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Create SSL directory
mkdir -p $SSL_DIR

# Stop nginx temporarily
systemctl stop nginx

# Get certificate
certbot certonly --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN

# Copy certificates to nginx directory
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $SSL_DIR/${DOMAIN}.crt
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $SSL_DIR/${DOMAIN}.key
cp /etc/letsencrypt/live/$DOMAIN/chain.pem $SSL_DIR/chain.crt

# Set proper permissions
chmod 600 $SSL_DIR/*.key
chmod 644 $SSL_DIR/*.crt

# Update nginx configuration
cat > $NGINX_CONF_DIR/atonixcorp-platform.conf << 'EOF'
$NGINX_SSL_CONFIG
EOF

# Test nginx configuration
nginx -t

# Start nginx
systemctl start nginx
systemctl enable nginx

# Setup auto-renewal
crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet --reload-hook 'systemctl reload nginx'"; } | crontab -

echo "SSL certificate setup complete!"
echo "Certificate will auto-renew via cron job."
"""

# Docker SSL Configuration
DOCKER_SSL_CONFIG = """
# Docker configuration for SSL in production

# 1. Add SSL volume mount to docker-compose.yml:
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.fullstack
    ports:
      - "80:8080"   # HTTP for Let's Encrypt verification
      - "443:8443"  # HTTPS
    volumes:
      - ssl_certs:/etc/nginx/ssl:ro
      - ./docker/nginx-ssl.conf:/etc/nginx/sites-available/default
    environment:
      - USE_HTTPS=true
      - DOMAIN=your-domain.com

volumes:
  ssl_certs:
    external: true

# 2. Update Dockerfile.fullstack to include SSL support:
FROM nginx:alpine as nginx-stage
COPY docker/nginx-ssl.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/nginx/ssl

# 3. Environment variables for SSL:
USE_HTTPS=true
DOMAIN=your-domain.com
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
"""

# Development HTTPS Setup (Self-signed certificates)
DEV_HTTPS_SETUP = """#!/bin/bash
# Development HTTPS setup with self-signed certificates

set -e

SSL_DIR="./docker/ssl"
DOMAIN="localhost"

echo "Setting up development HTTPS with self-signed certificates"

# Create SSL directory
mkdir -p $SSL_DIR

# Generate private key
openssl genrsa -out $SSL_DIR/key.pem 2048

# Generate certificate signing request
openssl req -new -key $SSL_DIR/key.pem -out $SSL_DIR/cert.csr -subj "/C=US/ST=CA/L=San Francisco/O=AtonixCorp/OU=Development/CN=$DOMAIN"

# Generate self-signed certificate
openssl x509 -req -days 365 -in $SSL_DIR/cert.csr -signkey $SSL_DIR/key.pem -out $SSL_DIR/cert.pem

# Generate dhparam for additional security
openssl dhparam -out $SSL_DIR/dhparam.pem 2048

# Set permissions
chmod 600 $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem
chmod 644 $SSL_DIR/dhparam.pem

echo "Self-signed certificates generated in $SSL_DIR"
echo "Add these to your browser's trusted certificates for development"
"""


def generate_ssl_certificate_for_development():
    """Generate self-signed SSL certificate for development"""
    import subprocess
    import tempfile
    
    ssl_dir = Path("./docker/ssl")
    ssl_dir.mkdir(exist_ok=True)
    
    # Generate private key
    subprocess.run([
        "openssl", "genrsa", "-out", str(ssl_dir / "key.pem"), "2048"
    ], check=True)
    
    # Generate certificate
    subprocess.run([
        "openssl", "req", "-new", "-x509", "-key", str(ssl_dir / "key.pem"),
        "-out", str(ssl_dir / "cert.pem"), "-days", "365",
        "-subj", "/C=US/ST=CA/L=San Francisco/O=AtonixCorp/OU=Development/CN=localhost"
    ], check=True)
    
    print("Development SSL certificates generated in ./docker/ssl/")


def validate_ssl_configuration():
    """Validate SSL configuration"""
    ssl_dir = Path("./docker/ssl")
    
    required_files = ["cert.pem", "key.pem"]
    missing_files = []
    
    for file in required_files:
        if not (ssl_dir / file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"Missing SSL files: {missing_files}")
        print("Run generate_ssl_certificate_for_development() to create them")
        return False
    
    # Validate certificate
    try:
        cert_path = ssl_dir / "cert.pem"
        with open(cert_path, 'rb') as f:
            cert_data = f.read()
        
        # Basic validation that it's a valid certificate format
        if b'-----BEGIN CERTIFICATE-----' not in cert_data:
            print("Invalid certificate format")
            return False
        
        print("SSL configuration is valid")
        return True
        
    except Exception as e:
        print(f"SSL validation error: {e}")
        return False


# Security headers verification
def verify_security_headers():
    """Verify that security headers are properly configured"""
    import requests
    
    test_url = "http://localhost:8080"  # Adjust for your setup
    
    try:
        response = requests.get(test_url, timeout=5)
        headers = response.headers
        
        security_headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000',
            'Content-Security-Policy': 'default-src',
        }
        
        missing_headers = []
        for header, expected in security_headers.items():
            if header not in headers:
                missing_headers.append(header)
            elif expected not in headers[header]:
                print(f"Warning: {header} header may not be properly configured")
        
        if missing_headers:
            print(f"Missing security headers: {missing_headers}")
            return False
        
        print("All security headers are properly configured")
        return True
        
    except requests.RequestException as e:
        print(f"Could not verify headers: {e}")
        return False


if __name__ == "__main__":
    print("AtonixCorp Platform HTTPS/TLS Configuration")
    print("=" * 50)
    
    # For development
    print("Generating development SSL certificates...")
    generate_ssl_certificate_for_development()
    
    print("\nValidating SSL configuration...")
    validate_ssl_configuration()
    
    print("\nFor production deployment:")
    print("1. Use Let's Encrypt for free SSL certificates")
    print("2. Update nginx configuration with SSL settings")
    print("3. Ensure all environment variables are set")
    print("4. Test with SSL Labs (https://www.ssllabs.com/ssltest/)")