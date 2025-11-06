#!/bin/bash

# Enterprise Security Dashboard - Health Check Script
# Verifies backend and frontend are ready for security dashboard

echo "═══════════════════════════════════════════════════════════"
echo "Enterprise Security Dashboard - Health Check"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check backend
echo -n "Checking backend... "
if curl -s http://localhost:8000/api/security/frameworks/ > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend is running${NC}"
else
  echo -e "${RED}✗ Backend not accessible${NC}"
  echo "  Start backend: cd backend && python manage.py runserver"
fi

# Check frontend
echo -n "Checking frontend... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend is running${NC}"
else
  echo -e "${RED}✗ Frontend not accessible${NC}"
  echo "  Start frontend: cd frontend && npm start"
fi

# Check database migrations
echo -n "Checking migrations... "
if cd backend && python manage.py showmigrations enterprises | grep -q "\[X\] 0002_add_security_models" 2>/dev/null; then
  echo -e "${GREEN}✓ Security migrations applied${NC}"
  cd - > /dev/null
else
  echo -e "${YELLOW}⚠ Security migrations may not be applied${NC}"
  echo "  Run: cd backend && python manage.py migrate enterprises"
  cd - > /dev/null
fi

# Check security frameworks
echo -n "Checking security frameworks... "
FRAMEWORK_COUNT=$(cd backend && python manage.py shell -c "from enterprises.security_models import SecurityFramework; print(SecurityFramework.objects.count())" 2>/dev/null)
if [ "$FRAMEWORK_COUNT" -ge 8 ] 2>/dev/null; then
  echo -e "${GREEN}✓ $FRAMEWORK_COUNT frameworks loaded${NC}"
else
  echo -e "${YELLOW}⚠ Only $FRAMEWORK_COUNT frameworks found (expected 8)${NC}"
  echo "  Load frameworks: python manage.py shell < load_frameworks.py"
fi

# Check API endpoints
echo ""
echo "Checking API endpoints..."

endpoints=(
  "/api/security/frameworks/"
  "/api/security/policies/"
  "/api/dashboard/security/overview/"
  "/api/dashboard/security/compliance/"
  "/api/dashboard/security/incidents/"
  "/api/dashboard/security/audits/"
)

for endpoint in "${endpoints[@]}"; do
  echo -n "  $endpoint ... "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer test" http://localhost:8000$endpoint 2>/dev/null)
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
    echo -e "${GREEN}✓${NC}"
  elif [ "$STATUS" = "404" ]; then
    echo -e "${RED}✗ Not Found${NC}"
  else
    echo -e "${YELLOW}⚠ Status: $STATUS${NC}"
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "Health check complete!"
echo ""
echo "Dashboard URL: http://localhost:3000/enterprise/{id}/security"
echo ""
echo "Next steps:"
echo "1. Get your enterprise ID from /api/enterprises/"
echo "2. Navigate to http://localhost:3000/enterprise/{id}/security"
echo "3. View security dashboard with real data"
echo ""
echo "═══════════════════════════════════════════════════════════"
