// ===== EMAIL GUARDIAN CONFIGURATION =====

const CONFIG = {
    // API Configuration
    API: {
        // Dynamic BASE_URL - supports both development and production
        BASE_URL: (() => {
            // Check if running on localhost (development)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return 'http://127.0.0.1:8000'; // Development
            } else {
                // Production - use relative URL or server domain
                return window.location.origin.replace(':8080', ':8000'); // Same server, different port
            }
        })(),
        ENDPOINTS: {
            ANALYZE: '/api/analyze',
            STATS: '/api/stats',
            HISTORY: '/api/history',
            HEALTH: '/api/health',
            BATCH: '/api/analyze/batch'
        },
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Application Settings
    APP: {
        NAME: 'Email Guardian',
        VERSION: '1.0.0',
        MAX_EMAIL_LENGTH: 10000,
        MIN_EMAIL_LENGTH: 10,
        DEMO_MODE: false,
        DEBUG: true
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 5000,
        LOADING_MIN_TIME: 1000,
        DEBOUNCE_DELAY: 300
    },

    // Classification Thresholds
    CLASSIFICATION: {
        CONFIDENCE_THRESHOLDS: {
            HIGH: 0.8,
            MEDIUM: 0.6,
            LOW: 0.4
        },
        RISK_LEVELS: {
            SAFE: 0,
            SUSPICIOUS: 1,
            SPAM: 2,
            PHISHING: 3,
            MALWARE: 4
        }
    },

    // Feature Weights for ML
    FEATURES: {
        KEYWORDS: {
            SPAM: ['win', 'lottery', 'urgent', 'click here', 'limited time', 'act now', 'free money', 'congratulations'],
            PHISHING: ['verify', 'account', 'suspended', 'confirm', 'login', 'security alert', 'immediate action'],
            SAFE: ['meeting', 'schedule', 'regards', 'thank you', 'invoice', 'attachment']
        },
        WEIGHTS: {
            KEYWORD_MATCH: 0.3,
            URL_SUSPICIOUS: 0.2,
            URGENCY_LANGUAGE: 0.25,
            SENDER_REPUTATION: 0.15,
            CONTENT_ANALYSIS: 0.1
        }
    },

    // Storage Configuration  
    STORAGE: {
        HISTORY_KEY: 'emailAnalysisHistory',
        SETTINGS_KEY: 'emailGuardianSettings',
        CACHE_KEY: 'emailAnalysisCache',
        MAX_HISTORY_ITEMS: 100,
        CACHE_EXPIRY: 24 * 60 * 60 * 1000 // 24 hours
    },

    // Demo Data
    DEMO: {
        SAMPLE_EMAILS: [
            {
                id: 'safe_business',
                name: 'Email công việc an toàn',
                subject: 'Meeting Schedule Update',
                from: 'sarah.johnson@company.com',
                content: `Hi John,

I hope this email finds you well. I wanted to update you on tomorrow's meeting schedule.

The quarterly review meeting has been moved from 2:00 PM to 3:30 PM in Conference Room B.

Please let me know if this time works for you.

Best regards,
Sarah`,
                expectedClassification: 'safe',
                expectedConfidence: 0.95
            },
            {
                id: 'phishing_bank',
                name: 'Email phishing ngân hàng',
                subject: 'Urgent: Verify Your Account',
                from: 'security@yourbank.com',
                content: `Dear Customer,

Your account has been compromised. Please click the link below to verify your identity:

https://secure-bank-verification.com/verify

Failure to verify within 24 hours will result in account suspension.

Best regards,
Security Team`,
                expectedClassification: 'phishing',
                expectedConfidence: 0.92
            },
            {
                id: 'spam_lottery',
                name: 'Spam trúng số',
                subject: '🎉 CONGRATULATIONS! You\'ve Won $1,000,000!',
                from: 'winner@lottery-international.com',
                content: `URGENT WINNER NOTIFICATION!!!

Congratulations! Your email has been selected in our international lottery draw.

You have won USD $1,000,000!!!

To claim your prize, please provide:
- Full name
- Phone number  
- Bank account details
- Copy of ID

Reply immediately as this offer expires in 48 hours!

Dr. Michael Johnson
Lottery Commission`,
                expectedClassification: 'spam',
                expectedConfidence: 0.98
            },
            {
                id: 'suspicious_offer',
                name: 'Ưu đãi đáng nghi',
                subject: 'Limited Time Offer - Act Now!',
                from: 'deals@amazing-offers.com',
                content: `Don't miss out on this incredible opportunity!

For a limited time only, we're offering exclusive access to our premium service for FREE!

✅ No credit card required
✅ Cancel anytime
✅ Instant access

Click here to claim your free trial: https://bit.ly/free-premium

This offer expires in 24 hours!

Best,
Marketing Team`,
                expectedClassification: 'suspicious',
                expectedConfidence: 0.75
            }
        ],

        STATISTICS: {
            totalAnalyzed: 15420,
            spamDetected: 3280,
            phishingBlocked: 892,
            avgConfidence: 0.89,
            processingTime: 345,
            dailyAnalyses: 1250,
            weeklyTrend: [
                { day: 'Mon', safe: 180, spam: 45, phishing: 12 },
                { day: 'Tue', safe: 205, spam: 38, phishing: 8 },
                { day: 'Wed', safe: 195, spam: 52, phishing: 15 },
                { day: 'Thu', safe: 220, spam: 41, phishing: 9 },
                { day: 'Fri', safe: 240, spam: 35, phishing: 6 },
                { day: 'Sat', safe: 120, spam: 28, phishing: 4 },
                { day: 'Sun', safe: 90, spam: 22, phishing: 3 }
            ]
        }
    },

    // Error Messages
    MESSAGES: {
        ERRORS: {
            NETWORK: 'Lỗi kết nối mạng. Vui lòng thử lại.',
            TIMEOUT: 'Yêu cầu quá thời gian. Vui lòng thử lại.',
            SERVER: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ.',
            RATE_LIMIT: 'Quá nhiều yêu cầu. Vui lòng đợi một chút.',
            GENERAL: 'Đã xảy ra lỗi. Vui lòng thử lại.'
        },
        SUCCESS: {
            ANALYSIS_COMPLETE: 'Phân tích hoàn tất!',
            SAMPLE_LOADED: 'Đã tải email mẫu',
            INPUT_CLEARED: 'Đã xóa nội dung',
            CLIPBOARD_PASTED: 'Đã dán từ clipboard',
            RESULT_SAVED: 'Đã lưu kết quả'
        },
        INFO: {
            ANALYZING: 'Đang phân tích email...',
            LOADING: 'Đang tải...',
            CONNECTING: 'Đang kết nối...',
            PROCESSING: 'Đang xử lý...'
        }
    },

    // Keyboard Shortcuts
    SHORTCUTS: {
        ANALYZE: 'Ctrl+Enter',
        CLEAR: 'Escape',
        SAMPLE: 'Ctrl+S',
        PASTE: 'Ctrl+V',
        SECTIONS: {
            ANALYZE: 'Ctrl+1',
            DASHBOARD: 'Ctrl+2', 
            HISTORY: 'Ctrl+3',
            DOCS: 'Ctrl+4'
        }
    },

    // Feature Flags
    FEATURES: {
        ENABLE_WEBSOCKET: true,
        ENABLE_CACHING: true,
        ENABLE_ANALYTICS: false,
        ENABLE_EXPORT: true,
        ENABLE_BATCH_ANALYSIS: true,
        ENABLE_DARK_MODE: false
    },

    // Performance Settings
    PERFORMANCE: {
        DEBOUNCE_INPUT: 300,
        THROTTLE_SCROLL: 100,
        LAZY_LOAD_IMAGES: true,
        PRELOAD_SAMPLES: true,
        CACHE_RESULTS: true
    }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
    CONFIG.APP.DEBUG = true;
    CONFIG.API.BASE_URL = 'http://localhost:8000';
    CONFIG.FEATURES.ENABLE_ANALYTICS = false;
}

// Freeze config to prevent modifications
Object.freeze(CONFIG);

// Export for global use
window.CONFIG = CONFIG;

console.log('⚙️ Configuration loaded:', CONFIG.APP.NAME, 'v' + CONFIG.APP.VERSION); 