#!/bin/bash

# Verification Script for Apache2 Setup
# This script verifies that all Apache2 configuration is properly set up

echo " Apache2 Reverse Proxy Setup Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASS=0
FAIL=0

# Helper functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}${NC} Found: $1"
        ((PASS++))
    else
        echo -e "${RED}${NC} Missing: $1"
        ((FAIL++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}${NC} Found: $1"
        ((PASS++))
    else
        echo -e "${RED}${NC} Missing: $1"
        ((FAIL++))
    fi
}

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}${NC} Installed: $1"
        ((PASS++))
    else
        echo -e "${RED}${NC} Missing: $1"
        ((FAIL++))
    fi
}

# Check files and directories
echo " Checking file structure..."
check_dir "docker/apache2"
check_file "docker/apache2/httpd.conf"
check_file "docker/apache2/vhosts.conf"
check_file "docker/apache2/vhosts-ssl.conf"
check_file "docker/apache2/README.md"
check_file "docker/Dockerfile.apache2"
check_file "docker-compose.local.main.yml"
check_file "docker-compose.prod.override.yml"
check_file "setup-docker.sh"
check_file "APACHE2_GUIDE.md"
echo ""

# Check required commands
echo " Checking required tools..."
check_command "docker"
check_command "docker-compose"
check_command "curl"
echo ""

# Check Docker network
echo " Checking Docker network..."
if docker network inspect atonixcorp_net &> /dev/null; then
    echo -e "${GREEN}${NC} Network exists: atonixcorp_net"
    ((PASS++))
else
    echo -e "${YELLOW}ℹ${NC} Network not created: atonixcorp_net (will be created by setup-docker.sh)"
fi
echo ""

# Check hosts entries
echo " Checking /etc/hosts entries..."
if grep -q "atonixcorp.com" /etc/hosts 2>/dev/null; then
    echo -e "${GREEN}${NC} /etc/hosts has atonixcorp.com entry"
    ((PASS++))
else
    echo -e "${YELLOW}ℹ${NC} /etc/hosts needs atonixcorp.com entry (run setup-docker.sh)"
fi

if grep -q "api.atonixcorp.com" /etc/hosts 2>/dev/null; then
    echo -e "${GREEN}${NC} /etc/hosts has api.atonixcorp.com entry"
    ((PASS++))
else
    echo -e "${YELLOW}ℹ${NC} /etc/hosts needs api.atonixcorp.com entry (run setup-docker.sh)"
fi
echo ""

# Check .env file
echo "  Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}${NC} Found: .env file"
    ((PASS++))
else
    echo -e "${YELLOW}ℹ${NC} Missing: .env file (will be created by setup-docker.sh)"
fi
echo ""

# Check configuration syntax
echo " Configuration Content Verification..."
if grep -q "ServerName atonixcorp.com" docker/apache2/vhosts.conf; then
    echo -e "${GREEN}${NC} Frontend vhost configured (atonixcorp.com)"
    ((PASS++))
else
    echo -e "${RED}${NC} Frontend vhost not configured"
    ((FAIL++))
fi

if grep -q "ServerName api.atonixcorp.com" docker/apache2/vhosts.conf; then
    echo -e "${GREEN}${NC} API vhost configured (api.atonixcorp.com)"
    ((PASS++))
else
    echo -e "${RED}${NC} API vhost not configured"
    ((FAIL++))
fi

if grep -q "ProxyPass / http://atonixcorp_backend:8000/" docker/apache2/vhosts.conf; then
    echo -e "${GREEN}${NC} Backend proxy configured"
    ((PASS++))
else
    echo -e "${RED}${NC} Backend proxy not configured"
    ((FAIL++))
fi

if grep -q "ProxyPass / http://atonixcorp_frontend" docker/apache2/vhosts.conf; then
    echo -e "${GREEN}${NC} Frontend proxy configured"
    ((PASS++))
else
    echo -e "${RED}${NC} Frontend proxy not configured"
    ((FAIL++))
fi
echo ""

# Check docker-compose integration
echo " Checking docker-compose integration..."
if grep -q "apache-proxy:" docker-compose.local.main.yml; then
    echo -e "${GREEN}${NC} apache-proxy service in docker-compose.yml"
    ((PASS++))
else
    echo -e "${RED}${NC} apache-proxy service not in docker-compose.yml"
    ((FAIL++))
fi

if grep -q "Dockerfile.apache2" docker-compose.local.main.yml; then
    echo -e "${GREEN}${NC} Dockerfile.apache2 reference in docker-compose.yml"
    ((PASS++))
else
    echo -e "${RED}${NC} Dockerfile.apache2 not referenced in docker-compose.yml"
    ((FAIL++))
fi
echo ""

# Summary
echo "=================================="
echo " Verification Summary"
echo "=================================="
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN} All checks passed! Setup is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./setup-docker.sh"
    echo "2. Edit: .env (add your configuration)"
    echo "3. Build: docker-compose -f docker-compose.local.main.yml build"
    echo "4. Start: docker-compose -f docker-compose.local.main.yml up -d"
    exit 0
else
    echo -e "${RED} Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
