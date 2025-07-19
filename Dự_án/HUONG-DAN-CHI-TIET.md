# 📚 HƯỚNG DẪN CHI TIẾT - EMAIL GUARDIAN

## 🗂️ CẤU TRÚC TOÀN BỘ DỰ ÁN

```
Dự_án/
├── frontend/               # Giao diện người dùng
│   ├── index.html         # File chính HTML
│   ├── css/               # Styling files
│   │   ├── style.css      # CSS chính
│   │   └── components.css # CSS components
│   └── js/                # JavaScript files
│       ├── config.js      # Cấu hình toàn bộ app
│       ├── utils.js       # Utility functions
│       ├── api.js         # API service
│       ├── app.js         # Main application
│       └── components/
│           └── dashboard.js # Dashboard component
├── backend/               # Server (sẽ tạo sau)
└── docs/                  # Tài liệu (folder này)
```

---

## 🎯 PHẦN 1: GIAO DIỆN CHÍNH (index.html)

### **📍 Navigation Bar:**
```html
<nav class="nav">
    <a href="#analyze" class="nav-link active">Phân Tích</a>
    <a href="#dashboard" class="nav-link">Bảng Điều Khiển</a>
    <a href="#history" class="nav-link">Lịch Sử</a>
    <a href="#docs" class="nav-link">Hướng Dẫn</a>
</nav>
```
**Chức năng:** Chuyển đổi giữa các phần của ứng dụng
**Chỉnh sửa:** Thay đổi text trong thẻ `<a>` để đổi tên tab

### **📧 Section Phân Tích Email:**
```html
<section id="analyze" class="section active">
    <textarea id="email-input" placeholder="Nhập nội dung email..."></textarea>
    <button id="analyze-btn" class="btn-primary">🔍 Phân Tích Email</button>
</section>
```
**Chức năng:** 
- Input để nhập email cần phân tích
- Button trigger phân tích
- Hiển thị kết quả phân tích

**Chỉnh sửa giá trị:**
- `placeholder`: Thay đổi text gợi ý
- Button text: Thay đổi label nút

### **📊 Section Dashboard:**
```html
<section id="dashboard" class="section">
    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card" data-trend="up">
            <div class="stat-value" id="total-analyzed">0</div>
            <div class="stat-label">Tổng Phân Tích</div>
        </div>
    </div>
</section>
```
**Chức năng:** Hiển thị thống kê real-time
**Chỉnh sửa:** Thay đổi `stat-label` để đổi tên metric

---

## ⚙️ PHẦN 2: CẤU HÌNH HỆ THỐNG (config.js)

### **🌐 API Configuration:**
```javascript
API: {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    ENDPOINTS: {
        ANALYZE: '/analyze',
        BATCH: '/batch',
        STATS: '/stats',
        HISTORY: '/history',
        HEALTH: '/health'
    }
}
```
**Cách chỉnh sửa:**
- `BASE_URL`: Thay đổi địa chỉ server backend
- `TIMEOUT`: Thời gian chờ API (milliseconds)
- `RETRY_ATTEMPTS`: Số lần thử lại khi API fail
- `ENDPOINTS`: Đường dẫn các API endpoints

### **📊 Demo Statistics:**
```javascript
DEMO: {
    STATISTICS: {
        totalAnalyzed: 15420,
        spamDetected: 3280,
        phishingBlocked: 892,
        avgConfidence: 0.89,
        processingTime: 245
    }
}
```
**Cách chỉnh sửa:**
- Thay đổi các số để demo với data khác
- Tất cả số sẽ hiện trên Dashboard

### **🎨 UI Settings:**
```javascript
UI: {
    ANIMATION_DURATION: 300,
    AUTO_SAVE: true,
    THEME: 'light',
    LANGUAGE: 'vi',
    NOTIFICATIONS: {
        POSITION: 'top-right',
        DURATION: 3000,
        MAX_VISIBLE: 3
    }
}
```
**Cách chỉnh sửa:**
- `ANIMATION_DURATION`: Tốc độ animation (ms)
- `THEME`: 'light' hoặc 'dark'
- `LANGUAGE`: 'vi' hoặc 'en'
- `NOTIFICATIONS.DURATION`: Thời gian hiện notification

