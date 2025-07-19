// ===== DOCUMENTATION COMPONENT =====
class DocsManager {
    constructor() {
        this.currentDoc = 'overview';
        this.searchTerm = '';
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        console.log('📖 Documentation manager initializing...');
        
        this.setupSidebarNavigation();
        this.setupSearch();
        this.setupMobileNavigation();
        this.loadDefaultContent();
        
        this.isInitialized = true;
        console.log('✅ Documentation manager initialized');
    }

    setupSidebarNavigation() {
        // Category toggle functionality
        const categoryHeaders = document.querySelectorAll('.nav-category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategory(header);
            });
        });

        // Basic header toggle functionality
        const basicHeaders = document.querySelectorAll('.nav-basic-header');
        basicHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleBasicSection(header);
            });
        });

        // Subcategory toggle functionality
        const subcategoryHeaders = document.querySelectorAll('.nav-subcategory-header');
        subcategoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSubcategory(header);
            });
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.docs-nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const docId = link.getAttribute('href').substring(1);
                this.showDocsContent(docId);
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('docs-search');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterNavigation();
            }, 300));
        }
    }

    setupMobileNavigation() {
        const sidebarHeader = document.querySelector('.docs-sidebar-header');
        if (sidebarHeader) {
            sidebarHeader.addEventListener('click', () => {
                const navTree = document.querySelector('.docs-nav-tree');
                if (navTree) {
                    navTree.classList.toggle('mobile-open');
                }
            });
        }
    }

    toggleCategory(header) {
        const category = header.parentElement;
        const content = category.querySelector('.nav-category-content');
        const isCollapsed = header.classList.contains('collapsed');

        if (isCollapsed) {
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
        } else {
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        }
    }

    toggleBasicSection(header) {
        const basicSection = header.parentElement;
        const content = basicSection.querySelector('.nav-basic-content');
        const isCollapsed = header.classList.contains('collapsed');

        if (isCollapsed) {
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
        } else {
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        }
    }

    toggleSubcategory(header) {
        const subcategory = header.parentElement;
        const content = subcategory.querySelector('.nav-subcategory-links');
        const isCollapsed = header.classList.contains('collapsed');

        if (isCollapsed) {
            header.classList.remove('collapsed');
            content.classList.remove('collapsed');
        } else {
            header.classList.add('collapsed');
            content.classList.add('collapsed');
        }
    }

    filterNavigation() {
        const categories = document.querySelectorAll('.nav-category');
        
        categories.forEach(category => {
            const links = category.querySelectorAll('.docs-nav-link');
            let hasVisibleLinks = false;

            links.forEach(link => {
                const text = link.textContent.toLowerCase();
                const matches = !this.searchTerm || text.includes(this.searchTerm);
                
                link.style.display = matches ? 'block' : 'none';
                if (matches) hasVisibleLinks = true;
            });

            // Show/hide category based on if it has visible links
            category.style.display = hasVisibleLinks ? 'block' : 'none';
            
            // Auto-expand categories with matches
            if (hasVisibleLinks && this.searchTerm) {
                const header = category.querySelector('.nav-category-header');
                const content = category.querySelector('.nav-category-content');
                header.classList.remove('collapsed');
                content.classList.remove('collapsed');
            }
        });
    }

    showDocsContent(docId) {
        console.log(`📖 Loading documentation: ${docId}`);
        
        // Update active navigation
        this.updateActiveNavigation(docId);
        
        // Load content
        this.loadContent(docId);
        
        this.currentDoc = docId;
    }

    updateActiveNavigation(docId) {
        // Remove active from all links
        document.querySelectorAll('.docs-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active to current link
        const activeLink = document.querySelector(`[href="#${docId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Auto-expand parent containers if link is inside collapsed sections
            let parent = activeLink.closest('.nav-basic-content');
            if (parent && parent.classList.contains('collapsed')) {
                const header = parent.parentElement.querySelector('.nav-basic-header');
                if (header) {
                    header.classList.remove('collapsed');
                    parent.classList.remove('collapsed');
                }
            }
            
            parent = activeLink.closest('.nav-subcategory-links');
            if (parent && parent.classList.contains('collapsed')) {
                const header = parent.parentElement.querySelector('.nav-subcategory-header');
                if (header) {
                    header.classList.remove('collapsed');
                    parent.classList.remove('collapsed');
                }
            }
            
            // Ensure main category is expanded
            const category = activeLink.closest('.nav-category');
            if (category) {
                const header = category.querySelector('.nav-category-header');
                const content = category.querySelector('.nav-category-content');
                if (header && content) {
                    header.classList.remove('collapsed');
                    content.classList.remove('collapsed');
                }
            }
        }
    }

    loadContent(docId) {
        const contentArea = document.getElementById('docs-content-area');
        if (!contentArea) return;

        const content = this.getDocumentContent(docId);
        contentArea.innerHTML = content;

        // Scroll to top of content
        contentArea.scrollTop = 0;
    }

    loadDefaultContent() {
        // Show overview by default
        this.showDocsContent('overview');
    }

    getDocumentContent(docId) {
        const contents = {
            // Overview Section
            'overview': `
                <div class="doc-content">
                    <h1>🚀 Giới Thiệu Email Guardian</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Email Guardian là hệ thống bảo mật email tiên tiến sử dụng trí tuệ nhân tạo để phát hiện và ngăn chặn các mối đe dọa qua email.</p>
                    </div>

                    <div class="feature-highlights">
                        <h2>✨ Tính Năng Nổi Bật</h2>
                        
                        <div class="feature-grid">
                            <div class="feature-item">
                                <div class="feature-icon">🤖</div>
                                <h3>AI Phân Tích Thông Minh</h3>
                                <p>Sử dụng machine learning để phân tích nội dung email với độ chính xác cao</p>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">⚡</div>
                                <h3>Phân Tích Real-time</h3>
                                <p>Xử lý và phân tích email trong vài giây với kết quả tức thì</p>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">🛡️</div>
                                <h3>Bảo Vệ Đa Lớp</h3>
                                <p>Phát hiện spam, phishing, malware và social engineering</p>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">📊</div>
                                <h3>Dashboard Trực Quan</h3>
                                <p>Thống kê real-time và báo cáo chi tiết về tình hình bảo mật</p>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">🌍</div>
                                <h3>Giao Diện Tiếng Việt</h3>
                                <p>Hoàn toàn bằng tiếng Việt, dễ sử dụng cho người dùng Việt Nam</p>
                            </div>
                            
                            <div class="feature-item">
                                <div class="feature-icon">🔗</div>
                                <h3>Tích Hợp Dễ Dàng</h3>
                                <p>API RESTful để tích hợp vào hệ thống hiện có</p>
                            </div>
                        </div>
                    </div>

                    <div class="getting-started-section">
                        <h2>🏁 Bắt Đầu Ngay</h2>
                        <p>Chỉ cần 3 bước đơn giản để bắt đầu bảo vệ email của bạn:</p>
                        
                        <div class="steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h3>Paste Email</h3>
                                    <p>Sao chép nội dung email cần kiểm tra vào hệ thống</p>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h3>AI Phân Tích</h3>
                                    <p>Hệ thống AI sẽ phân tích và đánh giá mức độ nguy hiểm</p>
                                </div>
                            </div>
                            
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h3>Nhận Kết Quả</h3>
                                    <p>Xem kết quả chi tiết và khuyến nghị hành động</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="cta-section">
                            <button class="btn-primary" onclick="manualNavigate('analyze')">
                                🚀 Bắt Đầu Phân Tích Email
                            </button>
                        </div>
                    </div>
                </div>
            `,

            'getting-started': `
                <div class="doc-content">
                    <h1>🚀 Bắt Đầu Nhanh</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Học cách sử dụng Email Guardian trong 5 phút với hướng dẫn từng bước chi tiết.</p>
                    </div>

                    <div class="quick-start-guide">
                        <h2>⚡ Hướng Dẫn Nhanh</h2>
                        
                        <div class="guide-section">
                            <h3>📧 Bước 1: Chuẩn Bị Email</h3>
                            <div class="instruction-box">
                                <h4>Cách lấy nội dung email:</h4>
                                <ul>
                                    <li><strong>Gmail:</strong> Mở email → Menu "..." → "Show original" → Copy nội dung</li>
                                    <li><strong>Outlook:</strong> Mở email → "File" → "Properties" → Copy message source</li>
                                    <li><strong>Email khác:</strong> Copy toàn bộ nội dung email bao gồm header</li>
                                </ul>
                                
                                <div class="tip-box">
                                    <strong>💡 Mẹo:</strong> Không cần header đầy đủ, chỉ cần nội dung chính của email
                                </div>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h3>🔍 Bước 2: Phân Tích</h3>
                            <div class="instruction-box">
                                <ol>
                                    <li>Vào tab <strong>"Phân Tích"</strong> trên navigation bar</li>
                                    <li>Paste nội dung email vào text area</li>
                                    <li>Click nút <strong>"🔍 Phân Tích Email"</strong></li>
                                    <li>Đợi vài giây để AI xử lý</li>
                                </ol>
                                
                                <div class="shortcut-box">
                                    <strong>⌨️ Phím tắt:</strong> Ctrl + Enter để phân tích nhanh
                                </div>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h3>📊 Bước 3: Đọc Kết Quả</h3>
                            <div class="result-guide">
                                <div class="result-item safe">
                                    <div class="result-icon">✅</div>
                                    <div class="result-info">
                                        <h4>An Toàn (Safe)</h4>
                                        <p>Email hợp pháp, có thể xử lý bình thường</p>
                                    </div>
                                </div>
                                
                                <div class="result-item suspicious">
                                    <div class="result-icon">⚠️</div>
                                    <div class="result-info">
                                        <h4>Đáng Nghi (Suspicious)</h4>
                                        <p>Cần thận trọng, kiểm tra kỹ trước khi hành động</p>
                                    </div>
                                </div>
                                
                                <div class="result-item spam">
                                    <div class="result-icon">🚫</div>
                                    <div class="result-info">
                                        <h4>Spam</h4>
                                        <p>Email rác, nên xóa hoặc đánh dấu spam</p>
                                    </div>
                                </div>
                                
                                <div class="result-item phishing">
                                    <div class="result-icon">🎣</div>
                                    <div class="result-info">
                                        <h4>Phishing</h4>
                                        <p>Nguy hiểm! Không click link hoặc cung cấp thông tin</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h3>📈 Bước 4: Sử Dụng Dashboard</h3>
                            <div class="instruction-box">
                                <p>Dashboard cung cấp overview về hoạt động phân tích:</p>
                                <ul>
                                    <li><strong>Statistics:</strong> Tổng số email đã phân tích và phân bố loại</li>
                                    <li><strong>Charts:</strong> Xu hướng theo thời gian</li>
                                    <li><strong>Activity Feed:</strong> Hoạt động gần đây</li>
                                    <li><strong>Performance:</strong> Hiệu suất hệ thống</li>
                                </ul>
                            </div>
                        </div>

                        <div class="guide-section">
                            <h3>📚 Bước 5: Quản Lý Lịch Sử</h3>
                            <div class="instruction-box">
                                <p>Tất cả email đã phân tích được lưu trong lịch sử:</p>
                                <ul>
                                    <li><strong>Tìm kiếm:</strong> Search theo nội dung email</li>
                                    <li><strong>Lọc:</strong> Theo thời gian và loại phân tích</li>
                                    <li><strong>Xuất:</strong> Download báo cáo Excel</li>
                                    <li><strong>Chi tiết:</strong> Xem lại kết quả phân tích</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="next-steps">
                        <h2>🎯 Tiếp Theo</h2>
                        <div class="next-steps-grid">
                            <a href="#email-types" class="next-step-card" onclick="showDocsContent('email-types')">
                                <div class="card-icon">🏷️</div>
                                <h3>Tìm Hiểu Các Loại Email</h3>
                                <p>Học cách phân biệt các loại email và mối đe dọa</p>
                            </a>
                            
                            <a href="#red-flags" class="next-step-card" onclick="showDocsContent('red-flags')">
                                <div class="card-icon">⚠️</div>
                                <h3>Nhận Diện Dấu Hiệu Cảnh Báo</h3>
                                <p>Các red flags cần chú ý trong email</p>
                            </a>
                        </div>
                    </div>
                </div>
            `,

            'features': `
                <div class="doc-content">
                    <h1>✨ Tính Năng Chính</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Email Guardian cung cấp bộ công cụ toàn diện để bảo vệ khỏi mọi mối đe dọa email.</p>
                    </div>

                    <div class="features-detailed">
                        <div class="feature-category">
                            <h2>🤖 Phân Tích AI Thông Minh</h2>
                            <div class="feature-list">
                                <div class="feature-detail">
                                    <h3>🧠 Machine Learning Engine</h3>
                                    <p>Sử dụng mô hình AI tiên tiến để phân tích:</p>
                                    <ul>
                                        <li>Nội dung văn bản và ngữ cảnh</li>
                                        <li>Cấu trúc và metadata của email</li>
                                        <li>Patterns và behaviors của người gửi</li>
                                        <li>Link và attachment analysis</li>
                                    </ul>
                                </div>
                                
                                <div class="feature-detail">
                                    <h3>📊 Độ Chính Xác Cao</h3>
                                    <div class="accuracy-stats">
                                        <div class="stat-item">
                                            <div class="stat-number">95%+</div>
                                            <div class="stat-label">Spam Detection</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">90%+</div>
                                            <div class="stat-label">Phishing Detection</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">&lt;2%</div>
                                            <div class="stat-label">False Positive</div>
                                        </div>
                                        <div class="stat-item">
                                            <div class="stat-number">&lt;300ms</div>
                                            <div class="stat-label">Processing Time</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="feature-category">
                            <h2>🛡️ Bảo Vệ Đa Lớp</h2>
                            <div class="protection-layers">
                                <div class="layer-item">
                                    <div class="layer-icon">🚫</div>
                                    <div class="layer-content">
                                        <h3>Spam Filtering</h3>
                                        <p>Loại bỏ email quảng cáo không mong muốn và các chiến dịch bulk email</p>
                                    </div>
                                </div>
                                
                                <div class="layer-item">
                                    <div class="layer-icon">🎣</div>
                                    <div class="layer-content">
                                        <h3>Phishing Protection</h3>
                                        <p>Phát hiện các cố gắng đánh cắp thông tin cá nhân và credentials</p>
                                    </div>
                                </div>
                                
                                <div class="layer-item">
                                    <div class="layer-icon">🦠</div>
                                    <div class="layer-content">
                                        <h3>Malware Detection</h3>
                                        <p>Quét và ngăn chặn các file đính kèm và links độc hại</p>
                                    </div>
                                </div>
                                
                                <div class="layer-item">
                                    <div class="layer-icon">🎭</div>
                                    <div class="layer-content">
                                        <h3>Social Engineering</h3>
                                        <p>Nhận diện các kỹ thuật thao túng tâm lý và lừa đảo tinh vi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="feature-category">
                            <h2>📈 Dashboard & Analytics</h2>
                            <div class="analytics-features">
                                <div class="analytics-item">
                                    <h3>📊 Real-time Statistics</h3>
                                    <p>Theo dõi số liệu phân tích email theo thời gian thực</p>
                                </div>
                                
                                <div class="analytics-item">
                                    <h3>📈 Trend Analysis</h3>
                                    <p>Phân tích xu hướng và patterns của các mối đe dọa</p>
                                </div>
                                
                                <div class="analytics-item">
                                    <h3>📋 Detailed Reports</h3>
                                    <p>Báo cáo chi tiết có thể export và chia sẻ</p>
                                </div>
                            </div>
                        </div>

                        <div class="feature-category">
                            <h2>🔧 Tính Năng Hỗ Trợ</h2>
                            <div class="support-features">
                                <div class="support-grid">
                                    <div class="support-item">
                                        <div class="support-icon">🌍</div>
                                        <h3>Tiếng Việt Hoàn Toàn</h3>
                                        <p>Giao diện và tài liệu 100% tiếng Việt</p>
                                    </div>
                                    
                                    <div class="support-item">
                                        <div class="support-icon">📱</div>
                                        <h3>Responsive Design</h3>
                                        <p>Hoạt động mượt mà trên mọi thiết bị</p>
                                    </div>
                                    
                                    <div class="support-item">
                                        <div class="support-icon">🔄</div>
                                        <h3>Auto-Update</h3>
                                        <p>Cập nhật threat database tự động</p>
                                    </div>
                                    
                                    <div class="support-item">
                                        <div class="support-icon">🎯</div>
                                        <h3>User-Friendly</h3>
                                        <p>Thiết kế trực quan, dễ sử dụng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="cta-section">
                        <h2>🚀 Bắt Đầu Sử Dụng</h2>
                        <p>Sẵn sàng bảo vệ email của bạn? Hãy thử ngay!</p>
                        <button class="btn-primary" onclick="manualNavigate('analyze')">
                            🔍 Phân Tích Email Ngay
                        </button>
                    </div>
                </div>
            `,

            'system-requirements': `
                <div class="doc-content">
                    <h1>💻 Yêu Cầu Hệ Thống</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Email Guardian được thiết kế để hoạt động trên hầu hết các thiết bị và trình duyệt hiện đại.</p>
                    </div>

                    <div class="requirements-section">
                        <h2>🌐 Trình Duyệt Được Hỗ Trợ</h2>
                        
                        <div class="browser-grid">
                            <div class="browser-item supported">
                                <div class="browser-icon">🟢</div>
                                <h3>Chrome</h3>
                                <p>Version 90+ (Khuyến nghị)</p>
                            </div>
                            
                            <div class="browser-item supported">
                                <div class="browser-icon">🟢</div>
                                <h3>Firefox</h3>
                                <p>Version 88+</p>
                            </div>
                            
                            <div class="browser-item supported">
                                <div class="browser-icon">🟢</div>
                                <h3>Safari</h3>
                                <p>Version 14+</p>
                            </div>
                            
                            <div class="browser-item supported">
                                <div class="browser-icon">🟢</div>
                                <h3>Edge</h3>
                                <p>Version 90+</p>
                            </div>
                            
                            <div class="browser-item limited">
                                <div class="browser-icon">🟡</div>
                                <h3>Opera</h3>
                                <p>Version 76+ (Hạn chế)</p>
                            </div>
                            
                            <div class="browser-item not-supported">
                                <div class="browser-icon">🔴</div>
                                <h3>Internet Explorer</h3>
                                <p>Không hỗ trợ</p>
                            </div>
                        </div>
                    </div>

                    <div class="requirements-section">
                        <h2>📱 Thiết Bị & Hệ Điều Hành</h2>
                        
                        <div class="device-requirements">
                            <div class="device-category">
                                <h3>🖥️ Desktop/Laptop</h3>
                                <ul>
                                    <li><strong>Windows:</strong> 10, 11</li>
                                    <li><strong>macOS:</strong> 10.15+</li>
                                    <li><strong>Linux:</strong> Ubuntu 18+, CentOS 7+</li>
                                    <li><strong>RAM:</strong> Tối thiểu 4GB</li>
                                    <li><strong>CPU:</strong> Dual-core 2GHz+</li>
                                </ul>
                            </div>
                            
                            <div class="device-category">
                                <h3>📱 Mobile</h3>
                                <ul>
                                    <li><strong>iOS:</strong> 13.0+</li>
                                    <li><strong>Android:</strong> 8.0+ (API level 26)</li>
                                    <li><strong>RAM:</strong> Tối thiểu 2GB</li>
                                    <li><strong>Storage:</strong> 100MB trống</li>
                                </ul>
                            </div>
                            
                            <div class="device-category">
                                <h3>📟 Tablet</h3>
                                <ul>
                                    <li><strong>iPad:</strong> iOS 13.0+</li>
                                    <li><strong>Android Tablet:</strong> 8.0+</li>
                                    <li><strong>Surface:</strong> Windows 10+</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="requirements-section">
                        <h2>🌐 Kết Nối Mạng</h2>
                        
                        <div class="network-requirements">
                            <div class="network-item">
                                <h3>📶 Băng Thông</h3>
                                <ul>
                                    <li><strong>Tối thiểu:</strong> 1 Mbps</li>
                                    <li><strong>Khuyến nghị:</strong> 5 Mbps+</li>
                                    <li><strong>API calls:</strong> ~50KB/request</li>
                                </ul>
                            </div>
                            
                            <div class="network-item">
                                <h3>🔒 Bảo Mật</h3>
                                <ul>
                                    <li>HTTPS/TLS 1.2+ required</li>
                                    <li>WebSocket support</li>
                                    <li>CORS enabled</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="requirements-section">
                        <h2>⚙️ Cài Đặt Khuyến Nghị</h2>
                        
                        <div class="recommendations">
                            <div class="rec-item">
                                <div class="rec-icon">🍪</div>
                                <div class="rec-content">
                                    <h3>Cookies & Local Storage</h3>
                                    <p>Bật cookies và local storage để lưu preferences và lịch sử</p>
                                </div>
                            </div>
                            
                            <div class="rec-item">
                                <div class="rec-icon">📜</div>
                                <div class="rec-content">
                                    <h3>JavaScript</h3>
                                    <p>JavaScript phải được bật để ứng dụng hoạt động</p>
                                </div>
                            </div>
                            
                            <div class="rec-item">
                                <div class="rec-icon">🔔</div>
                                <div class="rec-content">
                                    <h3>Notifications</h3>
                                    <p>Cho phép notifications để nhận thông báo real-time</p>
                                </div>
                            </div>
                            
                            <div class="rec-item">
                                <div class="rec-icon">🎨</div>
                                <div class="rec-content">
                                    <h3>Độ Phân Giải</h3>
                                    <p>Tối thiểu 1024x768, khuyến nghị 1920x1080+</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="compatibility-check">
                        <h2>🧪 Kiểm Tra Tương Thích</h2>
                        <p>Nhấn nút bên dưới để kiểm tra xem thiết bị của bạn có tương thích không:</p>
                        
                        <button class="btn-primary" onclick="runCompatibilityCheck()">
                            🔍 Kiểm Tra Hệ Thống
                        </button>
                        
                        <div id="compatibility-results" class="compatibility-results" style="display: none;">
                            <!-- Results will be displayed here -->
                        </div>
                    </div>
                </div>
            `,

            'email-security-intro': `
                <div class="doc-content">
                    <h1>🔒 Tại Sao Cần Bảo Mật Email?</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Email là một trong những vector tấn công phổ biến nhất trong thế giới cyber security. Hiểu rõ lý do và cách thức bảo vệ là điều quan trọng.</p>
                    </div>

                    <div class="threat-statistics">
                        <h2>📊 Thống Kê Đáng Báo Động</h2>
                        
                        <div class="stats-grid">
                            <div class="stat-card danger">
                                <div class="stat-number">91%</div>
                                <div class="stat-desc">Các cuộc tấn công cyber bắt đầu từ email</div>
                            </div>
                            
                            <div class="stat-card warning">
                                <div class="stat-number">1/4</div>
                                <div class="stat-desc">Doanh nghiệp bị tấn công phishing mỗi năm</div>
                            </div>
                            
                            <div class="stat-card info">
                                <div class="stat-number">$4.9M</div>
                                <div class="stat-desc">Chi phí trung bình của một data breach</div>
                            </div>
                            
                            <div class="stat-card success">
                                <div class="stat-number">99%</div>
                                <div class="stat-desc">Các tấn công có thể ngăn chặn nếu có biện pháp phù hợp</div>
                            </div>
                        </div>
                    </div>

                    <div class="why-email-targeted">
                        <h2>🎯 Tại Sao Email Là Mục Tiêu?</h2>
                        
                        <div class="reasons-grid">
                            <div class="reason-item">
                                <div class="reason-icon">👥</div>
                                <h3>Phổ Biến Rộng Rãi</h3>
                                <p>Mọi người đều sử dụng email hàng ngày, tạo ra cơ hội tấn công lớn cho kẻ xấu.</p>
                            </div>
                            
                            <div class="reason-item">
                                <div class="reason-icon">🔓</div>
                                <h3>Bảo Mật Yếu</h3>
                                <p>Nhiều hệ thống email thiếu các biện pháp bảo mật hiện đại.</p>
                            </div>
                            
                            <div class="reason-item">
                                <div class="reason-icon">🎭</div>
                                <h3>Dễ Giả Mạo</h3>
                                <p>Kẻ tấn công có thể dễ dàng giả mạo địa chỉ gửi và nội dung.</p>
                            </div>
                            
                            <div class="reason-item">
                                <div class="reason-icon">🧠</div>
                                <h3>Khai Thác Tâm Lý</h3>
                                <p>Email cho phép thao túng tâm lý người dùng hiệu quả.</p>
                            </div>
                            
                            <div class="reason-item">
                                <div class="reason-icon">📎</div>
                                <h3>Vector Truyền Tải</h3>
                                <p>Có thể chứa malware qua attachments và links.</p>
                            </div>
                            
                            <div class="reason-item">
                                <div class="reason-icon">💰</div>
                                <h3>ROI Cao Cho Kẻ Xấu</h3>
                                <p>Chi phí thấp nhưng hiệu quả tấn công cao.</p>
                            </div>
                        </div>
                    </div>

                    <div class="impact-section">
                        <h2>💥 Tác Động Của Tấn Công Email</h2>
                        
                        <div class="impact-categories">
                            <div class="impact-category">
                                <h3>💼 Doanh Nghiệp</h3>
                                <ul>
                                    <li>Mất dữ liệu khách hàng và bí mật thương mại</li>
                                    <li>Thiệt hại tài chính từ ransomware</li>
                                    <li>Suy giảm uy tín và niềm tin</li>
                                    <li>Chi phí khôi phục và pháp lý</li>
                                    <li>Gián đoạn hoạt động kinh doanh</li>
                                </ul>
                            </div>
                            
                            <div class="impact-category">
                                <h3>👤 Cá Nhân</h3>
                                <ul>
                                    <li>Đánh cắp danh tính và thông tin cá nhân</li>
                                    <li>Mất tiền từ tài khoản ngân hàng</li>
                                    <li>Spam và phishing tiếp theo</li>
                                    <li>Stress và lo lắng</li>
                                    <li>Thời gian và công sức khôi phục</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="protection-benefits">
                        <h2>✅ Lợi Ích Của Bảo Mật Email</h2>
                        
                        <div class="benefits-list">
                            <div class="benefit-item">
                                <div class="benefit-icon">🛡️</div>
                                <div class="benefit-content">
                                    <h3>Bảo Vệ Dữ Liệu</h3>
                                    <p>Ngăn chặn truy cập trái phép vào thông tin nhạy cảm</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <div class="benefit-icon">💰</div>
                                <div class="benefit-content">
                                    <h3>Tiết Kiệm Chi Phí</h3>
                                    <p>Tránh chi phí khôi phục sau tấn công</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <div class="benefit-icon">🏆</div>
                                <div class="benefit-content">
                                    <h3>Duy Trì Uy Tín</h3>
                                    <p>Bảo vệ thương hiệu và niềm tin khách hàng</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <div class="benefit-icon">⚖️</div>
                                <div class="benefit-content">
                                    <h3>Tuân Thủ Pháp Luật</h3>
                                    <p>Đáp ứng các yêu cầu về bảo vệ dữ liệu</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <div class="benefit-icon">😌</div>
                                <div class="benefit-content">
                                    <h3>An Tâm</h3>
                                    <p>Yên tâm khi sử dụng email hàng ngày</p>
                                </div>
                            </div>
                            
                            <div class="benefit-item">
                                <div class="benefit-icon">📈</div>
                                <div class="benefit-content">
                                    <h3>Nâng Cao Hiệu Suất</h3>
                                    <p>Tập trung vào công việc thay vì lo lắng bảo mật</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="action-call">
                        <h2>🚀 Hành Động Ngay</h2>
                        <p>Đừng chờ đến khi bị tấn công mới hành động. Bắt đầu bảo vệ email ngay hôm nay!</p>
                        
                        <div class="action-buttons">
                            <button class="btn-primary" onclick="showDocsContent('getting-started')">
                                📖 Học Cách Sử Dụng
                            </button>
                            <button class="btn-secondary" onclick="manualNavigate('analyze')">
                                🔍 Phân Tích Email Ngay
                            </button>
                        </div>
                    </div>
                </div>
            `,

            'red-flags': `
                <div class="doc-content">
                    <h1>⚠️ Dấu Hiệu Cảnh Báo Trong Email</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Học cách nhận biết các dấu hiệu cảnh báo (red flags) trong email để tránh trở thành nạn nhân của các cuộc tấn công.</p>
                    </div>

                    <div class="red-flags-overview">
                        <h2>🚨 Các Dấu Hiệu Chính</h2>
                        
                        <div class="flags-grid">
                            <div class="flag-item critical">
                                <div class="flag-icon">⏰</div>
                                <h3>Tạo Cảm Giác Cấp Bách</h3>
                                <p>Yêu cầu hành động "ngay lập tức" hoặc "trong 24h"</p>
                            </div>
                            
                            <div class="flag-item critical">
                                <div class="flag-icon">👤</div>
                                <h3>Người Gửi Đáng Nghi</h3>
                                <p>Địa chỉ email lạ hoặc giả mạo tổ chức uy tín</p>
                            </div>
                            
                            <div class="flag-item high">
                                <div class="flag-icon">💰</div>
                                <h3>Yêu Cầu Tiền Bạc</h3>
                                <p>Chuyển tiền, thông tin ngân hàng, hoặc "phí xử lý"</p>
                            </div>
                            
                            <div class="flag-item high">
                                <div class="flag-icon">🔗</div>
                                <h3>Links Đáng Nghi</h3>
                                <p>URL rút gọn, domain lạ, hoặc không match với nội dung</p>
                            </div>
                            
                            <div class="flag-item medium">
                                <div class="flag-icon">✏️</div>
                                <h3>Lỗi Ngôn Ngữ</h3>
                                <p>Chính tả sai, ngữ pháp kém, hoặc dịch máy</p>
                            </div>
                            
                            <div class="flag-item medium">
                                <div class="flag-icon">📎</div>
                                <h3>File Đính Kèm Lạ</h3>
                                <p>Các file .exe, .zip, .scr từ người gửi không quen</p>
                            </div>
                        </div>
                    </div>

                    <div class="detailed-flags">
                        <div class="flag-section">
                            <h2>⏰ Chiến Thuật Tạo Áp Lực Thời Gian</h2>
                            
                            <div class="flag-details">
                                <h3>🎯 Mục đích:</h3>
                                <p>Khiến nạn nhân không có thời gian suy nghĩ kỹ và hành động vội vàng.</p>
                                
                                <h3>🚨 Các cụm từ thường thấy:</h3>
                                <div class="warning-phrases">
                                    <span class="phrase">"Trong 24 giờ tới"</span>
                                    <span class="phrase">"Ngay lập tức"</span>
                                    <span class="phrase">"Khẩn cấp"</span>
                                    <span class="phrase">"Hết hạn hôm nay"</span>
                                    <span class="phrase">"Cơ hội cuối cùng"</span>
                                    <span class="phrase">"Chỉ còn vài giờ"</span>
                                </div>
                                
                                <h3>✅ Cách phòng chống:</h3>
                                <ul>
                                    <li>Dừng lại và suy nghĩ kỹ trước khi hành động</li>
                                    <li>Liên hệ trực tiếp với tổ chức qua kênh chính thức</li>
                                    <li>Nhớ rằng các tổ chức uy tín hiếm khi yêu cầu hành động "ngay lập tức"</li>
                                </ul>
                            </div>
                        </div>

                        <div class="flag-section">
                            <h2>👤 Giả Mạo Danh Tính</h2>
                            
                            <div class="flag-details">
                                <h3>🎯 Các dạng phổ biến:</h3>
                                <div class="spoofing-types">
                                    <div class="spoofing-item">
                                        <h4>🏛️ Tổ chức chính phủ</h4>
                                        <p>Thuế, công an, tòa án, ngân hàng nhà nước</p>
                                    </div>
                                    
                                    <div class="spoofing-item">
                                        <h4>🏦 Ngân hàng</h4>
                                        <p>Vietcombank, BIDV, VietinBank, Techcombank</p>
                                    </div>
                                    
                                    <div class="spoofing-item">
                                        <h4>🌐 Dịch vụ online</h4>
                                        <p>Google, Facebook, Amazon, PayPal</p>
                                    </div>
                                    
                                    <div class="spoofing-item">
                                        <h4>👔 Sếp/đồng nghiệp</h4>
                                        <p>CEO, HR, IT Department</p>
                                    </div>
                                </div>
                                
                                <h3>🔍 Cách kiểm tra:</h3>
                                <ul>
                                    <li>Kiểm tra domain email có chính xác không</li>
                                    <li>Tìm các ký tự tương tự: vietcornbank.com thay vì vietcombank.com</li>
                                    <li>Xem chi tiết header email</li>
                                    <li>Gọi điện xác thực nếu cần thiết</li>
                                </ul>
                            </div>
                        </div>

                        <div class="flag-section">
                            <h2>🔗 Links và URLs Nguy Hiểm</h2>
                            
                            <div class="flag-details">
                                <h3>⚠️ Các dạng links đáng nghi:</h3>
                                <div class="dangerous-links">
                                    <div class="link-type">
                                        <h4>🔗 URL rút gọn</h4>
                                        <p>bit.ly, tinyurl.com, t.co - che giấu destination thật</p>
                                    </div>
                                    
                                    <div class="link-type">
                                        <h4>🌐 Domain giả mạo</h4>
                                        <p>faceb00k.com, gmai1.com, vietcornbank.com</p>
                                    </div>
                                    
                                    <div class="link-type">
                                        <h4>🔢 IP thay vì domain</h4>
                                        <p>http://192.168.1.1/login thay vì website chính thức</p>
                                    </div>
                                    
                                    <div class="link-type">
                                        <h4>📱 QR codes</h4>
                                        <p>QR code có thể dẫn đến website độc hại</p>
                                    </div>
                                </div>
                                
                                <h3>🛡️ Cách kiểm tra links an toàn:</h3>
                                <ul>
                                    <li>Hover chuột để xem URL thực trước khi click</li>
                                    <li>Copy link và paste vào browser thay vì click trực tiếp</li>
                                    <li>Sử dụng URL scanner tools</li>
                                    <li>Kiểm tra certificate của website</li>
                                </ul>
                            </div>
                        </div>

                        <div class="flag-section">
                            <h2>📎 File Đính Kèm Nguy Hiểm</h2>
                            
                            <div class="flag-details">
                                <h3>🚫 Các file extension nguy hiểm:</h3>
                                <div class="dangerous-extensions">
                                    <span class="ext critical">.exe</span>
                                    <span class="ext critical">.scr</span>
                                    <span class="ext critical">.bat</span>
                                    <span class="ext critical">.cmd</span>
                                    <span class="ext high">.zip</span>
                                    <span class="ext high">.rar</span>
                                    <span class="ext medium">.docm</span>
                                    <span class="ext medium">.xlsm</span>
                                </div>
                                
                                <h3>🎭 Kỹ thuật che giấu:</h3>
                                <ul>
                                    <li><strong>Double extension:</strong> photo.jpg.exe</li>
                                    <li><strong>Unicode tricks:</strong> Sử dụng ký tự đặc biệt</li>
                                    <li><strong>Archive password:</strong> File nén có mật khẩu để bypass scanner</li>
                                </ul>
                                
                                <h3>✅ Biện pháp an toàn:</h3>
                                <ul>
                                    <li>Không mở file từ người gửi không quen</li>
                                    <li>Scan virus trước khi mở</li>
                                    <li>Mở trong sandbox environment</li>
                                    <li>Xác thực với người gửi qua kênh khác</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div class="psychology-section">
                        <h2>🧠 Các Kỹ Thuật Tâm Lý</h2>
                        
                        <div class="psychology-grid">
                            <div class="psych-item">
                                <div class="psych-icon">😨</div>
                                <h3>Tạo Sợ Hãi</h3>
                                <p>"Tài khoản bị hack", "Virus detected", "Legal action"</p>
                            </div>
                            
                            <div class="psych-item">
                                <div class="psych-icon">🤑</div>
                                <h3>Lòng Tham</h3>
                                <p>"Win lottery", "Free money", "Investment opportunity"</p>
                            </div>
                            
                            <div class="psych-item">
                                <div class="psych-icon">❤️</div>
                                <h3>Lòng Trắc Ẩn</h3>
                                <p>"Charity", "Help needed", "Emergency situation"</p>
                            </div>
                            
                            <div class="psych-item">
                                <div class="psych-icon">🎯</div>
                                <h3>Tò Mò</h3>
                                <p>"You won't believe this", "Secret revealed", "Exclusive info"</p>
                            </div>
                        </div>
                    </div>

                    <div class="verification-methods">
                        <h2>✅ Phương Pháp Xác Thực</h2>
                        
                        <div class="verification-steps">
                            <div class="step-item">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <h3>Kiểm tra người gửi</h3>
                                    <p>Xác thực địa chỉ email và domain</p>
                                </div>
                            </div>
                            
                            <div class="step-item">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <h3>Phân tích nội dung</h3>
                                    <p>Tìm các red flags về ngôn ngữ và yêu cầu</p>
                                </div>
                            </div>
                            
                            <div class="step-item">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <h3>Kiểm tra links</h3>
                                    <p>Hover và verify tất cả các links</p>
                                </div>
                            </div>
                            
                            <div class="step-item">
                                <div class="step-number">4</div>
                                <div class="step-content">
                                    <h3>Xác thực qua kênh khác</h3>
                                    <p>Gọi điện hoặc liên hệ trực tiếp</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="quick-checklist">
                        <h2>📋 Checklist Nhanh</h2>
                        <p>Trước khi thực hiện bất kỳ hành động nào trong email, hãy tự hỏi:</p>
                        
                        <div class="checklist-items">
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Tôi có biết người gửi không?</span>
                            </label>
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Email này có tạo cảm giác cấp bách không?</span>
                            </label>
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Có yêu cầu thông tin cá nhân/tài chính không?</span>
                            </label>
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Links có dẫn đến đúng website không?</span>
                            </label>
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Ngôn ngữ có tự nhiên không?</span>
                            </label>
                            <label class="checklist-item">
                                <input type="checkbox">
                                <span>Tôi có thể xác thực qua kênh khác không?</span>
                            </label>
                        </div>
                        
                        <div class="checklist-result">
                            <p><strong>Nếu có bất kỳ câu trả lời "có" nào cho các câu hỏi trên → Hãy thận trọng và xác thực kỹ hơn!</strong></p>
                        </div>
                    </div>
                </div>
            `,

            'email-types': `
                <div class="doc-content">
                    <h1>🏷️ Các Loại Email và Cách Phân Biệt</h1>
                    
                    <div class="doc-intro">
                        <p class="lead">Hiểu rõ các loại email khác nhau và cách nhận diện chúng là bước đầu tiên để bảo vệ bản thân khỏi các mối đe dọa online.</p>
                    </div>

                    <div class="email-types-overview">
                        <h2>📊 Tổng Quan Phân Loại</h2>
                        
                        <div class="classification-chart">
                            <div class="chart-item safe">
                                <div class="chart-bar" style="width: 70%"></div>
                                <div class="chart-label">
                                    <span class="label">✅ Email An Toàn</span>
                                    <span class="percentage">~70%</span>
                                </div>
                            </div>
                            
                            <div class="chart-item spam">
                                <div class="chart-bar" style="width: 20%"></div>
                                <div class="chart-label">
                                    <span class="label">🚫 Spam</span>
                                    <span class="percentage">~20%</span>
                                </div>
                            </div>
                            
                            <div class="chart-item phishing">
                                <div class="chart-bar" style="width: 7%"></div>
                                <div class="chart-label">
                                    <span class="label">🎣 Phishing</span>
                                    <span class="percentage">~7%</span>
                                </div>
                            </div>
                            
                            <div class="chart-item suspicious">
                                <div class="chart-bar" style="width: 3%"></div>
                                <div class="chart-label">
                                    <span class="label">⚠️ Đáng Nghi</span>
                                    <span class="percentage">~3%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="email-type-details">
                        <div class="type-section safe">
                            <div class="type-header">
                                <div class="type-icon">✅</div>
                                <div class="type-info">
                                    <h2>Email An Toàn (Safe)</h2>
                                    <p class="type-description">Email hợp pháp từ nguồn tin cậy</p>
                                </div>
                                <div class="risk-indicator low">Rủi ro thấp</div>
                            </div>
                            
                            <div class="type-content">
                                <div class="characteristics">
                                    <h3>🔍 Đặc điểm nhận diện:</h3>
                                    <ul>
                                        <li>Người gửi từ domain/tổ chức quen thuộc</li>
                                        <li>Nội dung liên quan đến công việc hoặc cá nhân</li>
                                        <li>Không yêu cầu thông tin nhạy cảm</li>
                                        <li>Links đến websites chính thức</li>
                                        <li>Tone và ngôn ngữ chuyên nghiệp, phù hợp</li>
                                    </ul>
                                </div>
                                
                                <div class="examples">
                                    <h3>📧 Ví dụ:</h3>
                                    <div class="example-email safe">
                                        <div class="email-header">
                                            <strong>From:</strong> hr@company.com<br>
                                            <strong>Subject:</strong> Thông báo nghỉ lễ 30/4 - 1/5
                                        </div>
                                        <div class="email-preview">
                                            "Kính chào anh/chị, Công ty thông báo lịch nghỉ lễ Giải phóng miền Nam và Quốc tế Lao động từ ngày 30/4 đến 1/5. Anh chị vui lòng sắp xếp công việc..."
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="actions">
                                    <h3>✅ Hành động khuyến nghị:</h3>
                                    <ul>
                                        <li>Có thể đọc và xử lý bình thường</li>
                                        <li>Trả lời nếu cần thiết</li>
                                        <li>Click links nếu từ nguồn tin cậy</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="type-section spam">
                            <div class="type-header">
                                <div class="type-icon">🚫</div>
                                <div class="type-info">
                                    <h2>Email Spam</h2>
                                    <p class="type-description">Email quảng cáo không mong muốn, thường hàng loạt</p>
                                </div>
                                <div class="risk-indicator medium">Rủi ro trung bình</div>
                            </div>
                            
                            <div class="type-content">
                                <div class="characteristics">
                                    <h3>🔍 Đặc điểm nhận diện:</h3>
                                    <ul>
                                        <li>Subject line với từ khóa: "FREE", "WIN", "URGENT", "LIMITED"</li>
                                        <li>Nội dung quảng cáo sản phẩm/dịch vụ</li>
                                        <li>Yêu cầu hành động ngay lập tức</li>
                                        <li>Chứa nhiều hình ảnh và links quảng cáo</li>
                                        <li>Địa chỉ gửi lạ hoặc không rõ ràng</li>
                                        <li>Lỗi chính tả, ngữ pháp</li>
                                    </ul>
                                </div>
                                
                                <div class="examples">
                                    <h3>📧 Ví dụ:</h3>
                                    <div class="example-email spam">
                                        <div class="email-header">
                                            <strong>From:</strong> promotion@deals-now.com<br>
                                            <strong>Subject:</strong> 🔥 GIẢM GIÁ 90% - CHỈ HÔM NAY!!!
                                        </div>
                                        <div class="email-preview">
                                            "KHUYẾN MÃI KHỦNG! Giảm giá lên đến 90% cho tất cả sản phẩm. Chỉ có 100 suất đầu tiên! NHANH TAY CLICK NGAY để không bỏ lỡ cơ hội..."
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="actions">
                                    <h3>🚫 Hành động khuyến nghị:</h3>
                                    <ul>
                                        <li>Đánh dấu là spam trong email client</li>
                                        <li>Không click vào links</li>
                                        <li>Không trả lời</li>
                                        <li>Block người gửi nếu cần</li>
                                        <li>Delete email</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="type-section phishing">
                            <div class="type-header">
                                <div class="type-icon">🎣</div>
                                <div class="type-info">
                                    <h2>Email Phishing</h2>
                                    <p class="type-description">Cố gắng đánh cắp thông tin cá nhân, mật khẩu</p>
                                </div>
                                <div class="risk-indicator high">Rủi ro cao</div>
                            </div>
                            
                            <div class="type-content">
                                <div class="characteristics">
                                    <h3>🔍 Đặc điểm nhận diện:</h3>
                                    <ul>
                                        <li>Giả mạo tổ chức uy tín (ngân hàng, chính phủ)</li>
                                        <li>Yêu cầu "verify", "confirm", "update" thông tin</li>
                                        <li>Tạo cảm giác cấp bách: "account suspended"</li>
                                        <li>Links đến websites giả mạo</li>
                                        <li>Yêu cầu nhập password, PIN, số thẻ</li>
                                        <li>Domain gửi khác với tổ chức thật</li>
                                    </ul>
                                </div>
                                
                                <div class="examples">
                                    <h3>📧 Ví dụ:</h3>
                                    <div class="example-email phishing">
                                        <div class="email-header">
                                            <strong>From:</strong> security@bankofvietnam.fake.com<br>
                                            <strong>Subject:</strong> Khẩn cấp: Tài khoản bị đình chỉ
                                        </div>
                                        <div class="email-preview">
                                            "Chúng tôi phát hiện hoạt động bất thường trên tài khoản của bạn. Vui lòng xác thực ngay lập tức bằng cách click vào link và nhập thông tin đăng nhập..."
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="actions">
                                    <h3>🚨 Hành động khuyến nghị:</h3>
                                    <ul>
                                        <li><strong>KHÔNG BAO GIỜ</strong> click vào links</li>
                                        <li><strong>KHÔNG</strong> cung cấp thông tin cá nhân</li>
                                        <li>Liên hệ trực tiếp với tổ chức để xác thực</li>
                                        <li>Report email như phishing</li>
                                        <li>Delete email ngay lập tức</li>
                                        <li>Thay đổi mật khẩu nếu đã nhập</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="type-section suspicious">
                            <div class="type-header">
                                <div class="type-icon">⚠️</div>
                                <div class="type-info">
                                    <h2>Email Đáng Nghi</h2>
                                    <p class="type-description">Có một số dấu hiệu bất thường, cần thận trọng</p>
                                </div>
                                <div class="risk-indicator medium">Rủi ro trung bình</div>
                            </div>
                            
                            <div class="type-content">
                                <div class="characteristics">
                                    <h3>🔍 Đặc điểm nhận diện:</h3>
                                    <ul>
                                        <li>Một vài yếu tố đáng nghi nhưng chưa rõ ràng</li>
                                        <li>Người gửi không quen nhưng nội dung hợp lý</li>
                                        <li>Có yêu cầu nhưng không quá cấp bách</li>
                                        <li>Links đến websites ít biết</li>
                                        <li>Ngôn ngữ hơi bất thường</li>
                                    </ul>
                                </div>
                                
                                <div class="actions">
                                    <h3>⚠️ Hành động khuyến nghị:</h3>
                                    <ul>
                                        <li>Đọc kỹ và kiểm tra thông tin người gửi</li>
                                        <li>Xác thực qua kênh khác nếu có yêu cầu</li>
                                        <li>Thận trọng với links và attachments</li>
                                        <li>Có thể trả lời nhưng cẩn thận với thông tin</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="identification-tips">
                        <h2>💡 Mẹo Nhận Diện Nhanh</h2>
                        
                        <div class="quick-tips">
                            <div class="tip-item">
                                <div class="tip-icon">👀</div>
                                <div class="tip-content">
                                    <h3>Kiểm tra người gửi</h3>
                                    <p>Domain có chính xác không? Có typo không?</p>
                                </div>
                            </div>
                            
                            <div class="tip-item">
                                <div class="tip-icon">🔗</div>
                                <div class="tip-content">
                                    <h3>Hover links trước khi click</h3>
                                    <p>URL thật có match với text không?</p>
                                </div>
                            </div>
                            
                            <div class="tip-item">
                                <div class="tip-icon">⏰</div>
                                <div class="tip-content">
                                    <h3>Cảnh giác với "urgency"</h3>
                                    <p>Email thật hiếm khi yêu cầu hành động "ngay lập tức"</p>
                                </div>
                            </div>
                            
                            <div class="tip-item">
                                <div class="tip-icon">🔐</div>
                                <div class="tip-content">
                                    <h3>Không chia sẻ thông tin nhạy cảm</h3>
                                    <p>Password, PIN, số thẻ không bao giờ được yêu cầu qua email</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,

            // Add default for any missing content
            'default': `
                <div class="doc-content">
                    <h1>📄 Đang Phát Triển</h1>
                    <div class="doc-intro">
                        <p class="lead">Tài liệu này đang được phát triển. Vui lòng quay lại sau hoặc chọn tài liệu khác từ menu bên trái.</p>
                    </div>
                    
                    <div class="placeholder-content">
                        <div class="placeholder-icon">🚧</div>
                        <h2>Nội dung sẽ sớm có</h2>
                        <p>Chúng tôi đang tích cực hoàn thiện tài liệu này để cung cấp thông tin tốt nhất cho bạn.</p>
                        
                        <div class="suggestions">
                            <h3>📚 Tài liệu có sẵn:</h3>
                            <ul>
                                <li><a href="#overview" onclick="showDocsContent('overview')">Giới thiệu Email Guardian</a></li>
                                <li><a href="#getting-started" onclick="showDocsContent('getting-started')">Bắt đầu nhanh</a></li>
                                <li><a href="#email-types" onclick="showDocsContent('email-types')">Các loại email</a></li>
                                <li><a href="#email-security-intro" onclick="showDocsContent('email-security-intro')">Tại sao cần bảo mật email</a></li>
                                <li><a href="#red-flags" onclick="showDocsContent('red-flags')">Dấu hiệu cảnh báo</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `
        };

        return contents[docId] || contents['default'];
    }

    // Method for essential cards and external calls
    static showContent(docId) {
        if (window.docsManager) {
            window.docsManager.showDocsContent(docId);
        } else {
            console.warn('Docs manager not initialized');
        }
    }
}

