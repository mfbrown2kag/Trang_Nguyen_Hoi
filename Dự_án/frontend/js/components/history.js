// ===== HISTORY COMPONENT =====
class History {
    constructor() {
        this.historyData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {
            time: 'all',
            classification: 'all',
            search: '',
            sort: 'newest'
        };
        
        this.init();
    }

    init() {
        console.log('📚 History component initializing...');
        
        this.setupEventListeners();
        this.loadHistoryData();
        this.updateStatistics();
        
        console.log('✅ History component initialized');
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-history');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        // Time filter
        const timeFilter = document.getElementById('time-filter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.currentFilters.time = e.target.value;
                this.applyFilters();
            });
        }

        // Classification filter
        const classificationFilter = document.getElementById('classification-filter');
        if (classificationFilter) {
            classificationFilter.addEventListener('change', (e) => {
                this.currentFilters.classification = e.target.value;
                this.applyFilters();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sort-history');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.applyFilters();
            });
        }

        // Export history
        const exportBtn = document.getElementById('export-history');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportHistory();
            });
        }

        // Clear history
        const clearBtn = document.getElementById('clear-history');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        // Load more
        const loadMoreBtn = document.getElementById('load-more-history');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }
    }

    loadHistoryData() {
        // Load from localStorage or generate mock data
        const savedHistory = Utils.getLocalStorage('email-history', []);
        
        if (savedHistory.length > 0) {
            this.historyData = savedHistory;
        } else {
            this.historyData = this.generateMockHistory();
            this.saveHistory();
        }

        this.applyFilters();
    }

    generateMockHistory() {
        const history = [];
        const classifications = ['safe', 'spam', 'phishing', 'suspicious'];
        const sampleEmails = [
            {
                text: "Meeting update for tomorrow at 2 PM in conference room B. Please bring the financial reports.",
                classification: 'safe',
                confidence: 0.92
            },
            {
                text: "CONGRATULATIONS! You won $1,000,000! Click here now to claim your prize immediately!",
                classification: 'spam',
                confidence: 0.96
            },
            {
                text: "Your account has been suspended. Please verify your credentials immediately by clicking this link.",
                classification: 'phishing',
                confidence: 0.89
            },
            {
                text: "Limited time offer! Best deals available only today. Act now before it's too late!",
                classification: 'suspicious',
                confidence: 0.73
            },
            {
                text: "Hi John, just wanted to follow up on our conversation yesterday about the project timeline.",
                classification: 'safe',
                confidence: 0.88
            },
            {
                text: "Free money! No strings attached! Click now to get your free $500 cash reward today!",
                classification: 'spam',
                confidence: 0.94
            },
            {
                text: "Security alert: Unusual login detected. Confirm your identity now to secure your account.",
                classification: 'phishing',
                confidence: 0.91
            },
            {
                text: "New message from your bank: Important account information requires your immediate attention.",
                classification: 'suspicious',
                confidence: 0.79
            }
        ];

        for (let i = 0; i < 25; i++) {
            const sample = sampleEmails[i % sampleEmails.length];
            const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            history.push({
                id: Utils.generateId(),
                text: sample.text,
                classification: sample.classification,
                confidence: sample.confidence + (Math.random() * 0.1 - 0.05),
                timestamp: randomDate.toISOString(),
                processingTime: Math.floor(Math.random() * 400 + 150),
                riskScore: this.calculateRiskScore(sample.classification, sample.confidence)
            });
        }

        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    calculateRiskScore(classification, confidence) {
        const riskLevels = {
            'safe': 0,
            'suspicious': 1,
            'spam': 2,
            'phishing': 3
        };
        return Math.min(riskLevels[classification] * confidence * 25, 100);
    }

    applyFilters() {
        let filtered = [...this.historyData];

        // Time filter
        if (this.currentFilters.time !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            switch (this.currentFilters.time) {
                case 'today':
                    cutoffDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
            }
            
            if (cutoffDate) {
                filtered = filtered.filter(item => new Date(item.timestamp) >= cutoffDate);
            }
        }

        // Classification filter
        if (this.currentFilters.classification !== 'all') {
            filtered = filtered.filter(item => item.classification === this.currentFilters.classification);
        }

        // Search filter
        if (this.currentFilters.search) {
            const searchTerm = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(item => 
                item.text.toLowerCase().includes(searchTerm) ||
                item.classification.toLowerCase().includes(searchTerm)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'confidence':
                    return b.confidence - a.confidence;
                case 'risk':
                    return b.riskScore - a.riskScore;
                default:
                    return 0;
            }
        });

        this.filteredData = filtered;
        this.currentPage = 1;
        this.renderHistoryList();
        this.updatePagination();
    }

    renderHistoryList() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const itemsToShow = this.filteredData.slice(startIndex, endIndex);

        if (itemsToShow.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <div class="empty-title">Không tìm thấy kết quả</div>
                    <div class="empty-description">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                </div>
            `;
            return;
        }

        historyList.innerHTML = itemsToShow.map(item => this.createHistoryItemHTML(item)).join('');

        // Add event listeners for new items
        itemsToShow.forEach(item => {
            const element = document.querySelector(`[data-id="${item.id}"]`);
            if (element) {
                this.attachItemEventListeners(element, item);
            }
        });
    }

    createHistoryItemHTML(item) {
        const confidencePercentage = Math.round(item.confidence * 100);
        const timeAgo = Utils.formatDate(item.timestamp);
        
        return `
            <div class="history-item ${item.classification}" data-id="${item.id}">
                <div class="history-item-header">
                    <div class="history-classification ${item.classification}">
                        ${this.getClassificationIcon(item.classification)}
                        ${this.getClassificationLabel(item.classification)}
                    </div>
                    <div class="history-time">${timeAgo}</div>
                </div>
                
                <div class="history-content" data-id="${item.id}">
                    ${Utils.truncateText(item.text, 200)}
                </div>
                
                <div class="history-metrics">
                    <div class="history-confidence">
                        <span>Độ tin cậy:</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill ${item.classification}" style="width: ${confidencePercentage}%"></div>
                        </div>
                        <span>${confidencePercentage}%</span>
                    </div>
                    
                    <div class="history-actions">
                        <button class="btn-secondary expand-btn" data-id="${item.id}">
                            📖 Xem đầy đủ
                        </button>
                        <button class="btn-secondary reanalyze-btn" data-id="${item.id}">
                            🔄 Phân tích lại
                        </button>
                        <button class="btn-secondary delete-btn" data-id="${item.id}">
                            🗑️ Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    attachItemEventListeners(element, item) {
        // Expand/collapse content
        const expandBtn = element.querySelector('.expand-btn');
        const content = element.querySelector('.history-content');
        
        if (expandBtn && content) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = content.classList.contains('expanded');
                
                if (isExpanded) {
                    content.classList.remove('expanded');
                    expandBtn.textContent = '📖 Xem đầy đủ';
                    content.innerHTML = Utils.truncateText(item.text, 200);
                } else {
                    content.classList.add('expanded');
                    expandBtn.textContent = '📖 Thu gọn';
                    content.innerHTML = item.text;
                }
            });
        }

        // Reanalyze button
        const reanalyzeBtn = element.querySelector('.reanalyze-btn');
        if (reanalyzeBtn) {
            reanalyzeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.reanalyzeItem(item);
            });
        }

        // Delete button
        const deleteBtn = element.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteItem(item.id);
            });
        }

        // Click to expand (optional)
        element.addEventListener('click', () => {
            const content = element.querySelector('.history-content');
            const expandBtn = element.querySelector('.expand-btn');
            
            if (content && !content.classList.contains('expanded')) {
                expandBtn.click();
            }
        });
    }

    getClassificationIcon(classification) {
        const icons = {
            'safe': '✅',
            'spam': '🚫',
            'phishing': '🎣',
            'suspicious': '⚠️'
        };
        return icons[classification] || '❓';
    }

    getClassificationLabel(classification) {
        const labels = {
            'safe': 'An Toàn',
            'spam': 'Spam',
            'phishing': 'Phishing',
            'suspicious': 'Đáng Nghi'
        };
        return labels[classification] || 'Không xác định';
    }

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Update mini stat cards
        const elements = {
            'history-total': stats.total,
            'history-safe': stats.safe,
            'history-spam': stats.spam,
            'history-phishing': stats.phishing,
            'history-suspicious': stats.suspicious
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // Animate count up
                Utils.animateValue(element, 0, value, 1000, (current) => {
                    element.textContent = Math.floor(current);
                });
            }
        });
    }

    calculateStatistics() {
        const stats = {
            total: this.historyData.length,
            safe: 0,
            spam: 0,
            phishing: 0,
            suspicious: 0
        };

        this.historyData.forEach(item => {
            if (stats.hasOwnProperty(item.classification)) {
                stats[item.classification]++;
            }
        });

        return stats;
    }

    updatePagination() {
        const shownCount = Math.min(this.currentPage * this.itemsPerPage, this.filteredData.length);
        const totalCount = this.filteredData.length;

        const shownElement = document.getElementById('shown-count');
        const totalElement = document.getElementById('total-count');
        const loadMoreBtn = document.getElementById('load-more-history');

        if (shownElement) shownElement.textContent = shownCount;
        if (totalElement) totalElement.textContent = totalCount;

        if (loadMoreBtn) {
            loadMoreBtn.style.display = shownCount < totalCount ? 'block' : 'none';
        }
    }

    loadMore() {
        this.currentPage++;
        this.renderHistoryList();
        this.updatePagination();
    }

    async reanalyzeItem(item) {
        if (window.app) {
            // Switch to analyze section and populate with this email
            window.app.showSection('analyze');
            
            // Wait a bit for section to load
            setTimeout(() => {
                const emailInput = document.getElementById('email-input');
                if (emailInput) {
                    emailInput.value = item.text;
                    emailInput.focus();
                }
                
                if (window.app.showNotification) {
                    window.app.showNotification('📧 Email đã được load vào phần Phân Tích', 'info');
                }
            }, 100);
        }
    }

    deleteItem(itemId) {
        if (confirm('Bạn có chắc muốn xóa mục này khỏi lịch sử?')) {
            this.historyData = this.historyData.filter(item => item.id !== itemId);
            this.saveHistory();
            this.applyFilters();
            this.updateStatistics();
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('🗑️ Đã xóa khỏi lịch sử', 'success');
            }
        }
    }

    exportHistory() {
        try {
            const exportData = this.filteredData.map(item => ({
                'Thời gian': new Date(item.timestamp).toLocaleString('vi-VN'),
                'Phân loại': this.getClassificationLabel(item.classification),
                'Độ tin cậy': Math.round(item.confidence * 100) + '%',
                'Nội dung': item.text.substring(0, 100) + (item.text.length > 100 ? '...' : ''),
                'Thời gian xử lý (ms)': item.processingTime,
                'Điểm rủi ro': Math.round(item.riskScore)
            }));

            const csvContent = Utils.arrayToCSV(exportData);
            const filename = `email-history-${new Date().toISOString().split('T')[0]}.csv`;
            Utils.downloadFile(csvContent, filename, 'text/csv');
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('📊 Đã xuất lịch sử ra file Excel', 'success');
            }
        } catch (error) {
            console.error('Export error:', error);
            if (window.app && window.app.showNotification) {
                window.app.showNotification('❌ Lỗi khi xuất file', 'error');
            }
        }
    }

    clearHistory() {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.')) {
            this.historyData = [];
            this.saveHistory();
            this.applyFilters();
            this.updateStatistics();
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('🗑️ Đã xóa toàn bộ lịch sử', 'success');
            }
        }
    }

    // Add new analysis to history
    addToHistory(analysisResult) {
        const historyItem = {
            id: Utils.generateId(),
            text: analysisResult.originalText || '',
            classification: analysisResult.classification,
            confidence: analysisResult.confidence,
            timestamp: new Date().toISOString(),
            processingTime: analysisResult.processingTime || 0,
            riskScore: analysisResult.riskScore || this.calculateRiskScore(analysisResult.classification, analysisResult.confidence)
        };

        this.historyData.unshift(historyItem); // Add to beginning
        this.saveHistory();
        
        // If currently viewing history, update the display
        if (document.getElementById('history').classList.contains('active')) {
            this.applyFilters();
            this.updateStatistics();
        }
    }

    saveHistory() {
        Utils.setLocalStorage('email-history', this.historyData);
    }

    // Public method to refresh when history section becomes active
    refreshData() {
        if (document.getElementById('history').classList.contains('active')) {
            this.loadHistoryData();
            this.updateStatistics();
        }
    }

    destroy() {
        // Cleanup if needed
        console.log('🗑️ History component destroyed');
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = History;
} 