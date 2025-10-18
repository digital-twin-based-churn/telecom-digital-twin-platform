from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from database import get_db, engine
from models import Base
from routers import auth, chatbot, analytics, digital_twin

try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Warning: Could not create database tables: {e}")
    print("Continuing without database...")

app = FastAPI(
    title="Dijital İkiz Tabanlı Churn Önleme Projesi API",
    description="FastAPI ile geliştirilmiş  Dijital İkiz Tabanlı Churn Önleme Projesi API'si",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    servers=[
        {"url": "http://localhost:8001", "description": "Backend API (port 8001) - ACTIVE"},
        {"url": "http://127.0.0.1:8001", "description": "Backend API (127.0.0.1:8001)"},
        {"url": "http://localhost:8000", "description": "GYK ML Service (port 8000)"},
        {"url": "http://127.0.0.1:8000", "description": "GYK ML Service (127.0.0.1:8000)"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:3005",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002", 
        "http://127.0.0.1:3003",
        "http://127.0.0.1:3004",
        "http://127.0.0.1:3005",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        
        "http://192.168.1.7:3000",
        "http://192.168.1.7:3001", 
        "http://192.168.1.7:3002",
        "http://192.168.1.7:3003",
        "http://192.168.1.7:3004",
        "http://192.168.1.7:3005",
        "http://192.168.1.7:5173",
        "http://192.168.1.7:8080",
        "http://192.168.1.7:8081",
        
        "https://localhost:3000",
        "https://localhost:3001",
        "https://localhost:3002",
        "https://127.0.0.1:3000",
        "https://127.0.0.1:3001",
        "https://127.0.0.1:3002",
        
        "*"
    ],
    allow_credentials=False,  # Must be False when using "*" in allow_origins
    allow_methods=[
        "GET", "POST", "PUT", "DELETE", "OPTIONS", 
        "HEAD", "PATCH", "TRACE", "CONNECT"
    ],
    allow_headers=[
        "Accept",
        "Accept-Language", 
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRFToken",
        "X-Request-ID",
        "Origin",
        "Referer",
        "User-Agent",
        "Cache-Control",
        "Pragma",
        "Expires",
        "Last-Modified",
        "ETag",
        "If-Modified-Since",
        "If-None-Match",
        "If-Range",
        "Range",
        "Content-Range",
        "Content-Length",
        "Content-Encoding",
        "Transfer-Encoding",
        "Connection",
        "Upgrade",
        "Sec-WebSocket-Key",
        "Sec-WebSocket-Version",
        "Sec-WebSocket-Protocol",
        "Sec-WebSocket-Extensions",
        "*"
    ],
    expose_headers=[
        "Content-Length",
        "Content-Type", 
        "Content-Encoding",
        "Content-Range",
        "Accept-Ranges",
        "ETag",
        "Last-Modified",
        "Cache-Control",
        "Expires",
        "X-Request-ID",
        "X-Response-Time",
        "X-Total-Count",
        "X-Page-Count",
        "X-Current-Page",
        "X-Per-Page",
        "X-Rate-Limit-Limit",
        "X-Rate-Limit-Remaining",
        "X-Rate-Limit-Reset",
        "*"
    ],
    max_age=3600,
)

# Handle OPTIONS requests for CORS preflight
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle all OPTIONS requests for CORS preflight"""
    return {}

@app.get("/")
async def root():
    return {"message": "Dijital İkiz Tabanlı Churn Önleme  Proje API'sine hoş geldiniz!"}

# OPTIONS requests are automatically handled by CORSMiddleware

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API çalışıyor"}

@app.get("/db-test")
async def test_database_connection(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1 as test"))
        return {"status": "success", "message": "Veritabanı bağlantısı başarılı", "test_result": result.fetchone()[0]}
    except Exception as e:
        return {"status": "error", "message": f"Veritabanı bağlantı hatası: {str(e)}"}

app.include_router(auth.router)
app.include_router(chatbot.router)
app.include_router(analytics.router)
app.include_router(digital_twin.router)

# Favicon endpoint
@app.get("/favicon.ico")
async def favicon():
    return FileResponse("favicon.ico", media_type="image/x-icon")


if __name__ == "__main__":
    import sys
    
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Geçersiz port numarası: {sys.argv[1]}. Varsayılan port 8000 kullanılıyor.")
    
    print(f"Backend başlatılıyor: http://0.0.0.0:{port}")
    print(f"API dokümantasyonu: http://localhost:{port}/docs")
    uvicorn.run(app, host="0.0.0.0", port=port)
