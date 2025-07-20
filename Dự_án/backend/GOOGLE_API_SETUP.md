# 🔑 Hướng Dẫn Setup Google AI API Key

## ❌ **Lỗi Hiện Tại:**
```
Lỗi khi gọi Google AI API: 400 INVALID_ARGUMENT
API key not valid. Please pass a valid API key.
```

## ✅ **Cách Sửa:**

### **Bước 1: Lấy Google AI API Key**

1. **Truy cập Google AI Studio:**
   - Vào: https://makersuite.google.com/app/apikey
   - Đăng nhập bằng Google account

2. **Tạo API Key:**
   - Click "Create API Key"
   - Copy API key được tạo

3. **Hoặc sử dụng Google Cloud Console:**
   - Vào: https://console.cloud.google.com/
   - Tạo project mới hoặc chọn project có sẵn
   - Enable "Generative Language API"
   - Tạo API key trong "Credentials"

### **Bước 2: Cập Nhật Config**

1. **Mở file config:**
```bash
cd Dự_án/backend
nano config.env
```

2. **Thay thế API key:**
```env
# Thay thế dòng này:
GOOGLE_API_KEY=your_actual_google_api_key_here

# Bằng API key thật của bạn:
GOOGLE_API_KEY=AIzaSyCzheqQ6fj5_-WmSB-EFedQsCN4i6TZsqY
```

### **Bước 3: Restart Server**

```bash
# Nếu dùng Docker:
docker-compose restart

# Nếu dùng manual:
# Dừng server và chạy lại
python api_server.py
```

### **Bước 4: Test**

1. **Kiểm tra API key:**
```bash
curl http://localhost:8000/api/health
```

2. **Test phân tích email:**
- Vào frontend: http://localhost
- Nhập email test
- Click "Phân Tích Email"

## 🔍 **Kiểm Tra API Key:**

### **Test trực tiếp:**
```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, how are you?"
      }]
    }]
  }'
```

### **Expected Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Hello! I'm doing well, thank you for asking..."
      }]
    }
  }]
}
```

## ⚠️ **Lưu Ý Quan Trọng:**

1. **API Key Format:** Phải bắt đầu bằng `AIzaSy...`
2. **Quota Limits:** Google AI có giới hạn request/ngày
3. **Billing:** Có thể cần setup billing account
4. **Security:** Không chia sẻ API key công khai

## 🚨 **Nếu Vẫn Lỗi:**

1. **Kiểm tra API key có đúng format không**
2. **Kiểm tra có enable Generative Language API không**
3. **Kiểm tra billing account có setup không**
4. **Kiểm tra quota có đủ không**

## 📞 **Hỗ Trợ:**

- Google AI Documentation: https://ai.google.dev/
- Google Cloud Console: https://console.cloud.google.com/
- API Quotas: https://ai.google.dev/pricing 