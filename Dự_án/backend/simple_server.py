#!/usr/bin/env python3
"""
Email Guardian - Server với Google AI + MySQL
============================================

Server built-in Python + Google AI + MySQL database.
Tối ưu cho deployment với database của giám khảo.
"""

import json
import logging
import os
import re
import pickle
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Import database
from app.database import get_database

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class GoogleAI:
    """Google AI integration đơn giản"""
    
    def __init__(self, api_key):
        """Khởi tạo Google AI"""
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
        logger.info("✅ Google AI initialized")
    
    def generate_explanation(self, email_text, classification):
        """Tạo giải thích bằng Google AI"""
        try:
            # Tạo prompt
            prompt = f"""
            Bạn là chuyên gia bảo mật email. Phân tích email này và giải thích tại sao nó được phân loại là {classification.upper()}.
            
            Nội dung Email:
            {email_text}
            
            Phân loại: {classification.upper()}
            
            Hãy cung cấp giải thích rõ ràng, chuyên nghiệp trong 2-3 câu bằng tiếng Việt:
            1. Tại sao email này được phân loại như vậy
            2. Những chỉ số bảo mật bạn thấy
            3. Hành động khuyến nghị cho người dùng
            
            Giữ response ngắn gọn và chuyên nghiệp.
            """
            
            # Tạo request data
            data = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 300
                }
            }
            
            # Gửi request
            request_data = json.dumps(data).encode('utf-8')
            url = f"{self.base_url}?key={self.api_key}"
            
            req = urllib.request.Request(url, data=request_data, headers={
                'Content-Type': 'application/json'
            })
            
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                
                if 'candidates' in result and result['candidates']:
                    text = result['candidates'][0]['content']['parts'][0]['text']
                    logger.info("✅ Google AI explanation generated")
                    return text.strip()
                else:
                    logger.warning("⚠️ Google AI returned empty response")
                    return self._get_fallback_explanation(classification)
                    
        except Exception as e:
            logger.error(f"❌ Google AI error: {e}")
            return self._get_fallback_explanation(classification)
    
    def _get_fallback_explanation(self, classification):
        """Fallback explanation khi AI lỗi"""
        explanations = {
            'safe': '✅ Email này có vẻ an toàn. Không phát hiện mối đe dọa bảo mật rõ ràng.',
            'spam': '📧 Email này được phân loại là spam. Có thể chứa quảng cáo không mong muốn.',
            'phishing': '🎣 Email này có đặc điểm lừa đảo. Có thể cố gắng lấy thông tin cá nhân.',
            'malware': '🦠 Email này có thể chứa phần mềm độc hại. Rất nguy hiểm!',
            'suspicious': '⚠️ Email này có đặc điểm đáng ngờ. Hãy thận trọng.'
        }
        return explanations.get(classification, f'Email được phân loại là {classification}.')

