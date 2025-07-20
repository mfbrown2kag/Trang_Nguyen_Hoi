#!/bin/bash
# Email Guardian - Cài đặt với Google AI + MySQL
# Chỉ dùng thư viện built-in Python + MySQL connector!

echo "🚀 Email Guardian - Cài đặt với Google AI + MySQL"
echo "================================================="

# Kiểm tra Python
echo "🔍 Kiểm tra Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa cài. Vui lòng cài Python3 trước."
    exit 1
fi
echo "✅ Python3 đã có"

# Cài MySQL connector
echo "📦 Cài đặt MySQL connector..."
pip3 install mysql-connector-python==8.2.0
if [ $? -eq 0 ]; then
    echo "✅ MySQL connector đã cài"
else
    echo "❌ Cài MySQL connector thất bại"
    exit 1
fi

# Tạo thư mục
echo "📁 Tạo thư mục..."
mkdir -p model
mkdir -p logs

# Kiểm tra model
if [ ! -f "model/model_check_email.pkl" ]; then
    echo "⚠️ Chưa có file model. Hệ thống sẽ dùng rule-based."
else
    echo "✅ Model đã có"
fi

# Tạo config với Google AI key và MySQL
if [ ! -f "config.env" ]; then
    echo "📝 Tạo file config với Google AI và MySQL..."
    cat > config.env << 'EOF'
# Email Guardian Config
HOST=0.0.0.0
PORT=8000
GOOGLE_API_KEY=AIzaSyBqXOoWIhFrWeuNfgG-gTm17LaXP1VwHxI

# MySQL Database Config
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=email_guardian
DB_PORT=3306
EOF
    echo "✅ Config đã tạo với Google AI key và MySQL"
else
    echo "✅ Config đã có"
fi

echo ""
echo "🎉 Cài đặt xong!"
echo ""
echo "🚀 Chạy server:"
echo "   python3 simple_server.py"
echo ""
echo "🌐 Truy cập: http://localhost:8000"
echo "📚 API docs: http://localhost:8000/docs"
echo ""
echo "🤖 Google AI: Đã được tích hợp!"
echo "🗄️ MySQL: Đã được tích hợp!"
echo "💡 Chỉ cần 1 thư viện MySQL connector!" 