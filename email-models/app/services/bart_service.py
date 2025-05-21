from transformers import BartTokenizer, BartForConditionalGeneration
import torch

class BartSummarizationService:
    def __init__(self,model_name = "facebook/bart-large-cnn"):

        """
        Khởi tạo mô hình BART và tokenizer.
        
        Args:
            model_name (str): Tên mô hình BART pre-trained (mặc định là facebook/bart-large-cnn).
        """

        try:
            self.tokenizer = BartTokenizer.from_pretrained(model_name)
            self.model = BartForConditionalGeneration.from_pretrained(model_name)

            # Chuyển model lên GPU nếu có
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.model.to(self.device)
        except Exception as e:
            raise Exception(f"Error initializing BART model: {str(e)}")
        
    def summarize(self, text: str, max_length: int = 100, min_length: int = 30) -> str:
        """
        Tóm tắt văn bản (email) bằng mô hình BART.
        
        Args:
            text (str): Nội dung email cần tóm tắt.
            max_length (int): Độ dài tối đa của tóm tắt (tính bằng token).
            min_length (int): Độ dài tối thiểu của tóm tắt (tính bằng token).
        
        Returns:
            str: Bản tóm tắt của email.
        
        Raises:
            Exception: Nếu có lỗi trong quá trình tóm tắt.
        """

        try:
            # Đảm bảo text không rỗng
            if not text or not text.strip():
                raise ValueError("Input text cannot be empty")
            
            # Tokenize vaf chuẩn bị input
            inputs = self.tokenizer(
                text,
                max_length=1024,
                return_tensors="pt",
                truncation=True,
                padding=True
            ).to(self.device)

            #Tạo tóm tắt
            summary_ids = self.model.generate(
                inputs["input_ids"],
                max_length=max_length,
                min_length=min_length,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )

            #Decode tóm tắt
            summary=self.tokenizer.decode(summary_ids[0],skip_special_tokens=True)
            return summary
        
        except Exception as e:
            raise Exception(f"Error summarizing text: {str(e)}")
        
if __name__ == "__main__":
    # Test code 
    service = BartSummarizationService()
    text = """Dear candidates,

    Thank you for taking the time to apply at Glory Vietnam software.

    Although we are very impressed with your skills and experiences, unfortunately they do not fully match our current requirements.

    We will store your job application in the database and will contact you if you have an appropriate recruitment location in the near future.

    Thank you very much for spending time and wishing you all the best in your career.

    For more jobs, please check our website through the link: https://www.glory-global.com/en-GB/

    Best regards"""
    summary = service.summarize(text)
    print(summary)