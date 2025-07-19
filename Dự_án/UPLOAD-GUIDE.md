# 🚀 Hướng Dẫn Upload Email Guardian Lên Server

## 📋 Tổng Quan

Đây là hướng dẫn chi tiết để upload và triển khai **Email Guardian** lên server production. Project đã được tối ưu hóa và sẵn sàng cho deployment.

## 📁 Cấu Trúc File Đã Dọn Dẹp

```
Dự_án/
├── backend/                 # Backend API (FastAPI)
│   ├── api_server.py       # ✅ Server chính (đã sửa lỗi)
│   ├── app/                # Core logic modules
│   │   ├── core_logic.py   # Email analysis engine
│   │   ├── gen.py          # Google AI integration
│   │   └── demo_emails.py  # Sample emails
│   ├── model/              # ML models
│   │   └── model_check_email.pkl
│   ├── config.env          # Environment variables
│   ├── config.env.example  # Template config
│   ├── requirements.txt    # Backend dependencies
│   └── README.md           # Backend docs
├── frontend/               # Frontend web app
│   ├── index.html          # ✅ Main page (đã sửa lỗi nút phân tích)
│   ├── js/                 # JavaScript modules
│   │   ├── app.js          # ✅ Main logic (đã sửa lỗi)
│   │   ├── api.js          # API service
│   │   └── components/     # UI components
│   ├── css/                # Stylesheets
│   └── game_en/            # Educational game
├── Dockerfile              # ✅ Container configuration
├── docker-compose.yml      # ✅ Multi-container setup
├── nginx.conf              # ✅ Production nginx
├── requirements.txt        # ✅ Main dependencies
├── start_server.sh         # ✅ Production startup
├── cleanup.sh              # ✅ Cleanup script
├── .gitignore              # ✅ Git ignore
├── DEPLOYMENT.md           # ✅ Detailed deployment guide
├── README.md               # ✅ Project documentation
└── UPLOAD-GUIDE.md         # ✅ This file
```

## 🎯 Các Lỗi Đã Sửa

### ✅ **Backend (api_server.py)**
- Sửa lỗi `Field()` với `max_items` không hợp lệ
- Thêm import `validator` cho Pydantic
- Sửa lỗi thiếu tham số `timestamp` trong batch analysis

### ✅ **Frontend (app.js)**
- Sửa lỗi `return` sớm trong `setupQuickActions()`
- Sửa lỗi `return` sớm trong `analyzeEmail()`
- Nút "Phân Tích Email" giờ hoạt động bình thường

## 🚀 Cách Upload Lên Server

### **Phương Pháp 1: Docker (Khuyến Nghị)**

1. **Upload toàn bộ thư mục `Dự_án` lên server**

2. **SSH vào server và chạy:**
```bash
cd Dự_án

# Setup environment
cp backend/config.env.example backend/config.env
nano backend/config.env  # Chỉnh sửa với API key thật

# Deploy với Docker
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f
```

3. **Kiểm tra ứng dụng:**
- Frontend: http://your-server-ip
- API: http://your-server-ip/api
- Health Check: http://your-server-ip/health
- API Docs: http://your-server-ip/api/docs

### **Phương Pháp 2: Manual Deployment**

1. **Upload toàn bộ thư mục `Dự_án` lên server**

2. **Setup server:**
```bash
# Cài đặt dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv nginx git -y

cd Dự_án

# Setup Python environment
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup config
cp backend/config.env.example backend/config.env
nano backend/config.env  # Chỉnh sửa với API key thật
```

3. **Setup Nginx:**
```bash
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo cp -r frontend/* /var/www/html/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Tạo systemd service:**
```bash
sudo nano /etc/systemd/system/email-guardian.service
```

Nội dung service:
```ini
[Unit]
Description=Email Guardian API
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/path/to/Dự_án
Environment=PATH=/path/to/Dự_án/venv/bin
ExecStart=/path/to/Dự_án/venv/bin/gunicorn backend.api_server:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

5. **Start service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable email-guardian
sudo systemctl start email-guardian
sudo systemctl status email-guardian
```

## 🔧 Cấu Hình Quan Trọng

### **1. Environment Variables (backend/config.env)**
```env
# Google AI API Key (BẮT BUỘC)
GOOGLE_API_KEY=your_actual_google_api_key_here

# Environment
ENVIRONMENT=production

# Log Level
LOG_LEVEL=INFO
```

### **2. Firewall Setup**
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### **3. SSL Certificate (Optional)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

## 📊 Kiểm Tra Sau Khi Deploy

### **1. Health Check**
```bash
curl http://localhost:8000/api/health
```

### **2. Test API**
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "Test email content"}'
```

### **3. Check Logs**
```bash
# Docker logs
docker-compose logs -f

# System logs
sudo journalctl -u email-guardian -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Troubleshooting

### **Lỗi Thường Gặp:**

1. **API không hoạt động:**
   - Kiểm tra `config.env` có API key đúng không
   - Kiểm tra service status: `sudo systemctl status email-guardian`

2. **Frontend không load:**
   - Kiểm tra nginx config: `sudo nginx -t`
   - Kiểm tra nginx status: `sudo systemctl status nginx`

3. **Port conflicts:**
   - Kiểm tra port usage: `sudo netstat -tlnp | grep :8000`
   - Kill process nếu cần: `sudo kill -9 <PID>`

### **Restart Services:**
```bash
# Docker
docker-compose restart

# Manual
sudo systemctl restart email-guardian nginx
```

## 📈 Monitoring

### **Performance Monitoring:**
```bash
# CPU và Memory
htop

# Disk usage
df -h

# Network
nethogs
```

### **Log Analysis:**
```bash
# Top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Error analysis
grep "ERROR" logs/error.log | tail -20
```

## 🔐 Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] API keys secured
- [ ] Logs rotated
- [ ] Backups scheduled
- [ ] Monitoring enabled

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs trong `/var/log/` và `logs/`
2. Kiểm tra service status với `systemctl`
3. Kiểm tra network connectivity
4. Kiểm tra file permissions
5. Kiểm tra environment variables

---

**🎉 Chúc mừng! Email Guardian đã sẵn sàng hoạt động trên server!**

**📧 Bảo vệ email của bạn với AI thông minh! 🛡️** 