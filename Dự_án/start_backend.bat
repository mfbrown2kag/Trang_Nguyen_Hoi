@echo off
echo 🚀 Starting Email Guardian Backend...
echo.
cd backend
echo 📁 Current directory: %CD%
echo.
echo 📦 Installing dependencies...
pip install -r requirements.txt
echo.
echo 🔧 Starting backend server...
python api_server.py
pause 