@echo off
REM AI Fitness Trainer Startup Script for Windows

echo 🏋️ Starting AI Fitness Trainer...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.9 or higher.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Install Python dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

REM Install Node.js dependencies
echo 📦 Installing Node.js dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

REM Check for environment file
if not exist ".env" (
    echo ⚠️  No .env file found. Creating from template...
    copy env.example .env
    echo 📝 Please edit .env file with your API keys before running the application
)

echo 🚀 Starting backend server...
cd backend
start "Backend Server" cmd /k "python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait for backend to start
timeout /t 8 /nobreak >nul

echo 🌐 Starting frontend development server...
cd ..\frontend
start "Frontend Server" cmd /k "npm start"

echo ✅ AI Fitness Trainer is starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs

pause
