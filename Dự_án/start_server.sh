#!/bin/bash

# Email Guardian - Production Server Startup Script
# Script khởi động server cho production

set -e

echo "🚀 Email Guardian Production Server Starting..."
echo "================================================"

# Check if running in production
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌍 Production mode detected"
    export PYTHONPATH="${PYTHONPATH}:$(pwd)"
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p data
    
    # Check if model file exists
    if [ ! -f "backend/model/model_check_email.pkl" ]; then
        echo "❌ Model file not found: backend/model/model_check_email.pkl"
        echo "📝 Please ensure the model file is present"
        exit 1
    fi
    
    # Check if config file exists
    if [ ! -f "backend/config.env" ]; then
        echo "⚠️ Config file not found: backend/config.env"
        echo "📝 Creating default config..."
        cat > backend/config.env << EOF
# Email Guardian Configuration
GOOGLE_API_KEY=your_google_api_key_here
ENVIRONMENT=production
LOG_LEVEL=INFO
EOF
    fi
    
    # Start with Gunicorn for production
    echo "🔧 Starting with Gunicorn..."
    exec gunicorn backend.api_server:app \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --worker-class uvicorn.workers.UvicornWorker \
        --access-logfile logs/access.log \
        --error-logfile logs/error.log \
        --log-level info \
        --timeout 120 \
        --keep-alive 5 \
        --max-requests 1000 \
        --max-requests-jitter 100

else
    echo "🔧 Development mode detected"
    
    # Start with Uvicorn for development
    echo "🔧 Starting with Uvicorn..."
    exec uvicorn backend.api_server:app \
        --host 0.0.0.0 \
        --port 8000 \
        --reload \
        --log-level info
fi 