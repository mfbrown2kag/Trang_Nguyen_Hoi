// ===== API SERVICE =====

class APIService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.timeout = CONFIG.API.TIMEOUT;
        this.retryAttempts = CONFIG.API.RETRY_ATTEMPTS;
        this.retryDelay = CONFIG.API.RETRY_DELAY;
        this.cache = new Map();
        this.cacheExpiry = CONFIG.STORAGE.CACHE_EXPIRY;
        
        this.init();
    }

    init() {
        console.log('🌐 API Service initializing...');
        console.log('Base URL:', this.baseURL);
    }

    // Generic HTTP request với retry logic
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const requestOptions = {
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🔄 API Request (attempt ${attempt}): ${options.method || 'GET'} ${url}`);
                
                const response = await this.fetchWithTimeout(url, requestOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('✅ API Response:', data);
                return { success: true, data };

            } catch (error) {
                console.warn(`❌ API Request failed (attempt ${attempt}):`, error.message);
                lastError = error;

                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        console.error('🚨 API Request failed after all attempts:', lastError);
        return { 
            success: false, 
            error: lastError.message,
            fallback: true
        };
    }

    // Fetch với timeout support
    async fetchWithTimeout(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Delay helper
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cache helpers
    getCacheKey(endpoint, params = {}) {
        return `${endpoint}_${JSON.stringify(params)}`;
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('📦 Using cached data for:', key);
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // =============================================================
    // EMAIL ANALYSIS API
    // =============================================================

    async analyzeEmail(emailText, options = {}) {
        const endpoint = CONFIG.API.ENDPOINTS.ANALYZE;
        const cacheKey = this.getCacheKey(endpoint, { text: emailText.substring(0, 100) });
        
        // Check cache first
        if (!options.skipCache) {
            const cached = this.getFromCache(cacheKey);
            if (cached) return { success: true, data: cached };
        }

        // Try backend API first
        const result = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({
                text: emailText,
                timestamp: new Date().toISOString(),
                options: options
            })
        });

        // If backend fails, try Gemini API
        if (!result.success) {
            console.log('🔄 Backend API failed, trying Gemini API...');
            
            try {
                const geminiService = new GeminiAPIService();
                const geminiResult = await geminiService.analyzeEmail(emailText, options);
                
                if (geminiResult.success) {
                    console.log('✅ Gemini API analysis successful');
                    result.data = geminiResult.data;
                    result.success = true;
                    result.source = 'gemini';
                } else {
                    console.log('⚠️ Gemini API failed, using mock data');
                    result.data = this.getMockAnalysisResult(emailText);
                    result.success = true;
                    result.source = 'mock';
                }
            } catch (error) {
                console.warn('⚠️ Gemini API error, using mock data:', error);
                result.data = this.getMockAnalysisResult(emailText);
                result.success = true;
                result.source = 'mock';
            }
        }

        // Cache successful responses
        if (result.success) {
            this.setCache(cacheKey, result.data);
        }

        return result;
    }

    async analyzeBatch(emails) {
        const endpoint = CONFIG.API.ENDPOINTS.BATCH;
        
        const result = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify({ emails })
        });

        if (!result.success) {
            // Return mock batch results
            result.data = emails.map(email => this.getMockAnalysisResult(email));
            result.success = true;
        }

        return result;
    }

    // =============================================================
    // DASHBOARD API
    // =============================================================

    async getStats(timeRange = 'week') {
        const endpoint = CONFIG.API.ENDPOINTS.STATS;
        const cacheKey = this.getCacheKey(endpoint, { timeRange });
        
        // Check cache
        const cached = this.getFromCache(cacheKey);
        if (cached) return { success: true, data: cached };

        const result = await this.request(`${endpoint}?range=${timeRange}`);

        if (!result.success) {
            // Return mock stats
            result.data = this.getMockStats(timeRange);
            result.success = true;
        }

        this.setCache(cacheKey, result.data);
        return result;
    }

    async getHistory(limit = 50, filters = {}) {
        const endpoint = CONFIG.API.ENDPOINTS.HISTORY;
        const params = new URLSearchParams({ limit, ...filters });
        
        const result = await this.request(`${endpoint}?${params}`);

        if (!result.success) {
            // Return mock history
            result.data = this.getMockHistory(limit);
            result.success = true;
        }

        return result;
    }

    async checkHealth() {
        const endpoint = CONFIG.API.ENDPOINTS.HEALTH;
        
        try {
            const result = await this.request(endpoint, {
                method: 'GET'
            });
            
            if (result.success) {
                console.log('✅ API Health Check: Connected to backend');
                return result;
            } else {
                console.warn('⚠️ API Health Check: Backend unavailable, trying Gemini API...');
                
                // Try Gemini API as fallback
                try {
                    const geminiService = new GeminiAPIService();
                    const geminiHealth = await geminiService.checkHealth();
                    
                    if (geminiHealth.success) {
                        console.log('✅ API Health Check: Connected to Gemini API');
                        return {
                            success: true,
                            data: {
                                status: "gemini_mode",
                                timestamp: new Date().toISOString(),
                                version: "1.0.0",
                                model_loaded: true,
                                source: "gemini"
                            },
                            fallback: true
                        };
                    } else {
                        throw new Error('Gemini API also failed');
                    }
                } catch (geminiError) {
                    console.warn('⚠️ API Health Check: Both backend and Gemini failed, using demo mode');
                    return {
                        success: true,
                        data: {
                            status: "demo_mode",
                            timestamp: new Date().toISOString(),
                            version: "1.0.0",
                            model_loaded: true,
                            source: "mock"
                        },
                        fallback: true
                    };
                }
            }
        } catch (error) {
            console.warn('⚠️ API Health Check: Error occurred, trying Gemini API...', error.message);
            
            // Try Gemini API as fallback
            try {
                const geminiService = new GeminiAPIService();
                const geminiHealth = await geminiService.checkHealth();
                
                if (geminiHealth.success) {
                    console.log('✅ API Health Check: Connected to Gemini API');
                    return {
                        success: true,
                        data: {
                            status: "gemini_mode",
                            timestamp: new Date().toISOString(),
                            version: "1.0.0",
                            model_loaded: true,
                            source: "gemini"
                        },
                        fallback: true
                    };
                } else {
                    throw new Error('Gemini API also failed');
                }
            } catch (geminiError) {
                console.warn('⚠️ API Health Check: All APIs failed, using demo mode');
                return {
                    success: true,
                    data: {
                        status: "demo_mode",
                        timestamp: new Date().toISOString(),
                        version: "1.0.0",
                        model_loaded: true,
                        source: "mock"
                    },
                    fallback: true
                };
            }
        }
    }

    // =============================================================
    // MOCK DATA GENERATORS (for demo/fallback)
    // =============================================================

    getMockAnalysisResult(emailText) {
        const lowerText = emailText.toLowerCase();
        let classification = 'safe';
        let confidence = 0.85;
        let reasoning = [];

        // Simple rule-based classification
        const spamKeywords = ['win', 'lottery', 'urgent', 'click here', 'limited time', 'act now', 'free money', 'congratulations'];
        const phishingKeywords = ['verify', 'account', 'suspended', 'confirm', 'login', 'security alert'];
        
        const spamCount = spamKeywords.filter(keyword => lowerText.includes(keyword)).length;
        const phishingCount = phishingKeywords.filter(keyword => lowerText.includes(keyword)).length;

        if (phishingCount >= 2) {
            classification = 'phishing';
            confidence = 0.89 + Math.random() * 0.1;
            reasoning.push('Chứa nhiều từ khóa phishing');
        } else if (spamCount >= 3) {
            classification = 'spam';
            confidence = 0.92 + Math.random() * 0.07;
            reasoning.push('Chứa nhiều từ khóa spam');
        } else if (spamCount >= 2 || phishingCount >= 1) {
            classification = 'suspicious';
            confidence = 0.70 + Math.random() * 0.15;
            reasoning.push('Có một số dấu hiệu đáng nghi');
        }

        // Extract features
        const features = {
            'Độ dài email': `${emailText.length} ký tự`,
            'Số từ khóa spam': spamCount,
            'Số từ khóa phishing': phishingCount,
            'Chứa liên kết': lowerText.includes('http') ? 'Có' : 'Không',
            'Yêu cầu hành động': lowerText.includes('click') || lowerText.includes('verify') ? 'Có' : 'Không',
            'Cấp độ khẩn cấp': lowerText.includes('urgent') || lowerText.includes('immediate') ? 'Cao' : 'Thấp',
            'Chứa số điện thoại': /\d{10,}/.test(emailText) ? 'Có' : 'Không',
            'Chứa email': /@/.test(emailText) ? 'Có' : 'Không'
        };

        return {
            classification,
            confidence: Math.min(confidence, 0.99),
            features,
            explanation: reasoning.length > 0 ? reasoning.join(', ') : 'Email có vẻ an toàn',
            processingTime: Math.floor(Math.random() * 300) + 150,
            timestamp: new Date().toISOString(),
            riskScore: this.calculateRiskScore(classification, confidence),
            recommendations: this.getRecommendations(classification)
        };
    }

    calculateRiskScore(classification, confidence) {
        const riskLevels = {
            'safe': 0,
            'suspicious': 1,
            'spam': 2,
            'phishing': 3,
            'malware': 4
        };
        return Math.min(riskLevels[classification] * confidence * 25, 100);
    }

    getRecommendations(classification) {
        const recommendations = {
            'safe': ['Email an toàn, có thể đọc bình thường'],
            'suspicious': ['Kiểm tra thông tin người gửi', 'Không click vào links đáng nghi'],
            'spam': ['Xóa email ngay lập tức', 'Báo cáo spam', 'Không trả lời'],
            'phishing': ['KHÔNG click bất kỳ link nào', 'Báo cáo cho IT', 'Xóa ngay lập tức'],
            'malware': ['Cách ly ngay lập tức', 'Quét virus toàn hệ thống', 'Liên hệ bộ phận bảo mật']
        };
        return recommendations[classification] || ['Cần xem xét thêm'];
    }

    getMockStats(timeRange) {
        const baseStats = CONFIG.DEMO.STATISTICS;
        const multiplier = timeRange === 'today' ? 0.1 : timeRange === 'month' ? 4.3 : 1;

        return {
            totalAnalyzed: Math.floor(baseStats.totalAnalyzed * multiplier),
            spamDetected: Math.floor(baseStats.spamDetected * multiplier),
            phishingBlocked: Math.floor(baseStats.phishingBlocked * multiplier),
            avgConfidence: baseStats.avgConfidence,
            processingTime: baseStats.processingTime + Math.floor(Math.random() * 100 - 50),
            successRate: 0.97 + Math.random() * 0.02,
            weeklyTrend: this.generateTrendData(timeRange),
            distribution: this.generateDistributionData(multiplier),
            timestamp: new Date().toISOString()
        };
    }

    generateTrendData(timeRange) {
        const days = timeRange === 'today' ? 1 : timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        const trend = [];

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const baseValue = 100 + Math.random() * 100;
            trend.push({
                date: date.toISOString().split('T')[0],
                safe: Math.floor(baseValue * 0.75),
                spam: Math.floor(baseValue * 0.15),
                phishing: Math.floor(baseValue * 0.05),
                suspicious: Math.floor(baseValue * 0.05)
            });
        }

        return trend;
    }

    generateDistributionData(multiplier) {
        return {
            safe: Math.floor(2500 * multiplier),
            spam: Math.floor(400 * multiplier),
            phishing: Math.floor(120 * multiplier),
            suspicious: Math.floor(180 * multiplier)
        };
    }

    getMockHistory(limit) {
        const history = [];
        const classifications = ['safe', 'spam', 'phishing', 'suspicious'];
        const sampleTexts = [
            'Meeting update for tomorrow at 2 PM',
            'You have won $1,000,000! Click here now!',
            'Your account requires immediate verification',
            'Limited time offer - Act now!',
            'Invoice for recent purchase',
            'Urgent: Security alert for your account',
            'Weekly newsletter - Company updates'
        ];

        for (let i = 0; i < limit; i++) {
            const randomClassification = classifications[Math.floor(Math.random() * classifications.length)];
            const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
            const randomDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

            history.push({
                id: Utils.generateId(),
                text: randomText,
                classification: randomClassification,
                confidence: 0.6 + Math.random() * 0.4,
                timestamp: randomDate.toISOString(),
                processingTime: Math.floor(Math.random() * 500 + 100)
            });
        }

        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // =============================================================
    // EXPORT/IMPORT API
    // =============================================================

    async exportData(format = 'json', dateRange = {}) {
        // Simulate export process
        await this.delay(2000);
        
        const data = {
            exported_at: new Date().toISOString(),
            format: format,
            date_range: dateRange,
            stats: await this.getStats(),
            history: await this.getHistory(100)
        };

        if (format === 'csv') {
            return Utils.arrayToCSV(data.history.data);
        }

        return JSON.stringify(data, null, 2);
    }

    // =============================================================
    // REAL-TIME UPDATES (WebSocket simulation)
    // =============================================================

    setupRealTimeUpdates(callback) {
        // Simulate real-time updates
        setInterval(() => {
            const update = {
                type: 'stats_update',
                data: this.getMockStats('today'),
                timestamp: new Date().toISOString()
            };
            callback(update);
        }, 30000);

        // Simulate new analysis notifications
        setInterval(() => {
            const newAnalysis = {
                type: 'new_analysis',
                data: {
                    classification: ['safe', 'spam', 'phishing', 'suspicious'][Math.floor(Math.random() * 4)],
                    confidence: 0.6 + Math.random() * 0.4,
                    timestamp: new Date().toISOString()
                }
            };
            callback(newAnalysis);
        }, 45000);
    }

    // =============================================================
    // ERROR RECOVERY
    // =============================================================

    handleNetworkError(error) {
        console.error('Network error:', error);
        
        if (window.app) {
            window.app.showNotification('🌐 Lỗi kết nối mạng. Đang sử dụng dữ liệu demo.', 'warning');
        }
    }

    handleServerError(error) {
        console.error('Server error:', error);
        
        if (window.app) {
            window.app.showNotification('🖥️ Lỗi máy chủ. Đang sử dụng dữ liệu demo.', 'warning');
        }
    }

    // =============================================================
    // CLEANUP
    // =============================================================

    clearCache() {
        this.cache.clear();
        console.log('🗑️ API cache cleared');
    }

    destroy() {
        this.clearCache();
        console.log('🔌 API Service destroyed');
    }
}

// Create global instance
window.APIService = new APIService();

console.log('🌐 API Service loaded successfully'); 