// ===== EMAIL GUARDIAN APP MAIN CONTROLLER =====
class EmailGuardianApp {
    constructor() {
        this.currentSection = 'analyze';
        this.isLoading = false;
        this.apiStatus = 'connecting';
        this.components = {};
        
        this.init();
    }

    init() {
        console.log('🚀 Email Guardian App initializing...');
        
        // Initialize core components
        this.setupEventListeners();
        this.initializeComponents();
        this.checkAPIStatus();
        this.loadDemoData();
        
        console.log('✅ App initialized successfully');
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        console.log(`Found ${navLinks.length} navigation links`);
        
        navLinks.forEach((link, index) => {
            console.log(`Setting up listener for nav link ${index}: ${link.getAttribute('href')}`);
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                console.log(`🎯 Nav link clicked: ${sectionId}`);
                this.navigateToSection(sectionId);
            });
        });

        // Documentation sub-navigation
        try {
            this.setupDocsNavigation();
        } catch (error) {
            console.warn('⚠️ Error setting up docs navigation:', error);
        }

        // FAQ accordion
        try {
            this.setupFAQAccordion();
        } catch (error) {
            console.warn('⚠️ Error setting up FAQ accordion:', error);
        }

        // Demo mode toggle
        const demoBtn = document.getElementById('demo-mode');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.toggleDemoMode());
        }

        // Quick actions
        try {
            this.setupQuickActions();
        } catch (error) {
            console.warn('⚠️ Error setting up quick actions:', error);
        }

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        
        console.log('✅ Event listeners setup completed');
    }

    setupQuickActions() {
        // Load sample email
        const loadSampleBtn = document.getElementById('load-sample');
        if (loadSampleBtn) {
            loadSampleBtn.addEventListener('click', () => {
                this.loadSampleEmail();
            });
        }

        // Paste from clipboard
        const pasteBtn = document.getElementById('paste-clipboard');
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => {
                this.pasteFromClipboard();
            });
        }

        // Clear input
        const clearBtn = document.getElementById('clear-input');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeEmail();
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to analyze
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.analyzeEmail();
            }

            // Escape to clear/cancel
            if (e.key === 'Escape') {
                if (this.isLoading) {
                    this.cancelAnalysis();
                } else {
                    this.clearInput();
                }
            }

            // Tab navigation
            if (e.ctrlKey && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const sections = ['analyze', 'dashboard', 'history', 'docs'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    this.navigateToSection(sections[index]);
                }
            }
        });
    }

    initializeComponents() {
        try {
            // Initialize dashboard component
            if (typeof Dashboard !== 'undefined') {
                this.components.dashboard = new Dashboard();
                console.log('📊 Dashboard component initialized');
            }

            // Initialize history component
            if (typeof History !== 'undefined') {
                this.components.history = new History();
                console.log('📚 History component initialized');
            }

            // Initialize docs component
            if (typeof DocsManager !== 'undefined') {
                this.components.docs = new DocsManager();
                window.docsManager = this.components.docs;
                console.log('📖 Documentation component initialized');
            }

            console.log('📦 Components initialized:', Object.keys(this.components));
        } catch (error) {
            console.warn('⚠️ Some components failed to initialize:', error);
        }
    }

    navigateToSection(sectionId) {
        console.log(`🚀 Navigation requested to: ${sectionId}`);
        
        // Remove active class from all sections and nav links
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
            console.log(`Removed active from section: ${section.id}`);
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to target section and nav link
        const targetSection = document.getElementById(sectionId);
        const targetNavLink = document.querySelector(`[href="#${sectionId}"]`);

        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            console.log(`✅ Activated section: ${sectionId}`);
        } else {
            console.error(`❌ Section not found: ${sectionId}`);
        }

        if (targetNavLink) {
            targetNavLink.classList.add('active');
            console.log(`✅ Activated nav link for: ${sectionId}`);
        } else {
            console.error(`❌ Nav link not found for: ${sectionId}`);
        }

        // Update page title
        this.updatePageTitle(sectionId);

        // Load section-specific data
        this.loadSectionData(sectionId);

        // Scroll to top
        window.scrollTo(0, 0);

        console.log(`📍 Navigation completed to: ${sectionId}`);
    }

    // Public method for other components to use
    showSection(sectionId) {
        this.navigateToSection(sectionId);
    }

    updatePageTitle(sectionId) {
        const titles = {
            'analyze': '🔍 Phân Tích Email',
            'dashboard': '📈 Dashboard',
            'history': '📚 Lịch Sử',
            'docs': '📖 Hướng Dẫn'
        };
        
        document.title = `${titles[sectionId]} - Email Guardian`;
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                if (this.components.dashboard) {
                    // Refresh dashboard data when section becomes active
                    setTimeout(() => {
                        this.components.dashboard.refreshData();
                    }, 100);
                }
                break;
            case 'analyze':
                // No specific loading needed for analyze section
                break;
            case 'history':
                if (this.components.history) {
                    // Refresh history data when section becomes active
                    setTimeout(() => {
                        this.components.history.refreshData();
                    }, 100);
                }
                break;
            case 'docs':
                // Initialize docs manager if not done
                if (this.components.docs) {
                    // Docs manager will handle its own initialization
                    console.log('📖 Docs section activated');
                } else {
                    // Fallback: ensure default docs subsection is active
                    this.showDocsSubsection('overview');
                }
                break;
        }
    }

    setupDocsNavigation() {
        // Wait for docs section to be available
        setTimeout(() => {
            const docsLinks = document.querySelectorAll('.docs-link');
            console.log(`Setting up ${docsLinks.length} docs navigation links`);
            
            docsLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const subsectionId = link.getAttribute('href').substring(1);
                    this.showDocsSubsection(subsectionId);
                });
            });
        }, 100);
    }

    showDocsSubsection(subsectionId) {
        // Use the docs manager if available
        if (this.components.docs) {
            this.components.docs.showDocsContent(subsectionId);
        } else {
            console.warn('Docs manager not available, using fallback');
            // Fallback for old system
            document.querySelectorAll('.docs-link').forEach(link => {
                link.classList.remove('active');
            });
            
            document.querySelectorAll('.docs-section').forEach(section => {
                section.classList.remove('active');
            });

            // Add active class to target link and section
            const targetLink = document.querySelector(`[href="#${subsectionId}"]`);
            const targetSection = document.getElementById(subsectionId);

            if (targetLink) {
                targetLink.classList.add('active');
            }

            if (targetSection) {
                targetSection.classList.add('active');
            }
        }

        console.log(`📖 Docs subsection: ${subsectionId}`);
    }

    setupFAQAccordion() {
        // Set up FAQ accordion functionality
        setTimeout(() => {
            const faqHeaders = document.querySelectorAll('.faq-item h3');
            console.log(`Setting up ${faqHeaders.length} FAQ accordion items`);
            
            faqHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const faqItem = header.parentElement;
                    const answer = faqItem.querySelector('.faq-answer');
                    const isActive = faqItem.classList.contains('active');

                    // Close all other FAQ items
                    document.querySelectorAll('.faq-item').forEach(item => {
                        item.classList.remove('active');
                        const ans = item.querySelector('.faq-answer');
                        if (ans) ans.style.display = 'none';
                    });

                    // Toggle current item
                    if (!isActive) {
                        faqItem.classList.add('active');
                        if (answer) answer.style.display = 'block';
                    }
                });
            });
        }, 500);
    }

    async checkAPIStatus() {
        const statusIndicator = document.getElementById('api-status');
        const statusDot = statusIndicator?.querySelector('.status-dot');
        const statusText = statusIndicator?.querySelector('.status-text');

        try {
            // Use APIService to check health
            const isHealthy = await window.APIService.checkHealth();

            if (isHealthy) {
                this.apiStatus = 'connected';
                if (statusDot) statusDot.classList.add('connected');
                if (statusText) statusText.textContent = 'Kết nối';
                
                console.log('✅ API connected');
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            this.apiStatus = 'disconnected';
            if (statusText) statusText.textContent = 'Demo Mode';
            
            console.warn('❌ API disconnected, using demo mode:', error);
            
            // Show notification about demo mode
            setTimeout(() => {
                this.showNotification('🎭 Chạy ở Demo Mode - Sử dụng dữ liệu mẫu', 'info');
            }, 1000);
            
            // Retry connection every 30 seconds
            setTimeout(() => this.checkAPIStatus(), 30000);
        }
    }

    loadSampleEmail() {
        const samples = [
            {
                subject: "Urgent: Verify Your Account",
                from: "security@yourbank.com",
                content: "Dear Customer,\n\nYour account has been compromised. Please click the link below to verify your identity:\n\nhttps://secure-bank-verification.com/verify\n\nFailure to verify within 24 hours will result in account suspension.\n\nBest regards,\nSecurity Team"
            },
            {
                subject: "Meeting Schedule Update",
                from: "sarah.johnson@company.com", 
                content: "Hi John,\n\nI hope this email finds you well. I wanted to update you on tomorrow's meeting schedule.\n\nThe quarterly review meeting has been moved from 2:00 PM to 3:30 PM in Conference Room B.\n\nPlease let me know if this time works for you.\n\nBest regards,\nSarah"
            },
            {
                subject: "🎉 CONGRATULATIONS! You've Won $1,000,000!",
                from: "winner@lottery-international.com",
                content: "URGENT WINNER NOTIFICATION!!!\n\nCongratulations! Your email has been selected in our international lottery draw.\n\nYou have won USD $1,000,000!!!\n\nTo claim your prize, please provide:\n- Full name\n- Phone number\n- Bank account details\n- Copy of ID\n\nReply immediately as this offer expires in 48 hours!\n\nDr. Michael Johnson\nLottery Commission"
            },
            {
                subject: "Invoice #INV-2025-001",
                from: "accounts@supplier.com",
                content: "Dear Finance Team,\n\nPlease find attached the invoice for the recent order.\n\nInvoice Details:\n- Amount: $2,450.00\n- Due Date: January 30, 2025\n- Terms: Net 30\n\nPayment can be made via bank transfer to the account details provided in the attached invoice.\n\nThank you for your business.\n\nBest regards,\nAccounts Department"
            }
        ];

        const randomSample = samples[Math.floor(Math.random() * samples.length)];
        
        const emailText = `Subject: ${randomSample.subject}
From: ${randomSample.from}

${randomSample.content}`;

        const textarea = document.getElementById('email-text');
        if (textarea) {
            textarea.value = emailText;
            this.updateCharCount();
            this.validateInput();
            
            // Show notification
            this.showNotification('📄 Đã tải email mẫu', 'success');
        }
    }

    async pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            const textarea = document.getElementById('email-text');
            
            if (textarea && text) {
                textarea.value = text;
                this.updateCharCount();
                this.validateInput();
                
                this.showNotification('📋 Đã dán từ clipboard', 'success');
            }
        } catch (error) {
            this.showNotification('❌ Không thể truy cập clipboard', 'error');
            console.error('Clipboard error:', error);
        }
    }

    clearInput() {
        const textarea = document.getElementById('email-text');
        const resultsContent = document.getElementById('results-content');
        
        if (textarea) {
            textarea.value = '';
            this.updateCharCount();
            this.validateInput();
        }

        if (resultsContent) {
            resultsContent.innerHTML = `
                <div class="placeholder-state">
                    <div class="placeholder-icon">🎯</div>
                    <h3>Sẵn sàng phân tích</h3>
                    <p>Nhập nội dung email và nhấn "Phân Tích Email" để bắt đầu</p>
                </div>
            `;
        }

        this.showNotification('🗑️ Đã xóa nội dung', 'success');
    }

    updateCharCount() {
        const textarea = document.getElementById('email-text');
        const charCount = document.querySelector('.char-count');
        const wordCount = document.querySelector('.word-count');

        if (textarea && charCount) {
            const length = textarea.value.length;
            charCount.textContent = `${length.toLocaleString()}/10,000 ký tự`;

            // Update word count
            if (wordCount) {
                const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
                wordCount.textContent = `${words} từ`;
            }
        }
    }

    validateInput() {
        const textarea = document.getElementById('email-text');
        const analyzeBtn = document.getElementById('analyze-btn');
        const validationDiv = document.getElementById('input-validation');

        if (!textarea || !analyzeBtn) return;

        const text = textarea.value;
        const length = text.length;
        
        // Clear previous validation
        if (validationDiv) {
            validationDiv.innerHTML = '';
        }

        let isValid = true;
        const messages = [];

        // Length validation
        if (length < 10) {
            isValid = false;
            messages.push({
                type: 'error',
                icon: '❌',
                text: 'Email quá ngắn. Cần ít nhất 10 ký tự.'
            });
        } else if (length > 10000) {
            isValid = false;
            messages.push({
                type: 'error',
                icon: '❌', 
                text: 'Email quá dài. Tối đa 10,000 ký tự.'
            });
        }

        // Content validation
        if (length > 10 && !text.includes('@') && !text.toLowerCase().includes('email')) {
            messages.push({
                type: 'warning',
                icon: '⚠️',
                text: 'Nội dung có vẻ không phải email. Kết quả có thể không chính xác.'
            });
        }

        // Display validation messages
        if (validationDiv && messages.length > 0) {
            validationDiv.innerHTML = messages.map(msg => `
                <div class="validation-message ${msg.type}">
                    <span>${msg.icon}</span>
                    <span>${msg.text}</span>
                </div>
            `).join('');
        }

        // Update button state
        analyzeBtn.disabled = !isValid;
    }

    async analyzeEmail() {
        const textarea = document.getElementById('email-text');
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('❌ Vui lòng nhập nội dung email', 'error');
            return;
        }

        const emailText = textarea.value.trim();
        
        try {
            this.showLoading('Đang phân tích email...');
            
            // Simulate API call for demo
            const result = await this.performAnalysis(emailText);
            
            this.hideLoading();
            this.displayResult(result);
            
            // Save to history
            this.saveToHistory(emailText, result);
            
        } catch (error) {
            this.hideLoading();
            this.showNotification('❌ Lỗi khi phân tích email', 'error');
            console.error('Analysis error:', error);
        }
    }

    async performAnalysis(emailText) {
        try {
            // Use API Service for analysis
            const result = await window.APIService.analyzeEmail(emailText);
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            
            // Fallback to simple analysis
            return this.getFallbackAnalysis(emailText);
        }
    }

    getFallbackAnalysis(emailText) {
        const lowerText = emailText.toLowerCase();
        let classification = 'safe';
        let confidence = 0.85;
        let reasoning = [];

        // Simple rule-based classification for demo
        const spamKeywords = ['win', 'lottery', 'urgent', 'click here', 'limited time', 'act now', 'free money'];
        const spamCount = spamKeywords.filter(keyword => lowerText.includes(keyword)).length;
        
        if (spamCount >= 3) {
            classification = 'spam';
            confidence = 0.92;
            reasoning.push('Chứa nhiều từ khóa spam');
        } else if (spamCount >= 2) {
            classification = 'suspicious';
            confidence = 0.78;
            reasoning.push('Chứa một số từ khóa đáng nghi');
        }

        // Check for phishing indicators
        if (lowerText.includes('verify') && lowerText.includes('account') && lowerText.includes('click')) {
            classification = 'phishing';
            confidence = 0.89;
            reasoning.push('Có dấu hiệu phishing');
        }

        // Extract features
        const features = {
            'Độ dài': `${emailText.length} ký tự`,
            'Số từ khóa spam': spamCount,
            'Chứa liên kết': lowerText.includes('http') ? 'Có' : 'Không',
            'Yêu cầu hành động': lowerText.includes('click') || lowerText.includes('verify') ? 'Có' : 'Không',
            'Cấp độ khẩn cấp': lowerText.includes('urgent') || lowerText.includes('immediate') ? 'Cao' : 'Thấp'
        };

        return {
            classification,
            confidence,
            features,
            explanation: reasoning.join(', ') || 'Email có vẻ an toàn',
            processingTime: Math.floor(Math.random() * 500) + 200
        };
    }

    displayResult(result) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) return;

        const confidenceClass = result.confidence > 0.8 ? 'high' : result.confidence > 0.6 ? 'medium' : 'low';
        const classificationIcon = this.getClassificationIcon(result.classification);

        resultsContent.innerHTML = `
            <div class="result-container">
                <div class="result-header">
                    <div class="classification ${result.classification}">
                        <span class="classification-icon">${classificationIcon}</span>
                        <span>${this.getClassificationLabel(result.classification)}</span>
                    </div>
                    <div class="confidence-score">
                        <div class="confidence-percentage">${Math.round(result.confidence * 100)}%</div>
                        <div class="confidence-label">Độ tin cậy</div>
                    </div>
                </div>

                <div class="confidence-bar">
                    <div class="confidence-fill ${confidenceClass}" style="width: ${result.confidence * 100}%"></div>
                </div>

                <div class="features-section">
                    <h3>📊 Các đặc trưng phân tích</h3>
                    <div class="features-grid">
                        ${Object.entries(result.features).map(([key, value]) => `
                            <div class="feature-item">
                                <span class="feature-name">${key}</span>
                                <span class="feature-value neutral">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="explanation-section">
                    <h3>💡 Giải thích kết quả</h3>
                    <div class="explanation-content">
                        ${result.explanation}
                    </div>
                </div>

                <div class="processing-info">
                    <small>⚡ Thời gian xử lý: ${result.processingTime}ms</small>
                </div>
            </div>
        `;

        this.showNotification('✅ Phân tích hoàn tất!', 'success');
    }

    getClassificationIcon(classification) {
        const icons = {
            'safe': '✅',
            'suspicious': '⚠️',
            'spam': '🚫',
            'phishing': '🎣',
            'malware': '🦠'
        };
        return icons[classification] || '❓';
    }

    getClassificationLabel(classification) {
        const labels = {
            'safe': 'An toàn',
            'suspicious': 'Đáng nghi',
            'spam': 'Spam',
            'phishing': 'Phishing',
            'malware': 'Malware'
        };
        return labels[classification] || 'Không xác định';
    }

    saveToHistory(emailText, result) {
        // If History component is available, use it
        if (this.components.history) {
            const analysisResult = {
                originalText: emailText,
                classification: result.classification,
                confidence: result.confidence,
                processingTime: result.processingTime || 0,
                riskScore: result.riskScore || this.calculateRiskScore(result.classification, result.confidence)
            };
            
            this.components.history.addToHistory(analysisResult);
        } else {
            // Fallback to old method
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                text: emailText.substring(0, 200) + (emailText.length > 200 ? '...' : ''),
                classification: result.classification,
                confidence: result.confidence
            };

            let history = JSON.parse(localStorage.getItem('emailAnalysisHistory') || '[]');
            history.unshift(historyItem);
            history = history.slice(0, 100); // Keep only last 100 items
            
            localStorage.setItem('emailAnalysisHistory', JSON.stringify(history));
        }
    }

    calculateRiskScore(classification, confidence) {
        const riskLevels = {
            'safe': 0,
            'suspicious': 1,
            'spam': 2,
            'phishing': 3
        };
        return Math.min((riskLevels[classification] || 1) * confidence * 25, 100);
    }

    showLoading(message = 'Đang xử lý...') {
        const overlay = document.getElementById('loading-overlay');
        const loadingText = overlay?.querySelector('.loading-text');
        const progressBar = overlay?.querySelector('.progress-fill');

        if (overlay) {
            overlay.classList.add('active');
            this.isLoading = true;
        }

        if (loadingText) {
            loadingText.textContent = message;
        }

        // Simulate progress
        if (progressBar) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress > 95) progress = 95;
                
                progressBar.style.width = `${progress}%`;
                
                if (!this.isLoading) {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                }
            }, 200);
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            this.isLoading = false;
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; float: right;">×</button>
            </div>
        `;

        container.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    toggleDemoMode() {
        // Thử nhiều đường dẫn khác nhau để mở game
        const possiblePaths = [
            '../Tiếng anh/game.html',
            './Tiếng anh/game.html',
            '/Tiếng anh/game.html',
            '../Tiếng anh/index.html',
            './Tiếng anh/index.html',
            '/Tiếng anh/index.html',
            'http://localhost:8080/game.html',
            'http://localhost:8080/index.html',
            'http://127.0.0.1:8080/game.html',
            'http://127.0.0.1:8080/index.html'
        ];
        
        const demoBtn = document.getElementById('demo-mode');
        
        // Hiển thị loading state
        if (demoBtn) {
            demoBtn.classList.add('active');
            demoBtn.textContent = '🎮 Đang mở...';
        }
        
        // Thử mở game với đường dẫn đầu tiên
        const gameUrl = possiblePaths[0];
        
        try {
            // Mở game trong tab mới
            const gameWindow = window.open(gameUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            
            // Kiểm tra xem window có mở thành công không
            if (gameWindow) {
                this.showNotification('🎮 Đang mở game Cyber Guardian Defense...', 'success');
                
                // Reset button sau 2 giây
                setTimeout(() => {
                    if (demoBtn) {
                        demoBtn.classList.remove('active');
                        demoBtn.textContent = '🎮 Thử sức';
                    }
                }, 2000);
            } else {
                // Nếu không mở được, thử đường dẫn khác
                this.tryAlternativePaths(possiblePaths.slice(1), demoBtn);
            }
            
        } catch (error) {
            console.error('❌ Lỗi khi mở game:', error);
            this.showNotification('❌ Không thể mở game. Vui lòng thử lại!', 'error');
            
            // Reset button
            if (demoBtn) {
                demoBtn.classList.remove('active');
                demoBtn.textContent = '🎮 Thử sức';
            }
        }
    }
    
    tryAlternativePaths(paths, demoBtn) {
        if (paths.length === 0) {
            this.showNotification('❌ Không thể mở game. Vui lòng kiểm tra đường dẫn!', 'error');
            if (demoBtn) {
                demoBtn.classList.remove('active');
                demoBtn.textContent = '🎮 Thử sức';
            }
            return;
        }
        
        const nextPath = paths[0];
        console.log(`🔄 Thử đường dẫn: ${nextPath}`);
        
        try {
            const gameWindow = window.open(nextPath, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            
            if (gameWindow) {
                this.showNotification(`🎮 Game đã mở thành công!`, 'success');
                setTimeout(() => {
                    if (demoBtn) {
                        demoBtn.classList.remove('active');
                        demoBtn.textContent = '🎮 Thử sức';
                    }
                }, 2000);
            } else {
                // Thử đường dẫn tiếp theo
                setTimeout(() => {
                    this.tryAlternativePaths(paths.slice(1), demoBtn);
                }, 500);
            }
        } catch (error) {
            console.error(`❌ Lỗi với đường dẫn ${nextPath}:`, error);
            setTimeout(() => {
                this.tryAlternativePaths(paths.slice(1), demoBtn);
            }, 500);
        }
    }

    handleResize() {
        // Handle responsive adjustments
        console.log('Window resized');
    }

    handleBeforeUnload(e) {
        if (this.isLoading) {
            e.preventDefault();
            e.returnValue = 'Analysis in progress. Are you sure you want to leave?';
        }
    }

    loadDemoData() {
        // Load some demo statistics for dashboard
        const stats = {
            totalAnalyzed: 15420,
            spamDetected: 3280,
            avgConfidence: 0.89,
            processingTime: 345
        };

        // Update dashboard stats
        setTimeout(() => {
            document.getElementById('total-analyzed')?.textContent = stats.totalAnalyzed.toLocaleString();
            document.getElementById('spam-detected')?.textContent = stats.spamDetected.toLocaleString();
            document.getElementById('avg-confidence')?.textContent = `${Math.round(stats.avgConfidence * 100)}%`;
            document.getElementById('processing-time')?.textContent = `${stats.processingTime}ms`;
        }, 1000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup input validation
    const textarea = document.getElementById('email-text');
    if (textarea) {
        textarea.addEventListener('input', () => {
            if (window.app) {
                window.app.updateCharCount();
                window.app.validateInput();
            }
        });
    }

    // Initialize the main app
    window.app = new EmailGuardianApp();
    
    // Add global test functions for debugging
    window.testNavigation = (sectionId) => {
        console.log(`🧪 Testing navigation to: ${sectionId}`);
        if (window.app) {
            window.app.navigateToSection(sectionId);
        } else {
            console.error('❌ App not initialized');
        }
    };
    
    window.testAllSections = () => {
        const sections = ['analyze', 'dashboard', 'history', 'docs'];
        sections.forEach((section, index) => {
            setTimeout(() => {
                console.log(`🧪 Auto-testing: ${section}`);
                window.testNavigation(section);
            }, index * 2000);
        });
    };
});

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailGuardianApp;
} 