import os
from google import genai
from google.genai.types import GenerateContentConfig
from dotenv import load_dotenv

# Load environment variables from config.env
load_dotenv('config.env')

# Lấy API key từ biến môi trường (hỗ trợ cả GOOGLE_API_KEY và GEMINI_API_KEY)
api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
if not api_key:
    print("⚠️ Warning: GOOGLE_API_KEY or GEMINI_API_KEY not found in environment variables")
    print("📝 Please set your Google API key in config.env file")
    # Tạo client với API key nếu có
    client = genai.Client(api_key=api_key) if api_key else None
else:
    print(f"✅ Using Google API key: {api_key[:10]}...")
    client = genai.Client(api_key=api_key)

system : str = """
Bạn là một chuyên gia an ninh mạng và xử lý email bằng trí tuệ nhân tạo.  
Dưới đây là một email văn bản đã được hệ thống AI phân loại là: "{label}" (ví dụ: lừa đảo, quảng cáo, thông báo, v.v.).  
Hãy phân tích **vì sao hệ thống đã phân loại email này như vậy** dựa trên nội dung của nó.

Bạn cần:
- Nhận diện các cụm từ, cấu trúc, dấu hiệu đặc trưng cho nhãn "{label}" trong email.
- Giải thích logic mà một mô hình học máy có thể dùng để đưa ra quyết định này (ví dụ: ngram, từ khóa, giọng văn, mục đích).
- Trình bày phân tích một cách ngắn gọn, logic, và dễ hiểu.

Chỉ phân tích dựa trên nội dung email, không phỏng đoán thêm ngoài văn bản.

Nếu không đủ dữ kiện, hãy nói rõ rằng nội dung chưa đủ để chắc chắn.

---
Ví dụ:
"""

class Answer_Question_From_Documents:
    def __init__(self, question: str, context : str) -> None:
        self.question : str = question
        self.context : str = context

    def run(self):
        if not client:
            return "❌ Lỗi: Không thể kết nối với Google AI API. Vui lòng kiểm tra API key."
        
        prompt : str = f"""      
        Câu hỏi:
        {self.question}
        Thông tin:
        {self.context}      
        Trả lời:"""
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents= prompt,
                config=GenerateContentConfig(
                    system_instruction=[
                        system
                    ]
                )
            )
            return response.text
        except Exception as e:
            return f"❌ Lỗi khi gọi Google AI API: {str(e)}"