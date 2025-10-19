FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first (better caching)
COPY api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app
COPY api /app

# Environment
ENV PORT=8001 \
    HOST=0.0.0.0 \
    PYTHONUNBUFFERED=1

EXPOSE 8001

CMD ["python", "main.py", "--port", "8001"]