---

## 🎨 PHẦN 3: STYLING (CSS Files)

### **🎯 Main Colors (style.css):**
```css
:root {
    --primary-color: #3b82f6;
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --gray-50: #f9fafb;
    --white: #ffffff;
}
```
**Cách đổi màu chủ đạo:**
1. `--primary-color`: Màu chính (xanh dương)
2. `--success-color`: Màu thành công (xanh lá)  
3. `--warning-color`: Màu cảnh báo (vàng)
4. `--danger-color`: Màu nguy hiểm (đỏ)

### **📐 Layout Settings:**
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
}
```
**Cách chỉnh sửa:**
- `max-width`: Độ rộng tối đa container
- `minmax(250px, 1fr)`: Kích thước tối thiểu card

---

## 🧮 PHẦN 4: LOGIC CHÍNH (app.js)

### **🚀 Khởi tạo App:**
```javascript
class EmailGuardianApp {
    constructor() {
        this.currentSection = 'analyze';
        this.apiStatus = 'disconnected';
        this.components = {};
        this.init();
    }
}
```
**Cách chỉnh sửa:**
- `currentSection`: Section mặc định khi load
- Thêm properties mới cho app

### **📧 Phân tích Email:**
```javascript
async performAnalysis(emailText) {
    const result = await window.APIService.analyzeEmail(emailText);
    return result.data;
}
```
**Hoạt động:**
1. Nhận text email từ user
2. Gọi API để phân tích
3. Trả về kết quả classification

**Chỉnh sửa Logic:**
- Thay đổi validation rules
- Thêm pre-processing steps
- Custom response format

### **🔔 Notification System:**
```javascript
showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
}
```
**Types available:** 'info', 'success', 'warning', 'error'
**Chỉnh sửa:** Thay đổi styling, position, duration

---

## 📊 PHẦN 5: DASHBOARD COMPONENT (dashboard.js)

### **📈 Stats Cards Configuration:**
```javascript
animateCountUp(elementId, targetValue, suffix = '') {
    // Animation from 0 to target value
    const duration = 2000; // 2 seconds
}
```
**Cách chỉnh sửa:**
- `duration`: Thời gian animation
- `targetValue`: Giá trị cuối cùng
- `suffix`: Đơn vị ('%', 'ms', etc.)

### **📊 Charts Setup:**
```javascript
initTrendChart() {
    this.charts.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'An toàn',
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }]
        }
    });
}
```
**Cách custom charts:**
- `type`: 'line', 'bar', 'pie', 'doughnut'
- `borderColor`: Màu viền
- `backgroundColor`: Màu nền
- `label`: Tên series

### **⏰ Auto-refresh Settings:**
```javascript
startAutoRefresh() {
    this.updateInterval = setInterval(() => {
        if (this.autoRefresh) {
            this.refreshDashboard();
        }
    }, 30000); // 30 seconds
}
```
**Chỉnh sửa:**
- `30000`: Thay đổi interval (milliseconds)
- Add/remove auto-refresh features

---

## 🌐 PHẦN 6: API SERVICE (api.js)

### **🔄 Request Configuration:**
```javascript
async request(endpoint, options = {}) {
    const requestOptions = {
        timeout: this.timeout,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };
}
```
**Chỉnh sửa:**
- Thêm authentication headers
- Custom timeout per request
- Add request interceptors

### **💾 Cache System:**
```javascript
setCache(key, data) {
    this.cache.set(key, {
        data,
        timestamp: Date.now()
    });
}
```
**Cách quản lý cache:**
- `this.cacheExpiry`: Thời gian expire (5 phút default)
- Clear cache: `APIService.clearCache()`
- Disable cache: Pass `{skipCache: true}`

### **🎭 Mock Data Generator:**
```javascript
getMockAnalysisResult(emailText) {
    const spamKeywords = ['win', 'lottery', 'urgent', 'click here'];
    const phishingKeywords = ['verify', 'account', 'suspended'];
}
```
**Cách chỉnh sửa mock logic:**
- Thêm keywords vào arrays
- Thay đổi confidence calculations  
- Custom response format

---

## 🛠️ PHẦN 7: UTILITY FUNCTIONS (utils.js)

### **📅 Date Formatting:**
```javascript
static formatDate(date, options = {}) {
    // Returns Vietnamese relative time
    // "2 phút trước", "3 giờ trước", etc.
}
```
**Sử dụng:** `Utils.formatDate(new Date())`

### **💾 Local Storage:**
```javascript
static setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
```
**Sử dụng:** 
- `Utils.setLocalStorage('data', {...})`
- `Utils.getLocalStorage('data', defaultValue)`

### **📱 Device Detection:**
```javascript
static isMobile() {
    return window.innerWidth <= 768;
}
```
**Sử dụng:** `if (Utils.isMobile()) { /* mobile logic */ }`

---

## 🎮 PHẦN 8: CÁCH CHỈNH SỬA CÁC TÍNH NĂNG

### **🔄 Thay đổi Auto-refresh Interval:**
1. Mở `js/components/dashboard.js`
2. Tìm dòng `}, 30000); // 30 seconds`
3. Thay `30000` thành giá trị mới (milliseconds)

