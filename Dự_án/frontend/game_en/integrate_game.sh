#!/bin/bash
# 🎮 Script tích hợp Game Cyber Guardian
# Tự động tích hợp game vào hệ thống Email Guardian

echo "🎮 Cyber Guardian Game - Tích hợp tự động"
echo "=========================================="

# Kiểm tra thư mục hiện tại
if [ ! -f "index.html" ]; then
    echo "❌ Không tìm thấy index.html trong thư mục hiện tại"
    echo "💡 Hãy chạy script này từ thư mục game_en/"
    exit 1
fi

echo "✅ Đang ở thư mục game_en/"

# Tạo thư mục đích nếu chưa có
TARGET_DIR="../"
echo "📁 Tích hợp vào: $TARGET_DIR"

# Copy files
echo ""
echo "📋 Copying files..."

# Copy HTML
if [ -f "index.html" ]; then
    cp index.html "$TARGET_DIR/game.html"
    echo "✅ game.html copied"
fi

# Copy CSS
if [ -f "style.css" ]; then
    cp style.css "$TARGET_DIR/css/game.css"
    echo "✅ game.css copied"
fi

# Copy JS
if [ -f "game.js" ]; then
    cp game.js "$TARGET_DIR/js/game.js"
    echo "✅ game.js copied"
fi

# Copy images
if [ -d "images" ]; then
    cp -r images "$TARGET_DIR/"
    echo "✅ images/ copied"
fi

# Copy hướng dẫn
if [ -f "INTEGRATION_GUIDE.md" ]; then
    cp INTEGRATION_GUIDE.md "$TARGET_DIR/"
    echo "✅ INTEGRATION_GUIDE.md copied"
fi

echo ""
echo "🎯 Tích hợp HTML vào trang chính..."

# Tạo file HTML integration
cat > "$TARGET_DIR/game_integration.html" << 'EOF'
<!-- 🎮 Game Integration Template -->
<!-- Copy đoạn code này vào trang chính -->

<!-- Option 1: Direct Link -->
<a href="game.html" class="nav-link game-link">
    🎮 Cyber Guardian Game
</a>

<!-- Option 2: Iframe Embed -->
<div class="game-section">
    <h2>🎮 Cyber Guardian - Game Bảo Mật Email</h2>
    <div class="game-container">
        <iframe src="game.html" 
                width="100%" 
                height="600px" 
                frameborder="0"
                allowfullscreen>
        </iframe>
    </div>
</div>

<!-- Option 3: Modal Popup -->
<button onclick="openGameModal()" class="btn btn-primary game-btn">
    🎮 Chơi Game
</button>

<div id="gameModal" class="modal">
    <div class="modal-content">
        <span class="close" onclick="closeGameModal()">&times;</span>
        <iframe src="game.html" 
                width="100%" 
                height="600px" 
                frameborder="0">
        </iframe>
    </div>
</div>

<script>
// Game Modal Functions
function openGameModal() {
    document.getElementById('gameModal').style.display = 'block';
}

function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
</script>
EOF

echo "✅ game_integration.html created"

# Tạo CSS integration
cat > "$TARGET_DIR/css/game_integration.css" << 'EOF'
/* 🎮 Game Integration CSS */
/* Copy vào file CSS chính */

/* Game Link */
.game-link {
    display: inline-block;
    padding: 12px 24px;
    background: linear-gradient(45deg, #00ffff, #0066ff);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
}

.game-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
    color: white;
    text-decoration: none;
}

/* Game Section */
.game-section {
    margin: 40px 0;
    padding: 20px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    border: 2px solid #00ffff;
}

.game-section h2 {
    text-align: center;
    color: #00ffff;
    margin-bottom: 20px;
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
}

/* Game Container */
.game-container {
    width: 100%;
    height: 600px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Game Button */
.game-btn {
    background: linear-gradient(45deg, #00ffff, #0066ff);
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    font-weight: bold;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
    transition: all 0.3s ease;
}

.game-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 255, 255, 0.5);
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background-color: #1a1a2e;
    margin: 2% auto;
    padding: 20px;
    border: 2px solid #00ffff;
    border-radius: 15px;
    width: 90%;
    max-width: 1200px;
    height: 80%;
    box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
}

.close {
    position: absolute;
    right: 20px;
    top: 10px;
    color: #00ffff;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1001;
    transition: all 0.3s ease;
}

.close:hover {
    color: #ff3366;
    transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
    .game-container {
        height: 400px;
    }
    
    .game-section h2 {
        font-size: 1.5rem;
    }
    
    .modal-content {
        width: 95%;
        height: 90%;
        margin: 5% auto;
    }
}

