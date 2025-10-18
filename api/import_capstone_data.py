# import_capstone_data.py - Capstone verilerini veritabanına aktarır
# ----------------------------------------------------------------

import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Customer
from schemas import CustomerCreate
from crud import create_customer
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def import_capstone_data(max_customers: int = 1000):
    """Capstone verilerini veritabanına aktarır"""
    
    # Capstone dosyalarını bul
    capstone_dir = Path("/Users/sultan/Desktop/proje/GYK-capstone-project/data")
    capstone_files = list(capstone_dir.glob("capstone.*.jsonl"))
    
    if not capstone_files:
        logger.error("Capstone dosyaları bulunamadı!")
        return 0
    
    logger.info(f"Bulunan capstone dosyaları: {len(capstone_files)}")
    
    # Veritabanı bağlantısı
    db = SessionLocal()
    created_count = 0
    error_count = 0
    
    try:
        for file_path in sorted(capstone_files):
            logger.info(f"İşleniyor: {file_path.name}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    if created_count >= max_customers:
                        logger.info(f"Maximum {max_customers} müşteri limitine ulaşıldı")
                        break
                    
                    try:
                        # JSON satırını parse et
                        data = json.loads(line.strip())
                        
                        # Müşteri zaten var mı kontrol et
                        existing_customer = db.query(Customer).filter(
                            Customer.customer_id == data["id"]
                        ).first()
                        
                        if existing_customer:
                            continue
                        
                        # Veriyi temizle ve dönüştür
                        customer_data = {
                            "customer_id": data["id"],
                            "age": data.get("age"),
                            "tenure": data.get("tenure"),
                            "service_type": data.get("service_type"),
                            "avg_call_duration": data.get("avg_call_duration"),
                            "data_usage": data.get("data_usage"),
                            "roaming_usage": data.get("roaming_usage"),
                            "monthly_charge": data.get("monthly_charge"),
                            "overdue_payments": data.get("overdue_payments"),
                            "auto_payment": data.get("auto_payment"),
                            "avg_top_up_count": data.get("avg_top_up_count"),
                            "call_drops": data.get("call_drops"),
                            "customer_support_calls": data.get("customer_support_calls"),
                            "satisfaction_score": data.get("satisfaction_score"),
                            "apps": data.get("apps", []),
                            "churn": data.get("churn")
                        }
                        
                        # Pydantic model oluştur ve veritabanına ekle
                        customer_create = CustomerCreate(**customer_data)
                        create_customer(db, customer_create)
                        created_count += 1
                        
                        if created_count % 100 == 0:
                            logger.info(f"İşlenen müşteri sayısı: {created_count}")
                            
                    except Exception as e:
                        error_count += 1
                        if error_count <= 10:  # İlk 10 hatayı logla
                            logger.error(f"Hata - Satır {line_num}: {str(e)}")
                        continue
                
                if created_count >= max_customers:
                    break
        
        logger.info(f"İmport tamamlandı!")
        logger.info(f"Oluşturulan müşteri sayısı: {created_count}")
        logger.info(f"Hata sayısı: {error_count}")
        
        return created_count
        
    except Exception as e:
        logger.error(f"Genel hata: {str(e)}")
        return 0
    finally:
        db.close()

def get_capstone_stats():
    """Capstone dosyalarının istatistiklerini getirir"""
    capstone_dir = Path("/Users/sultan/Desktop/proje/GYK-capstone-project/data")
    capstone_files = list(capstone_dir.glob("capstone.*.jsonl"))
    
    total_lines = 0
    for file_path in sorted(capstone_files):
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f)
            total_lines += lines
            print(f"{file_path.name}: {lines:,} satır")
    
    print(f"Toplam satır sayısı: {total_lines:,}")
    return total_lines

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        try:
            max_customers = int(sys.argv[1])
        except ValueError:
            print("Geçersiz sayı. Varsayılan 1000 kullanılıyor.")
            max_customers = 1000
    else:
        max_customers = 1000
    
    print(f"Capstone verilerini import ediyorum (max: {max_customers})...")
    
    # Önce istatistikleri göster
    print("\nCapstone dosya istatistikleri:")
    get_capstone_stats()
    
    print(f"\nİmport başlıyor...")
    created = import_capstone_data(max_customers)
    print(f"\nToplam {created} müşteri import edildi.")
