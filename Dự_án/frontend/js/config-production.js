// ===== PRODUCTION CONFIGURATION OVERRIDE =====
// This file overrides development settings for production deployment

// Override CONFIG.API.BASE_URL for production
if (typeof CONFIG !== 'undefined') {
    // Production API configuration
    CONFIG.API.BASE_URL = (() => {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        const port = '8000'; // Backend port
        
        // If running on a real domain (not localhost)
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `${protocol}//${hostname}:${port}`;
        }
        
        // For localhost development
        return 'http://127.0.0.1:8000';
    })();
    
    // Production settings
    CONFIG.APP.DEMO_MODE = false;
    CONFIG.APP.DEBUG = false;
    
    console.log('🌐 Production configuration loaded');
    console.log('API Base URL:', CONFIG.API.BASE_URL);
}

// Environment detection
window.IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
window.IS_DEVELOPMENT = !window.IS_PRODUCTION;

console.log(`🚀 Environment: ${window.IS_PRODUCTION ? 'Production' : 'Development'}`); 