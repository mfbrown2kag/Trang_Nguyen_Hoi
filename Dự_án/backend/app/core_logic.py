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
            classification = predictions[0] if predictions else "unknown"
            
            # Get AI explanation using the existing Answer_Question_From_Documents
            ai_analyzer = Answer_Question_From_Documents(email_text, classification)
            explanation = ai_analyzer.run()
            
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
        
        if classification == 'spam' and spam_count >= 2:
            base_confidence += 0.1
        elif classification == 'phishing' and phishing_count >= 2:
            base_confidence += 0.1
        elif classification == 'safe' and spam_count == 0 and phishing_count == 0:
            base_confidence += 0.05
        
        return min(max(base_confidence, 0.1), 0.99)
    
    def _extract_features(self, email_text):
        """Extract features from email text"""
        return {
            "length": len(email_text),
            "word_count": len(email_text.split()),
            "has_links": "http" in email_text.lower(),
            "has_urgent_words": any(word in email_text.lower() 
                                  for word in ['urgent', 'immediate', 'asap']),
            "has_money_words": any(word in email_text.lower() 
                                 for word in ['money', 'win', 'lottery', 'prize']),
            "has_action_words": any(word in email_text.lower() 
                                  for word in ['click', 'verify', 'confirm', 'download'])
        }
    
    def _calculate_risk_score(self, classification, confidence):
        """Calculate risk score from 0-100"""
        risk_levels = {
            'safe': 0,
            'suspicious': 1,
            'spam': 2,
            'phishing': 3,
            'malware': 4
        }
        base_risk = risk_levels.get(classification, 1)
        return min(int(base_risk * confidence * 25), 100)
    
    def _get_recommendations(self, classification):
        """Get security recommendations based on classification"""
        recommendations = {
            'safe': ['Email appears safe to read and respond to'],
            'suspicious': [
                'Verify sender identity before responding',
                'Avoid clicking suspicious links',
                'Check for unusual requests'
            ],
            'spam': [
                'Delete email immediately',
                'Mark as spam',
                'Do not reply or click any links'
            ],
            'phishing': [
                'DO NOT click any links',
                'Do not provide any personal information',
                'Report to IT security team',
                'Delete immediately'
            ],
            'malware': [
                'Quarantine immediately',
                'Run full system virus scan',
                'Contact security team',
                'Do not open any attachments'
            ]
        }
        return recommendations.get(classification, ['Requires further review'])

# Global analyzer instance
_analyzer_instance = None

def get_analyzer():
    """Get or create the global analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = EmailAnalyzer()
    return _analyzer_instance 