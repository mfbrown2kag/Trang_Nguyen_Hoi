"""
Core logic module for Email Guardian
Extracts email analysis functionality for reuse across different interfaces
"""

import pickle
import os
from .gen import Answer_Question_From_Documents

class EmailAnalyzer:
    """Core email analysis engine"""
    
    def __init__(self, model_path="model/model_check_email.pkl"):
        """Initialize the analyzer with ML model"""
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the ML model from file"""
        try:
            # Adjust path based on current working directory
            if os.path.exists(self.model_path):
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
                print(f"✅ Model loaded from {self.model_path}")
            else:
                # Try alternative path
                alt_path = os.path.join("backend", self.model_path)
                if os.path.exists(alt_path):
                    with open(alt_path, "rb") as f:
                        self.model = pickle.load(f)
                    print(f"✅ Model loaded from {alt_path}")
                else:
                    raise FileNotFoundError(f"Model file not found: {self.model_path}")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def analyze_email(self, email_text):
        """
        Analyze email text and return classification with AI explanation
        
        Args:
            email_text (str): The email content to analyze
            
        Returns:
            dict: Analysis results including classification, confidence, and explanation
        """
        if not self.model:
            raise RuntimeError("Model not loaded")
        
        if not email_text or not email_text.strip():
            raise ValueError("Email text cannot be empty")
        
        try:
            # Get ML model prediction
            predictions = self.model.predict([email_text])
            raw_classification = predictions[0] if predictions else "unknown"
            
            # Map to Vietnamese classification names
            classification_map = {
                # English labels
                'safe': 'An toàn',
                'spam': 'Spam',
                'phishing': 'Lừa đảo',
                'suspicious': 'Đáng ngờ',
                'malware': 'Phần mềm độc hại',
                'unknown': 'Cần xem xét thêm',
                'notification': 'Thông báo',
                'invoice': 'Hóa đơn',
                'promotion': 'Khuyến mãi',
                # Vietnamese labels (from model)
                'Bình thường': 'An toàn',
                'Giả mạo': 'Lừa đảo',
                'Spam': 'Spam',
                'Đáng ngờ': 'Đáng ngờ',
                'Phần mềm độc hại': 'Phần mềm độc hại',
                'Thông báo': 'Thông báo',
                'Hóa đơn': 'Hóa đơn',
                'Khuyến mãi': 'Khuyến mãi',
                'An toàn': 'An toàn',
                'Lừa đảo': 'Lừa đảo',
                # Additional mappings for model output
                'normal': 'An toàn',
                'fake': 'Lừa đảo',
                'suspicious': 'Đáng ngờ'
            }
            
            print(f"🔍 Debug: Raw classification from model: '{raw_classification}'")
            print(f"🔍 Debug: Available keys in map: {list(classification_map.keys())}")
            
            # Get base classification from model
            base_classification = classification_map.get(raw_classification, 'Cần xem xét thêm')
            
            # Apply content-based classification rules
            classification = self._apply_content_rules(base_classification, email_text)
            
            print(f"🔍 Debug: Base classification: '{base_classification}'")
            print(f"🔍 Debug: Final classification: '{classification}'")
            
            # Get AI explanation using the existing Answer_Question_From_Documents
            ai_analyzer = Answer_Question_From_Documents(email_text, classification)
            explanation = ai_analyzer.run()
            
            # If AI explanation fails, provide a basic explanation
            if explanation and (explanation.startswith("❌") or "không thể" in explanation.lower()):
                explanation = self._generate_basic_explanation(classification, email_text)
            
            # Calculate confidence (placeholder - you might want to enhance this)
            confidence = self._calculate_confidence(email_text, classification)
            
            # Extract features for detailed analysis
            features = self._extract_features(email_text)
            
            return {
                "classification": classification,
                "confidence": confidence,
                "explanation": explanation,
                "features": features,
                "processing_time": 0,  # Will be calculated by API layer
                "risk_score": self._calculate_risk_score(classification, confidence),
                "recommendations": self._get_recommendations(classification)
            }
            
        except Exception as e:
            print(f"❌ Error during analysis: {e}")
            raise
    
    def _calculate_confidence(self, email_text, classification):
        """Calculate confidence score based on various factors"""
        # This is a simplified confidence calculation
        # You can enhance this based on your model's actual confidence scores
        
        base_confidence = 0.85
        
        # Adjust based on email length
        if len(email_text) < 50:
            base_confidence -= 0.1
        elif len(email_text) > 1000:
            base_confidence += 0.05
        
        # Adjust based on classification patterns
        spam_keywords = ['win', 'lottery', 'urgent', 'click here', 'free money']
        phishing_keywords = ['verify', 'account', 'suspended', 'confirm', 'login']
        
        email_lower = email_text.lower()
        spam_count = sum(1 for keyword in spam_keywords if keyword in email_lower)
        phishing_count = sum(1 for keyword in phishing_keywords if keyword in email_lower)
        
        # Map Vietnamese classification back to English for comparison
        classification_map_reverse = {
            'An toàn': 'safe',
            'Spam': 'spam', 
            'Lừa đảo': 'phishing',
            'Đáng ngờ': 'suspicious',
            'Phần mềm độc hại': 'malware',
            'Cần xem xét thêm': 'unknown'
        }
        eng_classification = classification_map_reverse.get(classification, classification)
        
        if eng_classification == 'spam' and spam_count >= 2:
            base_confidence += 0.1
        elif eng_classification == 'phishing' and phishing_count >= 2:
            base_confidence += 0.1
        elif eng_classification == 'safe' and spam_count == 0 and phishing_count == 0:
            base_confidence += 0.05
        
        return min(max(base_confidence, 0.1), 0.99)
    
    def _apply_content_rules(self, base_classification, email_text):
        """Apply content-based rules to improve classification"""
        email_lower = email_text.lower()
        
        # Invoice detection
        invoice_keywords = ['invoice', 'hóa đơn', 'bill', 'payment', 'amount', 'due date', 'billing']
        if any(keyword in email_lower for keyword in invoice_keywords):
            return 'Hóa đơn'
        
        # Notification detection
        notification_keywords = ['notification', 'thông báo', 'announcement', 'update', 'important notice']
        if any(keyword in email_lower for keyword in notification_keywords):
            return 'Thông báo'
        
        # Promotion detection
        promotion_keywords = ['promotion', 'khuyến mãi', 'discount', 'offer', 'sale', 'limited time', 'special']
        if any(keyword in email_lower for keyword in promotion_keywords):
            return 'Khuyến mãi'
        
        # Spam detection (override safe classification)
        spam_keywords = ['congratulations', 'winner', 'lottery', 'prize', 'free money', 'claim now', 'act now']
        if any(keyword in email_lower for keyword in spam_keywords):
            return 'Spam'
        
        # Phishing detection (override safe classification)
        phishing_keywords = ['verify', 'confirm', 'account suspended', 'login', 'password', 'security alert']
        if any(keyword in email_lower for keyword in phishing_keywords):
            return 'Lừa đảo'
        
        # Return base classification if no specific rules match
        return base_classification
    
    def _extract_features(self, email_text):
        """Extract features from email text"""
        email_lower = email_text.lower()
        
        # Check for suspicious patterns
        urgent_words = ['urgent', 'immediate', 'asap', 'now', 'quickly', 'hurry', 'congratulations']
        money_words = ['money', 'win', 'lottery', 'prize', 'million', 'dollar', '$', 'cash', '1000000']
        action_words = ['click', 'verify', 'confirm', 'download', 'login', 'password', 'claim']
        spam_words = ['free', 'limited time', 'exclusive', 'act now', 'don\'t miss', 'congratulations']
        
        # Count occurrences for better analysis
        urgent_count = sum(1 for word in urgent_words if word in email_lower)
        money_count = sum(1 for word in money_words if word in email_lower)
        action_count = sum(1 for word in action_words if word in email_lower)
        spam_count = sum(1 for word in spam_words if word in email_lower)
        

        
        return {
            "📏 Độ dài email": f"{len(email_text)} ký tự",
            "📝 Số từ": f"{len(email_text.split())} từ",
            "🔗 Có liên kết": "✅ Có" if "http" in email_lower else "❌ Không",
            "⚡ Từ khóa khẩn cấp": f"⚠️ Có ({urgent_count} từ)" if urgent_count > 0 else "✅ Không",
            "💰 Từ khóa tiền bạc": f"💸 Có ({money_count} từ)" if money_count > 0 else "✅ Không",
            "🎯 Từ khóa hành động": f"🔧 Có ({action_count} từ)" if action_count > 0 else "✅ Không",
            "📧 Từ khóa spam": f"🚫 Có ({spam_count} từ)" if spam_count > 0 else "✅ Không"
        }
    
    def _calculate_risk_score(self, classification, confidence):
        """Calculate risk score from 0-100"""
        risk_levels = {
            'An toàn': 0,
            'Đáng ngờ': 1,
            'Spam': 2,
            'Lừa đảo': 3,
            'Phần mềm độc hại': 4,
            'Cần xem xét thêm': 1
        }
        base_risk = risk_levels.get(classification, 1)
        return min(int(base_risk * confidence * 25), 100)
    
    def _generate_basic_explanation(self, classification, email_text):
        """Generate basic explanation when AI fails"""
        explanations = {
            'An toàn': f"✅ Email này được phân loại là An toàn vì không chứa các dấu hiệu đáng ngờ. Bạn có thể yên tâm đọc và trả lời email này.",
            'Spam': f"📧 Email này được phân loại là Spam vì chứa các từ khóa quảng cáo và lời hứa không thực tế. Khuyến nghị xóa email này.",
            'Lừa đảo': f"🎣 Email này được phân loại là Lừa đảo vì yêu cầu thông tin cá nhân hoặc có liên kết đáng ngờ. TUYỆT ĐỐI KHÔNG click vào liên kết hoặc cung cấp thông tin.",
            'Đáng ngờ': f"⚠️ Email này được phân loại là Đáng ngờ vì có một số dấu hiệu không bình thường. Hãy cẩn thận và xác minh trước khi hành động.",
            'Phần mềm độc hại': f"🦠 Email này được phân loại là Phần mềm độc hại vì có thể chứa virus hoặc mã độc. KHÔNG mở tệp đính kèm và xóa ngay lập tức.",
            'Cần xem xét thêm': f"❓ Email này cần xem xét thêm vì không thể phân loại rõ ràng. Hãy kiểm tra kỹ trước khi thực hiện bất kỳ hành động nào.",
            'Thông báo': f"📢 Email này được phân loại là Thông báo chính thức. Bạn có thể đọc và thực hiện theo hướng dẫn.",
            'Hóa đơn': f"🧾 Email này được phân loại là Hóa đơn thanh toán. Hãy kiểm tra thông tin thanh toán cẩn thận.",
            'Khuyến mãi': f"🎉 Email này được phân loại là Khuyến mãi. Hãy kiểm tra tính hợp lệ của chương trình trước khi tham gia."
        }
        return explanations.get(classification, f"📊 Email này được phân loại là {classification}. Hãy kiểm tra kỹ trước khi thực hiện bất kỳ hành động.")
    
    def _get_recommendations(self, classification):
        """Get security recommendations based on classification"""
        recommendations = {
            'An toàn': ['✅ Email an toàn, có thể đọc và trả lời bình thường'],
            'Đáng ngờ': [
                '🔍 Xác minh danh tính người gửi trước khi trả lời',
                '⚠️ Tránh click vào các liên kết đáng ngờ',
                '📋 Kiểm tra các yêu cầu bất thường'
            ],
            'Spam': [
                '🗑️ Xóa email ngay lập tức',
                '🏷️ Đánh dấu là spam',
                '❌ Không trả lời hoặc click vào bất kỳ liên kết nào'
            ],
            'Lừa đảo': [
                '🚫 TUYỆT ĐỐI KHÔNG click vào bất kỳ liên kết nào',
                '🔒 Không cung cấp thông tin cá nhân',
                '📞 Báo cáo cho đội bảo mật IT',
                '🗑️ Xóa ngay lập tức'
            ],
            'Phần mềm độc hại': [
                '🚨 Cách ly ngay lập tức',
                '🛡️ Chạy quét virus toàn hệ thống',
                '📞 Liên hệ đội bảo mật',
                '📎 Không mở bất kỳ tệp đính kèm nào'
            ],
            'Cần xem xét thêm': [
                '🔍 Kiểm tra kỹ nội dung email',
                '📧 Xác minh nguồn gốc',
                '⏰ Không vội vàng thực hiện yêu cầu'
            ],
            'Thông báo': [
                '📢 Email thông báo chính thức',
                '✅ Có thể đọc và thực hiện theo hướng dẫn'
            ],
            'Hóa đơn': [
                '🧾 Email hóa đơn thanh toán',
                '💰 Kiểm tra thông tin thanh toán',
                '📅 Ghi nhớ ngày hạn thanh toán'
            ],
            'Khuyến mãi': [
                '🎉 Email khuyến mãi từ doanh nghiệp',
                '🔍 Kiểm tra tính hợp lệ của chương trình',
                '⚠️ Cẩn thận với các ưu đãi quá hấp dẫn'
            ]
        }
        return recommendations.get(classification, ['❓ Cần xem xét thêm'])

# Global analyzer instance
_analyzer_instance = None

def get_analyzer():
    """Get or create the global analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = EmailAnalyzer()
    return _analyzer_instance 