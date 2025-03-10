import openai
from typing import Optional

class GPTSummarizationService:

    def __init__(self, api_key: str, model_name: str = "gpt-3.5-turbo"):
        """
        Khởi tạo dịch vụ với API Key của OpenAI.
        
        Args:
            api_key (str): API Key từ OpenAI.
            model (str): Tên mô hình (mặc định là gpt-3.5-turbo, có thể dùng gpt-4).
        """
        try:
            openai.api_key = api_key
            self.model = model_name
        except Exception as e:
            raise Exception(f"Error initializing GPT service: {str(e)}")
        
    def summarize(self, text: str,max_length: int=100)->str:
        """
        Tóm tắt văn bản (email) bằng mô hình GPT.
        
        Args:
            text (str): Nội dung email cần tóm tắt.
            max_length (int): Độ dài tối đa mong muốn cho tóm tắt (tính bằng ký tự hoặc token, gợi ý cho GPT).
        
        Returns:
            str: Bản tóm tắt của email.
        
        Raises:
            Exception: Nếu có lỗi từ API OpenAI.
        """
        try:
            if not text or not text.strip():
                raise ValueError("Input text cannot be empty")
            
            # Tạo prompt cho GPT
            prompt=f"""
            Tóm tắt email sau đây, tập trung vào thông tin quan trọng, không quá {max_length} ký tự:
            
            {text}
            """

            # Gửi yêu cầu đến OpenAI API
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role":"user","content":prompt}
                ],
                max_tokens=50,  # Giới hạn số token của tóm tắt (tương đương độ dài)
                temperature=0.7  # Điều chỉnh độ sáng tạo (0.7 là giá trị vừa phải)
            )

            summary = response.choices[0].message.content.strip()

            return summary
        except openai.OpenAIError as e:
            raise Exception(f"OpenAI API error: {str(e)}")
        except Exception as e:
            raise Exception(f"Error summarizing text: {str(e)}")
        
if __name__ == "__main__":
    api_key = "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"
    gpt_service = GPTSummarizationService(api_key)

    # Ví dụ email
    email_content = """
    Subject: Meeting Schedule Update
    
    Hi Team,
    
    I hope you're all doing well. I'm writing to inform you about some updates to our upcoming meeting schedule. Originally, we planned to have the project review meeting on Wednesday at 10 AM. However, due to a conflict with another event, we’ve decided to reschedule it to Friday at 2 PM. Please let me know if this works for you. Additionally, we’ll be discussing the project timeline, resource allocation, and next steps, so come prepared with your updates.
    
    Thanks,
    John
    """
    
    # Tóm tắt email
    summary = gpt_service.summarize(email_content)
    print("Tóm tắt:", summary)