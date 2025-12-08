# Root Dockerfile to build and run the backend with Cloud Run

FROM python:3.11-slim

# Work inside /app
WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend .

# Cloud Run will inject PORT, but we default to 8080
ENV PORT=8080

# Start FastAPI app using uvicorn, server.py has "app"
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]

