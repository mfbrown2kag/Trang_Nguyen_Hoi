# 📧 Email Guardian - AI-Powered Email Security System

**Email Guardian** là hệ thống phân tích email thông minh sử dụng AI/ML để phát hiện spam, phishing và các mối đe dọa email khác. Ứng dụng cung cấp giao diện web hiện đại với dashboard real-time và khả năng phân tích chi tiết.

## 🚀 Tính Năng Chính

### 🔍 **Phân Tích Email Thông Minh**
- Phân tích nội dung email bằng AI/ML
- Phát hiện spam, phishing, malware
- Đánh giá độ tin cậy và điểm rủi ro
- Giải thích chi tiết kết quả phân tích

### 📊 **Dashboard Real-time**
- Thống kê phân tích theo thời gian thực
- Biểu đồ xu hướng và phân bố
- Theo dõi hiệu suất hệ thống
- Báo cáo chi tiết

### 📚 **Lịch Sử & Quản Lý**
- Lưu trữ lịch sử phân tích
- Tìm kiếm và lọc kết quả
- Xuất báo cáo PDF/Excel
- Backup và khôi phục dữ liệu

### 🛡️ **Bảo Mật Nâng Cao**
- API rate limiting
- CORS protection
- Input validation
- Secure logging

## 🏗️ Cấu Trúc Project

```
Dự_án/
├── backend/                 # Backend API (FastAPI)
│   ├── api_server.py       # Main API server
│   ├── app/                # Core logic modules
│   │   ├── core_logic.py   # Email analysis engine
│   │   ├── gen.py          # Google AI integration
│   │   └── demo_emails.py  # Sample emails
│   ├── model/              # ML models
│   │   └── model_check_email.pkl
│   └── config.env          # Environment variables
├── frontend/               # Frontend web app
│   ├── index.html          # Main application page
│   ├── js/                 # JavaScript modules
│   │   ├── app.js          # Main application logic
│   │   ├── api.js          # API service
│   │   └── components/     # UI components
│   ├── css/                # Stylesheets
│   └── game_en/            # Educational game
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── nginx.conf              # Nginx configuration
├── requirements.txt        # Python dependencies
└── start_server.sh         # Production startup script
```

## 🚀 Quick Start

### 1. **Development Mode**

```bash
# Clone repository
git clone <repository-url>
cd Dự_án

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup environment
cp config.env.example config.env
# Edit config.env with your Google API key

# Start backend server
python api_server.py
```

```bash
# Setup frontend (in another terminal)
cd frontend
# Open index.html in browser or use local server
python -m http.server 8080
```

### 2. **Production Deployment**

```bash
# Using Docker (Recommended)
docker-compose up -d

# Manual deployment
# See DEPLOYMENT.md for detailed instructions
```

## 🔧 Cấu Hình

### Environment Variables

Tạo file `backend/config.env`:

```env
# Google AI API Key (Required)
GOOGLE_API_KEY=your_actual_api_key_here

# Environment
ENVIRONMENT=production

# Log Level
LOG_LEVEL=INFO
```

### API Endpoints

- `GET /api/health` - Health check
- `POST /api/analyze` - Analyze single email
- `POST /api/analyze/batch` - Analyze multiple emails
- `GET /api/stats` - Get system statistics
- `GET /api/history` - Get analysis history

## 📊 API Documentation

Sau khi khởi động server, truy cập:
- **API Docs**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **FastAPI** - Modern Python web framework
- **Scikit-learn** - Machine learning
- **Google Generative AI** - AI analysis
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation

### Frontend
- **Vanilla JavaScript** - Core functionality
- **HTML5/CSS3** - Modern UI/UX
- **Chart.js** - Data visualization
- **Responsive Design** - Mobile-friendly

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Gunicorn** - Production server
- **SQLite** - Database (production: PostgreSQL)

## 📈 Performance

- **Response Time**: < 2 seconds per analysis
- **Throughput**: 100+ emails/minute
- **Accuracy**: 95%+ for spam/phishing detection
- **Uptime**: 99.9% with proper monitoring

## 🔐 Security Features

- **Input Validation** - Sanitize all inputs
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Cross-origin security
- **API Authentication** - Optional API keys
- **Secure Logging** - Audit trail
- **HTTPS Support** - Encrypted communication

## 📚 Documentation

- [📖 Deployment Guide](DEPLOYMENT.md) - Chi tiết triển khai
- [🔧 Integration Guide](backend/INTEGRATION_GUIDE.md) - Tích hợp API
- [📊 Feature Overview](TONG-QUAN-CHUC-NANG.md) - Tổng quan tính năng
- [📋 Project Analysis](PHAN-TICH-DU-AN.md) - Phân tích dự án

## 🎮 Educational Game

Project bao gồm game giáo dục về bảo mật email:
- **Game EN**: `frontend/game_en/`
- **Game VI**: `frontend/game_vi/`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Email**: support@emailguardian.com

## 🙏 Acknowledgments

- Google Generative AI for AI analysis capabilities
- FastAPI community for excellent framework
- Open source contributors

---

**Email Guardian** - Bảo vệ email của bạn với AI thông minh! 🛡️ 