#!/bin/bash

echo "Starting SkillSwap Development Environment..."
echo

echo "Starting .NET API..."
cd src/SkillSwap.API
dotnet run &
API_PID=$!

echo "Waiting for API to start..."
sleep 5

echo "Starting React Frontend..."
cd ../../front-end
npm run dev &
FRONTEND_PID=$!

echo
echo "Both services are starting..."
echo "API: http://localhost:51423 (or https://localhost:51422)"
echo "Frontend: http://localhost:5173 (or 5174 if 5173 is busy)"
echo
echo "Press Ctrl+C to stop both services..."

# Function to cleanup on exit
cleanup() {
    echo "Stopping services..."
    kill $API_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