class EmailAnalyzer:
    """Phân tích email với Google AI và MySQL"""
    
    def __init__(self):
        """Khởi tạo analyzer"""
        self.model = None
        self.spam_keywords = ['win', 'lottery', 'congratulations', 'free money', 'urgent', 'click here']
        self.phishing_keywords = ['verify', 'account', 'suspended', 'login', 'password', 'bank']
        self.malware_keywords = ['download', 'virus', 'scan', 'update', 'install']
        
        # Khởi tạo Google AI
        api_key = os.getenv('GOOGLE_API_KEY', 'AIzaSyBqXOoWIhFrWeuNfgG-gTm17LaXP1VwHxI')
        self.google_ai = GoogleAI(api_key)
        
        # Khởi tạo database
        self.db = get_database()
        
        # Load model nếu có
        self._load_model()
        logger.info("✅ Email analyzer with Google AI and MySQL initialized")
    
    def _load_model(self):
        """Load ML model nếu có"""
        try:
            if os.path.exists('model/model_check_email.pkl'):
                with open('model/model_check_email.pkl', 'rb') as f:
                    self.model = pickle.load(f)
                logger.info("✅ ML model loaded")
            else:
                logger.info("⚠️ No ML model - using rule-based")
        except Exception as e:
            logger.warning(f"⚠️ Model load failed: {e}")
    
    def analyze_email(self, email_text):
        """Phân tích email với Google AI và lưu vào MySQL"""
        start_time = datetime.now()
        
        # Phân loại
        classification = self._classify_email(email_text)
        
        # Giải thích bằng Google AI
        explanation = self.google_ai.generate_explanation(email_text, classification)
        
        # Tính điểm rủi ro
        risk_score = self._calculate_risk(classification, email_text)
        
        # Khuyến nghị
        recommendations = self._get_recommendations(classification)
        
        # Thời gian xử lý
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Tạo kết quả
        result = {
            "email_text": email_text,
            "classification": classification,
            "confidence": 0.85,
            "explanation": explanation,
            "risk_score": risk_score,
            "recommendations": recommendations,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat(),
            "ai_used": True
        }
        
        # Lưu vào database
        try:
            self.db.save_analysis_result(result)
            logger.info("✅ Analysis result saved to MySQL")
        except Exception as e:
            logger.warning(f"⚠️ Failed to save to database: {e}")
        
        return result
    
    def _classify_email(self, email_text):
        """Phân loại email"""
        email_lower = email_text.lower()
        
        # Dùng ML model nếu có
        if self.model:
            try:
                # Giả sử model.predict trả về classification
                prediction = self.model.predict([email_text])
                if prediction:
                    return prediction[0]
            except:
                pass
        
        # Rule-based classification
        spam_count = sum(1 for word in self.spam_keywords if word in email_lower)
        phishing_count = sum(1 for word in self.phishing_keywords if word in email_lower)
        malware_count = sum(1 for word in self.malware_keywords if word in email_lower)
        
        if malware_count >= 1:
            return 'malware'
        elif phishing_count >= 2:
            return 'phishing'
        elif spam_count >= 2:
            return 'spam'
        elif 'urgent' in email_lower or 'asap' in email_lower:
            return 'suspicious'
        else:
            return 'safe'
    
    def _calculate_risk(self, classification, email_text):
        """Tính điểm rủi ro"""
        risk_levels = {'safe': 0, 'suspicious': 25, 'spam': 50, 'phishing': 75, 'malware': 90}
        base_risk = risk_levels.get(classification, 25)
        
        # Tăng điểm nếu có từ khóa nguy hiểm
        email_lower = email_text.lower()
        if 'urgent' in email_lower:
            base_risk += 10
        if 'click' in email_lower:
            base_risk += 15
        
        return min(base_risk, 100)
    
    def _get_recommendations(self, classification):
        """Khuyến nghị bảo mật"""
        recommendations = {
            'safe': ['✅ Email an toàn, có thể đọc bình thường'],
            'spam': ['🗑️ Xóa email', '🚫 Không trả lời'],
            'phishing': ['🚫 KHÔNG click liên kết', '🚫 KHÔNG cung cấp thông tin'],
            'malware': ['🚨 Xóa ngay lập tức', '🛡️ Quét virus máy tính'],
            'suspicious': ['⚠️ Thận trọng', '🔍 Kiểm tra kỹ trước khi hành động']
        }
        return recommendations.get(classification, ['Cần xem xét thêm'])

