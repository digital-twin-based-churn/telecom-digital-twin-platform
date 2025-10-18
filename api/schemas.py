from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Customer schemas
class CustomerBase(BaseModel):
    customer_id: str
    age: Optional[int] = None
    tenure: Optional[int] = None
    service_type: Optional[str] = None
    avg_call_duration: Optional[float] = None
    data_usage: Optional[float] = None
    roaming_usage: Optional[float] = None
    monthly_charge: Optional[float] = None
    overdue_payments: Optional[int] = None
    auto_payment: Optional[bool] = None
    avg_top_up_count: Optional[int] = None
    call_drops: Optional[int] = None
    customer_support_calls: Optional[int] = None
    satisfaction_score: Optional[float] = None
    apps: Optional[List[str]] = None
    churn: Optional[bool] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    age: Optional[int] = None
    tenure: Optional[int] = None
    service_type: Optional[str] = None
    avg_call_duration: Optional[float] = None
    data_usage: Optional[float] = None
    roaming_usage: Optional[float] = None
    monthly_charge: Optional[float] = None
    overdue_payments: Optional[int] = None
    auto_payment: Optional[bool] = None
    avg_top_up_count: Optional[int] = None
    call_drops: Optional[int] = None
    customer_support_calls: Optional[int] = None
    satisfaction_score: Optional[float] = None
    apps: Optional[List[str]] = None
    churn: Optional[bool] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Digital Twin schemas
class DigitalTwinBase(BaseModel):
    customer_id: str
    twin_data: Dict[str, Any]
    churn_risk_score: Optional[float] = None
    churn_probability: Optional[float] = None
    risk_level: Optional[str] = None

class DigitalTwinCreate(DigitalTwinBase):
    pass

class DigitalTwinResponse(DigitalTwinBase):
    id: int
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Intervention schemas
class InterventionRequest(BaseModel):
    intervention_type: str
    intervention_value: float

class InterventionResponse(BaseModel):
    customer_id: str
    intervention_type: str
    intervention_value: float
    original_probability: Optional[float] = None
    new_probability: Optional[float] = None
    improvement: Optional[float] = None

class BulkInterventionRequest(BaseModel):
    intervention_type: str
    intervention_value: float
    target_customers: Optional[List[str]] = None

class BulkInterventionResponse(BaseModel):
    intervention_type: str
    intervention_value: float
    target_customers_count: int
    total_improvement: float
    average_improvement: float
    results: List[InterventionResponse]

# Analytics schemas
class RiskDistribution(BaseModel):
    total_customers: int
    risk_levels: Dict[str, int]
    percentages: Dict[str, float]

class CustomerInsights(BaseModel):
    customer_id: str
    churn_probability: Optional[float] = None
    risk_level: Optional[str] = None
    top_risk_factors: Dict[str, float]
    recommendations: List[str]
    last_updated: Optional[str] = None

class AnalyticsSummary(BaseModel):
    total_customers: int
    high_risk_customers: int
    average_risk_score: float
    risk_distribution: RiskDistribution
    last_updated: str
