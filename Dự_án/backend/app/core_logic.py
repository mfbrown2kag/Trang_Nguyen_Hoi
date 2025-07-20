"""
Email Guardian Core Logic
========================

Professional email analysis engine that combines:
- Machine Learning model for classification
- Google AI for detailed explanations
- Risk assessment and security recommendations

Author: Email Guardian Team
Version: 2.0.0
"""

import pickle
import os
import logging
from typing import Dict, Any, List
from datetime import datetime

from .gen import Answer_Question_From_Documents

# Setup logging
logger = logging.getLogger(__name__)

# ============================================================================
# EMAIL ANALYZER CLASS
# ============================================================================

class EmailAnalyzer:
    """
    Professional email analysis engine
    
    This class provides comprehensive email analysis using:
    1. ML Model: Pre-trained classifier for email types
    2. Google AI: Detailed explanations and insights
    3. Feature Extraction: Security-relevant features
    4. Risk Assessment: Calculated risk scores
    """
    
    def __init__(self, model_path: str = "model/model_check_email.pkl"):
        """
        Initialize the email analyzer
        
        Args:
            model_path: Path to the ML model file
        """
        self.model_path = model_path
        self.model = None
        self._load_model()
        
        # Security keywords for feature extraction
        self.spam_keywords = [
            'win', 'lottery', 'urgent', 'click here', 'free money',
            'congratulations', 'limited time', 'act now', 'exclusive offer'
        ]
        
        self.phishing_keywords = [
            'verify', 'account', 'suspended', 'confirm', 'login',
            'password', 'security', 'update', 'verify your account'
        ]
        
        self.malware_keywords = [
            'download', 'attachment', 'virus', 'scan', 'update software',
            'security patch', 'system update'
        ]
    
    def _load_model(self) -> None:
        """
        Load the machine learning model from file
        
        Raises:
            FileNotFoundError: If model file doesn't exist
            Exception: If model loading fails
        """
        try:
            # Try primary path
            if os.path.exists(self.model_path):
                with open(self.model_path, "rb") as f:
                    self.model = pickle.load(f)
                logger.info(f"✅ ML model loaded from {self.model_path}")
                return
            
            # Try alternative paths
            alt_paths = [
                os.path.join("backend", self.model_path),
                os.path.join(os.path.dirname(__file__), "..", "model", "model_check_email.pkl")
            ]
            
            for alt_path in alt_paths:
                if os.path.exists(alt_path):
                    with open(alt_path, "rb") as f:
                        self.model = pickle.load(f)
                    logger.info(f"✅ ML model loaded from {alt_path}")
                    return
            
            # If no model found
            raise FileNotFoundError(f"Model file not found in any expected location")
            
        except Exception as e:
            logger.error(f"❌ Failed to load ML model: {e}")
            raise
    
    def analyze_email(self, email_text: str) -> Dict[str, Any]:
        """
        Analyze email text and return comprehensive results
        
        This method performs:
        1. ML classification
        2. AI explanation generation
        3. Feature extraction
        4. Risk assessment
        5. Security recommendations
        
        Args:
            email_text: The email content to analyze
            
        Returns:
            Dictionary containing analysis results:
            - classification: Email type (safe/spam/phishing/malware)
            - confidence: Confidence score (0-1)
            - explanation: AI-generated explanation
            - features: Extracted security features
            - risk_score: Calculated risk score (0-100)
            - recommendations: Security recommendations
            
        Raises:
            RuntimeError: If model is not loaded
            ValueError: If email text is invalid
        """
        # Validate inputs
        if not self.model:
            raise RuntimeError("ML model not loaded")
        
        if not email_text or not email_text.strip():
            raise ValueError("Email text cannot be empty")
        
        try:
            logger.info(f"Starting email analysis (length: {len(email_text)} chars)")
            
            # Step 1: ML Model Classification
            classification = self._get_ml_classification(email_text)
            
            # Step 2: Google AI Explanation
            explanation = self._get_ai_explanation(email_text, classification)
            
            # Step 3: Feature Extraction
            features = self._extract_features(email_text)
            
            # Step 4: Confidence Calculation
            confidence = self._calculate_confidence(email_text, classification, features)
            
            # Step 5: Risk Assessment
            risk_score = self._calculate_risk_score(classification, confidence, features)
            
            # Step 6: Security Recommendations
            recommendations = self._get_recommendations(classification, risk_score)
            
            # Create comprehensive result
            result = {
                "classification": classification,
                "confidence": confidence,
                "explanation": explanation,
                "features": features,
                "risk_score": risk_score,
                "recommendations": recommendations,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Analysis completed - Classification: {classification}, Confidence: {confidence:.2f}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Analysis failed: {e}")
            raise
    
    def _get_ml_classification(self, email_text: str) -> str:
        """
        Get classification from ML model with improved error handling
        
        Args:
            email_text: Email content
            
        Returns:
            Classification string
        """
        try:
            if not self.model:
                logger.warning("ML model not loaded, using fallback classification")
                return self._fallback_classification(email_text)
            
            predictions = self.model.predict([email_text])
            classification = predictions[0] if predictions else "unknown"
            
            # Map model outputs to standard classifications
            classification_map = {
                'safe': 'safe',
                'spam': 'spam', 
                'phishing': 'phishing',
                'malware': 'malware',
                'suspicious': 'suspicious',
                'an toàn': 'safe',
                'lừa đảo': 'phishing',
                'phần mềm độc hại': 'malware',
                'đáng ngờ': 'suspicious'
            }
            
            mapped_classification = classification_map.get(classification.lower(), classification)
            logger.info(f"ML classification: {classification} -> {mapped_classification}")
            return mapped_classification
            
        except Exception as e:
            logger.warning(f"ML classification failed: {e}")
            return self._fallback_classification(email_text)
    
    def _fallback_classification(self, email_text: str) -> str:
        """
        Fallback classification when ML model fails
        
        Args:
            email_text: Email content
            
        Returns:
            Fallback classification
        """
        email_lower = email_text.lower()
        
        # Simple rule-based classification
        if any(word in email_lower for word in ['win', 'lottery', 'congratulations', 'free money']):
            return 'spam'
        elif any(word in email_lower for word in ['verify', 'account', 'suspended', 'login']):
            return 'phishing'
        elif any(word in email_lower for word in ['download', 'virus', 'scan', 'update']):
            return 'malware'
        elif any(word in email_lower for word in ['urgent', 'immediate', 'asap']):
            return 'suspicious'
        else:
            return 'safe'
    
    def _get_ai_explanation(self, email_text: str, classification: str) -> str:
        """
        Get AI explanation using Google AI
        
        Args:
            email_text: Email content
            classification: ML classification result
            
        Returns:
            AI-generated explanation
        """
        try:
            ai_analyzer = Answer_Question_From_Documents(email_text, classification)
            explanation = ai_analyzer.run()
            
            # Ensure explanation is not empty
            if not explanation or explanation.strip() == "":
                explanation = f"Email classified as {classification} based on content analysis."
            
            return explanation
            
        except Exception as e:
            logger.warning(f"AI explanation failed: {e}")
            return f"Email classified as {classification}. AI explanation unavailable."
    
    def _extract_features(self, email_text: str) -> Dict[str, Any]:
        """
        Extract security-relevant features from email
        
        Args:
            email_text: Email content
            
        Returns:
            Dictionary of extracted features
        """
        email_lower = email_text.lower()
        
        return {
            "length": len(email_text),
            "word_count": len(email_text.split()),
            "has_links": "http" in email_lower or "www." in email_lower,
            "has_attachments": "attachment" in email_lower or ".pdf" in email_lower or ".exe" in email_lower,
            "has_urgent_words": any(word in email_lower for word in ['urgent', 'immediate', 'asap', 'now']),
            "has_money_words": any(word in email_lower for word in ['money', 'win', 'lottery', 'prize', 'cash']),
            "has_action_words": any(word in email_lower for word in ['click', 'verify', 'confirm', 'download']),
            "spam_keyword_count": sum(1 for keyword in self.spam_keywords if keyword in email_lower),
            "phishing_keyword_count": sum(1 for keyword in self.phishing_keywords if keyword in email_lower),
            "malware_keyword_count": sum(1 for keyword in self.malware_keywords if keyword in email_lower),
            "has_suspicious_sender": any(domain in email_lower for domain in ['@fake.com', '@suspicious.com', '@unknown.com'])
        }
    
    def _calculate_confidence(self, email_text: str, classification: str, features: Dict[str, Any]) -> float:
        """
        Calculate confidence score based on multiple factors
        
        Args:
            email_text: Email content
            classification: ML classification
            features: Extracted features
            
        Returns:
            Confidence score (0-1)
        """
        base_confidence = 0.85
        
        # Adjust based on email length
        if len(email_text) < 50:
            base_confidence -= 0.1
        elif len(email_text) > 1000:
            base_confidence += 0.05
        
        # Adjust based on keyword matches
        if classification == 'spam' and features['spam_keyword_count'] >= 2:
            base_confidence += 0.1
        elif classification == 'phishing' and features['phishing_keyword_count'] >= 2:
            base_confidence += 0.1
        elif classification == 'malware' and features['malware_keyword_count'] >= 1:
            base_confidence += 0.15
        elif classification == 'safe' and features['spam_keyword_count'] == 0 and features['phishing_keyword_count'] == 0:
            base_confidence += 0.05
        
        # Adjust based on suspicious features
        if features['has_suspicious_sender']:
            base_confidence -= 0.1
        if features['has_attachments'] and classification in ['phishing', 'malware']:
            base_confidence += 0.1
        
        return min(max(base_confidence, 0.1), 0.99)
    
    def _calculate_risk_score(self, classification: str, confidence: float, features: Dict[str, Any]) -> int:
        """
        Calculate risk score from 0-100
        
        Args:
            classification: Email classification
            confidence: Confidence score
            features: Extracted features
            
        Returns:
            Risk score (0-100)
        """
        # Base risk levels
        risk_levels = {
            'safe': 0,
            'suspicious': 25,
            'spam': 50,
            'phishing': 75,
            'malware': 90
        }
        
        base_risk = risk_levels.get(classification, 25)
        
        # Adjust based on confidence
        confidence_multiplier = confidence
        
        # Adjust based on features
        feature_risk = 0
        if features['has_attachments']:
            feature_risk += 10
        if features['has_suspicious_sender']:
            feature_risk += 15
        if features['has_urgent_words']:
            feature_risk += 5
        
        # Calculate final risk score
        risk_score = int((base_risk * confidence_multiplier) + feature_risk)
        
        return min(max(risk_score, 0), 100)
    
    def _get_recommendations(self, classification: str, risk_score: int) -> List[str]:
        """
        Get security recommendations based on classification and risk
        
        Args:
            classification: Email classification
            risk_score: Calculated risk score
            
        Returns:
            List of security recommendations
        """
        base_recommendations = {
            'safe': [
                '✅ Email appears safe to read and respond to',
                '📧 Verify sender identity if unsure',
                '🔍 Check for any unusual requests'
            ],
            'suspicious': [
                '⚠️ Exercise caution with this email',
                '🔍 Verify sender identity before responding',
                '🚫 Avoid clicking suspicious links',
                '📧 Check for unusual requests or demands'
            ],
            'spam': [
                '🗑️ Delete email immediately',
                '🚫 Do not reply or click any links',
                '📧 Mark as spam in your email client',
                '🔒 Consider blocking the sender'
            ],
            'phishing': [
                '🚨 DO NOT click any links',
                '🚫 Do not provide any personal information',
                '📧 Report to IT security team immediately',
                '🗑️ Delete email immediately',
                '🔒 Change passwords if you clicked anything'
            ],
            'malware': [
                '🚨 QUARANTINE immediately',
                '🛡️ Run full system virus scan',
                '📞 Contact security team immediately',
                '🚫 Do not open any attachments',
                '💻 Check for unauthorized access'
            ]
        }
        
        recommendations = base_recommendations.get(classification, ['Requires further review'])
        
        # Add risk-based recommendations
        if risk_score >= 80:
            recommendations.insert(0, '🚨 HIGH RISK: Immediate action required')
        elif risk_score >= 60:
            recommendations.insert(0, '⚠️ MEDIUM RISK: Exercise extreme caution')
        
        return recommendations

# ============================================================================
# GLOBAL ANALYZER INSTANCE
# ============================================================================

_analyzer_instance = None

def get_analyzer() -> EmailAnalyzer:
    """
    Get or create the global analyzer instance
    
    Returns:
        EmailAnalyzer instance
        
    Raises:
        Exception: If analyzer initialization fails
    """
    global _analyzer_instance
    
    if _analyzer_instance is None:
        try:
            _analyzer_instance = EmailAnalyzer()
            logger.info("✅ Global analyzer instance created")
        except Exception as e:
            logger.error(f"❌ Failed to create analyzer instance: {e}")
            raise
    
    return _analyzer_instance 