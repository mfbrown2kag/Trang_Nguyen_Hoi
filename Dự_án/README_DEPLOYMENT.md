# 🚀 EMAIL GUARDIAN - HƯỚNG DẪN DEPLOYMENT

## 📋 TRẢ LỜI CÂU HỎI CỦA THẦY

### ❓ **Câu hỏi 1: Backend và Frontend có chạy riêng không?**

**Trả lời: CÓ, Backend và Frontend chạy riêng biệt**

- **Backend**: Chạy trên port 8000 (FastAPI server)
- **Frontend**: Chạy trên port 3000 (Static HTML files)

### ❓ **Câu hỏi 2: Nếu chạy riêng thì chúng sẽ chạy ở file nào?**

**Trả lời:**

#### **Backend Files:**
```
Dự_án/backend/
├── api_server.py          ← FILE CHÍNH để chạy backend
├── app/
│   ├── __init__.py
│   ├── core_logic.py      ← Logic phân tích email
│   ├── email_analyzer.py  ← AI model integration
│   ├── gen.py            ← AI explanation generation
│   └── database.py       ← Database connection
├── model/
│   └── model_check_email.pkl  ← AI model file
└── requirements.txt       ← Python dependencies
```

#### **Frontend Files:**
```
Dự_án/frontend/
├── index.html            ← FILE CHÍNH để chạy frontend
├── js/
│   ├── app.js           ← Main JavaScript
│   ├── api.js           ← API calls
│   └── components/      ← UI components
├── css/
│   ├── style.css        ← Main styles
│   └── modern-theme.css ← Theme styles
└── components/          ← HTML components
```

## 🚀 HƯỚNG DẪN DEPLOYMENT

### **Bước 1: Cài đặt Backend**

```bash
# Di chuyển vào thư mục backend
cd Dự_án/backend

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy backend server
python api_server.py
```

**Backend sẽ chạy tại:** `http://localhost:8000`

### **Bước 2: Cài đặt Frontend**

```bash
# Di chuyển vào thư mục frontend
cd Dự_án/frontend

# Sử dụng HTTP server để serve static files
python -m http.server 3000
```

**Frontend sẽ chạy tại:** `http://localhost:3000`

### **Bước 3: Kiểm tra hoạt động**

1. **Backend API:** `http://localhost:8000/api/health`
2. **Frontend:** `http://localhost:3000`
3. **API Documentation:** `http://localhost:8000/api/docs`

## 📁 CẤU TRÚC PROJECT

```
Dự_án/
├── backend/              ← Backend API Server
│   ├── api_server.py     ← Main server file
│   ├── app/              ← Application modules
│   ├── model/            ← AI model files
│   └── requirements.txt  ← Python dependencies
├── frontend/             ← Frontend Static Files
│   ├── index.html        ← Main HTML file
│   ├── js/               ← JavaScript files
│   ├── css/              ← CSS files
│   └── components/       ← HTML components
└── README_DEPLOYMENT.md  ← This file
```

## 🔧 CẤU HÌNH MÔI TRƯỜNG

### **Backend Environment Variables:**
```env
GOOGLE_API_KEY=your_google_api_key
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=sqlite:///./email_guardian.db
```

### **Frontend Configuration:**
- Frontend tự động kết nối đến `http://localhost:8000` cho API calls
- Không cần cấu hình thêm

## 📊 TÍNH NĂNG HỆ THỐNG

### **Backend Features:**
- ✅ Email analysis với AI model
- ✅ Database storage (SQLite)
- ✅ RESTful API endpoints
- ✅ AI explanation generation
- ✅ Fallback mechanism

### **Frontend Features:**
- ✅ Modern responsive UI
- ✅ Real-time email analysis
- ✅ Dashboard với charts
- ✅ History tracking
- ✅ Mobile-friendly design

## 🎯 KẾT LUẬN

**Backend và Frontend chạy độc lập:**
- **Backend**: `python api_server.py` (port 8000)
- **Frontend**: `python -m http.server 3000` (port 3000)

**Hệ thống sẵn sàng deploy lên server của thầy!** 🚀 