#!/bin/bash

echo "=========================================="
echo "🛑 TÜM SERVİSLER DURDURULUYOR"
echo "=========================================="
echo ""

# Backend durdur
echo "⏹️  Backend durduruluyor..."
lsof -ti:8000 | xargs kill -9 2>/dev/null && echo "✅ Backend durduruldu" || echo "⚠️  Backend zaten durmuş"

# Frontend durdur
echo "⏹️  Frontend durduruluyor..."
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "✅ Frontend durduruldu" || echo "⚠️  Frontend zaten durmuş"

# Docker servislerini durdur (isteğe bağlı)
echo ""
echo "❓ PostgreSQL & pgAdmin durdurmak ister misin? (y/n)"
read -t 5 -n 1 answer || answer="n"
echo ""

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "⏹️  Docker servisleri durduruluyor..."
    cd /Users/sultan/Desktop/proje
    docker-compose down
    echo "✅ Docker servisleri durduruldu"
else
    echo "⏭️  Docker servisleri çalışmaya devam ediyor"
fi

echo ""
echo "=========================================="
echo "✅ SERVİSLER DURDURULDU!"
echo "=========================================="
echo ""

