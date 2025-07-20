@echo off
echo 🌐 Starting Email Guardian Frontend...
echo.
cd frontend
echo 📁 Current directory: %CD%
echo.
echo 🌐 Starting frontend server on port 3000...
python -m http.server 3000
pause 