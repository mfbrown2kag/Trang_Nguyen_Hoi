# 🗄️ Hướng Dẫn Thiết Lập MySQL Database

## 📋 Yêu Cầu Hệ Thống

1. **MySQL Server** đã cài đặt và đang chạy
2. **Python 3.8+** với pip
3. **MySQL Connector** cho Python

## 🚀 Thiết Lập Nhanh

### 1. Cài Đặt MySQL Dependencies

```bash
cd Dự_án/backend
pip install -r requirements.txt
```

### 2. Cấu Hình Database Settings

```bash
# Copy file config mẫu
cp config.env.example config.env

# Chỉnh sửa config.env với cài đặt MySQL của bạn
nano config.env
```

**Cài đặt MySQL cần thiết trong `config.env`:**
```env
# Cấu Hình MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=email_guardian
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DATABASE_URL=mysql://your_mysql_username:your_mysql_password@localhost:3306/email_guardian
```

### 3. Khởi Tạo Database

```bash
# Chạy script khởi tạo database
python init_database.py
```

**Kết Quả Mong Đợi:**
```
🚀 Email Guardian - Khởi Tạo Database
==================================================
🔍 Đang tạo MySQL database...
✅ Database 'email_guardian' đã được tạo/xác minh thành công
✅ Bảng email_analyses đã được tạo
✅ Bảng system_stats đã được tạo
✅ Bảng user_sessions đã được tạo
✅ Dữ liệu thống kê ban đầu đã được thêm
✅ Khởi tạo database hoàn tất thành công

🔍 Kiểm tra kết nối SQLAlchemy...
✅ Kết nối database thành công
✅ Các bảng database đã được khởi tạo thành công

🎉 Khởi tạo database hoàn tất thành công!

📋 Các bước tiếp theo:
1. Khởi động API server: uvicorn api_server:app --reload
2. Kiểm tra API: http://localhost:8000/api/health
3. Xem tài liệu API: http://localhost:8000/api/docs
```

## 🗂️ Cấu Trúc Database

### Các Bảng Được Tạo:

#### 1. `email_analyses`
```sql
CREATE TABLE email_analyses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email_text TEXT NOT NULL,
    classification VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    risk_score INT NOT NULL,
    processing_time INT NOT NULL,
    explanation TEXT,
    features TEXT,           -- Chuỗi JSON
    recommendations TEXT,    -- Chuỗi JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_classification (classification),
    INDEX idx_created_at (created_at)
);
```

