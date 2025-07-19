# 📧 Email Analyzer

Ứng dụng phân tích email được xây dựng bằng Streamlit, giúp phân tích và đánh giá nội dung email một cách chi tiết.

## ✨ Tính năng

- **Phân tích cảm xúc (Sentiment Analysis)**: Đánh giá tone và cảm xúc của email
- **Thống kê văn bản**: Đếm từ, câu, ký tự và phân tích độ dài
- **Tần suất từ vựng**: Tìm từ phổ biến nhất trong email
- **Từ khóa cảm xúc**: Phát hiện từ tích cực và tiêu cực
- **Word Cloud**: Tạo biểu đồ từ khóa trực quan
- **Gợi ý cải thiện**: Đưa ra các đề xuất để viết email tốt hơn

## 🚀 Cài đặt

### Yêu cầu hệ thống
- Python 3.7+
- pip

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd email-analyzer
```

### Bước 2: Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### Bước 3: Chạy ứng dụng
```bash
streamlit run email_analyzer.py
```

Ứng dụng sẽ mở tại: http://localhost:8501

## 📖 Hướng dẫn sử dụng

### 1. Nhập nội dung email
- Copy và paste nội dung email vào ô văn bản
- Hoặc nhập trực tiếp nội dung cần phân tích

### 2. Chọn loại phân tích
Trong sidebar, chọn các loại phân tích mong muốn:
- **Sentiment Analysis**: Phân tích cảm xúc
- **Word Frequency**: Tần suất từ vựng
- **Text Statistics**: Thống kê văn bản
- **Emotion Keywords**: Từ khóa cảm xúc
- **Word Cloud**: Biểu đồ từ khóa

### 3. Phân tích
- Nhấn nút "🔍 Phân tích" để bắt đầu
- Xem kết quả chi tiết và biểu đồ trực quan

### 4. Đọc gợi ý
- Xem các gợi ý cải thiện email
- Áp dụng các đề xuất để viết email tốt hơn

## 📊 Các chỉ số phân tích

### Sentiment Score
- **Tích cực** (> 0.1): Email có tone tích cực
- **Trung tính** (-0.1 đến 0.1): Email có tone trung tính
- **Tiêu cực** (< -0.1): Email có tone tiêu cực

### Subjectivity Score
- **Khách quan** (< 0.3): Email chứa nhiều thông tin thực tế
- **Cân bằng** (0.3-0.7): Email có cả thông tin khách quan và chủ quan
- **Chủ quan** (> 0.7): Email chứa nhiều ý kiến cá nhân

### Text Statistics
- **Số từ**: Tổng số từ trong email
- **Từ duy nhất**: Số từ không lặp lại
- **Số câu**: Tổng số câu
- **Độ dài câu trung bình**: Số từ trung bình mỗi câu
- **Số ký tự**: Tổng số ký tự (có/không khoảng trắng)

## 💡 Mẹo viết email hiệu quả

### 1. Độ dài phù hợp
- **Email ngắn**: 50-125 từ cho thông báo đơn giản
- **Email trung bình**: 125-250 từ cho thông tin chi tiết
- **Email dài**: 250+ từ cho báo cáo hoặc đề xuất phức tạp

### 2. Cấu trúc rõ ràng
- **Mở đầu**: Lời chào và mục đích
- **Nội dung chính**: Thông tin quan trọng
- **Kết thúc**: Call-to-action và lời chào

### 3. Ngôn ngữ chuyên nghiệp
- Sử dụng ngôn ngữ lịch sự
- Tránh từ ngữ tiêu cực
- Rõ ràng và dễ hiểu

### 4. Call-to-action
- Nêu rõ hành động mong muốn
- Cung cấp thông tin liên hệ
- Đặt deadline nếu cần

## 🛠️ Công nghệ sử dụng

- **Streamlit**: Framework web app
- **TextBlob**: Phân tích sentiment
- **NLTK**: Xử lý ngôn ngữ tự nhiên
- **Plotly**: Biểu đồ tương tác
- **WordCloud**: Tạo biểu đồ từ khóa
- **Pandas & NumPy**: Xử lý dữ liệu

## 📝 Ví dụ sử dụng

### Email tích cực
```
Chào bạn,

Cảm ơn bạn đã gửi báo cáo tuần này. Tôi rất ấn tượng với kết quả đạt được. 
Dự án đang tiến triển tốt và chúng ta đã vượt mục tiêu đề ra.

Hãy tiếp tục phát huy tinh thần làm việc tuyệt vời này!

Trân trọng,
[Your Name]
```

### Email cần cải thiện
```
Chào bạn,

Báo cáo tuần này có vấn đề. Kết quả không tốt và chúng ta cần làm lại.
Dự án đang gặp khó khăn và có thể thất bại.

Cần cải thiện ngay lập tức.

[Your Name]
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 📞 Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub. 