#!/bin/bash

echo "🔍 AtonixCorp Platform Status Check"
echo "=================================="

# Check Django server
echo "🐍 Django Backend (Port 8000):"
if curl -s http://127.0.0.1:8000/api/auth/me/ > /dev/null 2>&1; then
    echo "   ✅ Django server is running and responding"
    echo "   📍 http://127.0.0.1:8000"
else
    echo "   ❌ Django server is not responding"
fi

# Check React server
echo ""
echo "⚛️  React Frontend (Port 3000):"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ React server is running and responding"
    echo "   📍 http://localhost:3000"
else
    echo "   ❌ React server is not responding"
fi

echo ""
echo "🔧 Running Processes:"
echo "Django processes:"
ps aux | grep -E "python.*manage.py.*runserver" | grep -v grep || echo "   No Django processes found"

echo ""
echo "React processes:"
ps aux | grep -E "node.*react-scripts" | grep -v grep || echo "   No React processes found"

echo ""
echo "📋 Quick Test Commands:"
echo "   Test Django API: curl http://127.0.0.1:8000/api/auth/me/"
echo "   Test React proxy: curl http://localhost:3000/api/auth/me/"
echo "   Stop all servers: pkill -f 'python manage.py runserver' && pkill -f 'react-scripts start'"