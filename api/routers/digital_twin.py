# digital_twin.py - Dijital İkiz API Router
# -----------------------------------------
# Dijital ikiz tabanlı churn tahmini için API endpoints

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from services.digital_twin_service import DigitalTwinService
from services.digital_twin import CustomerFeatures

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

# Pydantic models
class CustomerFeaturesRequest(BaseModel):
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

class InterventionRequest(BaseModel):
    intervention_type: str  # satisfaction_improvement, support_calls_reduction, payment_reminder, service_upgrade
    intervention_value: float

class BulkInterventionRequest(BaseModel):
    intervention_type: str
    intervention_value: float
    target_customers: Optional[List[str]] = None

# API Endpoints

@router.post("/create/{customer_id}")
async def create_customer_twin(customer_id: str, db: Session = Depends(get_db)):
    """Müşteri için dijital ikiz oluşturur"""
    try:
        service = DigitalTwinService(db)
        result = service.create_customer_twin(customer_id)
        
        if result is None:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
        
        return {
            "success": True,
            "message": f"Dijital ikiz oluşturuldu: {customer_id}",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dijital ikiz oluşturma hatası: {str(e)}")

@router.get("/{customer_id}")
async def get_customer_twin(customer_id: str, db: Session = Depends(get_db)):
    """Müşteri dijital ikizini getirir"""
    try:
        service = DigitalTwinService(db)
        twin_data = service.get_customer_twin(customer_id)
        
        if twin_data is None:
            raise HTTPException(status_code=404, detail="Dijital ikiz bulunamadı")
        
        return {
            "success": True,
            "data": twin_data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dijital ikiz getirme hatası: {str(e)}")

@router.put("/{customer_id}")
async def update_customer_twin(customer_id: str, db: Session = Depends(get_db)):
    """Müşteri dijital ikizini günceller"""
    try:
        service = DigitalTwinService(db)
        result = service.update_customer_twin(customer_id)
        
        if result is None:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı")
        
        return {
            "success": True,
            "message": f"Dijital ikiz güncellendi: {customer_id}",
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dijital ikiz güncelleme hatası: {str(e)}")

@router.get("/")
async def get_all_twins(db: Session = Depends(get_db)):
    """Tüm dijital ikizleri getirir"""
    try:
        service = DigitalTwinService(db)
        twins = service.get_all_twins()
        
        return {
            "success": True,
            "count": len(twins),
            "data": twins
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dijital ikizleri getirme hatası: {str(e)}")

@router.get("/high-risk")
async def get_high_risk_customers(
    threshold: float = Query(0.6, description="Risk eşiği (0.0-1.0)"),
    db: Session = Depends(get_db)
):
    """Yüksek riskli müşterileri getirir"""
    try:
        service = DigitalTwinService(db)
        high_risk = service.get_high_risk_customers(threshold)
        
        return {
            "success": True,
            "threshold": threshold,
            "count": len(high_risk),
            "data": high_risk
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yüksek riskli müşterileri getirme hatası: {str(e)}")

@router.post("/simulate/{customer_id}")
async def simulate_intervention(
    customer_id: str,
    intervention: InterventionRequest,
    db: Session = Depends(get_db)
):
    """Müşteri için müdahale simülasyonu yapar"""
    try:
        service = DigitalTwinService(db)
        result = service.simulate_intervention(
            customer_id,
            intervention.intervention_type,
            intervention.intervention_value
        )
        
        if result is None:
            raise HTTPException(status_code=404, detail="Müşteri dijital ikizi bulunamadı")
        
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Müdahale simülasyonu hatası: {str(e)}")

@router.post("/simulate/bulk")
async def bulk_simulate_intervention(
    intervention: BulkInterventionRequest,
    db: Session = Depends(get_db)
):
    """Toplu müdahale simülasyonu yapar"""
    try:
        service = DigitalTwinService(db)
        result = service.bulk_simulate_intervention(
            intervention.intervention_type,
            intervention.intervention_value,
            intervention.target_customers
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Toplu müdahale simülasyonu hatası: {str(e)}")

@router.post("/create-all")
async def create_all_twins(db: Session = Depends(get_db)):
    """Tüm müşteriler için dijital ikiz oluşturur"""
    try:
        service = DigitalTwinService(db)
        result = service.create_all_twins()
        
        return {
            "success": True,
            "message": "Toplu dijital ikiz oluşturma tamamlandı",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Toplu dijital ikiz oluşturma hatası: {str(e)}")

@router.get("/analytics/risk-distribution")
async def get_risk_distribution(db: Session = Depends(get_db)):
    """Risk dağılımını getirir"""
    try:
        service = DigitalTwinService(db)
        distribution = service.get_risk_distribution()
        
        return {
            "success": True,
            "data": distribution
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk dağılımı hesaplama hatası: {str(e)}")

@router.get("/insights/{customer_id}")
async def get_customer_insights(customer_id: str, db: Session = Depends(get_db)):
    """Müşteri için detaylı insights getirir"""
    try:
        service = DigitalTwinService(db)
        insights = service.get_customer_insights(customer_id)
        
        if insights is None:
            raise HTTPException(status_code=404, detail="Müşteri bulunamadı veya dijital ikiz oluşturulamadı")
        
        return {
            "success": True,
            "data": insights
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Müşteri insights hatası: {str(e)}")

@router.get("/analytics/summary")
async def get_analytics_summary(db: Session = Depends(get_db)):
    """Dijital ikiz analitik özeti getirir"""
    try:
        service = DigitalTwinService(db)
        
        # Risk dağılımı
        risk_distribution = service.get_risk_distribution()
        
        # Yüksek riskli müşteriler
        high_risk = service.get_high_risk_customers(0.6)
        
        # Tüm dijital ikizler
        all_twins = service.get_all_twins()
        
        # Ortalama risk skoru
        avg_risk = 0
        if all_twins:
            risk_scores = [twin.get('churn_probability', 0) for twin in all_twins if twin.get('churn_probability')]
            avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0
        
        return {
            "success": True,
            "data": {
                "total_customers": len(all_twins),
                "high_risk_customers": len(high_risk),
                "average_risk_score": round(avg_risk, 3),
                "risk_distribution": risk_distribution,
                "last_updated": datetime.now().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analitik özet hatası: {str(e)}")

# Intervention types için yardımcı endpoint
@router.get("/intervention-types")
async def get_intervention_types():
    """Mevcut müdahale türlerini getirir"""
    return {
        "success": True,
        "data": {
            "intervention_types": [
                {
                    "type": "satisfaction_improvement",
                    "name": "Memnuniyet Artırma",
                    "description": "Müşteri memnuniyet skorunu artırır",
                    "unit": "puan"
                },
                {
                    "type": "support_calls_reduction",
                    "name": "Destek Çağrılarını Azaltma",
                    "description": "Müşteri destek çağrı sayısını azaltır",
                    "unit": "çağrı"
                },
                {
                    "type": "payment_reminder",
                    "name": "Ödeme Hatırlatma",
                    "description": "Geciken ödemeleri azaltır",
                    "unit": "ödeme"
                },
                {
                    "type": "service_upgrade",
                    "name": "Hizmet Yükseltme",
                    "description": "Veri kullanımını ve hizmet kalitesini artırır",
                    "unit": "GB"
                }
            ]
        }
    }