// Compatibility check function
window.runCompatibilityCheck = function() {
    const resultsDiv = document.getElementById('compatibility-results');
    if (!resultsDiv) return;
    
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = '<p>🔄 Đang kiểm tra...</p>';
    
    setTimeout(() => {
        const results = [];
        
        // Browser check
        const userAgent = navigator.userAgent;
        let browserOk = true;
        let browserName = 'Unknown';
        
        if (userAgent.includes('Chrome')) {
            browserName = 'Chrome';
            browserOk = true;
        } else if (userAgent.includes('Firefox')) {
            browserName = 'Firefox';
            browserOk = true;
        } else if (userAgent.includes('Safari')) {
            browserName = 'Safari';
            browserOk = true;
        } else if (userAgent.includes('Edge')) {
            browserName = 'Edge';
            browserOk = true;
        } else {
            browserOk = false;
        }
        
        results.push({
            item: 'Trình duyệt',
            status: browserOk ? 'pass' : 'fail',
            details: `${browserName} - ${browserOk ? 'Được hỗ trợ' : 'Không được hỗ trợ'}`
        });
        
        // JavaScript check
        results.push({
            item: 'JavaScript',
            status: 'pass',
            details: 'Đã bật và hoạt động'
        });
        
        // Local Storage check
        const hasLocalStorage = typeof(Storage) !== "undefined";
        results.push({
            item: 'Local Storage',
            status: hasLocalStorage ? 'pass' : 'fail',
            details: hasLocalStorage ? 'Được hỗ trợ' : 'Không được hỗ trợ'
        });
        
        // Screen resolution
        const width = screen.width;
        const height = screen.height;
        const resolutionOk = width >= 1024 && height >= 768;
        results.push({
            item: 'Độ phân giải',
            status: resolutionOk ? 'pass' : 'warn',
            details: `${width}x${height} - ${resolutionOk ? 'Tốt' : 'Thấp'}`
        });
        
        // Render results
        let html = '<h3>🧪 Kết Quả Kiểm Tra</h3>';
        results.forEach(result => {
            const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
            html += `
                <div class="compat-result ${result.status}">
                    ${icon} <strong>${result.item}:</strong> ${result.details}
                </div>
            `;
        });
        
        const allPass = results.every(r => r.status === 'pass');
        const hasWarnings = results.some(r => r.status === 'warn');
        
        if (allPass) {
            html += '<div class="compat-summary success">🎉 Hệ thống của bạn hoàn toàn tương thích!</div>';
        } else if (hasWarnings) {
            html += '<div class="compat-summary warning">⚠️ Hệ thống tương thích với một số lưu ý.</div>';
        } else {
            html += '<div class="compat-summary error">❌ Hệ thống có thể không tương thích hoàn toàn.</div>';
        }
        
        resultsDiv.innerHTML = html;
    }, 1000);
};

// Global function for essential cards
window.showDocsContent = function(docId) {
    if (window.docsManager) {
        window.docsManager.showDocsContent(docId);
    } else {
        console.warn('Docs manager not initialized');
    }
};

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocsManager;
}

console.log('📖 Documentation component loaded'); 