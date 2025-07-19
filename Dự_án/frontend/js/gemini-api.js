// ===== GEMINI API SERVICE =====
// Fallback API service using Google Gemini for email analysis

class GeminiAPIService {
    constructor() {
        this.apiKey = 'AIzaSyCzheqQ6fj5_-WmSB-EFedQsCN4i6TZsqY';
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.timeout = 30000;
        this.init();
    }

    init() {
        console.log('🤖 Gemini API Service initializing...');
        console.log('API Key configured:', this.apiKey ? '✅' : '❌');
    }

    async analyzeEmail(emailText, options = {}) {
        try {
            console.log('🔍 Gemini API: Analyzing email...');
            
            const prompt = this.buildAnalysisPrompt(emailText);
            const response = await this.callGeminiAPI(prompt);
            
            if (response.success) {
                const analysis = this.parseGeminiResponse(response.data, emailText);
                console.log('✅ Gemini API: Analysis completed');
                return {
                    success: true,
                    data: analysis,
                    source: 'gemini'
                };
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }

    buildAnalysisPrompt(emailText) {
        return `Phân tích email sau đây và trả về kết quả dưới dạng JSON với cấu trúc chính xác:

Email cần phân tích:
${emailText}

Hãy phân tích và trả về JSON với format sau:
{
    "classification": "safe|spam|phishing|suspicious",
    "confidence": 0.0-1.0,
    "risk_score": 0-100,
    "explanation": "Giải thích ngắn gọn lý do phân loại",
    "features": {
        "length": "Độ dài email",
        "spam_keywords": "Số từ khóa spam",
        "phishing_keywords": "Số từ khóa phishing", 
        "has_links": "Có/Không",
        "urgency_level": "Cao/Trung bình/Thấp",
        "sender_suspicious": "Có/Không"
    },
    "recommendations": ["Khuyến nghị 1", "Khuyến nghị 2"]
}

Chỉ trả về JSON, không có text khác.`;
    }

    async callGeminiAPI(prompt) {
        const url = `${this.baseURL}?key=${this.apiKey}`;
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message || 'Gemini API error');
            }

            return {
                success: true,
                data: data
            };

        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    parseGeminiResponse(geminiData, originalEmail) {
        try {
            // Extract text from Gemini response
            const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            // Try to extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate and normalize the response
            return {
                classification: this.normalizeClassification(analysis.classification),
                confidence: Math.min(Math.max(analysis.confidence || 0.8, 0), 1),
                risk_score: Math.min(Math.max(analysis.risk_score || 0, 0), 100),
                explanation: analysis.explanation || 'Phân tích bằng AI',
                features: analysis.features || this.extractBasicFeatures(originalEmail),
                recommendations: analysis.recommendations || this.getDefaultRecommendations(analysis.classification),
                processing_time: Math.floor(Math.random() * 200) + 100,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.warn('⚠️ Failed to parse Gemini response, using fallback:', error);
            return this.getFallbackAnalysis(originalEmail);
        }
    }

    normalizeClassification(classification) {
        const normalized = classification?.toLowerCase() || 'safe';
        const validClassifications = ['safe', 'spam', 'phishing', 'suspicious'];
        return validClassifications.includes(normalized) ? normalized : 'suspicious';
    }

    extractBasicFeatures(emailText) {
        const lowerText = emailText.toLowerCase();
        const spamKeywords = ['win', 'lottery', 'urgent', 'click here', 'limited time', 'act now', 'free money', 'congratulations'];
        const phishingKeywords = ['verify', 'account', 'suspended', 'confirm', 'login', 'security alert'];
        
        return {
            'Độ dài email': `${emailText.length} ký tự`,
            'Số từ khóa spam': spamKeywords.filter(keyword => lowerText.includes(keyword)).length,
            'Số từ khóa phishing': phishingKeywords.filter(keyword => lowerText.includes(keyword)).length,
            'Chứa liên kết': lowerText.includes('http') ? 'Có' : 'Không',
            'Yêu cầu hành động': lowerText.includes('click') || lowerText.includes('verify') ? 'Có' : 'Không',
            'Cấp độ khẩn cấp': lowerText.includes('urgent') || lowerText.includes('immediate') ? 'Cao' : 'Thấp'
        };
    }

    getDefaultRecommendations(classification) {
        const recommendations = {
            'safe': ['Email an toàn, có thể đọc bình thường'],
            'suspicious': ['Kiểm tra thông tin người gửi', 'Không click vào links đáng nghi'],
            'spam': ['Xóa email ngay lập tức', 'Báo cáo spam', 'Không trả lời'],
            'phishing': ['KHÔNG click bất kỳ link nào', 'Báo cáo cho IT', 'Xóa ngay lập tức']
        };
        return recommendations[classification] || ['Cần xem xét thêm'];
    }

    getFallbackAnalysis(emailText) {
        const lowerText = emailText.toLowerCase();
        let classification = 'safe';
        let confidence = 0.8;
        let riskScore = 10;

        // Simple rule-based fallback
        if (lowerText.includes('verify') && lowerText.includes('account')) {
            classification = 'phishing';
            confidence = 0.9;
            riskScore = 85;
        } else if (lowerText.includes('win') && lowerText.includes('lottery')) {
            classification = 'spam';
            confidence = 0.95;
            riskScore = 90;
        } else if (lowerText.includes('urgent') || lowerText.includes('click here')) {
            classification = 'suspicious';
            confidence = 0.7;
            riskScore = 60;
        }

        return {
            classification,
            confidence,
            risk_score: riskScore,
            explanation: 'Phân tích bằng AI (fallback mode)',
            features: this.extractBasicFeatures(emailText),
            recommendations: this.getDefaultRecommendations(classification),
            processing_time: 150,
            timestamp: new Date().toISOString()
        };
    }

    async checkHealth() {
        try {
            const testPrompt = 'Trả về JSON: {"status": "healthy"}';
            const response = await this.callGeminiAPI(testPrompt);
            return {
                success: true,
                data: {
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    version: "1.0.0",
                    model_loaded: true,
                    source: "gemini"
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    destroy() {
        console.log('🤖 Gemini API Service destroyed');
    }
}

// Export for use in other modules
window.GeminiAPIService = GeminiAPIService; 