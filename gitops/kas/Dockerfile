FROM python:3.11-slim
WORKDIR /app
COPY stub/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY stub/app.py ./
EXPOSE 8081
CMD ["python","app.py"]
