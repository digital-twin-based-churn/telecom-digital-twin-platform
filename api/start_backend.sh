#!/bin/bash

# Dijital İkiz Backend Başlatma Scripti
# Port: 8000 (Frontend: 8081)

echo "=================================="
echo "Backend Başlatılıyor..."
echo "=================================="

# API dizinine git
cd "$(dirname "$0")"

# Virtual environment'ı aktifleştir
if [ -d "venv" ]; then
    echo "✓ Virtual environment aktifleştiriliyor..."
    source venv/bin/activate
else
    echo "✗ HATA: venv bulunamadı!"
    echo "  Lütfen önce: python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# .env dosyasını kontrol et
if [ ! -f ".env" ]; then
    echo "✗ UYARI: .env dosyası bulunamadı!"
    echo "  .env.example dosyasını .env olarak kopyalayın ve düzenleyin."
fi

# Port kontrolü
PORT=${PORT:-8000}

echo ""
echo "✓ Backend ayarları:"
echo "  - Port: $PORT"
echo "  - API Docs: http://localhost:$PORT/swagger"
echo "  - Health Check: http://localhost:$PORT/health"
echo ""
echo "=================================="
echo "Backend çalıştırılıyor..."
echo "=================================="
echo ""

# Backend'i başlat
python main.py --port $PORT

