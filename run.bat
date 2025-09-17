@echo off
echo Starting Skill Swap API...
echo.

echo Restoring packages...
dotnet restore

echo.
echo Building solution...
dotnet build

echo.
echo Starting API...
cd src\SkillSwap.API
dotnet run

pause
