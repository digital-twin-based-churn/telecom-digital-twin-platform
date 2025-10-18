from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, JSON
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, nullable=False)
    age = Column(Integer, nullable=True)
    tenure = Column(Integer, nullable=True)
    service_type = Column(String, nullable=True)  # Postpaid, Prepaid
    avg_call_duration = Column(Float, nullable=True)
    data_usage = Column(Float, nullable=True)
    roaming_usage = Column(Float, nullable=True)
    monthly_charge = Column(Float, nullable=True)
    overdue_payments = Column(Integer, nullable=True)
    auto_payment = Column(Boolean, nullable=True)
    avg_top_up_count = Column(Integer, nullable=True)
    call_drops = Column(Integer, nullable=True)
    customer_support_calls = Column(Integer, nullable=True)
    satisfaction_score = Column(Float, nullable=True)
    apps = Column(JSON, nullable=True)  # JSON array of apps
    churn = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CustomerTwin(Base):
    __tablename__ = "customer_twins"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, nullable=False)
    twin_data = Column(JSON, nullable=False)  # Müşterinin dijital ikiz verileri
    churn_risk_score = Column(Float, nullable=True)
    churn_probability = Column(Float, nullable=True)
    risk_level = Column(String, nullable=True)  # LOW, MEDIUM, HIGH, CRITICAL
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