@media (max-width: 480px) {
    .game-container {
        height: 300px;
    }
    
    .game-section h2 {
        font-size: 1.2rem;
    }
    
    .game-btn {
        padding: 12px 20px;
        font-size: 1rem;
    }
}
EOF

echo "✅ game_integration.css created"

# Tạo JavaScript integration
cat > "$TARGET_DIR/js/game_integration.js" << 'EOF'
// 🎮 Game Integration JavaScript
// Copy vào file JS chính

class GameIntegration {
    constructor() {
        this.gameInstance = null;
        this.init();
    }
    
    init() {
        console.log('🎮 Game Integration initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Game link click
        document.querySelectorAll('.game-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openGame();
            });
        });
        
        // Game button click
        document.querySelectorAll('.game-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openGameModal();
            });
        });
    }
    
    openGame() {
        // Open game in new window/tab
        window.open('game.html', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    }
    
    openGameModal() {
        // Open game in modal
        const modal = document.getElementById('gameModal');
        if (modal) {
            modal.style.display = 'block';
            // Focus iframe
            const iframe = modal.querySelector('iframe');
            if (iframe) {
                iframe.focus();
            }
        }
    }
    
    closeGameModal() {
        // Close game modal
        const modal = document.getElementById('gameModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    // API integration
    async analyzeEmailWithAPI(emailText) {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: emailText })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('🎮 API error:', error);
            return null;
        }
    }
    
    // Save game score
    async saveGameScore(score, stats) {
        try {
            const response = await fetch('/api/game-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    score, 
                    stats,
                    timestamp: new Date().toISOString(),
                    game: 'cyber-guardian'
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('🎮 Save score error:', error);
            return null;
        }
    }
    
    // Get high scores
    async getHighScores() {
        try {
            const response = await fetch('/api/game-scores');
            return await response.json();
        } catch (error) {
            console.error('🎮 Get scores error:', error);
            return [];
        }
    }
}

// Initialize game integration
document.addEventListener('DOMContentLoaded', () => {
    window.gameIntegration = new GameIntegration();
});

// Global functions for HTML
function openGameModal() {
    if (window.gameIntegration) {
        window.gameIntegration.openGameModal();
    }
}

function closeGameModal() {
    if (window.gameIntegration) {
        window.gameIntegration.closeGameModal();
    }
}

function openGame() {
    if (window.gameIntegration) {
        window.gameIntegration.openGame();
    }
}
EOF

echo "✅ game_integration.js created"

# Tạo README
cat > "$TARGET_DIR/GAME_README.md" << 'EOF'
# 🎮 Cyber Guardian Game - Tích hợp thành công!

## ✅ Files đã được tích hợp:
- `game.html` - Trang game chính
- `css/game.css` - CSS của game
- `js/game.js` - JavaScript của game
- `images/` - Thư mục hình ảnh
- `game_integration.html` - Template tích hợp
- `css/game_integration.css` - CSS tích hợp
- `js/game_integration.js` - JavaScript tích hợp

## 🚀 Cách sử dụng:

### 1. Thêm CSS vào trang chính:
```html
<link rel="stylesheet" href="css/game_integration.css">
```

### 2. Thêm JavaScript vào trang chính:
```html
<script src="js/game_integration.js"></script>
```

### 3. Copy code từ game_integration.html vào trang chính

### 4. Test game:
- Truy cập: `http://your-domain/game.html`
- Hoặc click button "🎮 Chơi Game"

## 🎯 Tính năng:
- ✅ Game hoạt động độc lập
- ✅ Modal popup
- ✅ Responsive design
- ✅ API integration ready
- ✅ Database integration ready

## 🔧 Tùy chỉnh:
- Thay đổi thời gian: Sửa `timer: 120` trong game.js
- Thay đổi màu: Sửa CSS variables trong game.css
- Thay đổi độ khó: Sửa `getDifficultyPhase()` trong game.js

**Game sẵn sàng sử dụng!** 🚀
EOF

echo "✅ GAME_README.md created"

echo ""
echo "🎉 Tích hợp hoàn thành!"
echo ""
echo "📋 Files đã tạo:"
echo "  ✅ game.html"
echo "  ✅ css/game.css"
echo "  ✅ js/game.js"
echo "  ✅ images/"
echo "  ✅ game_integration.html (template)"
echo "  ✅ css/game_integration.css"
echo "  ✅ js/game_integration.js"
echo "  ✅ GAME_README.md"
echo ""
echo "🚀 Bước tiếp theo:"
echo "  1. Copy code từ game_integration.html vào trang chính"
echo "  2. Thêm CSS và JS links"
echo "  3. Test game tại: http://localhost/game.html"
echo ""
echo "📚 Xem GAME_README.md để biết chi tiết!" 