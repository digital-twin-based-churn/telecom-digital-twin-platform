FROM openjdk:11-jre-slim as base

# Python and system deps for PySpark
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    gcc \
    g++ \
    ca-certificates \
    bash \
    procps \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Install Python deps first
COPY GYK-capstone-project/data/requirements.txt /app/requirements.txt
RUN python3 -m pip install --upgrade pip && \
    pip install -r /app/requirements.txt && \
    pip install pyspark==3.5.1

# Copy service code and artifacts
COPY GYK-capstone-project/svc /app/svc
COPY GYK-capstone-project/data /app/data
COPY GYK-capstone-project/artifacts /app/artifacts

WORKDIR /app/svc

ENV SPARK_LOCAL_IP=127.0.0.1 \
    SPARK_DRIVER_MEM=2g \
    SPARK_EXECUTOR_MEM=2g

EXPOSE 8000

CMD ["python3", "app_multi_model.py"]