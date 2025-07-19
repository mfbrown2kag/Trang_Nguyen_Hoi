# 🚀 Email Guardian Backend - Deployment Guide

## 📋 Prerequisites

- Python 3.8+ 
- pip (Python package manager)
- Git
- Server with at least 1GB RAM

## 🔧 Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/mfbrown2kag/Trang_Nguyen_Hoi.git
cd Trang_Nguyen_Hoi/Dự_án/backend
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Setup
```bash
# Copy example config
cp config.env.example config.env

# Edit config.env with your settings
nano config.env
```

**Required Environment Variables:**
```env
GOOGLE_API_KEY=your_google_genai_api_key_here
MODEL_PATH=model/model_check_email.pkl
DEBUG=False
HOST=0.0.0.0
PORT=8000
```

### 4. Test Installation
```bash
python test_deployment.py
```

**Expected Output:**
```
🚀 Email Guardian Backend - Deployment Test
==================================================
🔍 Testing directory structure...
✅ app/
✅ model/

🔍 Testing configuration files...
✅ config.env
✅ config.env.example
✅ requirements.txt

🔍 Testing model file...
✅ Model found at: model/model_check_email.pkl
✅ Model loaded successfully

🔍 Testing imports...
✅ fastapi
✅ uvicorn
✅ pydantic
✅ pandas
✅ numpy
✅ textblob
✅ nltk
✅ plotly
✅ wordcloud
✅ matplotlib
✅ seaborn
✅ google.genai
✅ dotenv
✅ pickle

🔍 Testing core logic...
✅ Analyzer initialized
✅ classification: safe
✅ confidence: 0.85
✅ explanation: [AI explanation]
✅ features: {...}
✅ risk_score: 0
✅ recommendations: [...]
✅ Core logic test passed!

🔍 Testing API endpoints...
✅ FastAPI app imported
✅ Root endpoint working
✅ Health endpoint working
✅ API endpoints test passed!

==================================================
📊 TEST RESULTS:
==================================================
Directory Structure: ✅ PASS
Configuration Files: ✅ PASS
Model File: ✅ PASS
Imports: ✅ PASS
Core Logic: ✅ PASS
API Endpoints: ✅ PASS

Overall: 6/6 tests passed
🎉 ALL TESTS PASSED! Ready for deployment!
```

## 🚀 Production Deployment

### Option 1: Direct Uvicorn
```bash
uvicorn api_server:app --host 0.0.0.0 --port 8000 --workers 4
```

### Option 2: Using Gunicorn (Recommended)
```bash
pip install gunicorn
gunicorn api_server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Option 3: Docker (If available)
```bash
docker build -t email-guardian-backend .
docker run -p 8000:8000 email-guardian-backend
```

## 🔍 Health Check

After deployment, test these endpoints:

1. **Root**: `GET http://your-server:8000/`
2. **Health**: `GET http://your-server:8000/api/health`
3. **Docs**: `GET http://your-server:8000/api/docs`

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Root info |
| `/api/health` | GET | Health check |
| `/api/analyze` | POST | Analyze single email |
| `/api/analyze/batch` | POST | Analyze multiple emails |
| `/api/stats` | GET | Get system statistics |
| `/api/history` | GET | Get analysis history |
| `/api/docs` | GET | API documentation |

## 🔧 Troubleshooting

### Common Issues:

1. **Model not found**
   - Ensure `model/model_check_email.pkl` exists
   - Check file permissions

2. **Import errors**
   - Run `pip install -r requirements.txt`
   - Check Python version (3.8+)

3. **Port already in use**
   - Change port in config.env
   - Kill existing process: `lsof -ti:8000 | xargs kill -9`

4. **Memory issues**
   - Reduce workers: `--workers 2`
   - Increase server RAM

### Logs
```bash
# View logs
tail -f logs/app.log

# Check process
ps aux | grep uvicorn
```

## 📞 Support

If deployment fails:
1. Run `python test_deployment.py` and share output
2. Check server logs
3. Verify all files are present in repository

## ✅ Deployment Checklist

- [ ] Repository cloned successfully
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Environment variables configured
- [ ] Model file present (`model/model_check_email.pkl`)
- [ ] Test script passes (`python test_deployment.py`)
- [ ] Server starts without errors
- [ ] Health endpoint responds (`/api/health`)
- [ ] API documentation accessible (`/api/docs`)

## 🎯 Expected File Structure

```
backend/
├── api_server.py          # Main FastAPI server
├── requirements.txt       # Python dependencies
├── config.env            # Environment variables
├── config.env.example    # Example config
├── test_deployment.py    # Deployment test script
├── DEPLOYMENT_GUIDE.md   # This file
├── app/
│   ├── __init__.py
│   ├── core_logic.py     # Core analysis logic
│   ├── gen.py           # AI generation
│   ├── email_analyzer.py
│   └── demo_emails.py
└── model/
    └── model_check_email.pkl  # ML model (490KB)
```

**Total size**: ~500KB (excluding dependencies) 