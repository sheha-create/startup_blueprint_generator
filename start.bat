@echo off
echo === Starting Startup Blueprint Generator ===
echo.

REM Start backend in a new window
echo Starting FastAPI backend on port 8000...
start "Blueprint Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in a new window
echo Starting Next.js frontend on port 3000...
start "Blueprint Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers starting...
echo.
echo   Backend API:  http://localhost:8000
echo   Frontend App: http://localhost:3000
echo   API Docs:     http://localhost:8000/docs
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:3000
