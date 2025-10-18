# seed_data.py - Örnek müşteri verileri
# -----------------------------------
# Dijital ikiz sistemi için örnek müşteri verileri

from sqlalchemy.orm import Session
from models import Customer
from crud import create_customer
from schemas import CustomerCreate
import json

def seed_customers(db: Session):
    """Örnek müşteri verilerini veritabanına ekler"""
    
    sample_customers = [
        {
            "customer_id": "CUST001",
            "age": 35,
            "tenure": 24,
            "service_type": "Postpaid",
            "avg_call_duration": 120.5,
            "data_usage": 8.5,
            "roaming_usage": 0.2,
            "monthly_charge": 89.99,
            "overdue_payments": 0,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 2,
            "customer_support_calls": 1,
            "satisfaction_score": 8.5,
            "apps": ["WhatsApp", "Instagram", "Netflix"],
            "churn": False
        },
        {
            "customer_id": "CUST002",
            "age": 28,
            "tenure": 12,
            "service_type": "Postpaid",
            "avg_call_duration": 85.2,
            "data_usage": 12.3,
            "roaming_usage": 1.5,
            "monthly_charge": 129.99,
            "overdue_payments": 2,
            "auto_payment": False,
            "avg_top_up_count": 0,
            "call_drops": 8,
            "customer_support_calls": 5,
            "satisfaction_score": 4.2,
            "apps": ["WhatsApp", "TikTok", "YouTube"],
            "churn": True
        },
        {
            "customer_id": "CUST003",
            "age": 45,
            "tenure": 36,
            "service_type": "Postpaid",
            "avg_call_duration": 200.8,
            "data_usage": 5.2,
            "roaming_usage": 0.1,
            "monthly_charge": 79.99,
            "overdue_payments": 0,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 1,
            "customer_support_calls": 0,
            "satisfaction_score": 9.2,
            "apps": ["WhatsApp", "Telegram", "Banking"],
            "churn": False
        },
        {
            "customer_id": "CUST004",
            "age": 22,
            "tenure": 6,
            "service_type": "Postpaid",
            "avg_call_duration": 45.3,
            "data_usage": 15.8,
            "roaming_usage": 2.1,
            "monthly_charge": 149.99,
            "overdue_payments": 3,
            "auto_payment": False,
            "avg_top_up_count": 0,
            "call_drops": 12,
            "customer_support_calls": 8,
            "satisfaction_score": 3.1,
            "apps": ["Instagram", "TikTok", "Spotify", "Snapchat"],
            "churn": True
        },
        {
            "customer_id": "CUST005",
            "age": 52,
            "tenure": 48,
            "service_type": "Postpaid",
            "avg_call_duration": 150.2,
            "data_usage": 3.5,
            "roaming_usage": 0.0,
            "monthly_charge": 69.99,
            "overdue_payments": 0,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 0,
            "customer_support_calls": 0,
            "satisfaction_score": 9.8,
            "apps": ["WhatsApp", "News"],
            "churn": False
        },
        {
            "customer_id": "CUST006",
            "age": 31,
            "tenure": 18,
            "service_type": "Postpaid",
            "avg_call_duration": 95.7,
            "data_usage": 9.8,
            "roaming_usage": 0.8,
            "monthly_charge": 99.99,
            "overdue_payments": 1,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 4,
            "customer_support_calls": 2,
            "satisfaction_score": 7.2,
            "apps": ["WhatsApp", "Instagram", "LinkedIn"],
            "churn": False
        },
        {
            "customer_id": "CUST007",
            "age": 26,
            "tenure": 9,
            "service_type": "Postpaid",
            "avg_call_duration": 60.1,
            "data_usage": 18.5,
            "roaming_usage": 3.2,
            "monthly_charge": 179.99,
            "overdue_payments": 4,
            "auto_payment": False,
            "avg_top_up_count": 0,
            "call_drops": 15,
            "customer_support_calls": 12,
            "satisfaction_score": 2.8,
            "apps": ["TikTok", "Instagram", "Snapchat", "Discord"],
            "churn": True
        },
        {
            "customer_id": "CUST008",
            "age": 38,
            "tenure": 30,
            "service_type": "Postpaid",
            "avg_call_duration": 180.3,
            "data_usage": 6.8,
            "roaming_usage": 0.5,
            "monthly_charge": 89.99,
            "overdue_payments": 0,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 3,
            "customer_support_calls": 1,
            "satisfaction_score": 8.1,
            "apps": ["WhatsApp", "Telegram", "YouTube"],
            "churn": False
        },
        {
            "customer_id": "CUST009",
            "age": 29,
            "tenure": 15,
            "service_type": "Postpaid",
            "avg_call_duration": 75.4,
            "data_usage": 11.2,
            "roaming_usage": 1.8,
            "monthly_charge": 119.99,
            "overdue_payments": 2,
            "auto_payment": False,
            "avg_top_up_count": 0,
            "call_drops": 6,
            "customer_support_calls": 4,
            "satisfaction_score": 5.5,
            "apps": ["WhatsApp", "Instagram", "Spotify"],
            "churn": False
        },
        {
            "customer_id": "CUST010",
            "age": 41,
            "tenure": 42,
            "service_type": "Postpaid",
            "avg_call_duration": 220.5,
            "data_usage": 4.2,
            "roaming_usage": 0.2,
            "monthly_charge": 79.99,
            "overdue_payments": 0,
            "auto_payment": True,
            "avg_top_up_count": 0,
            "call_drops": 1,
            "customer_support_calls": 0,
            "satisfaction_score": 9.5,
            "apps": ["WhatsApp", "Telegram", "News"],
            "churn": False
        }
    ]
    
    created_count = 0
    for customer_data in sample_customers:
        try:
            # Müşteri zaten var mı kontrol et
            existing_customer = db.query(Customer).filter(
                Customer.customer_id == customer_data["customer_id"]
            ).first()
            
            if not existing_customer:
                # Pydantic model oluştur
                customer_create = CustomerCreate(**customer_data)
                create_customer(db, customer_create)
                created_count += 1
                print(f"Müşteri oluşturuldu: {customer_data['customer_id']}")
            else:
                print(f"Müşteri zaten mevcut: {customer_data['customer_id']}")
                
        except Exception as e:
            print(f"Müşteri oluşturma hatası - {customer_data['customer_id']}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print(f"Toplam {created_count} müşteri oluşturuldu.")
    return created_count

if __name__ == "__main__":
    from database import SessionLocal
    db = SessionLocal()
    try:
        seed_customers(db)
    finally:
        db.close()
