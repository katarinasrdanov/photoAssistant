FROM python:3.11-slim

WORKDIR /app

# Kopiram backend in frontend mape
COPY backend/ ./backend
COPY frontend/ ./frontend

# Namestim runtime dependency-je
RUN pip install --no-cache-dir -r backend/requirements.txt

EXPOSE 5000

CMD ["sh", "-c", "python backend/app.py & node backend/serverGRPC.js"]