FROM python:3.11-slim

WORKDIR /app

# Kopiram backend in frontend mape
COPY backend/ ./backend
COPY frontend/ ./frontend

# Namestim runtime dependency-je
RUN pip install --no-cache-dir \
    flask \
    flask-cors \
    requests

EXPOSE 5000

CMD ["python", "backend/app.py"]