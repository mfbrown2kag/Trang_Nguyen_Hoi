/* =================================
   🎮 CYBER GUARDIAN GAME ENGINE
   ================================= */

class CyberGuardianGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'loading'; // loading, menu, tutorial, playing, paused, gameOver
        this.gameData = this.initGameData();
        this.emails = [];
        this.particles = [];
        this.animations = [];
        this.currentScreen = 'loading';
        this.selectedTool = null;
        this.selectedEmail = null;
        this.sounds = {};
        this.lastPhase = 1; // Track phase changes
        
        // Game Settings
        this.settings = {
            volume: 0.7,
            difficulty: 'normal',
            showTips: true
        };
        
        // Initialize game
        this.init();
    }
    
    initGameData() {
        return {
            score: 0,
            health: 100,
            timer: 120, // 2 minutes
            combo: 1,
            maxCombo: 1,
            emailsAnalyzed: 0,
            correctAnalyses: 0,
            wave: 1,
            isShieldActive: false,
            shieldTimeLeft: 0,
            toolCooldowns: {
                scan: 0,
                block: 0,
                quarantine: 0,
                shield: 0
            }
        };
    }

    async init() {
        this.setupEventListeners();
        this.showLoading();
        
        // Simulate loading time
        await this.simulateLoading();
        
        this.showScreen('main-menu');
    }
    
    async simulateLoading() {
        const progressBar = document.querySelector('.loading-progress');
        const loadingText = document.querySelector('.loading-text');
        
        const steps = [
            'Đang khởi tạo giao thức bảo mật...',
            'Đang tải mô hình AI...',
            'Đang kết nối cơ sở dữ liệu mối đe dọa...',
            'Đang hiệu chỉnh hệ thống phòng thủ...',
            'Sẵn sàng bảo vệ!'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            loadingText.textContent = steps[i];
            progressBar.style.width = `${(i + 1) * 20}%`;
            await this.sleep(600);
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial-btn').addEventListener('click', () => this.showScreen('tutorial-screen'));
        document.getElementById('back-to-menu').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('start-from-tutorial').addEventListener('click', () => this.startGame());
        
        // Game controls
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('resume-game').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('quit-to-menu').addEventListener('click', () => this.quitToMenu());
        
        // Game over buttons
        document.getElementById('play-again').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-main').addEventListener('click', () => this.showScreen('main-menu'));
        document.getElementById('share-score').addEventListener('click', () => this.shareScore());
        
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectTool(e.target.closest('.tool-btn').dataset.tool));
        });
        
        // Email analysis actions
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.analyzeEmail(e.target.dataset.action));
        });
        
        // Close buttons
        document.getElementById('close-email-info').addEventListener('click', () => this.closeEmailInfo());
        document.getElementById('close-education').addEventListener('click', () => this.closeEducationPopup());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    showLoading() {
        this.showScreen('loading-screen');
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
        }
        
        // Initialize canvas for game screen
        if (screenId === 'game-screen') {
            this.initCanvas();
        }
    }
    
    initCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Canvas click events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMove(e));
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    startGame() {
        this.gameData = this.initGameData();
        this.emails = [];
        this.particles = [];
        this.animations = [];
        this.selectedTool = null;
        this.selectedEmail = null;
        this.gameState = 'playing';
        this.lastPhase = 1;
        
        this.showScreen('game-screen');
        this.updateHUD();
        this.startGameLoop();
        this.startEmailSpawning();
        this.showNotification('🚀 Click vào email để phân tích! Dùng công cụ để hành động!', 'success');
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (this.gameState === 'playing') {
                this.update();
                this.render();
            }
        }, 1000/60); // 60 FPS
        
        // Timer countdown
        this.timerInterval = setInterval(() => {
            if (this.gameState === 'playing') {
                this.gameData.timer--;
                this.updateHUD();
                
                if (this.gameData.timer <= 0) {
                    this.endGame(true); // Victory
                }
                
                // Check health
                if (this.gameData.health <= 0) {
                    this.endGame(false); // Defeat
                }
            }
        }, 1000);
    }
    
    startEmailSpawning() {
        this.emailSpawner = setInterval(() => {
            if (this.gameState === 'playing') {
                this.spawnEmail();
            }
        }, this.getDynamicSpawnRate());
        
        // Update spawn rate every 5 seconds to increase difficulty
        this.difficultyUpdater = setInterval(() => {
            if (this.gameState === 'playing') {
                clearInterval(this.emailSpawner);
                this.emailSpawner = setInterval(() => {
                    if (this.gameState === 'playing') {
                        this.spawnEmail();
                    }
                }, this.getDynamicSpawnRate());
            }
        }, 5000);
    }

    getDynamicSpawnRate() {
        const timeElapsed = 120 - this.gameData.timer;
        const progress = timeElapsed / 120; // 0 to 1
        
        // Difficulty phases
        if (progress < 0.25) {
            // Phase 1: Easy start (0-30s) - 4-5 seconds between emails
            return 4500 - (timeElapsed * 50);
        } else if (progress < 0.5) {
            // Phase 2: Getting harder (30-60s) - 3-4 seconds
            return 3500 - ((timeElapsed - 30) * 30);
        } else if (progress < 0.75) {
            // Phase 3: Intense (60-90s) - 2-3 seconds
            return 2500 - ((timeElapsed - 60) * 25);
        } else {
            // Phase 4: Maximum chaos (90-120s) - 1.5-2.5 seconds
            return Math.max(1500, 2500 - ((timeElapsed - 90) * 33));
        }
    }

    getDifficultyPhase() {
        const timeElapsed = 120 - this.gameData.timer;
        const progress = timeElapsed / 120;
        
        if (progress < 0.25) return { phase: 1, name: "KHỞI ĐỘNG", color: "#00ff88" };
        else if (progress < 0.5) return { phase: 2, name: "TĂNG TỐC", color: "#ffaa00" };
        else if (progress < 0.75) return { phase: 3, name: "NGUY HIỂM", color: "#ff6666" };
        else return { phase: 4, name: "ĐỊA NGỤC", color: "#ff3366" };
    }
    
    spawnEmail() {
        const emailTypes = ['safe', 'spam', 'phishing', 'malware'];
        const weights = this.getEmailTypeWeights();
        const type = this.weightedRandom(emailTypes, weights);
        
        const email = this.generateEmail(type);
        
        // Dynamic speed based on difficulty phase
        const phase = this.getDifficultyPhase().phase;
        let baseSpeed = 25;
        let speedVariation = 15;
        
        // Increase speed based on phase
        if (phase === 2) {
            baseSpeed = 30;
            speedVariation = 20;
        } else if (phase === 3) {
            baseSpeed = 40;
            speedVariation = 25;
        } else if (phase === 4) {
            baseSpeed = 50;
            speedVariation = 30;
        }
        
        // Spawn from right edge with better positioning - avoid tools panel area
        email.x = this.canvas.width + 50;
        email.y = Math.random() * (this.canvas.height - 320) + 120; // More space for HUD and tools
        email.vx = -(baseSpeed + Math.random() * speedVariation); // Dynamic speed based on phase
        email.vy = (Math.random() - 0.5) * 8; // Reduced vertical movement
        email.id = Date.now() + Math.random();
        
        // Email dimensions for hit detection
        email.width = 180;
        email.height = 120;
        
        // Shorter lifetime in later phases to increase pressure
        let baseLifetime = 15000;
        let lifetimeVariation = 8000;
        
        if (phase === 3) {
            baseLifetime = 12000;
            lifetimeVariation = 6000;
        } else if (phase === 4) {
            baseLifetime = 10000;
            lifetimeVariation = 4000;
        }
        
        email.maxTimeOnScreen = baseLifetime + Math.random() * lifetimeVariation;
        
        this.emails.push(email);
        
        // Animate hacker when sending threatening emails
        if (type !== 'safe') {
            this.animateHackerAttack();
        }
        
        // Show phase notification on phase change
        const currentPhase = phase;
        if (this.lastPhase !== currentPhase) {
            this.lastPhase = currentPhase;
            const phaseInfo = this.getDifficultyPhase();
            this.showNotification(`🔥 ${phaseInfo.name} - Phase ${phaseInfo.phase}!`, 'warning');
        }
    }
    
    animateHackerAttack() {
        const hackerAttacker = document.getElementById('hacker-attacker');
        if (hackerAttacker) {
            hackerAttacker.classList.add('attacking');
            setTimeout(() => {
                hackerAttacker.classList.remove('attacking');
            }, 800);
        }
    }

    animateDefenderHit() {
        const defenderElement = document.getElementById('system-defender');
        if (defenderElement) {
            defenderElement.classList.add('under-attack');
            setTimeout(() => {
                defenderElement.classList.remove('under-attack');
            }, 500);
        }
    }
    
    getEmailTypeWeights() {
        const timeElapsed = 120 - this.gameData.timer;
        const progress = timeElapsed / 120;
        const phase = this.getDifficultyPhase().phase;
        
        // Dynamic threat level based on game phase
        if (phase === 1) {
            // Phase 1: Easy start - mostly safe emails
            return [0.70, 0.20, 0.08, 0.02]; // 70% safe, 20% spam, 8% phishing, 2% malware
        } else if (phase === 2) {
            // Phase 2: Getting serious - more spam and phishing
            return [0.50, 0.30, 0.15, 0.05]; // 50% safe, 30% spam, 15% phishing, 5% malware
        } else if (phase === 3) {
            // Phase 3: Danger zone - balanced but threatening
            return [0.30, 0.25, 0.30, 0.15]; // 30% safe, 25% spam, 30% phishing, 15% malware
        } else {
            // Phase 4: Hell mode - mostly threats
            return [0.15, 0.20, 0.35, 0.30]; // 15% safe, 20% spam, 35% phishing, 30% malware
        }
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }
    
    generateEmail(type) {
        const emailTemplates = {
            safe: {
                subjects: [
                    'Nhắc nhở họp team hàng tuần',
                    'Cập nhật dự án từ quản lý',
                    'Bản tin công ty - Tháng 3 2024',
                    'Ghi chú cuộc họp hôm qua',
                    'Hóa đơn từ Công ty Văn phòng phẩm'
                ],
                senders: [
                    'manager@company.com',
                    'hr@company.com',
                    'accounting@company.com',
                    'support@company.com'
                ],
                indicators: ['Người gửi đã xác minh', 'Tên miền công ty', 'Giờ làm việc bình thường'],
                color: '#00ff88'
            },
            spam: {
                subjects: [
                    'CHÚC MỪNG! Bạn đã thắng 1.000.000.000 VNĐ!!!',
                    'Giảm 20kg trong 5 ngày - CAM KẾT!',
                    'Cơ hội đầu tư Crypto - Lợi nhuận 500%!',
                    'Gặp gỡ người độc thân gần bạn NGAY!',
                    'iPhone 15 miễn phí - Ưu đãi có hạn!'
                ],
                senders: [
                    'noreply@marketing123.com',
                    'deals@giaresinh.net',
                    'winner@xosodep.org'
                ],
                indicators: ['Nội dung quảng cáo', 'Quá tốt để tin được', 'Ngôn ngữ gấp gáp'],
                color: '#ffaa00'
            },
            phishing: {
                subjects: [
                    'KHẨN CẤP: Tài khoản của bạn sẽ bị khóa',
                    'Cảnh báo bảo mật - Đăng nhập từ thiết bị mới',
                    'Thanh toán thất bại - Cập nhật thẻ ngay',
                    'Hoàn thuế - Nhận ngay lập tức',
                    'Microsoft: Phát hiện hoạt động bất thường'
                ],
                senders: [
                    'security@bancl.com', // Lỗi chính tả trong bank
                    'support@paypaI.com', // Dùng I thay cho l
                    'noreply@microsofft.com' // Hai chữ f
                ],
                indicators: ['Tên miền đáng ngờ', 'Tạo sự khẩn cấp', 'Yêu cầu thông tin đăng nhập'],
                color: '#ff3366'
            },
            malware: {
                subjects: [
                    'Hoa_don_Thang3_2024.exe',
                    'Tài liệu yêu cầu macro - Bật để xem',
                    'Cập nhật hệ thống có sẵn - Tải ngay',
                    'Ảnh từ đêm qua.scr',
                    'Bản vá khẩn cấp cho máy tính'
                ],
                senders: [
                    'system@update-center.net',
                    'admin@securityfix.org',
                    'noreply@windowsupdate.fake'
                ],
                indicators: ['File đính kèm đáng ngờ', 'File thực thi', 'Cập nhật hệ thống giả'],
                color: '#333333'
            }
        };
        
        const template = emailTemplates[type];
        const subject = template.subjects[Math.floor(Math.random() * template.subjects.length)];
        const sender = template.senders[Math.floor(Math.random() * template.senders.length)];
        const indicators = [...template.indicators];
        
        return {
            type: type,
            subject: subject,
            sender: sender,
            body: this.generateEmailBody(type, subject),
            indicators: indicators,
            color: template.color,
            analyzed: false,
            correctlyAnalyzed: false,
            timeOnScreen: 0,
            maxTimeOnScreen: 15000 // Will be set in spawnEmail based on phase
        };
    }
    
    generateEmailBody(type, subject) {
        const bodies = {
            safe: [
                'Chào team, chỉ là nhắc nhở về cuộc họp hàng tuần vào 2h chiều mai tại phòng họp.',
                'Xin xem bản cập nhật dự án đính kèm. Hãy cho tôi biết nếu có thắc mắc gì.',
                'Bản tin hàng tháng chứa các cập nhật quan trọng và thông báo của công ty.'
            ],
            spam: [
                'Bạn đã được chọn là người trúng thưởng may mắn! Nhấn đây để nhận giải ngay!',
                'Bí mật giảm cân tuyệt vời mà bác sĩ không muốn bạn biết! Đặt hàng ngay!',
                'Đầu tư tiền ảo hôm nay và trở thành triệu phú ngày mai! Chỗ có hạn!'
            ],
            phishing: [
                'Chúng tôi phát hiện hoạt động đáng ngờ trên tài khoản của bạn. Vui lòng xác minh danh tính ngay bằng cách nhấn link bên dưới.',
                'Tài khoản của bạn sẽ bị đình chỉ trong 24 giờ. Cập nhật thông tin thanh toán để tránh gián đoạn dịch vụ.',
                'Phát hiện vi phạm bảo mật. Nhập mật khẩu tại đây để bảo vệ tài khoản của bạn.'
            ],
            malware: [
                'Hệ thống của bạn cần cập nhật bảo mật khẩn cấp. Tải và chạy file đính kèm ngay lập tức.',
                'Mở tài liệu đính kèm để xem hóa đơn. Bật macro khi được yêu cầu.',
                'Phát hiện lỗ hổng nghiêm trọng. Cài đặt bản vá này để bảo vệ máy tính của bạn.'
            ]
        };
        
        const typeBody = bodies[type];
        return typeBody[Math.floor(Math.random() * typeBody.length)];
    }
    
    update() {
        // Update tool cooldowns
        Object.keys(this.gameData.toolCooldowns).forEach(tool => {
            if (this.gameData.toolCooldowns[tool] > 0) {
                this.gameData.toolCooldowns[tool] -= 16; // ~60 FPS
                if (this.gameData.toolCooldowns[tool] < 0) {
                    this.gameData.toolCooldowns[tool] = 0;
                }
            }
        });
        
        // Update shield
        if (this.gameData.isShieldActive) {
            this.gameData.shieldTimeLeft -= 16;
            if (this.gameData.shieldTimeLeft <= 0) {
                this.gameData.isShieldActive = false;
            }
        }
        
        // Update emails
        this.emails.forEach((email, index) => {
            email.x += email.vx / 60; // 60 FPS adjustment
            email.y += email.vy / 60;
            email.timeOnScreen += 16;
            
            // Handle quarantined emails differently
            if (email.quarantined) {
                // Quarantined emails move to bottom-left corner
                if (email.x < 50 && email.y > this.canvas.height - 200) {
                    this.emails.splice(index, 1); // Remove when reaching quarantine zone
                    return;
                }
            }
            
            // Remove emails that go off screen or timeout (account for new width)
            if (email.x < -200 || email.timeOnScreen > email.maxTimeOnScreen) {
                if (!email.analyzed && !email.quarantined && email.type !== 'safe') {
                    // Unanalyzed threat causes damage
                    this.takeDamage(email.type);
                }
                this.emails.splice(index, 1);
            }
        });
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.isDead()) {
                this.particles.splice(index, 1);
            }
        });
        
        // Update animations
        this.animations.forEach((animation, index) => {
            animation.update();
            if (animation.isDead()) {
                this.animations.splice(index, 1);
            }
        });
        
        this.updateHUD();
    }
    
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background effects
        this.drawBackgroundEffects();
        
        // Draw shield effect if active
        if (this.gameData.isShieldActive) {
            this.drawShieldEffect();
        }
        
        // Draw emails
        this.renderEmails();
        
        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));
        
        // Draw animations
        this.animations.forEach(animation => animation.draw(this.ctx));
        
        // Draw selected email highlight
        if (this.selectedEmail) {
            this.drawEmailHighlight(this.selectedEmail);
        }
    }
    
    renderEmails() {
        this.emails.forEach(email => {
            // Email card size - much larger
            const emailWidth = 180;
            const emailHeight = 120;
            
            // Check if email is quarantined for different styling
            const isQuarantined = email.quarantined;
            
            // Main email card with shadow
            this.ctx.save();
            this.ctx.shadowColor = isQuarantined ? 'rgba(255, 170, 0, 0.4)' : 'rgba(0, 0, 0, 0.4)';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowOffsetX = 5;
            this.ctx.shadowOffsetY = 5;
            
            // Email background with gradient
            const gradient = this.ctx.createLinearGradient(email.x, email.y, email.x, email.y + emailHeight);
            if (isQuarantined) {
                gradient.addColorStop(0, 'rgba(40, 30, 10, 0.95)');
                gradient.addColorStop(1, 'rgba(30, 20, 5, 0.95)');
            } else {
                gradient.addColorStop(0, 'rgba(20, 20, 40, 0.95)');
                gradient.addColorStop(1, 'rgba(10, 10, 30, 0.95)');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(email.x, email.y, emailWidth, emailHeight);
            
            // Email border based on type
            this.ctx.strokeStyle = isQuarantined ? '#ffaa00' : email.color;
            this.ctx.lineWidth = isQuarantined ? 4 : 3;
            this.ctx.strokeRect(email.x, email.y, emailWidth, emailHeight);
            
            // Glow effect
            this.ctx.shadowColor = isQuarantined ? '#ffaa00' : email.color;
            this.ctx.shadowBlur = 20;
            this.ctx.strokeRect(email.x, email.y, emailWidth, emailHeight);
            this.ctx.restore();
            
            // Email type icon - much larger
            const iconSize = 40;
            const iconX = email.x + 15;
            const iconY = email.y + 15;
            
            this.ctx.save();
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Icon background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(iconX - 5, iconY - 5, iconSize + 10, iconSize + 10);
            this.ctx.strokeStyle = isQuarantined ? '#ffaa00' : email.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(iconX - 5, iconY - 5, iconSize + 10, iconSize + 10);
            
            // Icon
            this.ctx.fillStyle = isQuarantined ? '#ffaa00' : email.color;
            let icon = '📧';
            if (isQuarantined) {
                icon = '📦'; // Quarantine box icon
            } else {
                if (email.type === 'spam') icon = '🟡';
                if (email.type === 'phishing') icon = '🔴';
                if (email.type === 'malware') icon = '⚫';
                if (email.type === 'safe') icon = '🟢';
            }
            
            this.ctx.fillText(icon, iconX + iconSize/2, iconY + iconSize/2);
            this.ctx.restore();
            
            // Subject line - larger and cleaner
            this.ctx.save();
            this.ctx.font = 'bold 14px "Segoe UI", sans-serif';
            this.ctx.fillStyle = isQuarantined ? '#ffcc88' : '#ffffff';
            this.ctx.textAlign = 'left';
            
            const subjectX = iconX + iconSize + 15;
            const subjectY = email.y + 25;
            const maxSubjectWidth = emailWidth - (subjectX - email.x) - 10;
            
            const truncatedSubject = this.truncateText(email.subject, maxSubjectWidth, '14px "Segoe UI"');
            this.ctx.fillText(truncatedSubject, subjectX, subjectY);
            this.ctx.restore();
            
            // Sender - styled better
            this.ctx.save();
            this.ctx.font = '12px "Segoe UI", sans-serif';
            this.ctx.fillStyle = isQuarantined ? '#cc9966' : '#cccccc';
            this.ctx.fillText(`Từ: ${this.truncateText(email.sender, maxSubjectWidth, '12px "Segoe UI"')}`, subjectX, subjectY + 20);
            this.ctx.restore();
            
            // Threat level indicator
            this.ctx.save();
            const threatBarY = email.y + emailHeight - 25;
            const threatBarWidth = emailWidth - 20;
            const threatBarHeight = 8;
            
            // Background bar
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(email.x + 10, threatBarY, threatBarWidth, threatBarHeight);
            
            // Threat level fill
            let threatLevel = 0.2;
            if (email.type === 'spam') threatLevel = 0.4;
            if (email.type === 'phishing') threatLevel = 0.7;
            if (email.type === 'malware') threatLevel = 0.9;
            
            this.ctx.fillStyle = isQuarantined ? '#ffaa00' : email.color;
            this.ctx.fillRect(email.x + 10, threatBarY, threatBarWidth * threatLevel, threatBarHeight);
            
            // Threat level text
            this.ctx.font = '10px "Segoe UI", sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            
            let threatText = isQuarantined ? 'CÁCH LY' : 'AN TOÀN';
            if (!isQuarantined) {
                if (email.type === 'spam') threatText = 'THƯ RÁC';
                if (email.type === 'phishing') threatText = 'LỪA ĐẢO';
                if (email.type === 'malware') threatText = 'MÃ ĐỘC';
            }
            
            this.ctx.fillText(threatText, email.x + emailWidth/2, threatBarY - 5);
            this.ctx.restore();
            
            // Click hint - show different messages based on tool selection
            if (this.selectedTool && !isQuarantined) {
                this.ctx.save();
                this.ctx.font = '10px "Segoe UI", sans-serif';
                this.ctx.fillStyle = '#ffff00';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('CLICK ĐỂ SỬ DỤNG CÔNG CỤ', email.x + emailWidth/2, email.y + emailHeight + 15);
                this.ctx.restore();
            } else if (!this.selectedTool && !isQuarantined) {
                this.ctx.save();
                this.ctx.font = '10px "Segoe UI", sans-serif';
                this.ctx.fillStyle = '#00ffff';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('CLICK ĐỂ PHÂN TÍCH', email.x + emailWidth/2, email.y + emailHeight + 15);
                this.ctx.restore();
            }
        });
    }
    
    truncateText(text, maxWidth, font) {
        this.ctx.save();
        this.ctx.font = font;
        
        if (this.ctx.measureText(text).width <= maxWidth) {
            this.ctx.restore();
            return text;
        }
        
        let truncated = text;
        while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        this.ctx.restore();
        return truncated + '...';
    }
    
    drawBackgroundEffects() {
        // Matrix-style data streams
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const time = Date.now() * 0.001;
        for (let i = 0; i < 5; i++) {
            const x = (time * 50 + i * 200) % (this.canvas.width + 200) - 100;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Floating particles
        for (let i = 0; i < 20; i++) {
            const x = (time * 30 + i * 50) % this.canvas.width;
            const y = (time * 20 + i * 30) % this.canvas.height;
            
            this.ctx.fillStyle = `rgba(0, 255, 255, ${0.1 + Math.sin(time + i) * 0.05})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawEmail(email) {
        // Email body
        this.ctx.fillStyle = email.color;
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillRect(email.x, email.y, 80, 60);
        
        // Email border
        this.ctx.strokeStyle = email.color;
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(email.x, email.y, 80, 60);
        
        // Email icon based on type
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        
        const icons = {
            safe: '✉️',
            spam: '📧',
            phishing: '⚠️',
            malware: '💀'
        };
        
        this.ctx.fillText(icons[email.type], email.x + 40, email.y + 35);
        
        // Progress bar showing time left
        const timeProgress = email.timeOnScreen / email.maxTimeOnScreen;
        const barWidth = 80;
        const barHeight = 4;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(email.x, email.y - 10, barWidth, barHeight);
        
        this.ctx.fillStyle = timeProgress > 0.7 ? '#ff3366' : '#ffaa00';
        this.ctx.fillRect(email.x, email.y - 10, barWidth * timeProgress, barHeight);
        
        // Analysis indicator
        if (email.analyzed) {
            this.ctx.fillStyle = email.correctlyAnalyzed ? '#00ff88' : '#ff3366';
            this.ctx.fillRect(email.x + 70, email.y, 10, 10);
        }
    }
    
    drawEmailHighlight(email) {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(email.x - 5, email.y - 5, 90, 70);
        this.ctx.setLineDash([]);
    }
    
    drawShieldEffect() {
        // Draw a protective shield overlay
        this.ctx.save();
        
        // Create shield gradient
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const shieldRadius = Math.min(this.canvas.width, this.canvas.height) * 0.4;
        
        const shieldGradient = this.ctx.createRadialGradient(
            centerX, centerY, shieldRadius * 0.7,
            centerX, centerY, shieldRadius
        );
        shieldGradient.addColorStop(0, 'rgba(153, 102, 255, 0.1)');
        shieldGradient.addColorStop(1, 'rgba(153, 102, 255, 0.3)');
        
        this.ctx.fillStyle = shieldGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shield border with pulse effect
        const pulseAlpha = 0.3 + 0.2 * Math.sin(Date.now() * 0.01);
        this.ctx.strokeStyle = `rgba(153, 102, 255, ${pulseAlpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, shieldRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Shield time remaining
        this.ctx.font = 'bold 16px "Segoe UI", sans-serif';
        this.ctx.fillStyle = '#9966ff';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `🛡️ KHIÊN: ${Math.ceil(this.gameData.shieldTimeLeft / 1000)}s`,
            centerX, centerY - 50
        );
        
        this.ctx.restore();
    }
    
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is on any email
        const clickedEmail = this.emails.find(email => 
            x >= email.x && 
            x <= email.x + email.width && 
            y >= email.y && 
            y <= email.y + email.height
        );
        
        if (clickedEmail) {
            // If no tool selected, just show email analysis
            if (!this.selectedTool) {
                this.selectedEmail = clickedEmail;
                this.showEmailAnalysis(clickedEmail);
                this.showNotification('📧 Đang phân tích email...', 'info');
                this.addParticles(clickedEmail.x + clickedEmail.width/2, clickedEmail.y + clickedEmail.height/2, '#00ffff', 10);
                return;
            }
            
            // If SHIELD tool is selected, it doesn't need email target
            if (this.selectedTool === 'shield') {
                this.useShield();
                return;
            }
            
            // Use selected tool on email
            this.useToolOnEmail(this.selectedTool, clickedEmail);
        } else if (this.selectedTool === 'shield') {
            // Allow shield activation anywhere on canvas
            this.useShield();
        } else if (this.selectedTool) {
            this.showNotification('⚠️ Click vào email để sử dụng công cụ!', 'warning');
        }
    }

    useToolOnEmail(toolName, email) {
        switch(toolName) {
            case 'scan':
                this.scanEmail(email);
                break;
            case 'block':
                this.blockEmail(email);
                break;
            case 'quarantine':
                this.quarantineEmail(email);
                break;
        }
        
        // Set cooldown
        const cooldowns = {
            'scan': 2000,    // 2 seconds
            'block': 4000,   // 4 seconds  
            'quarantine': 6000, // 6 seconds
            'shield': 10000  // 10 seconds
        };
        
        this.gameData.toolCooldowns[toolName] = cooldowns[toolName];
        
        // Clear tool selection
        this.clearToolSelection();
        this.updateHUD();
    }

    scanEmail(email) {
        // QUÉT: Show enhanced email analysis with scan tool
        this.selectedEmail = email;
        this.showEmailAnalysis(email);
        this.showNotification('🔍 Quét chi tiết hoàn tất! Hiển thị mẹo bảo mật.', 'success');
        
        // Enhanced visual scanning effect when using tool
        this.addParticles(email.x + email.width/2, email.y + email.height/2, '#00ffff', 25);
        
        // Show enhanced tips indicator
        setTimeout(() => {
            const tipsDiv = document.querySelector('.analysis-tips');
            if (tipsDiv) {
                tipsDiv.style.background = 'rgba(0, 255, 136, 0.15)';
                tipsDiv.style.border = '2px solid #00ff88';
                tipsDiv.style.animation = 'tip-highlight 1s ease-out';
            }
        }, 500);
    }

    blockEmail(email) {
        // CHẶN: Immediately remove email and get points based on correctness
        const isCorrectBlock = email.type !== 'safe'; // Blocking is correct for threats
        
        if (isCorrectBlock) {
            let points = 15;
            if (email.type === 'phishing') points = 25;
            if (email.type === 'malware') points = 30;
            
            this.gameData.score += points;
            this.gameData.combo = Math.min(this.gameData.combo + 0.3, 5);
            this.showNotification(`🚫 Email đã chặn! +${points} điểm`, 'success');
            this.createFloatingText(email.x, email.y, `+${points}`, '#ff6666');
        } else {
            // Wrongly blocked safe email
            this.takeDamage('wrong_block');
            this.showNotification('❌ Chặn nhầm email an toàn!', 'error');
        }
        
        // Remove email immediately
        this.removeEmail(email);
        this.addParticles(email.x + email.width/2, email.y + email.height/2, '#ff6666', 20);
    }

    quarantineEmail(email) {
        // CÁCH LY: Move email to quarantine zone (bottom left corner)
        const isCorrectQuarantine = email.type === 'spam' || email.type === 'phishing';
        
        if (isCorrectQuarantine) {
            let points = 20;
            if (email.type === 'phishing') points = 35;
            
            this.gameData.score += points;
            this.gameData.combo = Math.min(this.gameData.combo + 0.5, 5);
            this.showNotification(`📦 Email đã cách ly! +${points} điểm`, 'success');
            this.createFloatingText(email.x, email.y, `+${points}`, '#ffaa00');
            
            // Animate email moving to quarantine
            email.vx = -100;
            email.vy = 50;
            email.quarantined = true;
            email.maxTimeOnScreen = email.timeOnScreen + 3000; // 3 more seconds
            
        } else {
            this.takeDamage('wrong_quarantine');
            this.showNotification('❌ Email này không cần cách ly!', 'error');
            this.removeEmail(email);
        }
        
        this.addParticles(email.x + email.width/2, email.y + email.height/2, '#ffaa00', 15);
    }

    useShield() {
        // KHIÊN: Activate protection shield
        this.gameData.isShieldActive = true;
        this.gameData.shieldTimeLeft = 8000; // 8 seconds protection
        
        this.showNotification('🛡️ Khiên bảo vệ đã kích hoạt! (8s)', 'success');
        
        // Visual effect for shield activation
        this.addParticles(this.canvas.width / 2, this.canvas.height / 2, '#9966ff', 30);
        
        // Set cooldown
        this.gameData.toolCooldowns['shield'] = 12000; // 12 seconds cooldown
        this.clearToolSelection();
        this.updateHUD();
    }

    clearToolSelection() {
        this.selectedTool = null;
        this.canvas.classList.remove('tool-selected');
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Optional: Show hint about direct email clicking
        if (this.emails.length > 0) {
            this.showNotification('💡 Click email để xem thông tin, hoặc chọn công cụ để hành động!', 'info');
        }
    }
    
    handleCanvasMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update cursor based on hover
        const hoveredEmail = this.emails.find(email => 
            x >= email.x && x <= email.x + 80 &&
            y >= email.y && y <= email.y + 60
        );
        
        this.canvas.style.cursor = hoveredEmail ? 'pointer' : 'default';
    }
    
    selectTool(toolName) {
        // Check cooldown
        if (this.gameData.toolCooldowns[toolName] > 0) {
            this.showNotification('⏳ Công cụ đang hồi chiêu!', 'warning');
            return;
        }
        
        // Clear previous selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Select new tool
        const toolBtn = document.querySelector(`[data-tool="${toolName}"]`);
        if (toolBtn) {
            toolBtn.classList.add('selected');
            this.selectedTool = toolName;
            
            // Update canvas cursor
            this.canvas.classList.add('tool-selected');
            
            const toolNames = {
                'scan': 'QUÉT - Phân tích chi tiết email (có thể click trực tiếp)',
                'block': 'CHẶN - Click email để chặn ngay',
                'quarantine': 'CÁCH LY - Click email để cách ly',
                'shield': 'KHIÊN - Click để kích hoạt bảo vệ'
            };
            
            this.showNotification(`🔧 ${toolNames[toolName]}`, 'info');
        }
    }
    
    useTool(toolName, email) {
        if (this.gameData.toolCooldowns[toolName] > 0) return;
        
        switch (toolName) {
            case 'scan':
                this.scanEmail(email);
                this.gameData.toolCooldowns.scan = 1000; // 1 second
                break;
            case 'block':
                this.blockEmail(email);
                this.gameData.toolCooldowns.block = 2000; // 2 seconds
                break;
            case 'quarantine':
                this.quarantineEmail(email);
                this.gameData.toolCooldowns.quarantine = 3000; // 3 seconds
                break;
            case 'shield':
                this.activateShield();
                this.gameData.toolCooldowns.shield = 10000; // 10 seconds
                break;
        }
        
        this.selectedTool = null;
        this.updateToolUI();
    }
    
    scanEmail(email) {
        this.selectEmail(email);
        this.showNotification('🔍 Email đã được quét! Kiểm tra chi tiết.', 'success');
        this.addParticles(email.x + 40, email.y + 30, '#00ffff', 10);
    }
    
    blockEmail(email) {
        if (email.type !== 'safe') {
            this.correctAnalysis(email, 'chặn');
            this.removeEmail(email);
            this.showNotification('🚫 Mối đe dọa đã bị chặn!', 'success');
        } else {
            this.incorrectAnalysis(email);
            this.showNotification('❌ Đã chặn email an toàn!', 'error');
        }
        this.addParticles(email.x + 40, email.y + 30, '#ff3366', 15);
    }
    
    quarantineEmail(email) {
        if (email.type === 'phishing' || email.type === 'malware') {
            this.correctAnalysis(email, 'cách ly');
            this.removeEmail(email);
            this.showNotification('⚡ Mối đe dọa cao đã bị cách ly!', 'success');
            this.gameData.score += 25; // Bonus points
        } else {
            this.incorrectAnalysis(email);
            this.showNotification('❌ Cách ly không cần thiết!', 'error');
        }
        this.addParticles(email.x + 40, email.y + 30, '#ffaa00', 20);
    }
    
    activateShield() {
        this.gameData.isShieldActive = true;
        this.gameData.shieldTimeLeft = 5000; // 5 seconds
        this.showNotification('🛡️ Khiên đã được kích hoạt!', 'success');
        this.addParticles(this.canvas.width / 2, this.canvas.height / 2, '#00ffff', 30);
    }
    
    selectEmail(email) {
        this.selectedEmail = email;
        this.showEmailInfo(email);
    }
    
    showEmailInfo(email) {
        document.getElementById('email-from').textContent = email.sender;
        document.getElementById('email-subject').textContent = email.subject;
        document.getElementById('email-body').textContent = email.body;
        
        // Show analysis indicators
        const indicatorsDiv = document.querySelector('.analysis-indicators');
        indicatorsDiv.innerHTML = '';
        email.indicators.forEach(indicator => {
            const span = document.createElement('span');
            span.textContent = indicator;
            span.className = 'indicator';
            indicatorsDiv.appendChild(span);
        });
        
        // Show educational tips
        this.showEducationalTips(email);
        
        document.getElementById('email-info').classList.remove('hidden');
    }

    showEmailAnalysis(email) {
        // Populate email info panel with better formatting
        document.getElementById('email-from').textContent = email.sender;
        document.getElementById('email-subject').textContent = email.subject;
        document.getElementById('email-body').textContent = email.body;
        
        // Show indicators
        const indicatorsDiv = document.querySelector('.analysis-indicators');
        indicatorsDiv.innerHTML = '<h4>🚨 Chỉ số Đáng Ngờ</h4>';
        email.indicators.forEach(indicator => {
            const div = document.createElement('div');
            div.className = 'indicator';
            div.textContent = indicator;
            indicatorsDiv.appendChild(div);
        });
        
        // Show educational tips
        this.showEducationalTips(email);
        
        // Show the panel
        document.getElementById('email-info').classList.remove('hidden');
    }

    closeEmailInfo() {
        document.getElementById('email-info').classList.add('hidden');
        this.selectedEmail = null;
    }

    analyzeEmail(userChoice) {
        if (!this.selectedEmail) return;
        
        const email = this.selectedEmail;
        const isCorrect = userChoice === email.type;
        
        if (isCorrect) {
            this.handleCorrectAnalysis(email, userChoice);
        } else {
            this.handleIncorrectAnalysis(email, userChoice);
        }
        
        // Remove email and close panel
        this.removeEmail(email);
        this.closeEmailInfo();
        this.clearToolSelection();
        this.updateHUD();
    }
    
    correctAnalysis(email, action) {
        email.analyzed = true;
        email.correctlyAnalyzed = true;
        
        let points = 10;
        if (email.type === 'phishing') points = 20;
        if (email.type === 'malware') points = 25;
        if (action === 'quarantined') points += 5;
        
        // Apply combo multiplier
        const finalPoints = Math.floor(points * this.gameData.combo);
        this.gameData.score += finalPoints;
        
        // Increase combo
        this.gameData.combo = Math.min(this.gameData.combo + 0.5, 5);
        this.gameData.maxCombo = Math.max(this.gameData.maxCombo, this.gameData.combo);
        
        this.gameData.correctAnalyses++;
        this.gameData.emailsAnalyzed++;
        
        this.showNotification(`+${finalPoints} điểm! (${action})`, 'success');
        this.createFloatingText(email.x, email.y, `+${finalPoints}`, '#00ff88');
    }
    
    incorrectAnalysis(email) {
        email.analyzed = true;
        email.correctlyAnalyzed = false;
        
        // Reset combo
        this.gameData.combo = 1;
        this.gameData.emailsAnalyzed++;
        
        // Lose health for wrong analysis
        this.takeDamage('wrong_analysis');
        
        this.showNotification('❌ Phân tích sai! Mất máu!', 'error');
        this.createFloatingText(email.x, email.y, 'SAI!', '#ff3366');
    }
    
    takeDamage(source) {
        if (this.gameData.isShieldActive) {
            this.showNotification('🛡️ Khiên đã hấp thụ sát thương!', 'success');
            return;
        }
        
        let damage = 10;
        if (source === 'phishing') damage = 20;
        if (source === 'malware') damage = 25;
        if (source === 'wrong_analysis') damage = 15;
        if (source === 'wrong_block') damage = 12;
        if (source === 'wrong_quarantine') damage = 8;
        
        this.gameData.health -= damage;
        this.gameData.health = Math.max(0, this.gameData.health);
        
        // Reset combo on damage
        this.gameData.combo = 1;
        
        // Trigger defender hit animation
        this.animateDefenderHit();
        
        const damageMessages = {
            'phishing': '💔 Bị lừa đảo!',
            'malware': '💔 Nhiễm mã độc!',
            'wrong_analysis': '💔 Phân tích sai!',
            'wrong_block': '💔 Chặn nhầm email!',
            'wrong_quarantine': '💔 Cách ly sai!'
        };
        
        this.showNotification(`${damageMessages[source] || '💔 Hệ thống bị tấn công!'} (-${damage} máu)`, 'error');
        this.addScreenShake();
    }
    
    removeEmail(email) {
        const index = this.emails.findIndex(e => e.id === email.id);
        if (index !== -1) {
            this.emails.splice(index, 1);
        }
    }
    
    addParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    createFloatingText(x, y, text, color) {
        this.animations.push(new FloatingText(x, y, text, color));
    }
    
    addScreenShake() {
        this.canvas.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.canvas.style.animation = '';
        }, 500);
    }
    
    showEducationalTips(email) {
        const tips = {
            safe: [
                'Tên miền người gửi đã xác minh',
                'Ngôn ngữ công việc bình thường',
                'Không có yêu cầu khẩn cấp'
            ],
            spam: [
                'Lời đề nghị quá tốt để tin được',
                'Nội dung quảng cáo không mong muốn',
                'Tên miền người gửi đáng ngờ'
            ],
            phishing: [
                'Tạo ra sự khẩn cấp giả',
                'Yêu cầu thông tin nhạy cảm',
                'Tên miền đáng ngờ (lỗi chính tả)'
            ],
            malware: [
                'File đính kèm đáng ngờ',
                'Yêu cầu bật macro',
                'Cập nhật hệ thống giả'
            ]
        };
        
        const tipsDiv = document.querySelector('.analysis-tips');
        tipsDiv.innerHTML = `<h4>🧠 Mẹo Bảo Mật</h4>`;
        tips[email.type].forEach(tip => {
            const div = document.createElement('div');
            div.textContent = tip;
            div.className = 'tip';
            tipsDiv.appendChild(div);
        });
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.gameData.score.toLocaleString();
        document.getElementById('timer').textContent = this.gameData.timer;
        document.getElementById('combo').textContent = `x${this.gameData.combo.toFixed(1)}`;
        
        // Health bar
        const healthFill = document.getElementById('health-fill');
        const healthPercent = document.getElementById('health-percent');
        const healthBar = document.querySelector('.health-bar');
        
        const healthPercentage = this.gameData.health;
        healthFill.style.width = `${healthPercentage}%`;
        healthPercent.textContent = `${healthPercentage}%`;
        
        // Health bar color states
        healthBar.classList.remove('warning', 'danger');
        const gameBackground = document.getElementById('game-background');
        gameBackground.classList.remove('health-good', 'health-warning', 'health-danger');
        
        if (healthPercentage <= 30) {
            healthBar.classList.add('danger');
            gameBackground.classList.add('health-danger');
        } else if (healthPercentage <= 60) {
            healthBar.classList.add('warning');
            gameBackground.classList.add('health-warning');
        } else {
            gameBackground.classList.add('health-good');
        }
        
        // Update difficulty phase indicator
        this.updateDifficultyIndicator();
        
        this.updateToolUI();
        this.updateCharacterStates();
    }

    updateDifficultyIndicator() {
        const phaseInfo = this.getDifficultyPhase();
        const timeElapsed = 120 - this.gameData.timer;
        
        // Create or update phase indicator
        let phaseIndicator = document.getElementById('phase-indicator');
        if (!phaseIndicator) {
            phaseIndicator = document.createElement('div');
            phaseIndicator.id = 'phase-indicator';
            phaseIndicator.style.cssText = `
                position: fixed;
                top: 15px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 10px;
                font-weight: bold;
                font-size: 14px;
                z-index: 200;
                border: 2px solid;
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
                text-align: center;
                min-width: 120px;
            `;
            document.body.appendChild(phaseIndicator);
        }
        
        // Update phase indicator content and style
        phaseIndicator.innerHTML = `
            <div style="font-size: 12px; opacity: 0.8;">PHASE ${phaseInfo.phase}</div>
            <div style="font-size: 16px; margin: 2px 0;">${phaseInfo.name}</div>
            <div style="font-size: 11px; opacity: 0.9;">⚡ ${this.getSpawnRateText()}</div>
        `;
        
        phaseIndicator.style.background = `rgba(${this.hexToRgb(phaseInfo.color)}, 0.2)`;
        phaseIndicator.style.borderColor = phaseInfo.color;
        phaseIndicator.style.color = phaseInfo.color;
        phaseIndicator.style.boxShadow = `0 0 20px ${phaseInfo.color}40`;
        
        // Add pulsing effect for higher phases
        if (phaseInfo.phase >= 3) {
            phaseIndicator.style.animation = 'phase-pulse 1s ease-in-out infinite';
        } else {
            phaseIndicator.style.animation = 'none';
        }
        
        // Update canvas background intensity based on phase
        this.updateCanvasIntensity(phaseInfo.phase);
    }

    getSpawnRateText() {
        const rate = this.getDynamicSpawnRate();
        if (rate > 3500) return "CHẬM";
        else if (rate > 2500) return "BÌNH THƯỜNG";
        else if (rate > 1800) return "NHANH";
        else return "CỰC NHANH";
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '255, 255, 255';
    }

    updateCanvasIntensity(phase) {
        if (!this.canvas) return;
        
        // Add phase-based screen effects
        this.canvas.classList.remove('phase-1', 'phase-2', 'phase-3', 'phase-4');
        this.canvas.classList.add(`phase-${phase}`);
        
        // Add screen shake for intense phases
        if (phase === 4 && Math.random() < 0.1) {
            this.addScreenShake(0.3);
        }
        
        // Add pressure indicators for high phases
        this.updatePressureIndicators(phase);
    }

    updatePressureIndicators(phase) {
        // Remove existing pressure indicator
        const existingIndicator = document.getElementById('pressure-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Add pressure indicator for phases 3 and 4
        if (phase >= 3) {
            const pressureIndicator = document.createElement('div');
            pressureIndicator.id = 'pressure-indicator';
            pressureIndicator.className = 'pressure-indicator';
            
            let pressureText = '';
            if (phase === 3) {
                pressureText = '⚠️ NGUY HIỂM ⚠️';
            } else if (phase === 4) {
                pressureText = '🔥 ĐỊA NGỤC 🔥';
            }
            
            pressureIndicator.textContent = pressureText;
            document.body.appendChild(pressureIndicator);
        }
    }

    addScreenShake(intensity = 1) {
        const shakeIntensity = intensity * 5;
        this.canvas.style.transform = `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`;
        setTimeout(() => {
            this.canvas.style.transform = '';
        }, 100);
    }
    
    updateCharacterStates() {
        const defenderElement = document.getElementById('system-defender');
        const hackerElement = document.getElementById('hacker-attacker');
        
        // Update defender based on health
        if (defenderElement) {
            defenderElement.classList.remove('low-health', 'critical-health');
            
            if (this.gameData.health <= 30) {
                defenderElement.classList.add('critical-health');
            } else if (this.gameData.health <= 60) {
                defenderElement.classList.add('low-health');
            }
        }
        
        // Update hacker activity based on wave intensity
        if (hackerElement) {
            const timeElapsed = 120 - this.gameData.timer;
            if (timeElapsed > 90) {
                hackerElement.style.animationDuration = '1s';
            } else if (timeElapsed > 60) {
                hackerElement.style.animationDuration = '1.5s';
            } else {
                hackerElement.style.animationDuration = '2s';
            }
        }
    }
    
    updateToolUI() {
        Object.keys(this.gameData.toolCooldowns).forEach(tool => {
            const btn = document.querySelector(`[data-tool="${tool}"]`);
            const cooldownDiv = btn.querySelector('.tool-cooldown');
            
            if (this.gameData.toolCooldowns[tool] > 0) {
                btn.classList.add('disabled');
                cooldownDiv.textContent = Math.ceil(this.gameData.toolCooldowns[tool] / 1000) + 's';
            } else {
                btn.classList.remove('disabled');
                cooldownDiv.textContent = '';
            }
            
            // Show shield status
            if (tool === 'shield' && this.gameData.isShieldActive) {
                btn.classList.add('active-shield');
                cooldownDiv.textContent = `${Math.ceil(this.gameData.shieldTimeLeft / 1000)}s`;
            } else {
                btn.classList.remove('active-shield');
            }
        });
    }
    
    pauseGame() {
        this.gameState = 'paused';
        this.showScreen('pause-screen');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.showScreen('game-screen');
    }
    
    restartGame() {
        this.endGameIntervals();
        this.startGame();
    }
    
    quitGame() {
        this.pauseGame();
    }
    
    quitToMenu() {
        this.endGameIntervals();
        this.showScreen('main-menu');
        this.gameState = 'menu';
    }
    
    endGame(victory) {
        this.endGameIntervals();
        this.gameState = 'gameOver';
        
        // Calculate performance metrics
        const performance = this.calculatePerformance();
        
        // Show results
        if (victory) {
            document.getElementById('victory-result').classList.remove('hidden');
            document.getElementById('defeat-result').classList.add('hidden');
            this.celebrateVictory();
            this.showNotification('🎉 CHIẾN THẮNG! Bạn đã vượt qua thử thách!', 'success');
        } else {
            document.getElementById('victory-result').classList.add('hidden');
            document.getElementById('defeat-result').classList.remove('hidden');
            this.showDefeatMotivation(performance);
        }
        
        // Update stats display
        this.updateGameOverStats(performance);
        this.showAchievements();
        this.showScreen('game-over-screen');
        
        // Save high score
        this.saveHighScore();
    }
    
    celebrateVictory() {
        // Confetti effect
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
    
    showAchievements() {
        const achievements = [];
        
        if (this.gameData.score >= 100) achievements.push('🥉 Người Bảo Vệ Tập Sự');
        if (this.gameData.score >= 300) achievements.push('🥈 Chuyên Gia Bảo Mật');
        if (this.gameData.score >= 500) achievements.push('🥇 Chiến Binh Tinh Anh');
        if (this.gameData.score >= 800) achievements.push('💎 Thạc Sĩ Bảo Vệ');
        
        if (this.gameData.maxCombo >= 3) achievements.push('🔥 Bậc Thầy Combo');
        if (this.gameData.correctAnalyses >= 10) achievements.push('🎯 Nhà Phân Tích Sắc Bén');
        
        const accuracy = this.gameData.emailsAnalyzed > 0 ? 
            (this.gameData.correctAnalyses / this.gameData.emailsAnalyzed) * 100 : 0;
        if (accuracy >= 90) achievements.push('🏆 Chiến Binh Hoàn Hảo');
        
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.innerHTML = achievements.length > 0 ? 
            achievements.map(a => `<div class="achievement">${a}</div>`).join('') : 
            '<div class="no-achievements">Chưa có thành tích nào trong lượt này</div>';
    }
    
    endGameIntervals() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (this.emailSpawner) clearInterval(this.emailSpawner); // Clear the new spawner
        if (this.difficultyUpdater) clearInterval(this.difficultyUpdater); // Clear the difficulty updater
    }
    
    shareScore() {
        if (navigator.share) {
            navigator.share({
                title: 'Cyber Guardian Defense',
                text: `Tôi đã ghi được ${this.gameData.score.toLocaleString()} điểm khi bảo vệ chống lại các mối đe dọa mạng!`,
                url: window.location.href
            });
        } else {
            // Fallback to clipboard
            const text = `Tôi đã ghi được ${this.gameData.score.toLocaleString()} điểm trong Cyber Guardian Defense! 🛡️`;
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Điểm số đã được sao chép!', 'success');
            });
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 2000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // Type-specific styling
        if (type === 'success') {
            notification.style.background = 'rgba(0, 255, 136, 0.9)';
            notification.style.color = '#000';
            notification.style.border = '2px solid #00ff88';
        } else if (type === 'error') {
            notification.style.background = 'rgba(255, 51, 102, 0.9)';
            notification.style.color = '#fff';
            notification.style.border = '2px solid #ff3366';
        } else if (type === 'warning') {
            notification.style.background = 'rgba(255, 170, 0, 0.9)';
            notification.style.color = '#000';
            notification.style.border = '2px solid #ffaa00';
        } else {
            notification.style.background = 'rgba(0, 255, 255, 0.9)';
            notification.style.color = '#000';
            notification.style.border = '2px solid #00ffff';
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    closeEducationPopup() {
        document.getElementById('education-popup').classList.add('hidden');
    }
    
    handleKeyboard(e) {
        if (this.gameState !== 'playing') return;
        
        const key = e.key.toLowerCase();
        
        switch (key) {
            case '1':
                this.selectTool('scan');
                break;
            case '2':
                this.selectTool('block');
                break;
            case '3':
                this.selectTool('quarantine');
                break;
            case '4':
                this.selectTool('shield');
                break;
            case 'escape':
                this.closeEmailInfo();
                this.selectedTool = null;
                break;
            case ' ':
                e.preventDefault();
                this.pauseGame();
                break;
        }
    }

    handleCorrectAnalysis(email, userChoice) {
        email.analyzed = true;
        email.correctlyAnalyzed = true;
        
        let basePoints = 10;
        if (email.type === 'spam') basePoints = 15;
        if (email.type === 'phishing') basePoints = 25;
        if (email.type === 'malware') basePoints = 30;
        
        // Combo system - increases with consecutive correct analyses
        this.gameData.combo = Math.min(this.gameData.combo + 0.5, 5);
        this.gameData.maxCombo = Math.max(this.gameData.maxCombo, this.gameData.combo);
        
        // Phase bonus
        const phaseBonus = this.getDifficultyPhase().phase * 0.2;
        const finalPoints = Math.floor(basePoints * (this.gameData.combo + phaseBonus));
        
        this.gameData.score += finalPoints;
        this.gameData.correctAnalyses++;
        this.gameData.emailsAnalyzed++;
        
        // Show combo achievement
        if (this.gameData.combo >= 3) {
            this.showComboAchievement();
        }
        
        this.showNotification(`+${finalPoints} điểm! (${this.getEmailTypeText(email.type)})`, 'success');
        this.createFloatingText(email.x, email.y, `+${finalPoints}`, '#00ff88');
    }

    handleIncorrectAnalysis(email, userChoice) {
        email.analyzed = true;
        email.correctlyAnalyzed = false;
        
        // Reset combo
        this.gameData.combo = 1;
        this.gameData.emailsAnalyzed++;
        
        // Trigger defender hit animation
        this.animateDefenderHit();
        
        this.showNotification('❌ Phân tích sai! Mất máu!', 'error');
        this.createFloatingText(email.x, email.y, 'SAI!', '#ff3366');
        
        // Lose health for wrong analysis
        this.takeDamage('wrong_analysis');
    }

    getEmailTypeText(type) {
        const texts = {
            'safe': 'An toàn',
            'spam': 'Thư rác',
            'phishing': 'Lừa đảo', 
            'malware': 'Mã độc'
        };
        return texts[type] || type;
    }

    showComboAchievement() {
        const comboDiv = document.createElement('div');
        comboDiv.className = 'combo-display';
        comboDiv.textContent = `🔥 COMBO x${this.gameData.combo.toFixed(1)}!`;
        document.body.appendChild(comboDiv);
        
        setTimeout(() => {
            if (comboDiv.parentNode) {
                comboDiv.parentNode.removeChild(comboDiv);
            }
        }, 1000);
    }

    calculatePerformance() {
        const accuracy = this.gameData.emailsAnalyzed > 0 ? 
            (this.gameData.correctAnalyses / this.gameData.emailsAnalyzed * 100) : 0;
        
        const timeElapsed = 120 - this.gameData.timer;
        const phaseReached = this.getDifficultyPhase().phase;
        
        return {
            score: this.gameData.score,
            accuracy: accuracy,
            timeElapsed: timeElapsed,
            phaseReached: phaseReached,
            maxCombo: this.gameData.maxCombo,
            emailsAnalyzed: this.gameData.emailsAnalyzed,
            correctAnalyses: this.gameData.correctAnalyses
        };
    }

    showDefeatMotivation(performance) {
        const motivationMessages = [];
        
        // Performance-based encouragement
        if (performance.accuracy >= 80) {
            motivationMessages.push("🎯 Độ chính xác tuyệt vời! Bạn gần như hoàn hảo!");
        }
        
        if (performance.maxCombo >= 3) {
            motivationMessages.push(`🔥 Combo x${performance.maxCombo.toFixed(1)} ấn tượng!`);
        }
        
        if (performance.phaseReached >= 3) {
            motivationMessages.push("💪 Bạn đã vượt qua giai đoạn khó!");
        }
        
        if (performance.timeElapsed >= 90) {
            motivationMessages.push("⏰ Sắp thành công rồi! Chỉ còn 30 giây nữa thôi!");
        }
        
        if (this.gameData.health <= 20 && performance.timeElapsed >= 60) {
            motivationMessages.push("⚡ Chiến đấu đến giây cuối! Tinh thần thép!");
        }
        
        // General encouragement
        const generalMessages = [
            "🚀 Thử lại ngay! Lần này sẽ khác!",
            "💡 Mẹo: Sử dụng QUÉT để phân tích trước khi quyết định!",
            "🛡️ Đừng quên dùng KHIÊN khi gặp khó khăn!",
            "⚡ Bạn đã học được kinh nghiệm quý báu!"
        ];
        
        if (motivationMessages.length === 0) {
            motivationMessages.push(...generalMessages.slice(0, 2));
        } else {
            motivationMessages.push(generalMessages[Math.floor(Math.random() * generalMessages.length)]);
        }
        
        // Show motivation messages
        motivationMessages.forEach((message, index) => {
            setTimeout(() => {
                this.showNotification(message, 'info');
            }, index * 1500);
        });
    }

    saveHighScore() {
        const currentScore = this.gameData.score;
        const highScore = localStorage.getItem('cyberGuardianHighScore') || 0;
        
        if (currentScore > highScore) {
            localStorage.setItem('cyberGuardianHighScore', currentScore);
            this.showNotification('🏆 ĐIỂM SỐ CAO MỚI!', 'success');
        }
    }

    getHighScore() {
        return localStorage.getItem('cyberGuardianHighScore') || 0;
    }

    updateGameOverStats(performance) {
        // Update all stats using the existing HTML structure
        document.getElementById('final-score').textContent = performance.score.toLocaleString();
        document.getElementById('high-score').textContent = this.getHighScore().toLocaleString();
        document.getElementById('accuracy').textContent = performance.accuracy.toFixed(1) + '%';
        document.getElementById('max-combo').textContent = 'x' + performance.maxCombo.toFixed(1);
        document.getElementById('emails-analyzed').textContent = performance.emailsAnalyzed;
        document.getElementById('correct-analyzed').textContent = performance.correctAnalyses;
        document.getElementById('play-time').textContent = performance.timeElapsed + 's';
        document.getElementById('phase-reached').textContent = performance.phaseReached + '/4';
    }
}

// Particle class for visual effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 100;
        this.vy = (Math.random() - 0.5) * 100;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.vx / 60;
        this.y += this.vy / 60;
        this.life -= this.decay;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Floating text animation
class FloatingText {
    constructor(x, y, text, color) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.life = 1.0;
        this.decay = 0.02;
        this.vy = -30;
    }

    update() {
        this.y += this.vy / 60;
        this.life -= this.decay;
        this.vy *= 0.95;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new CyberGuardianGame();
});