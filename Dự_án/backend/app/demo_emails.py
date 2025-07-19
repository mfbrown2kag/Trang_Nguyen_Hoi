# Demo emails để test ứng dụng Email Analyzer

# Email tích cực - chuyên nghiệp
POSITIVE_EMAIL = """
Chào anh/chị,

Cảm ơn anh/chị đã gửi báo cáo tuần này. Tôi rất ấn tượng với kết quả đạt được. 
Dự án đang tiến triển tốt và chúng ta đã vượt mục tiêu đề ra 15%.

Đặc biệt, tôi muốn khen ngợi đội ngũ đã làm việc rất chăm chỉ và sáng tạo. 
Kết quả này chứng tỏ sự nỗ lực và tinh thần làm việc nhóm tuyệt vời.

Hãy tiếp tục phát huy tinh thần làm việc xuất sắc này! Tôi tin tưởng chúng ta sẽ 
đạt được những thành công lớn hơn trong thời gian tới.

Trân trọng,
[Your Name]
"""

# Email tiêu cực - cần cải thiện
NEGATIVE_EMAIL = """
Chào bạn,

Báo cáo tuần này có vấn đề nghiêm trọng. Kết quả không tốt và chúng ta cần làm lại 
toàn bộ dự án. Dự án đang gặp khó khăn lớn và có thể thất bại hoàn toàn.

Tôi rất thất vọng với hiệu suất làm việc của đội ngũ. Có quá nhiều lỗi và 
thiếu sót trong báo cáo. Điều này không thể chấp nhận được.

Cần cải thiện ngay lập tức và đảm bảo không có lỗi nào xảy ra nữa. 
Nếu không, chúng ta sẽ phải đối mặt với hậu quả nghiêm trọng.

[Your Name]
"""

# Email trung tính - thông báo
NEUTRAL_EMAIL = """
Chào anh/chị,

Tôi gửi thông báo về cuộc họp tuần tới. Cuộc họp sẽ diễn ra vào thứ 3, 
lúc 9:00 sáng tại phòng họp A.

Nội dung cuộc họp bao gồm:
- Đánh giá tiến độ dự án
- Thảo luận về ngân sách
- Lập kế hoạch cho tuần tiếp theo

Vui lòng chuẩn bị báo cáo và tham gia đầy đủ. Nếu có vấn đề gì, 
xin liên hệ với tôi trước cuộc họp.

Trân trọng,
[Your Name]
"""

# Email ngắn - thông báo đơn giản
SHORT_EMAIL = """
Chào bạn,

Cuộc họp ngày mai bị hoãn đến thứ 5. Xin lỗi vì sự bất tiện này.

Trân trọng,
[Your Name]
"""

# Email dài - báo cáo chi tiết
LONG_EMAIL = """
Chào anh/chị,

Tôi gửi báo cáo chi tiết về dự án Marketing Digital mà chúng ta đang thực hiện. 
Dự án này đã được triển khai trong 3 tháng qua và đã đạt được những kết quả đáng khích lệ.

Về mặt số liệu, chúng ta đã tăng 25% lượng truy cập website, 40% tăng trưởng 
trên mạng xã hội, và 15% tăng doanh số bán hàng trực tuyến. Đây là những con số 
rất tích cực so với mục tiêu ban đầu.

Tuy nhiên, vẫn còn một số thách thức cần giải quyết. Chi phí quảng cáo đang tăng 
cao hơn dự kiến 10%, và tỷ lệ chuyển đổi từ khách hàng tiềm năng thành khách hàng 
thực tế vẫn chưa đạt mục tiêu đề ra.

Để cải thiện hiệu quả, tôi đề xuất một số giải pháp:
1. Tối ưu hóa chi phí quảng cáo bằng cách tập trung vào các kênh hiệu quả nhất
2. Cải thiện nội dung marketing để tăng tỷ lệ chuyển đổi
3. Tăng cường phân tích dữ liệu để đưa ra quyết định chính xác hơn

Tôi cũng muốn nhấn mạnh tầm quan trọng của việc phối hợp giữa các bộ phận. 
Marketing cần làm việc chặt chẽ với Sales và Customer Service để đảm bảo trải nghiệm 
khách hàng được nhất quán.

Về kế hoạch tương lai, chúng ta sẽ tiếp tục mở rộng sang các kênh mới như TikTok 
và LinkedIn, đồng thời đầu tư vào công nghệ Marketing Automation để tăng hiệu quả.

Tôi mong nhận được phản hồi và ý kiến đóng góp từ anh/chị về những đề xuất này. 
Chúng ta có thể thảo luận chi tiết hơn trong cuộc họp tuần tới.

Trân trọng,
[Your Name]
"""

# Dictionary chứa tất cả email demo
DEMO_EMAILS = {
    "Email tích cực": POSITIVE_EMAIL,
    "Email tiêu cực": NEGATIVE_EMAIL,
    "Email trung tính": NEUTRAL_EMAIL,
    "Email ngắn": SHORT_EMAIL,
    "Email dài": LONG_EMAIL
}

if __name__ == "__main__":
    print("Demo emails cho Email Analyzer")
    print("=" * 50)
    
    for name, email in DEMO_EMAILS.items():
        print(f"\n{name}:")
        print("-" * 30)
        print(email)
        print("\n" + "=" * 50) 