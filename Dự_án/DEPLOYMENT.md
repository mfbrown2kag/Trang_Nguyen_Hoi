# 🚀 Email Guardian - Hướng Dẫn Deployment

## 📋 Tổng Quan

Email Guardian là hệ thống phân tích email thông minh sử dụng AI/ML. Tài liệu này hướng dẫn cách triển khai lên server production.

## 🏗️ Cấu Trúc Project

```
Dự_án/
├── backend/                 # Backend API
│   ├── api_server.py       # FastAPI server chính
│   ├── app/                # Core logic
│   ├── model/              # ML models
│   └── config.env          # Environment variables
├── frontend/               # Frontend web app
│   ├── index.html          # Main page
│   ├── js/                 # JavaScript files
│   └── css/                # CSS files
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── nginx.conf              # Nginx configuration
├── requirements.txt        # Python dependencies
└── start_server.sh         # Production startup script
```

## 🐳 Deployment với Docker (Khuyến Nghị)

### 1. Chuẩn Bị

```bash
# Clone project
git clone <repository-url>
cd Dự_án

# Tạo file config
cp backend/config.env.example backend/config.env
# Chỉnh sửa backend/config.env với API key thật
```

### 2. Chạy với Docker Compose

```bash
# Build và chạy
docker-compose up -d

# Kiểm tra logs
docker-compose logs -f

# Dừng
docker-compose down
```

### 3. Kiểm Tra

- Frontend: http://localhost
- API: http://localhost/api
- Health Check: http://localhost/health
- API Docs: http://localhost/api/docs

## 🖥️ Deployment Manual (Không dùng Docker)

### 1. Chuẩn Bị Server

```bash
# Cập nhật system
sudo apt update && sudo apt upgrade -y

# Cài đặt Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev -y

# Cài đặt Nginx
sudo apt install nginx -y

# Cài đặt Git
sudo apt install git -y
```

### 2. Setup Project

```bash
# Clone project
git clone <repository-url>
cd Dự_án

# Tạo virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo thư mục cần thiết
mkdir -p logs data
```

### 3. Cấu Hình Environment

```bash
# Tạo file config
cp backend/config.env.example backend/config.env
nano backend/config.env
```

Nội dung `backend/config.env`:
```env
# Email Guardian Configuration
GOOGLE_API_KEY=your_actual_google_api_key_here
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### 4. Cấu Hình Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/nginx.conf

# Copy frontend files
sudo cp -r frontend/* /var/www/html/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 5. Tạo Systemd Service

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

```bash
# Enable và start service
sudo systemctl daemon-reload
sudo systemctl enable email-guardian
sudo systemctl start email-guardian

# Kiểm tra status
sudo systemctl status email-guardian
```

## 🔧 Cấu Hình Production

### 1. Security

```bash
# Tạo SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com

# Cấu hình firewall
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

### 2. Monitoring

```bash
# Cài đặt monitoring tools
sudo apt install htop iotop nethogs -y

# Setup log rotation
sudo nano /etc/logrotate.d/email-guardian
```

Nội dung logrotate:
```
/path/to/Dự_án/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 3. Backup

```bash
# Tạo script backup
nano backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/email-guardian"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
cp /path/to/Dự_án/data/*.db $BACKUP_DIR/db_$DATE.db

# Backup logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /path/to/Dự_án/logs/

# Backup config
cp /path/to/Dự_án/backend/config.env $BACKUP_DIR/config_$DATE.env

echo "Backup completed: $DATE"
```

## 🚨 Troubleshooting

### 1. Kiểm Tra Logs

```bash
# Application logs
tail -f logs/error.log
tail -f logs/access.log

# System logs
sudo journalctl -u email-guardian -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 2. Kiểm Tra Status

```bash
# API health check
curl http://localhost:8000/api/health

# Service status
sudo systemctl status email-guardian

# Port usage
sudo netstat -tlnp | grep :8000
```

### 3. Restart Services

```bash
# Restart application
sudo systemctl restart email-guardian

# Restart nginx
sudo systemctl restart nginx

# Restart everything
sudo systemctl restart email-guardian nginx
```

## 📊 Monitoring & Maintenance

### 1. Performance Monitoring

```bash
# CPU và Memory usage
htop

# Disk usage
df -h

# Network usage
nethogs
```

### 2. Log Analysis

```bash
# Top IP addresses
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Top requested URLs
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# Error analysis
grep "ERROR" logs/error.log | tail -20
```

### 3. Updates

```bash
# Update application
git pull origin main
pip install -r requirements.txt
sudo systemctl restart email-guardian

# Update system
sudo apt update && sudo apt upgrade -y
```

## 🔐 Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] API keys secured
- [ ] Logs rotated
- [ ] Backups scheduled
- [ ] Monitoring enabled
- [ ] Updates automated
- [ ] Access logs reviewed

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs trong `/var/log/` và `logs/`
2. Service status với `systemctl`
3. Network connectivity
4. File permissions
5. Environment variables

---

**Lưu ý**: Đảm bảo thay thế `yourdomain.com` và `your_actual_google_api_key_here` bằng giá trị thực tế của bạn. 