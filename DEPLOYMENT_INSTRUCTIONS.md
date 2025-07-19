# 🚀 HƯỚNG DẪN DEPLOYMENT - EMAIL GUARDIAN

## 📋 THÔNG TIN DỰ ÁN

**Tên dự án:** Email Guardian - AI Powered Email Security  
**Repository:** https://github.com/mfbrown2kag/Trang_Nguyen_Hoi  
**Cấu trúc:** Backend API + Frontend Web App

---

## 🎯 CÁC FILE CHÍNH CẦN DEPLOY

### 🔧 **BACKEND (API Server)**
- **File chính:** `Dự_án/backend/api_server.py`
- **Port:** 8000
- **Framework:** FastAPI + Uvicorn
- **Model ML:** `Dự_án/backend/model/model_check_email.pkl` (490KB)

### 🎨 **FRONTEND (Web App)**
- **File chính:** `Dự_án/frontend/index.html`
- **Port:** 80 (hoặc 3000)
- **Framework:** HTML/CSS/JavaScript thuần

---

## 🚀 BƯỚC DEPLOYMENT

### **Bước 1: Clone Repository**
```bash
git clone https://github.com/mfbrown2kag/Trang_Nguyen_Hoi.git
cd Trang_Nguyen_Hoi
```

### **Bước 2: Deploy Backend API**

```bash
# Di chuyển vào thư mục backend
cd Dự_án/backend

# Cài đặt Python dependencies
pip install -r requirements.txt

# Kiểm tra deployment
python test_deployment.py

# Khởi động API server
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4
```

**✅ Kết quả mong đợi:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### **Bước 3: Deploy Frontend**

```bash
# Di chuyển vào thư mục frontend
cd ../frontend

# Sử dụng web server (chọn 1 trong các cách sau)
# Cách 1: Python HTTP server
python -m http.server 3000

# Cách 2: Node.js serve
npx serve -s . -l 3000

# Cách 3: Nginx (nếu có)
# Copy files vào /var/www/html/
```

### **Bước 4: Cấu hình Nginx (Tùy chọn)**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/Trang_Nguyen_Hoi/Dự_án/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔍 KIỂM TRA HOẠT ĐỘNG

### **Backend API Endpoints:**
- **Health Check:** `GET http://your-server:8000/api/health`
- **API Docs:** `GET http://your-server:8000/api/docs`
- **Root:** `GET http://your-server:8000/`

### **Frontend:**
- **Main App:** `http://your-server:3000/` hoặc `http://your-server/`
- **Game:** `http://your-server:3000/game_en/index.html`

---

## 📊 DEPENDENCIES

### **Backend Dependencies (requirements.txt):**
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
scikit-learn==1.3.2
pandas==2.1.3
numpy==1.24.3
textblob==0.17.1
nltk==3.8.1
google-genai
python-dotenv==1.0.0
httpx==0.25.2
```

### **Frontend Dependencies:**
- Không cần cài đặt gì thêm (chạy trực tiếp trên browser)

---

## 🔧 CẤU HÌNH MÔI TRƯỜNG

### **File config.env:**
```env
GOOGLE_API_KEY=your_google_genai_api_key_here
MODEL_PATH=model/model_check_email.pkl
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

### **Lưu ý quan trọng:**
- Cần có Google API key cho AI features
- Model file `model_check_email.pkl` phải có trong thư mục `model/`
- Port 8000 cho backend, port 3000 hoặc 80 cho frontend

---

## 🚨 TROUBLESHOOTING

### **Lỗi thường gặp:**

1. **Model not found:**
   ```bash
   # Kiểm tra file model
   ls -la Dự_án/backend/model/
   # Phải có: model_check_email.pkl
   ```

2. **Import errors:**
   ```bash
   # Cài lại dependencies
   pip install -r requirements.txt
   ```

3. **Port already in use:**
   ```bash
   # Tìm process đang dùng port
   lsof -ti:8000
   # Kill process
   kill -9 <PID>
   ```

4. **CORS errors:**
   - Backend đã cấu hình CORS cho phép tất cả origins
   - Kiểm tra frontend có gọi đúng URL backend không

---

## 📞 LIÊN HỆ HỖ TRỢ

Nếu gặp vấn đề:
1. Chạy `python test_deployment.py` và chia sẻ output
2. Kiểm tra logs: `tail -f logs/app.log`
3. Verify tất cả file có trong repository

---

## ✅ CHECKLIST DEPLOYMENT

- [ ] Repository cloned thành công
- [ ] Backend dependencies installed
- [ ] Model file present (`model_check_email.pkl`)
- [ ] Test script passes (`python test_deployment.py`)
- [ ] Backend server starts (`uvicorn api_server:app --host 0.0.0.0 --port 8000`)
- [ ] Frontend accessible (`http://server:3000/`)
- [ ] API health check passes (`/api/health`)
- [ ] Frontend can connect to backend API

**🎉 Khi tất cả checkboxes được tick = Deployment thành công!** 