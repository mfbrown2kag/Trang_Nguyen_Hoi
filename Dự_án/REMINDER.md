# 📧 Email Guardian - Server Built-in + Google AI

## 🎯 **Tổng quan**
Hệ thống phân tích email bảo mật **chỉ dùng thư viện built-in Python** + **Google AI** cho giải thích thông minh.
**Không cần cài thêm gì!**

## 📁 **Cấu trúc thư mục**
```
backend/
├── simple_server.py      # Server chính (built-in + Google AI)
├── requirements.txt      # Chỉ comment, không cài gì
├── install.sh           # Script cài đặt với Google AI
├── app/
│   ├── core_logic.py    # Logic phân tích (cũ)
│   └── gen.py          # Giải thích đơn giản
└── model/
    └── model_check_email.pkl  # ML model (tùy chọn)
```

## 🚀 **Triển khai với Google AI**

### **Bước 1: Cài đặt**
```bash
# Chạy script cài đặt
chmod +x install.sh
./install.sh
```

### **Bước 2: Khởi động**
```bash
# Chạy server với Google AI
python3 simple_server.py
```

### **Bước 3: Truy cập**
- 🌐 **Server**: http://localhost:8000
- 📚 **API docs**: http://localhost:8000/docs
- 💚 **Health check**: http://localhost:8000/health

## 📦 **Dependencies (0 thư viện!)**
```
# Chỉ dùng thư viện built-in Python:
# - http.server (thay cho FastAPI)
# - json (thay cho pydantic)
# - urllib.request (gọi Google AI API)
# - os, sys, logging (built-in)
# - pickle (thay cho scikit-learn)
# - re (regex built-in)
```

## 🔧 **Cấu hình Google AI**
File `config.env` tự động tạo với:
```
HOST=0.0.0.0
PORT=8000
GOOGLE_API_KEY=AIzaSyBqXOoWIhFrWeuNfgG-gTm17LaXP1VwHxI
```

## 📊 **API Endpoints**
- `POST /api/analyze` - Phân tích email với Google AI
- `GET /health` - Kiểm tra sức khỏe server và AI
- `GET /docs` - Tài liệu API (HTML built-in)

## 🛡️ **Tính năng**
- ✅ Phân loại email (safe/spam/phishing/malware)
- 🤖 **Giải thích thông minh bằng Google AI**
- ✅ Đánh giá rủi ro (0-100)
- ✅ Khuyến nghị bảo mật
- ✅ Rule-based khi không có ML model
- ✅ Server HTTP built-in
- 🤖 **Fallback khi Google AI lỗi**

## 🔍 **Test nhanh**
```bash
# Test API với Google AI
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "Subject: Urgent Action Required\n\nDear Customer, your account has been suspended. Click here to verify."}'
```

## ⚡ **Ưu điểm**
- 🚀 **Siêu đơn giản**: 0 thư viện cần cài
- 🤖 **Thông minh**: Google AI giải thích
- 🔧 **Dễ triển khai**: Chỉ cần Python
- 🛡️ **Ổn định**: Built-in + fallback
- 🌍 **Đa ngôn ngữ**: Hỗ trợ tiếng Việt
- 📱 **Sẵn sàng**: Chạy ngay trên server trắng

## 🆘 **Xử lý lỗi**
- **Lỗi Python**: Cài Python 3.6+
- **Lỗi Google AI**: Tự động dùng fallback
- **Lỗi model**: Hệ thống tự động dùng rule-based
- **Lỗi port**: Đổi PORT trong config.env

## 💡 **So sánh với phiên bản cũ**
| Tính năng | Cũ (FastAPI) | Mới (Built-in + AI) |
|-----------|-------------|---------------------|
| Dependencies | 5 thư viện | 0 thư viện |
| Cài đặt | `pip install` | Không cần |
| Server | uvicorn | http.server |
| AI | Google AI library | urllib.request |
| Performance | Cao | Trung bình |
| Độ phức tạp | Cao | Thấp |
| Giải thích | Fallback | Google AI |

## 🤖 **Google AI Features**
- ✅ **Giải thích thông minh** cho từng loại email
- ✅ **Phân tích chi tiết** mối đe dọa bảo mật
- ✅ **Khuyến nghị hành động** cụ thể
- ✅ **Fallback tự động** khi AI lỗi
- ✅ **Tiếng Việt** trong giải thích 