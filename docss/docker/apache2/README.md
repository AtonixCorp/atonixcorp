# Apache2 Reverse Proxy Configuration for AtonixCorp

This directory contains Apache2 configuration files for reverse proxying the AtonixCorp frontend and backend services.

## Configuration Files

### httpd.conf
Main Apache2 configuration file that loads all necessary modules and includes virtual host definitions.

**Key modules enabled:**
- `mod_proxy` - Proxy functionality
- `mod_proxy_http` - HTTP proxying
- `mod_rewrite` - URL rewriting
- `mod_headers` - HTTP header manipulation
- `mod_ssl` - SSL/HTTPS support

### vhosts.conf
Virtual host configuration for HTTP (development).

**Virtual Hosts:**
1. **atonixcorp.com** (Frontend)
   - Proxies to `atonixcorp_frontend:80`
   - Forwards `/api` requests to backend
   - Serves static files and React app

2. **api.atonixcorp.com** (Backend API)
   - Proxies to `atonixcorp_backend:8000`
   - Includes CORS headers for cross-origin requests
   - Handles all `/api` endpoints

### vhosts-ssl.conf
Virtual host configuration for HTTPS (production - optional).

**Features:**
- SSL/TLS encryption
- HTTP to HTTPS redirect
- HSTS (Strict-Transport-Security) headers
- Separate certificates for each domain

### Dockerfile.apache2
Docker image definition that builds Apache2 with custom configuration.

## Setup Instructions

### For Development (HTTP only)

1. **Create the network:**
```bash
docker network create atonixcorp_net
```

2. **Build and start the containers:**
```bash
docker-compose -f docker-compose.local.main.yml up -d apache-proxy backend frontend
```

3. **Update your local `/etc/hosts` file:**
```bash
sudo nano /etc/hosts
# Add these lines:
127.0.0.1 atonixcorp.com
127.0.0.1 api.atonixcorp.com
127.0.0.1 www.atonixcorp.com
127.0.0.1 www.api.atonixcorp.com
```

4. **Test the setup:**
```bash
# Frontend
curl -H "Host: atonixcorp.com" http://localhost/

# Backend API
curl -H "Host: api.atonixcorp.com" http://localhost/api/
```

### For Production (HTTPS)

1. **Generate or obtain SSL certificates:**

   Option A: Using Let's Encrypt with Certbot
   ```bash
   certbot certonly --standalone -d atonixcorp.com -d www.atonixcorp.com
   certbot certonly --standalone -d api.atonixcorp.com -d www.api.atonixcorp.com
   ```

   Option B: Using self-signed certificates (testing only)
   ```bash
   mkdir -p docker/apache2/certs
   
   # Frontend certificate
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/apache2/certs/atonixcorp.com.key \
     -out docker/apache2/certs/atonixcorp.com.crt \
     -subj "/C=US/ST=State/L=City/O=AtonixCorp/CN=atonixcorp.com"
   
   # API certificate
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/apache2/certs/api.atonixcorp.com.key \
     -out docker/apache2/certs/api.atonixcorp.com.crt \
     -subj "/C=US/ST=State/L=City/O=AtonixCorp/CN=api.atonixcorp.com"
   ```

2. **Update the docker-compose to use vhosts-ssl.conf:**
   
   Edit `docker-compose.local.main.yml` and update the apache-proxy service:
   ```yaml
   volumes:
     - ./docker/apache2/httpd.conf:/usr/local/apache2/conf/httpd.conf:ro
     - ./docker/apache2/vhosts-ssl.conf:/usr/local/apache2/conf.d/vhosts.conf:ro
     - ./docker/apache2/certs:/etc/apache2/certs:ro
   ```

3. **Start with HTTPS:**
   ```bash
   docker-compose -f docker-compose.local.main.yml up -d apache-proxy backend frontend
   ```

4. **Test HTTPS:**
   ```bash
   curl -k https://atonixcorp.com/
   curl -k https://api.atonixcorp.com/api/
   ```

## Directory Structure

```
docker/apache2/
├── httpd.conf                 # Main Apache configuration
├── vhosts.conf               # HTTP virtual hosts
├── vhosts-ssl.conf           # HTTPS virtual hosts
├── Dockerfile.apache2        # Docker image definition
└── certs/                    # SSL certificates (production)
    ├── atonixcorp.com.crt
    ├── atonixcorp.com.key
    ├── api.atonixcorp.com.crt
    ├── api.atonixcorp.com.key
    └── chain.crt             # Certificate chain (if needed)
```

## How It Works

### Request Flow

1. **Frontend Requests (atonixcorp.com)**
   - User → Apache (port 80/443)
   - Apache → React Frontend Container (port 3001)
   - Static assets and JS served by frontend

2. **API Requests (api.atonixcorp.com or atonixcorp.com/api)**
   - User → Apache (port 80/443)
   - Apache → Django Backend Container (port 8000)
   - JSON responses from API

### Key Features

- **ProxyPreserveHost**: Maintains original `Host` header
- **ProxyPassReverse**: Rewrites response `Location` headers
- **X-Forwarded-***: Headers inform backend about original request
- **CORS Headers**: Allow cross-origin requests to API
- **Security Headers**: Prevent clickjacking, XSS, MIME type sniffing

## Troubleshooting

### Container Won't Start
```bash
# Check Apache syntax
docker run --rm -v $(pwd)/docker/apache2:/config httpd:2.4 \
  httpd -t -f /config/httpd.conf
```

### Proxying Not Working
```bash
# Check Apache logs
docker logs atonixcorp_apache_proxy

# Test connectivity to backend
docker exec atonixcorp_apache_proxy curl http://atonixcorp_backend:8000/
docker exec atonixcorp_apache_proxy curl http://atonixcorp_frontend:80/
```

### 502 Bad Gateway
- Ensure backend and frontend containers are running
- Verify container networking (check `docker network inspect atonixcorp_net`)
- Check backend/frontend logs

### SSL Certificate Issues
- Verify certificate paths in volumes
- Ensure certificates match the domain names in vhosts-ssl.conf
- Check certificate expiration: `openssl x509 -text -noout -in certs/atonixcorp.com.crt`

## Performance Tuning

### Modify httpd.conf for production:
```apache
<IfModule mpm_prefork_module>
    StartServers 8
    MinSpareServers 5
    MaxSpareServers 20
    MaxRequestWorkers 256
    MaxConnectionsPerChild 4000
</IfModule>
```

### Enable caching:
```apache
<IfModule mod_cache.c>
    CacheLock on
    CacheLockPath /tmp/mod_cache-lock
    CacheQuickHandler off
    <IfModule mod_cache_disk.c>
        CacheRoot /var/cache/apache2/mod_cache_disk
    </IfModule>
</IfModule>
```

## Environment Variables

Add these to your `.env` file if needed:

```bash
# Apache
APACHE_PROXY_WORKERS=256
APACHE_PROXY_TIMEOUT=300

# Frontend
REACT_APP_API_URL=https://api.atonixcorp.com
REACT_APP_FRONTEND_URL=https://atonixcorp.com

# Backend
ALLOWED_HOSTS=atonixcorp.com,api.atonixcorp.com
CSRF_TRUSTED_ORIGINS=https://atonixcorp.com,https://api.atonixcorp.com
```

## References

- [Apache Proxy Documentation](https://httpd.apache.org/docs/2.4/mod/mod_proxy.html)
- [Apache SSL Documentation](https://httpd.apache.org/docs/2.4/mod/mod_ssl.html)
- [Apache Rewrite Documentation](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html)
