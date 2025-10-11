#!/bin/bash

echo "=========================================="
echo "🚀 TÜM SERVİSLERİ BAŞLATILIYOR"
echo "=========================================="
echo ""

# PostgreSQL & pgAdmin kontrolü
echo "📦 1. PostgreSQL & pgAdmin kontrolü..."
if docker ps | grep -q postgres; then
    echo "✅ PostgreSQL zaten çalışıyor"
else
    echo "⏳ PostgreSQL başlatılıyor..."
    cd /Users/sultan/Desktop/proje
    docker-compose up -d
    echo "✅ PostgreSQL başlatıldı"
fi
echo ""

# Backend başlatma
echo "🔧 2. Backend (FastAPI) başlatılıyor..."
echo "   Port: 8000"
echo "   URL: http://localhost:8000"
lsof -ti:8000 | xargs kill -9 2>/dev/null
cd /Users/sultan/Desktop/proje/api
source venv/bin/activate
nohup python main.py 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
echo "✅ Backend başlatıldı"
echo ""

# Frontend başlatma
echo "🎨 3. Frontend (React + Vite) başlatılıyor..."
echo "   Port: 8080"
echo "   URL: http://localhost:8080"
lsof -ti:8080 | xargs kill -9 2>/dev/null
cd /Users/sultan/Desktop/proje/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
echo "✅ Frontend başlatıldı"
echo ""

sleep 5

echo "=========================================="
echo "✅ TÜM SERVİSLER BAŞLATILDI!"
echo "=========================================="
echo ""
echo "📍 KULLANIM PORTLARI:"
echo "   🗄️  PostgreSQL: localhost:5432"
echo "   🖥️  pgAdmin: http://localhost:5050"
echo "   ⚙️  Backend API: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   🎨 Frontend: http://localhost:8080"
echo ""
echo "⚠️  ÖNEMLİ:"
echo "   - Browser'da http://localhost:8080 adresine git"
echo "   - Backend otomatik olarak 8000 portunda çalışıyor"
echo "   - Frontend backend'e otomatik bağlanıyor"
echo ""
echo "📋 LOG DOSYALARI:"
echo "   Backend: tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 DURDURMA:"
echo "   bash STOP_ALL.sh"
echo ""

