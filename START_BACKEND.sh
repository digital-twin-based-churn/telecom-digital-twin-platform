#!/bin/bash
cd /Users/sultan/Desktop/proje/api
source venv/bin/activate
echo "=========================================="
echo "🚀 BACKEND BAŞLATILIYOR"
echo "=========================================="
echo "📍 Port: 8000"
echo "🔍 Scraping: AKTIF"
echo ""
echo "⏳ Lütfen backend başladıktan sonra diğer terminalde test scriptini çalıştır:"
echo "   bash /Users/sultan/Desktop/proje/test_scraping.sh"
echo ""
echo "=========================================="
echo ""

python main.py 8000

