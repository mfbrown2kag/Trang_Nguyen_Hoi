"""
Email Analysis - Simple Fallback System
======================================

Module đơn giản để giải thích kết quả phân tích email.
Không phụ thuộc vào Google AI, chỉ dùng logic đơn giản.

Author: Email Guardian Team
Version: 3.0.0 - Simplified
"""

import logging

# Setup logging
logger = logging.getLogger(__name__)

class SimpleEmailExplainer:
    """
    Giải thích email đơn giản - Không cần Google AI
    
    Cung cấp giải thích cơ bản cho kết quả phân loại email
    dựa trên logic đơn giản và từ khóa.
    """
    
    def __init__(self, email_text: str, classification: str):
        """
        Khởi tạo explainer đơn giản
        
        Args:
            email_text: Nội dung email
            classification: Kết quả phân loại
        """
        self.email_text = email_text
        self.classification = classification
        logger.info(f"✅ Simple explainer initialized for {classification}")
    
    def run(self) -> str:
        """
        Tạo giải thích đơn giản
        
        Returns:
            Giải thích bằng tiếng Việt
        """
        try:
            # Lấy giải thích dựa trên classification
            explanation = self._get_explanation()
            logger.info(f"✅ Explanation created for {self.classification}")
            return explanation
            
        except Exception as e:
            logger.error(f"❌ Error creating explanation: {e}")
            return f"Email được phân loại là {self.classification}. Vui lòng xem xét cẩn thận."
    
    def _get_explanation(self) -> str:
        """Lấy giải thích dựa trên classification"""
        
        # Giải thích cho từng loại
        explanations = {
            'safe': self._get_safe_explanation(),
            'an toàn': self._get_safe_explanation(),
            'spam': self._get_spam_explanation(),
            'phishing': self._get_phishing_explanation(),
            'lừa đảo': self._get_phishing_explanation(),
            'malware': self._get_malware_explanation(),
            'phần mềm độc hại': self._get_malware_explanation(),
            'suspicious': self._get_suspicious_explanation(),
            'đáng ngờ': self._get_suspicious_explanation()
        }
        
        return explanations.get(
            self.classification.lower(),
            f"Email được phân loại là {self.classification}. Vui lòng xem xét cẩn thận."
        )
    
    def _get_safe_explanation(self) -> str:
        """Giải thích cho email an toàn"""
        return (
            "✅ Email này có vẻ an toàn. "
            "Không phát hiện mối đe dọa bảo mật rõ ràng. "
            "Bạn có thể đọc và trả lời bình thường."
        )
    
    def _get_spam_explanation(self) -> str:
        """Giải thích cho email spam"""
        return (
            "📧 Email này được phân loại là spam. "
            "Có thể chứa quảng cáo không mong muốn hoặc nội dung đáng ngờ. "
            "Khuyến nghị xóa email này."
        )
    
    def _get_phishing_explanation(self) -> str:
        """Giải thích cho email phishing"""
        return (
            "🎣 Email này có đặc điểm lừa đảo. "
            "Có thể cố gắng lấy thông tin cá nhân của bạn. "
            "KHÔNG click vào liên kết hoặc cung cấp thông tin."
        )
    
    def _get_malware_explanation(self) -> str:
        """Giải thích cho email malware"""
        return (
            "🦠 Email này có thể chứa phần mềm độc hại. "
            "Rất nguy hiểm! KHÔNG mở tệp đính kèm hoặc click liên kết. "
            "Xóa email ngay lập tức."
        )
    
    def _get_suspicious_explanation(self) -> str:
        """Giải thích cho email đáng ngờ"""
        return (
            "⚠️ Email này có đặc điểm đáng ngờ. "
            "Có thể không an toàn. "
            "Hãy thận trọng trước khi thực hiện bất kỳ hành động nào."
        )

# Alias để tương thích với code cũ
Answer_Question_From_Documents = SimpleEmailExplainer