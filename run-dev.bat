@echo off
echo Starting SkillSwap Development Environment...
echo.

echo Starting .NET API...
start "SkillSwap API" cmd /k "cd src\SkillSwap.API && dotnet run"

echo Waiting for API to start...
timeout /t 5 /nobreak > nul

echo Starting React Frontend...
start "SkillSwap Frontend" cmd /k "cd front-end && npm run dev"

echo.
echo Both services are starting...
echo API: http://localhost:51423 (or https://localhost:51422)
echo Frontend: http://localhost:5173 (or 5174 if 5173 is busy)
echo.
echo Press any key to exit...
pause > nul
