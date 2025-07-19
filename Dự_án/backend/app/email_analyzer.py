import streamlit as st
import re
from collections import Counter
import nltk
import matplotlib.pyplot as plt
import seaborn as sns
import io
import base64

import pickle
from gen import Answer_Question_From_Documents

# ==== 1. Tải mô hình từ file ====
with open("model/model_check_email.pkl", "rb") as f:
    model = pickle.load(f)

print("✅ Đã tải mô hình từ file 'model.pkl'")

class Input:
    def __init__(self, user : str) -> None:
        self.user : str = user
    def run(self) -> str:
        predictions = model.predict(self.user)
        ans = Answer_Question_From_Documents(self.user,predictions)
        return ans     

# Cấu hình trang
st.set_page_config(
    page_title="Email Analyzer",
    page_icon="📧",
    layout="wide",
    initial_sidebar_state="expanded"
)

# CSS tùy chỉnh
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin: 0.5rem 0;
    }
    .analysis-section {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
        border-left: 4px solid #1f77b4;
    }
    .positive { color: #28a745; }
    .negative { color: #dc3545; }
    .neutral { color: #6c757d; }
</style>
""", unsafe_allow_html=True)

def analyze_email_content(email_text):
    """Phân tích nội dung email"""


def create_wordcloud(text):
    """Tạo wordcloud từ văn bản"""
    wordcloud = WordCloud(
        width=800, 
        height=400, 
        background_color='white',
        colormap='viridis',
        max_words=100
    ).generate(text)
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.imshow(wordcloud, interpolation='bilinear')
    ax.axis('off')
    
    # Chuyển đổi thành base64 để hiển thị trong Streamlit
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=300)
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode()
    plt.close()
    
    return img_str

def main():
    # Header
    st.markdown('<h1 class="main-header">📧 Email Analyzer</h1>', unsafe_allow_html=True)
    st.markdown("### Phân tích và đánh giá nội dung email")
    
    # Sidebar
    with st.sidebar:
        st.header("⚙️ Cài đặt")
        st.markdown("---")
        
        # Tùy chọn phân tích
        analysis_options = st.multiselect(
            "Chọn loại phân tích:",
            ["Sentiment Analysis", "Word Frequency", "Text Statistics", "Emotion Keywords", "Word Cloud"],
            default=["Sentiment Analysis", "Text Statistics", "Word Cloud"]
        )
        
        st.markdown("---")
        st.markdown("### 📊 Thông tin")
        st.markdown("""
        **Email Analyzer** giúp bạn:
        - Phân tích cảm xúc của email
        - Thống kê từ vựng và câu
        - Tìm từ khóa quan trọng
        - Đưa ra gợi ý cải thiện
        """)
    
    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📝 Nhập nội dung email")
        email_content = st.text_area(
            "Nhập nội dung email cần phân tích:",
            height=300,
            placeholder="Nhập nội dung email của bạn vào đây..."
        )
        
        if st.button("🔍 Phân tích", type="primary", use_container_width=True):
            if email_content.strip():
                with st.spinner("Đang phân tích..."):
                    analysis_result = analyze_email_content(email_content)
                    
                    if analysis_result:
                        st.success("✅ Phân tích hoàn tất!")
                        
                        # Hiển thị kết quả
                        display_results(analysis_result, email_content, analysis_options)
            else:
                st.error("❌ Vui lòng nhập nội dung email để phân tích!")
    
    with col2:
        st.subheader("📋 Hướng dẫn")
        st.markdown("""
        1. **Nhập email**: Copy và paste nội dung email vào ô văn bản
        2. **Chọn phân tích**: Tùy chọn loại phân tích trong sidebar
        3. **Nhấn phân tích**: Xem kết quả chi tiết
        4. **Đọc gợi ý**: Cải thiện email dựa trên phân tích
        """)
        
        st.markdown("---")
        st.markdown("### 💡 Mẹo viết email")
        st.markdown("""
        - **Ngắn gọn**: 50-125 từ
        - **Rõ ràng**: Một ý chính mỗi đoạn
        - **Lịch sự**: Sử dụng ngôn ngữ chuyên nghiệp
        - **Call-to-action**: Nêu rõ hành động mong muốn
        """)

def display_results(analysis, email_content, analysis_options):
    """Hiển thị kết quả phân tích"""
    
    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown(f"""
        <div class="metric-card">
            <h3>📊 Từ</h3>
            <h2>{analysis['word_count']}</h2>
            <p>tổng cộng</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown(f"""
        <div class="metric-card">
            <h3>📝 Câu</h3>
            <h2>{analysis['sentence_count']}</h2>
            <p>tổng cộng</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown(f"""
        <div class="metric-card">
            <h3>📏 Ký tự</h3>
            <h2>{analysis['char_count']}</h2>
            <p>tổng cộng</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown(f"""
        <div class="metric-card">
            <h3>🎯 Sentiment</h3>
            <h2 class="{analysis['sentiment_color']}">{analysis['sentiment']}</h2>
            <p>Score: {analysis['sentiment_score']:.2f}</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Detailed analysis
    if "Sentiment Analysis" in analysis_options:
        st.markdown("---")
        st.subheader("😊 Phân tích cảm xúc")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Sentiment gauge
            fig = go.Figure(go.Indicator(
                mode = "gauge+number+delta",
                value = analysis['sentiment_score'],
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Sentiment Score"},
                delta = {'reference': 0},
                gauge = {
                    'axis': {'range': [-1, 1]},
                    'bar': {'color': "darkblue"},
                    'steps': [
                        {'range': [-1, -0.3], 'color': "lightgray"},
                        {'range': [-0.3, 0.3], 'color': "yellow"},
                        {'range': [0.3, 1], 'color': "lightgreen"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 0
                    }
                }
            ))
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Subjectivity chart
            fig = px.bar(
                x=['Subjectivity'],
                y=[analysis['subjectivity_score']],
                title="Độ chủ quan",
                color=[analysis['subjectivity_score']],
                color_continuous_scale='viridis'
            )
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
    
    if "Text Statistics" in analysis_options:
        st.markdown("---")
        st.subheader("📈 Thống kê văn bản")
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Word statistics
            stats_data = {
                'Metric': ['Từ tổng cộng', 'Từ duy nhất', 'Từ trung bình/câu', 'Ký tự (có khoảng trắng)', 'Ký tự (không khoảng trắng)'],
                'Value': [
                    analysis['word_count'],
                    analysis['unique_words'],
                    f"{analysis['avg_sentence_length']:.1f}",
                    analysis['char_count'],
                    analysis['char_count_no_spaces']
                ]
            }
            df_stats = pd.DataFrame(stats_data)
            st.dataframe(df_stats, use_container_width=True)
        
        with col2:
            # Sentence length distribution
            if analysis['sentence_lengths']:
                fig = px.histogram(
                    x=analysis['sentence_lengths'],
                    title="Phân bố độ dài câu",
                    labels={'x': 'Số từ', 'y': 'Số câu'}
                )
                fig.update_layout(height=300)
                st.plotly_chart(fig, use_container_width=True)
    
    if "Word Frequency" in analysis_options:
        st.markdown("---")
        st.subheader("🔤 Tần suất từ vựng")
        
        if analysis['word_freq']:
            words, freqs = zip(*analysis['word_freq'])
            fig = px.bar(
                x=list(words),
                y=list(freqs),
                title="Top 10 từ phổ biến nhất",
                labels={'x': 'Từ', 'y': 'Tần suất'}
            )
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
    
    if "Emotion Keywords" in analysis_options:
        st.markdown("---")
        st.subheader("😊 Từ khóa cảm xúc")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if analysis['found_positive']:
                st.markdown("**✅ Từ tích cực:**")
                for word in set(analysis['found_positive']):
                    st.markdown(f"- {word}")
            else:
                st.info("Không tìm thấy từ tích cực")
        
        with col2:
            if analysis['found_negative']:
                st.markdown("**❌ Từ tiêu cực:**")
                for word in set(analysis['found_negative']):
                    st.markdown(f"- {word}")
            else:
                st.info("Không tìm thấy từ tiêu cực")
    
    if "Word Cloud" in analysis_options:
        st.markdown("---")
        st.subheader("☁️ Word Cloud")
        
        # Tạo wordcloud
        img_str = create_wordcloud(email_content)
        st.markdown(f'<img src="data:image/png;base64,{img_str}" width="100%">', unsafe_allow_html=True)
    
    # Recommendations
    st.markdown("---")
    st.subheader("💡 Gợi ý cải thiện")
    
    recommendations = []
    
    if analysis['sentiment_score'] < -0.2:
        recommendations.append("🎯 **Cải thiện tone**: Email có vẻ tiêu cực, hãy sử dụng ngôn ngữ tích cực hơn")
    
    if analysis['avg_sentence_length'] > 20:
        recommendations.append("📝 **Rút ngắn câu**: Câu quá dài, hãy chia thành nhiều câu ngắn hơn")
    
    if analysis['word_count'] < 20:
        recommendations.append("📊 **Bổ sung nội dung**: Email quá ngắn, hãy thêm chi tiết cần thiết")
    
    if analysis['word_count'] > 200:
        recommendations.append("✂️ **Tóm tắt**: Email quá dài, hãy tóm tắt những điểm chính")
    
    if analysis['subjectivity_score'] > 0.8:
        recommendations.append("⚖️ **Cân bằng**: Email quá chủ quan, hãy thêm thông tin khách quan")
    
    if not recommendations:
        recommendations.append("✅ **Tuyệt vời**: Email của bạn đã được viết tốt!")
    
    for rec in recommendations:
        st.markdown(f"- {rec}")

if __name__ == "__main__":
    main() 