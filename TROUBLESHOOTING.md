# AtonixCorp - Quick Start Guide

## [START] Starting the Platform

### Option 1: Use the startup script (Recommended)
```bash
cd /home/atonixdev/atonixcorp
./start_platform.sh
```

### Option 2: Manual startup

**Start Django Backend:**
```bash
cd /home/atonixdev/atonixcorp
source .venv/bin/activate
cd backend
python manage.py runserver
```

**Start React Frontend (in another terminal):**
```bash
cd /home/atonixdev/atonixcorp/frontend
npm start
```

## [CHECK] Checking Status

Run the status check script:
```bash
cd /home/atonixdev/atonixcorp
./check_status.sh
```

Or check manually:
```bash
# Check Django API
curl http://127.0.0.1:8000/api/auth/me/

# Check React server
curl http://localhost:3000
```

## [TEST] Testing Authentication

### Test Signup (via curl)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "confirm_password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login (via curl)
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

## [ACCESS] Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **Admin Panel**: http://127.0.0.1:8000/admin/

## [TROUBLESHOOT] Troubleshooting

### Common Issues and Fixes

#### 1. "Connection Refused" Error
```bash
# Check if servers are running
./check_status.sh

# Restart servers if needed
./start_platform.sh
```

#### 2. "Bad Request (400)" on Signup
- Check that all required fields are provided
- Verify password meets requirements (min 8 characters)
- Ensure passwords match
- Check that username is at least 3 characters

#### 3. React Server Won't Start
```bash
# Kill existing processes and restart
pkill -f "react-scripts start"
cd frontend && npm start
```

#### 4. Django Server Issues
```bash
# Kill existing processes and restart
pkill -f "python manage.py runserver"
cd backend && source ../.venv/bin/activate && python manage.py runserver
```

#### 5. Proxy Issues (ECONNREFUSED)
- Ensure Django server is running on port 8000
- Check that `package.json` has correct proxy: `"proxy": "http://localhost:8000"`
- Verify React is making requests to relative URLs (e.g., `/api/auth/login/`)

### Current Configuration

**Backend (Django):**
- Port: 8000
- Virtual env: `/home/atonixdev/atonixcorp/.venv`
- Database: SQLite (dev)
- Auth: Token-based authentication

**Frontend (React):**
- Port: 3000 (default)
- Proxy: Configured to forward API requests to Django
- Framework: React 19 + TypeScript + MUI

### API Endpoints

**Authentication:**
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/me/` - Get current user info

**Dashboard:**
- `GET /api/dashboard/stats/` - Get dashboard statistics

### Stop All Servers

```bash
pkill -f "python manage.py runserver"
pkill -f "react-scripts start"
```

## [NOTES] Recent Fixes

- Fixed frontend build process with TypeScript configuration
- Updated authentication flow for better security
- Enhanced Docker container networking
- Improved error handling and logging

## [NEXT] Next Steps