### **📊 Thêm Stat Card mới:**
1. **HTML (index.html):**
```html
<div class="stat-card" data-trend="up">
    <div class="stat-icon">🆕</div>
    <div class="stat-content">
        <div class="stat-value" id="new-metric">0</div>
        <div class="stat-label">Metric Mới</div>
    </div>
</div>
```

2. **JavaScript (dashboard.js):**
```javascript
// Trong loadDashboardData()
this.animateCountUp('new-metric', 1234);
```

### **🎨 Thay đổi Theme Colors:**
1. Mở `css/style.css`
2. Chỉnh sửa `:root` variables:
```css
:root {
    --primary-color: #your-new-color;
    --success-color: #your-success-color;
}
```

### **📧 Custom Email Validation:**
1. Mở `js/utils.js`
2. Chỉnh sửa `isValidEmail()` function:
```javascript
static isValidEmail(email) {
    // Your custom validation logic
    return /your-regex/.test(email);
}
```

### **🔔 Custom Notifications:**
1. Mở `js/app.js`
2. Chỉnh sửa `showNotification()`:
```javascript
showNotification(message, type = 'info') {
    // Your custom notification logic
}
```

---

## 🐛 PHẦN 9: TROUBLESHOOTING

### **❌ Charts không hiển thị:**
1. Check Chart.js loaded: `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
2. Check canvas elements có `id` đúng
3. Check console errors

### **🔄 Auto-refresh không hoạt động:**
1. Check `auto-refresh` checkbox state
2. Check `this.autoRefresh` variable
3. Check `setInterval` đã được clear chưa

### **💾 Data không lưu:**
1. Check localStorage permissions
2. Check JSON.stringify errors  
3. Try incognito mode

### **📱 Mobile không responsive:**
1. Check viewport meta tag
2. Check CSS media queries
3. Clear browser cache

---

## 📋 CHECKLIST HOÀN CHỈNH

### **✅ Frontend Setup:**
- [ ] index.html loads correctly
- [ ] CSS files linked properly
- [ ] JavaScript files loaded in order
- [ ] Chart.js CDN working

### **✅ Dashboard Testing:**
- [ ] Navigation works
- [ ] Stats cards animate
- [ ] Charts render properly
- [ ] Auto-refresh toggles
- [ ] Manual refresh works
- [ ] Export buttons respond

### **✅ Responsive Design:**
- [ ] Desktop layout correct
- [ ] Tablet adapts properly  
- [ ] Mobile stacks correctly
- [ ] Touch interactions work

### **✅ Error Handling:**
- [ ] API failures handled gracefully
- [ ] Mock data displays
- [ ] Notifications appear
- [ ] Console errors minimal

---

**🎯 File này chứa mọi thông tin chi tiết để hiểu và chỉnh sửa từng phần của ứng dụng!** 