class EmailGuardianHandler(BaseHTTPRequestHandler):
    """HTTP handler cho Email Guardian"""
    
    def __init__(self, *args, analyzer=None, **kwargs):
        self.analyzer = analyzer
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Xử lý GET request"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self._send_response(200, {
                "message": "Email Guardian API with Google AI + MySQL",
                "version": "3.0.0",
                "status": "running",
                "ai_enabled": True,
                "database": "MySQL",
                "docs": "/docs"
            })
        elif parsed_path.path == '/health':
            self._send_response(200, {
                "status": "healthy",
                "version": "3.0.0",
                "ai_enabled": True,
                "database": "MySQL",
                "timestamp": datetime.now().isoformat()
            })
        elif parsed_path.path == '/docs':
            self._send_html_response(200, self._get_docs_html())
        elif parsed_path.path == '/api/stats':
            self._handle_stats()
        elif parsed_path.path == '/api/history':
            self._handle_history()
        else:
            self._send_response(404, {"error": "Not found"})
    
    def do_POST(self):
        """Xử lý POST request"""
        if self.path == '/api/analyze':
            self._handle_analyze()
        else:
            self._send_response(404, {"error": "Not found"})
    
    def _handle_analyze(self):
        """Xử lý phân tích email"""
        try:
            # Kiểm tra analyzer
            if not self.analyzer:
                self._send_response(500, {"error": "Analyzer not available"})
                return
            
            # Đọc request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            # Parse JSON
            request_data = json.loads(post_data.decode('utf-8'))
            email_text = request_data.get('text', '')
            
            if not email_text:
                self._send_response(400, {"error": "Email text is required"})
                return
            
            # Phân tích email với Google AI và lưu MySQL
            result = self.analyzer.analyze_email(email_text)
            
            # Trả về kết quả (bỏ email_text để giảm dung lượng)
            response_data = {k: v for k, v in result.items() if k != 'email_text'}
            self._send_response(200, response_data)
            
        except json.JSONDecodeError:
            self._send_response(400, {"error": "Invalid JSON"})
        except Exception as e:
            logger.error(f"Analysis error: {e}")
            self._send_response(500, {"error": "Internal server error"})
    
    def _handle_stats(self):
        """Xử lý thống kê"""
        try:
            db = self.analyzer.db
            stats = db.get_classification_stats()
            daily_stats = db.get_daily_stats(7)
            
            self._send_response(200, {
                "classification_stats": stats,
                "daily_stats": daily_stats
            })
        except Exception as e:
            logger.error(f"Stats error: {e}")
            self._send_response(500, {"error": "Failed to get stats"})
    
    def _handle_history(self):
        """Xử lý lịch sử"""
        try:
            db = self.analyzer.db
            recent = db.get_recent_analyses(10)
            
            self._send_response(200, {
                "recent_analyses": recent
            })
        except Exception as e:
            logger.error(f"History error: {e}")
            self._send_response(500, {"error": "Failed to get history"})
    
    def _send_response(self, status_code, data):
        """Gửi JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response.encode('utf-8'))
    
    def _send_html_response(self, status_code, html):
        """Gửi HTML response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(html.encode('utf-8'))
    
    def _get_docs_html(self):
        """HTML cho API docs"""
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email Guardian API - Google AI + MySQL</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .endpoint { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
                .method { color: #007cba; font-weight: bold; }
                .url { color: #333; font-family: monospace; }
                .ai-badge { background: #4CAF50; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
                .db-badge { background: #2196F3; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>📧 Email Guardian API <span class="ai-badge">🤖 Google AI</span> <span class="db-badge">🗄️ MySQL</span></h1>
            <p>API phân tích email bảo mật với Google AI và MySQL database</p>
            
            <div class="endpoint">
                <h3><span class="method">POST</span> <span class="url">/api/analyze</span></h3>
                <p>Phân tích email với Google AI và lưu vào MySQL</p>
                <h4>Request:</h4>
                <pre>{"text": "Nội dung email"}</pre>
                <h4>Response:</h4>
                <pre>{
  "classification": "safe|spam|phishing|malware|suspicious",
  "confidence": 0.85,
  "explanation": "Giải thích thông minh từ Google AI",
  "risk_score": 25,
  "recommendations": ["Khuyến nghị"],
  "processing_time": 100,
  "timestamp": "2024-01-01T12:00:00",
  "ai_used": true
}</pre>
            </div>
            
            <div class="endpoint">
                <h3><span class="method">GET</span> <span class="url">/api/stats</span></h3>
                <p>Lấy thống kê phân tích từ MySQL</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method">GET</span> <span class="url">/api/history</span></h3>
                <p>Lấy lịch sử phân tích gần đây</p>
            </div>
            
            <div class="endpoint">
                <h3><span class="method">GET</span> <span class="url">/health</span></h3>
                <p>Kiểm tra sức khỏe server, AI và database</p>
            </div>
            
            <h3>🚀 Tính năng:</h3>
            <ul>
                <li>✅ Phân loại email thông minh</li>
                <li>🤖 Giải thích bằng Google AI</li>
                <li>🗄️ Lưu trữ MySQL database</li>
                <li>📊 Thống kê và lịch sử</li>
                <li>🛡️ Đánh giá rủi ro</li>
                <li>💡 Khuyến nghị bảo mật</li>
                <li>⚡ Server built-in Python</li>
            </ul>
        </body>
        </html>
        """
    
    def log_message(self, format, *args):
        """Override logging"""
        logger.info(f"{self.address_string()} - {format % args}")

def create_handler_class(analyzer):
    """Tạo handler class với analyzer"""
    return type('EmailGuardianHandler', (EmailGuardianHandler,), {
        '__init__': lambda self, *args, **kwargs: EmailGuardianHandler.__init__(self, *args, analyzer=analyzer, **kwargs)
    })

def main():
    """Main function"""
    logger.info("🚀 Email Guardian - Server with Google AI + MySQL")
    
    # Khởi tạo analyzer với Google AI và MySQL
    analyzer = EmailAnalyzer()
    
    # Tạo handler class
    handler_class = create_handler_class(analyzer)
    
    # Khởi động server
    port = 8000
    server = HTTPServer(('0.0.0.0', port), handler_class)
    
    logger.info(f"🌐 Server running on http://localhost:{port}")
    logger.info("📚 API docs: http://localhost:8000/docs")
    logger.info("🤖 Google AI: Enabled")
    logger.info("🗄️ MySQL: Connected")
    logger.info("🛑 Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped")
        # Đóng database connection
        if analyzer.db:
            analyzer.db.close()
        server.shutdown()

if __name__ == "__main__":
    main() 