#### 2. `system_stats`
```sql
CREATE TABLE system_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_analyzed INT DEFAULT 0,
    spam_detected INT DEFAULT 0,
    phishing_blocked INT DEFAULT 0,
    suspicious_detected INT DEFAULT 0,
    total_processing_time INT DEFAULT 0,
    avg_confidence FLOAT DEFAULT 0.0,
    success_rate FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `user_sessions`
```sql
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_session_id (session_id),
    INDEX idx_last_activity (last_activity)
);
```

## 🔧 Xử Lý Sự Cố

### Các Vấn Đề Thường Gặp:

#### 1. **Kết Nối MySQL Thất Bại**
```
❌ Lỗi kết nối MySQL: 2003 (HY000): Không thể kết nối đến MySQL server
```

**Giải Pháp:**
- Đảm bảo MySQL server đang chạy: `sudo systemctl start mysql`
- Kiểm tra trạng thái MySQL: `sudo systemctl status mysql`
- Xác minh port 3306 đang mở: `netstat -tlnp | grep 3306`

#### 2. **Truy Cập Bị Từ Chối**
```
❌ Lỗi kết nối MySQL: 1045 (28000): Truy cập bị từ chối cho user
```

**Giải Pháp:**
- Kiểm tra username/password trong `config.env`
- Tạo MySQL user:
```sql
CREATE USER 'email_guardian'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON email_guardian.* TO 'email_guardian'@'localhost';
FLUSH PRIVILEGES;
```

#### 3. **Database Không Tìm Thấy**
```
❌ Lỗi kết nối MySQL: 1049 (42000): Database không xác định
```

**Giải Pháp:**
- Chạy `python init_database.py` để tạo database
- Hoặc tạo thủ công: `CREATE DATABASE email_guardian;`

#### 4. **Lỗi Import**
```
❌ Lỗi import: No module named 'sqlalchemy'
```

**Giải Pháp:**
- Cài đặt dependencies: `pip install -r requirements.txt`
- Kiểm tra môi trường Python: `python --version`

## 📊 Tính Năng Database

### ✅ **Tự Động Fallback**
- Nếu MySQL không khả dụng, hệ thống tự động chuyển sang lưu trữ trong bộ nhớ
- Không mất dữ liệu trong quá trình bảo trì database
- Chuyển đổi mượt mà giữa các chế độ lưu trữ

### ✅ **Connection Pooling**
- Tối ưu hóa kết nối database
- Tự động tái chế kết nối
- Giám sát sức khỏe kết nối

### ✅ **Lưu Trữ Dữ Liệu**
- Tất cả phân tích email được lưu trữ vĩnh viễn
- Thống kê hệ thống được theo dõi theo thời gian
- Quản lý phiên người dùng

### ✅ **Tối Ưu Hóa Hiệu Suất**
- Truy vấn có index để truy xuất nhanh
- Lưu trữ JSON cho dữ liệu phức tạp
- Nén dữ liệu hiệu quả

## 🔍 Kiểm Tra Kết Nối Database

### Kiểm Tra Thủ Công:
```bash
# Kiểm tra kết nối MySQL
mysql -u your_username -p -h localhost -P 3306

# Kiểm tra truy cập database
USE email_guardian;
SHOW TABLES;
SELECT * FROM system_stats;
```

### Kiểm Tra API:
```bash
# Kiểm tra endpoint health
curl http://localhost:8000/api/health

# Kiểm tra phân tích với database
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Nội dung email test"}'
```

## 📈 Giám Sát

### Kích Thước Database:
```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Kích Thước (MB)'
FROM information_schema.tables 
WHERE table_schema = 'email_guardian';
```

### Thống Kê Hiệu Suất:
```sql
SELECT 
    COUNT(*) as tong_phan_tich,
    AVG(processing_time) as thoi_gian_xu_ly_tb,
    MAX(created_at) as phan_tich_cuoi_cung
FROM email_analyses;
```

## 🛡️ Bảo Mật

### Thực Hành Tốt Nhất:
1. **Sử dụng MySQL user riêng** (không phải root)
2. **Mật khẩu mạnh** cho truy cập database
3. **Bảo mật mạng** (quy tắc firewall)
4. **Sao lưu thường xuyên** database
5. **Giám sát log truy cập**

### Script Sao Lưu:
```bash
#!/bin/bash
# backup_database.sh
mysqldump -u your_username -p email_guardian > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🎯 Các Bước Tiếp Theo

Sau khi thiết lập database thành công:

1. **Khởi Động API Server:**
   ```bash
   uvicorn api_server:app --reload
   ```

2. **Kiểm Tra Endpoints:**
   - Health: `http://localhost:8000/api/health`
   - Docs: `http://localhost:8000/api/docs`
   - Analysis: `http://localhost:8000/api/analyze`

3. **Giám Sát Logs:**
   ```bash
   tail -f logs/app.log
   ```

4. **Mở Rộng Database:**
   - Xem xét MySQL replication cho tính khả dụng cao
   - Triển khai database clustering cho quy mô lớn
   - Thêm Redis caching cho dữ liệu truy cập thường xuyên

---

**🎉 Chúc mừng!** Hệ thống Email Guardian của bạn hiện đã được kết nối với MySQL database với khả năng lưu trữ dữ liệu đầy đủ và tự động fallback. 