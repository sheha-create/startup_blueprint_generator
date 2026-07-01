@echo off
echo === Startup Blueprint Generator ===
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Install Python 3.11+ from https://python.org
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Setup .env
if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Edit .env and add your IBM watsonx.ai credentials before continuing.
    echo    WATSONX_API_KEY=your_key
    echo    WATSONX_PROJECT_ID=your_project_id
    echo.
    echo The app also runs in demo mode without credentials (uses local AI models).
    echo.
)

REM Setup backend
echo Setting up Python backend...
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
if not exist .env (
    copy ..\.env .env
)
cd ..

REM Setup frontend
echo Setting up Node.js frontend...
cd frontend
if not exist node_modules (
    npm install --silent
)
if not exist .env.local (
    echo NEXT_PUBLIC_BACKEND_URL=http://localhost:8000 > .env.local
)
cd ..

echo.
echo === Setup complete! ===
echo.
echo Run start.bat to launch the application.
echo.
pause
