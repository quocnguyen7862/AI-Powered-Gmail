FROM python:3.10-slim

WORKDIR /app

# Sao chép requirements và cài đặt Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Sao chép toàn bộ mã nguồn vào container
COPY ./app ./app
COPY logging.ini .

# Expose port cho FastAPI
EXPOSE 8000

# Lệnh chạy server (sửa lại nếu app/main.py có tên khác)
CMD ["uvicorn", "app.main:get_application", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# CMD ["gunicorn", "app.main:get_application", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]