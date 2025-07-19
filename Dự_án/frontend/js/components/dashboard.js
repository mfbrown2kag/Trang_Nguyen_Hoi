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

    updateTrendChart() {
        if (!this.charts.trendChart) return;

        const data = this.generateMockData();
        
        this.charts.trendChart.data.labels = data.labels;
        this.charts.trendChart.data.datasets[0].data = data.safe;
        this.charts.trendChart.data.datasets[1].data = data.spam;
        this.charts.trendChart.data.datasets[2].data = data.phishing;
        this.charts.trendChart.data.datasets[3].data = data.suspicious;
        
        this.charts.trendChart.update();
    }

    updatePieChart(period = 'week') {
        if (!this.charts.pieChart) return;

        const data = this.generateMockData();
        const totals = {
            safe: data.safe.reduce((a, b) => a + b, 0),
            spam: data.spam.reduce((a, b) => a + b, 0),
            phishing: data.phishing.reduce((a, b) => a + b, 0),
            suspicious: data.suspicious.reduce((a, b) => a + b, 0)
        };

        this.charts.pieChart.data.datasets[0].data = [
            totals.safe,
            totals.spam,
            totals.phishing,
            totals.suspicious
        ];

        this.charts.pieChart.update();

        // Update pie stats
        document.getElementById('pie-safe').textContent = totals.safe.toLocaleString();
        document.getElementById('pie-spam').textContent = totals.spam.toLocaleString();
        document.getElementById('pie-phishing').textContent = totals.phishing.toLocaleString();
        document.getElementById('pie-suspicious').textContent = totals.suspicious.toLocaleString();
    }

    loadDashboardData() {
        // Update main stats with animation
        this.animateCountUp('total-analyzed', 15420);
        this.animateCountUp('spam-detected', 3280);
        this.animateCountUp('phishing-blocked', 892);
        this.animateCountUp('avg-confidence', 89, '%');
        this.animateCountUp('processing-time', 345, 'ms');
        this.animateCountUp('success-rate', 97, '%');

        // Load activity feed
        this.loadActivityFeed();

        // Update performance metrics with animation
        setTimeout(() => {
            this.updatePerformanceMetrics();
        }, 500);
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

    updatePerformanceMetrics() {
        const metrics = [
            { selector: '.metric:nth-child(1) .metric-fill', width: Math.random() * 30 + 30 },
            { selector: '.metric:nth-child(2) .metric-fill', width: Math.random() * 40 + 40 },
            { selector: '.metric:nth-child(3) .metric-fill', width: Math.random() * 20 + 15 }
        ];

        metrics.forEach(metric => {
            const element = document.querySelector(metric.selector);
            if (element) {
                element.style.width = `${metric.width}%`;
            }
        });
    }

    loadActivityFeed() {
        const activityFeed = document.getElementById('activity-feed');
        if (!activityFeed) return;

        const activities = this.generateMockActivity();
        
        activityFeed.innerHTML = activities.map(activity => `
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

    getActivityIcon(type) {
        const icons = {
            'safe': '✅',
            'spam': '🚫',
            'phishing': '🎣',
            'suspicious': '⚠️'
        };
        return icons[type] || '📧';
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

    refreshDashboard(manual = false) {
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

        // Refresh all data
        this.updateTrendChart();
        this.updatePieChart();
        this.loadDashboardData();
        this.loadActivityFeed();
        this.updatePerformanceMetrics();

        if (manual && window.app) {
            setTimeout(() => {
                window.app.showNotification('✅ Dữ liệu đã được cập nhật', 'success');
            }, 2000);
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