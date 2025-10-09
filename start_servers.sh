#!/bin/bash

# Kill any existing servers
pkill -f "python manage.py runserver"
pkill -f "react-scripts start"

# Wait a moment for processes to terminate
sleep 2

# Start Django server in background
echo "Starting Django server..."
cd /home/atonixdev/atonixcorp-platform
source .venv/bin/activate
cd backend
python manage.py runserver &
DJANGO_PID=$!

# Wait for Django to start
sleep 3

# Start React server in background
echo "Starting React server..."
cd /home/atonixdev/atonixcorp-platform/frontend
npm start &
REACT_PID=$!

echo "Django server PID: $DJANGO_PID"
echo "React server PID: $REACT_PID"
echo "Both servers are starting..."
echo "Django: http://localhost:8000"
echo "React: http://localhost:3000"

# Wait for user input to stop servers
echo "Press any key to stop both servers..."
read -n 1

echo "Stopping servers..."
kill $DJANGO_PID 2>/dev/null
kill $REACT_PID 2>/dev/null
pkill -f "python manage.py runserver"
pkill -f "react-scripts start"

echo "Servers stopped."