from sqlalchemy.orm import Session
from typing import List, Optional
from models import User, Customer, CustomerTwin
from schemas import UserCreate, UserUpdate, CustomerCreate, CustomerUpdate
from auth import get_password_hash

# User CRUD operations
def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user: UserUpdate) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Customer CRUD operations
def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    db_customer = Customer(
        customer_id=customer.customer_id,
        age=customer.age,
        tenure=customer.tenure,
        service_type=customer.service_type,
        avg_call_duration=customer.avg_call_duration,
        data_usage=customer.data_usage,
        roaming_usage=customer.roaming_usage,
        monthly_charge=customer.monthly_charge,
        overdue_payments=customer.overdue_payments,
        auto_payment=customer.auto_payment,
        avg_top_up_count=customer.avg_top_up_count,
        call_drops=customer.call_drops,
        customer_support_calls=customer.customer_support_calls,
        satisfaction_score=customer.satisfaction_score,
        apps=customer.apps,
        churn=customer.churn
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def get_customer(db: Session, customer_id: str) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.customer_id == customer_id).first()

def get_customer_by_id(db: Session, id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100) -> List[Customer]:
    return db.query(Customer).offset(skip).limit(limit).all()

def update_customer(db: Session, customer_id: str, customer: CustomerUpdate) -> Optional[Customer]:
    db_customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if db_customer:
        update_data = customer.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_customer, field, value)
        db.commit()
        db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: str) -> bool:
    db_customer = db.query(Customer).filter(Customer.customer_id == customer_id).first()
    if db_customer:
        db.delete(db_customer)
        db.commit()
        return True
    return False

# CustomerTwin CRUD operations
def create_customer_twin(db: Session, customer_id: str, twin_data: dict, 
                        churn_risk_score: float = None, churn_probability: float = None, 
                        risk_level: str = None) -> CustomerTwin:
    db_twin = CustomerTwin(
        customer_id=customer_id,
        twin_data=twin_data,
        churn_risk_score=churn_risk_score,
        churn_probability=churn_probability,
        risk_level=risk_level
    )
    db.add(db_twin)
    db.commit()
    db.refresh(db_twin)
    return db_twin

def get_customer_twin(db: Session, customer_id: str) -> Optional[CustomerTwin]:
    return db.query(CustomerTwin).filter(CustomerTwin.customer_id == customer_id).first()

def get_customer_twins(db: Session, skip: int = 0, limit: int = 100) -> List[CustomerTwin]:
    return db.query(CustomerTwin).offset(skip).limit(limit).all()

def update_customer_twin(db: Session, customer_id: str, twin_data: dict = None,
                        churn_risk_score: float = None, churn_probability: float = None,
                        risk_level: str = None) -> Optional[CustomerTwin]:
    db_twin = db.query(CustomerTwin).filter(CustomerTwin.customer_id == customer_id).first()
    if db_twin:
        if twin_data is not None:
            db_twin.twin_data = twin_data
        if churn_risk_score is not None:
            db_twin.churn_risk_score = churn_risk_score
        if churn_probability is not None:
            db_twin.churn_probability = churn_probability
        if risk_level is not None:
            db_twin.risk_level = risk_level
        db.commit()
        db.refresh(db_twin)
    return db_twin

def delete_customer_twin(db: Session, customer_id: str) -> bool:
    db_twin = db.query(CustomerTwin).filter(CustomerTwin.customer_id == customer_id).first()
    if db_twin:
        db.delete(db_twin)
        db.commit()
        return True
    return False

def get_high_risk_customers(db: Session, threshold: float = 0.6) -> List[CustomerTwin]:
    return db.query(CustomerTwin).filter(CustomerTwin.churn_probability >= threshold).all()
