#!/bin/bash

echo "=========================================="
echo "🧪 SCRAPING TEST SCRIPTI"
echo "=========================================="
echo ""

echo "📡 Backend'e kampanya sorgusu gönderiliyor..."
echo ""

curl -X POST http://localhost:8000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Turkcell Vodafone Türk Telekom kampanya fiyat karşılaştır"}' \
  -s | python3 -c "
import json, sys
data = json.load(sys.stdin)
print('✅ YANIT ALINDI!')
print('')
print('📊 YANIT:')
print('=' * 80)
print(data['response'][:1000])
if len(data['response']) > 1000:
    print('...(devamı var)')
print('=' * 80)
"

echo ""
echo "✅ Test tamamlandı!"

