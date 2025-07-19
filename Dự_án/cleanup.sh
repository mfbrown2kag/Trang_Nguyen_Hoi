#!/bin/bash

# Email Guardian - Cleanup Script for Deployment
# Script dọn dẹp file không cần thiết trước khi upload lên server

echo "🧹 Email Guardian - Cleanup for Deployment"
echo "=========================================="

# Remove development files
echo "🗑️ Removing development files..."

# Remove cache directories
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type d -name "*.pyc" -exec rm -rf {} + 2>/dev/null || true

# Remove IDE files
find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.swp" -delete 2>/dev/null || true
find . -name "*.swo" -delete 2>/dev/null || true

# Remove OS files
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true

# Remove temporary files
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true

# Remove log files (keep directory)
find . -name "*.log" -delete 2>/dev/null || true

# Remove git files (if not needed)
# find . -name ".git" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove test files
find . -name "test_*.py" -delete 2>/dev/null || true
find . -name "*_test.py" -delete 2>/dev/null || true

# Remove backup files
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true

# Remove development scripts
rm -f backend/start.bat 2>/dev/null || true
rm -f backend/start.sh 2>/dev/null || true
rm -f backend/start.ps1 2>/dev/null || true
rm -f backend/start_windows.bat 2>/dev/null || true
rm -f backend/quick_start.bat 2>/dev/null || true
rm -f start_frontend.bat 2>/dev/null || true

# Remove documentation files (optional - uncomment if needed)
# rm -f HUONG-DAN-CHI-TIET.md 2>/dev/null || true
# rm -f PHAN-TICH-DU-AN.md 2>/dev/null || true
# rm -f TONG-QUAN-CHUC-NANG.md 2>/dev/null || true

# Create production directories
echo "📁 Creating production directories..."
mkdir -p logs
mkdir -p data

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod +x start_server.sh 2>/dev/null || true
chmod +x cleanup.sh 2>/dev/null || true

# Create deployment package
echo "📦 Creating deployment package..."
tar -czf email-guardian-deployment.tar.gz \
    --exclude='*.pyc' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='*.log' \
    --exclude='*.tmp' \
    --exclude='*.temp' \
    --exclude='*.bak' \
    --exclude='*.backup' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    .

echo "✅ Cleanup completed!"
echo "📦 Deployment package: email-guardian-deployment.tar.gz"
echo ""
echo "🚀 Ready for deployment!"
echo "📖 See DEPLOYMENT.md for deployment instructions" 