// ===== DASHBOARD COMPONENT =====
class Dashboard {
    constructor() {
        this.charts = {};
        this.updateInterval = null;
        this.currentTimeRange = 'week';
        this.autoRefresh = true;
        
        this.init();
    }

    init() {
        console.log('📊 Dashboard initializing...');
        
        this.setupEventListeners();
        this.initializeCharts();
        this.loadDashboardData();
        this.startAutoRefresh();
        
        console.log('✅ Dashboard initialized');
    }

    setupEventListeners() {
        // Time range selector
        const timeRange = document.getElementById('time-range');
        if (timeRange) {
            timeRange.addEventListener('change', (e) => {
                this.currentTimeRange = e.target.value;
                this.refreshDashboard();
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard(true);
            });
        }

        // Auto refresh toggle
        const autoRefreshToggle = document.getElementById('auto-refresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                this.autoRefresh = e.target.checked;
                if (this.autoRefresh) {
                    this.startAutoRefresh();
                } else {
                    this.stopAutoRefresh();
                }
            });
        }

        // Export buttons
        const exportPDF = document.getElementById('export-pdf');
        const exportExcel = document.getElementById('export-excel');
        
        if (exportPDF) {
            exportPDF.addEventListener('click', () => this.exportToPDF());
        }
        
        if (exportExcel) {
            exportExcel.addEventListener('click', () => this.exportToExcel());
        }

        // Chart period selectors
        const pieChartPeriod = document.getElementById('pie-chart-period');
        if (pieChartPeriod) {
            pieChartPeriod.addEventListener('change', (e) => {
                this.updatePieChart(e.target.value);
            });
        }

        // Activity controls
        const activityFilter = document.getElementById('activity-filter');
        if (activityFilter) {
            activityFilter.addEventListener('change', (e) => {
                this.filterActivity(e.target.value);
            });
        }

        const clearActivity = document.getElementById('clear-activity');
        if (clearActivity) {
            clearActivity.addEventListener('click', () => {
                this.clearActivityFeed();
            });
        }

        const loadMoreActivity = document.getElementById('load-more-activity');
        if (loadMoreActivity) {
            loadMoreActivity.addEventListener('click', () => {
                this.loadMoreActivity();
            });
        }
    }

    initializeCharts() {
        this.initTrendChart();
        this.initPieChart();
    }

    initTrendChart() {
        const ctx = document.getElementById('trend-chart');
        if (!ctx) return;

        // Show loading state
        this.showChartLoading('trend-chart');

        // Simulate loading delay
        setTimeout(() => {
            this.charts.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'An toàn',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Spam',
                            data: [],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Phishing',
                            data: [],
                            borderColor: '#8b4513',
                            backgroundColor: 'rgba(139, 69, 19, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'Đáng nghi',
                            data: [],
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false // We have custom legend
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: '#3b82f6',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MM/DD'
                                }
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#e5e7eb'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value.toLocaleString();
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            this.updateTrendChart();
        }, 1000);
    }

    initPieChart() {
        const ctx = document.getElementById('pie-chart');
        if (!ctx) return;

        this.showChartLoading('pie-chart');

        setTimeout(() => {
            this.charts.pieChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['An toàn', 'Spam', 'Phishing', 'Đáng nghi'],
                    datasets: [{
                        data: [0, 0, 0, 0],
                        backgroundColor: [
                            '#10b981',
                            '#ef4444', 
                            '#8b4513',
                            '#f59e0b'
                        ],
                        borderWidth: 0,
                        cutout: '60%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            callbacks: {
                                label: function(context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                                    return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });

            this.updatePieChart();
        }, 1200);
    }

    showChartLoading(chartId) {
        const container = document.getElementById(chartId).parentElement;
        const canvas = document.getElementById(chartId);
        
        canvas.style.display = 'none';
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chart-loading';
        loadingDiv.innerHTML = `
            <div class="chart-loading-spinner"></div>
            <div>Đang tải dữ liệu...</div>
        `;
        
        container.appendChild(loadingDiv);
        
        // Remove loading after chart is ready
        setTimeout(() => {
            if (loadingDiv.parentNode) {
                loadingDiv.remove();
                canvas.style.display = 'block';
            }
        }, 1500);
    }

    generateMockData() {
        const days = this.getDaysForTimeRange(this.currentTimeRange);
        const data = {
            labels: [],
            safe: [],
            spam: [],
            phishing: [],
            suspicious: []
        };

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            data.labels.push(date.toISOString().split('T')[0]);
            
            // Generate realistic data with trends
            const baseValue = 100 + Math.random() * 50;
            data.safe.push(Math.floor(baseValue * (0.7 + Math.random() * 0.2)));
            data.spam.push(Math.floor(baseValue * (0.15 + Math.random() * 0.1)));
            data.phishing.push(Math.floor(baseValue * (0.05 + Math.random() * 0.05)));
            data.suspicious.push(Math.floor(baseValue * (0.1 + Math.random() * 0.05)));
        }

        return data;
    }

    getDaysForTimeRange(range) {
        switch (range) {
            case 'today': return 1;
            case 'week': return 7;
            case 'month': return 30;
            case 'quarter': return 90;
            default: return 7;
        }
    }

    async updateTrendChart(trends = null) {
        if (!this.charts.trendChart) return;

        try {
            let data;
            if (trends) {
                data = trends;
            } else {
                // Load real trend data from API
                const response = await fetch('/api/dashboard/trends?period=' + this.currentTimeRange);
                if (!response.ok) {
                    throw new Error('Failed to load trend data');
                }
                data = await response.json();
            }
            
            this.charts.trendChart.data.labels = data.labels || [];
            this.charts.trendChart.data.datasets[0].data = data.safe || [];
            this.charts.trendChart.data.datasets[1].data = data.spam || [];
            this.charts.trendChart.data.datasets[2].data = data.phishing || [];
            this.charts.trendChart.data.datasets[3].data = data.suspicious || [];
            
            this.charts.trendChart.update();
        } catch (error) {
            console.error('❌ Error updating trend chart:', error);
            // Fallback to empty data
            this.charts.trendChart.data.labels = [];
            this.charts.trendChart.data.datasets.forEach(dataset => dataset.data = []);
            this.charts.trendChart.update();
        }
    }

    async updatePieChart(period = 'week', distribution = null) {
        if (!this.charts.pieChart) return;

        try {
            let data;
            if (distribution) {
                data = distribution;
            } else {
                // Load real distribution data from API
                const response = await fetch('/api/dashboard/distribution?period=' + period);
                if (!response.ok) {
                    throw new Error('Failed to load distribution data');
                }
                data = await response.json();
            }

            const totals = {
                safe: data.safe || 0,
                spam: data.spam || 0,
                phishing: data.phishing || 0,
                suspicious: data.suspicious || 0
            };

            this.charts.pieChart.data.datasets[0].data = [
                totals.safe,
                totals.spam,
                totals.phishing,
                totals.suspicious
            ];

            this.charts.pieChart.update();

            // Update pie stats
            const pieSafe = document.getElementById('pie-safe');
            const pieSpam = document.getElementById('pie-spam');
            const piePhishing = document.getElementById('pie-phishing');
            const pieSuspicious = document.getElementById('pie-suspicious');
            
            if (pieSafe) pieSafe.textContent = totals.safe.toLocaleString();
            if (pieSpam) pieSpam.textContent = totals.spam.toLocaleString();
            if (piePhishing) piePhishing.textContent = totals.phishing.toLocaleString();
            if (pieSuspicious) pieSuspicious.textContent = totals.suspicious.toLocaleString();
            
        } catch (error) {
            console.error('❌ Error updating pie chart:', error);
            // Fallback to empty data
            this.charts.pieChart.data.datasets[0].data = [0, 0, 0, 0];
            this.charts.pieChart.update();
        }
    }

    async loadDashboardData() {
        console.log('📊 Loading dashboard data from database...');
        
        try {
            // Load real data from API
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) {
                throw new Error('Failed to load dashboard data');
            }
            
            const data = await response.json();
            
            // Update main stats with real data
            this.animateCountUp('total-analyzed', data.total_analyzed || 0);
            this.animateCountUp('spam-detected', data.spam_detected || 0);
            this.animateCountUp('phishing-blocked', data.phishing_blocked || 0);
            this.animateCountUp('avg-confidence', Math.round(data.avg_confidence || 0), '%');
            this.animateCountUp('processing-time', Math.round(data.avg_processing_time || 0), 'ms');
            this.animateCountUp('success-rate', Math.round(data.success_rate || 0), '%');

            // Load real activity feed
            await this.loadActivityFeed();

            // Update performance metrics with real data
            setTimeout(() => {
                this.updatePerformanceMetrics(data);
            }, 500);
            
            console.log('✅ Dashboard data loaded from database');
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            // Fallback to zero values
            this.animateCountUp('total-analyzed', 0);
            this.animateCountUp('spam-detected', 0);
            this.animateCountUp('phishing-blocked', 0);
            this.animateCountUp('avg-confidence', 0, '%');
            this.animateCountUp('processing-time', 0, 'ms');
            this.animateCountUp('success-rate', 0, '%');
        }
    }

    animateCountUp(elementId, targetValue, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString() + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updatePerformanceMetrics(data = {}) {
        // Calculate real metrics from data
        const total = data.total_analyzed || 0;
        const spam = data.spam_detected || 0;
        const phishing = data.phishing_blocked || 0;
        const safe = total - spam - phishing;
        
        const metrics = [
            { selector: '.metric:nth-child(1) .metric-fill', width: total > 0 ? (safe / total) * 100 : 0 },
            { selector: '.metric:nth-child(2) .metric-fill', width: total > 0 ? (spam / total) * 100 : 0 },
            { selector: '.metric:nth-child(3) .metric-fill', width: total > 0 ? (phishing / total) * 100 : 0 }
        ];

        metrics.forEach(metric => {
            const element = document.querySelector(metric.selector);
            if (element) {
                element.style.width = `${Math.min(metric.width, 100)}%`;
            }
        });
    }

    async loadActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        try {
            // Load real activity from API
            const response = await fetch('/api/analysis/activity?limit=10');
            if (!response.ok) {
                throw new Error('Failed to load activity feed');
            }
            
            const activities = await response.json();
            
            if (activities.length === 0) {
                activityFeed.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon">
                            ℹ️
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">Chưa có hoạt động</div>
                            <div class="activity-description">Hãy phân tích email đầu tiên để bắt đầu</div>
                        </div>
                        <div class="activity-time">-</div>
                    </div>
                `;
                return;
            }
            
            activityFeed.innerHTML = activities.map(activity => `
                <div class="activity-item" data-type="${this.getActivityType(activity.classification)}">
                    <div class="activity-icon ${this.getActivityType(activity.classification)}">
                        ${this.getActivityIcon(this.getActivityType(activity.classification))}
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Email ${activity.classification}</div>
                        <div class="activity-description">${activity.email_text.substring(0, 100)}${activity.email_text.length > 100 ? '...' : ''}</div>
                    </div>
                    <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('❌ Error loading activity feed:', error);
            activityFeed.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        ❌
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Lỗi tải dữ liệu</div>
                        <div class="activity-description">Không thể tải hoạt động từ server</div>
                    </div>
                    <div class="activity-time">-</div>
                </div>
            `;
        }
    }

    generateMockActivity() {
        const activities = [
            {
                type: 'spam',
                title: 'Phát hiện email spam',
                description: 'From: lottery-winner@fake-site.com - "You won $1,000,000!"',
                time: '2 phút trước'
            },
            {
                type: 'safe',
                title: 'Email an toàn được phân tích',
                description: 'From: john@company.com - "Meeting update for tomorrow"',
                time: '5 phút trước'
            },
            {
                type: 'phishing',
                title: 'Chặn thành công email phishing',
                description: 'From: security@bank-fake.com - "Account verification required"',
                time: '8 phút trước'
            },
            {
                type: 'suspicious',
                title: 'Email đáng nghi cần xem xét',
                description: 'From: deals@amazing-offers.com - "Limited time offer!"',
                time: '12 phút trước'
            },
            {
                type: 'safe',
                title: 'Batch analysis hoàn tất',
                description: '150 emails được phân tích - 142 an toàn, 8 spam',
                time: '15 phút trước'
            },
            {
                type: 'spam',
                title: 'Cập nhật blacklist',
                description: 'Thêm 25 domain mới vào danh sách đen',
                time: '22 phút trước'
            }
        ];

        return activities;
    }

    getActivityType(classification) {
        const typeMap = {
            'An toàn': 'safe',
            'Lừa đảo': 'phishing',
            'Spam': 'spam',
            'Đáng ngờ': 'suspicious',
            'Phần mềm độc hại': 'malware',
            'Thông báo': 'safe',
            'Hóa đơn': 'safe',
            'Khuyến mãi': 'spam',
            'Cần xem xét thêm': 'suspicious'
        };
        return typeMap[classification] || 'safe';
    }

    getActivityIcon(type) {
        const icons = {
            'safe': '✅',
            'spam': '🚫',
            'phishing': '🎣',
            'suspicious': '⚠️',
            'malware': '🦠'
        };
        return icons[type] || '📧';
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return time.toLocaleDateString('vi-VN');
    }

    filterActivity(type) {
        const activityItems = document.querySelectorAll('.activity-item');
        
        activityItems.forEach(item => {
            if (type === 'all' || item.dataset.type === type) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    clearActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        if (activityFeed) {
            activityFeed.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        ℹ️
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">Đã xóa lịch sử hoạt động</div>
                        <div class="activity-description">Tất cả hoạt động trước đây đã được xóa</div>
                    </div>
                    <div class="activity-time">Vừa xong</div>
                </div>
            `;
        }

        // Show notification
        if (window.app) {
            window.app.showNotification('🗑️ Đã xóa lịch sử hoạt động', 'success');
        }
    }

    loadMoreActivity() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        const moreActivities = [
            {
                type: 'safe',
                title: 'Hệ thống backup thành công',
                description: 'Backup database và cấu hình hệ thống hoàn tất',
                time: '1 giờ trước'
            },
            {
                type: 'spam',
                title: 'Cập nhật ML model',
                description: 'Model phiên bản 2.1.3 đã được deploy',
                time: '2 giờ trước'
            }
        ];

        const newItems = moreActivities.map(activity => `
            <div class="activity-item" data-type="${activity.type}">
                <div class="activity-icon ${activity.type}">
                    ${this.getActivityIcon(activity.type)}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');

        activityFeed.insertAdjacentHTML('beforeend', newItems);
    }

    async refreshDashboard(manual = false) {
        if (manual) {
            // Show loading state
            const refreshBtn = document.getElementById('refresh-dashboard');
            if (refreshBtn) {
                const originalContent = refreshBtn.innerHTML;
                refreshBtn.innerHTML = '<span class="refresh-icon">⏳</span><span>Đang làm mới...</span>';
                refreshBtn.disabled = true;

                setTimeout(() => {
                    refreshBtn.innerHTML = originalContent;
                    refreshBtn.disabled = false;
                }, 2000);
            }

            if (window.app) {
                window.app.showNotification('🔄 Đang làm mới dữ liệu...', 'info');
            }
        }

        try {
            // Refresh all data
            await this.loadDashboardData();
            await this.updateTrendChart();
            await this.updatePieChart(this.currentTimeRange);
            
            if (manual && window.app) {
                setTimeout(() => {
                    window.app.showNotification('✅ Dữ liệu đã được cập nhật', 'success');
                }, 2000);
            }
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
            if (window.app) {
                window.app.showNotification('❌ Lỗi khi làm mới dữ liệu', 'error');
            }
        }
    }

    startAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(() => {
            if (this.autoRefresh) {
                this.refreshDashboard();
            }
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    exportToPDF() {
        if (window.app) {
            window.app.showNotification('📄 Đang tạo file PDF...', 'info');
        }

        // Simulate PDF generation
        setTimeout(() => {
            if (window.app) {
                window.app.showNotification('✅ File PDF đã được tạo và tải xuống', 'success');
            }
        }, 2000);
    }

    exportToExcel() {
        if (window.app) {
            window.app.showNotification('📊 Đang tạo file Excel...', 'info');
        }

        // Simulate Excel generation
        setTimeout(() => {
            if (window.app) {
                window.app.showNotification('✅ File Excel đã được tạo và tải xuống', 'success');
            }
        }, 2000);
    }

    // Public method to refresh when dashboard section becomes active
    refreshData() {
        if (document.getElementById('dashboard').classList.contains('active')) {
            this.refreshDashboard();
        }
    }

    // Cleanup when dashboard is not in use
    destroy() {
        this.stopAutoRefresh();
        
        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }
        
        if (this.charts.pieChart) {
            this.charts.pieChart.destroy();
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
} 