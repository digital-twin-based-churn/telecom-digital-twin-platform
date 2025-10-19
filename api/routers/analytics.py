"""
Analytics endpoints for dashboard data using GYK-capstone-project
"""
from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
import logging
import requests

from services.analytics_service import analytics_service
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)

@router.get("/dashboard-summary")
async def get_dashboard_summary() -> Dict[str, Any]:
    """
    Get comprehensive dashboard summary with real GYK data
    """
    try:
        summary = analytics_service.get_dashboard_summary()
        if not summary:
            raise HTTPException(status_code=500, detail="Failed to fetch dashboard data")
        return summary
    except Exception as e:
        logger.error(f"Error in dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/churn-stats")
async def get_churn_stats() -> Dict[str, Any]:
    """
    Get churn statistics from GYK data
    """
    try:
        return analytics_service.get_churn_statistics()
    except Exception as e:
        logger.error(f"Error getting churn stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service-distribution")
async def get_service_distribution() -> List[Dict[str, Any]]:
    """
    Get service type distribution from GYK data
    """
    try:
        return analytics_service.get_service_type_distribution()
    except Exception as e:
        logger.error(f"Error getting service distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-performance")
async def get_model_performance() -> Dict[str, Any]:
    """
    Get model performance metrics from GYK artifacts
    """
    try:
        return analytics_service.get_model_performance()
    except Exception as e:
        logger.error(f"Error getting model performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/percentile-analysis")
async def get_percentile_analysis() -> Dict[str, Any]:
    """
    Get percentile analysis from EDA data
    """
    try:
        return analytics_service.get_percentile_analysis()
    except Exception as e:
        logger.error(f"Error getting percentile analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service-comparison")
async def get_service_comparison() -> List[Dict[str, Any]]:
    """
    Get service type comparison metrics
    """
    try:
        return analytics_service.get_service_comparison()
    except Exception as e:
        logger.error(f"Error getting service comparison: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/key-insights")
async def get_key_insights() -> Dict[str, Any]:
    """
    Get key insights from EDA data
    """
    try:
        return analytics_service.get_key_insights()
    except Exception as e:
        logger.error(f"Error getting key insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/revenue-analysis")
async def get_revenue_analysis() -> Dict[str, Any]:
    """
    Get revenue and cost analysis from GYK data
    """
    try:
        return analytics_service.get_revenue_analysis()
    except Exception as e:
        logger.error(f"Error getting revenue analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/campaign-roi")
async def get_campaign_roi() -> Dict[str, Any]:
    """
    Get campaign ROI analysis from GYK data
    """
    try:
        return analytics_service.get_campaign_roi()
    except Exception as e:
        logger.error(f"Error getting campaign ROI: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def analytics_health() -> Dict[str, Any]:
    """
    Check analytics service health
    """
    try:
        churn_stats = analytics_service.get_churn_statistics()
        return {
            "status": "healthy",
            "data_available": churn_stats['total_customers'] > 0,
            "total_customers": churn_stats['total_customers'],
            "data_source": "GYK-capstone-project"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.post("/churn-prediction")
async def predict_churn(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict churn using GYK ML Service
    """
    try:
        # Add auto-generated ID if not provided
        if "id" not in data or not data["id"]:
            import uuid
            data["id"] = f"customer_{uuid.uuid4().hex[:8]}"
        
        # Forward request to ML Service
        base_url = settings.ML_SERVICE_URL.rstrip('/')
        ml_service_url = f"{base_url}/score"
        response = requests.post(ml_service_url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ML Service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/customer-360/{customer_id}")
async def get_customer_360(customer_id: str) -> Dict[str, Any]:
    """
    Get comprehensive customer 360 view with real data
    """
    try:
        logger.info(f"Getting customer 360 data for ID: {customer_id}")
        result = analytics_service.get_customer_360_data(customer_id)
        logger.info(f"Customer 360 data retrieved successfully")
        return result
    except Exception as e:
        logger.error(f"Error getting customer 360 data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/segment-analysis")
async def get_segment_analysis() -> Dict[str, Any]:
    """
    Get detailed segment analysis from GYK data
    """
    try:
        logger.info("Getting segment analysis data")
        result = analytics_service.get_segment_analysis()
        logger.info(f"Segment analysis data retrieved successfully: {len(result.get('segments', []))} segments")
        return result
    except Exception as e:
        logger.error(f"Error getting segment analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/random-customer-ids")
async def get_random_customer_ids() -> Dict[str, Any]:
    """
    Get random customer IDs from the database for testing
    """
    try:
        from database import get_db
        from models import Customer
        from sqlalchemy.orm import Session
        import random
        
        db = next(get_db())
        
        # Veritabanından müşteri ID'lerini çek
        customers = db.query(Customer.customer_id).limit(50).all()
        
        if not customers:
            # Veritabanı boşsa fallback ID'ler döndür
            return {
                "customer_ids": [
                    "1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd",
                    "postpaid_sadik_musteri",
                    "postpaid_problemli_musteri", 
                    "prepaid_sadik_musteri",
                    "prepaid_problemli_musteri",
                    "broadband_sadik_musteri",
                    "broadband_problemli_musteri"
                ]
            }
        
        # Customer ID'leri çıkar
        customer_ids = [customer.customer_id for customer in customers]
        
        # Random 10 ID seç
        random_ids = random.sample(customer_ids, min(10, len(customer_ids)))
        
        db.close()
        
        return {
            "customer_ids": random_ids,
            "total_customers": len(customer_ids)
        }
    except Exception as e:
        logger.error(f"Error getting random customer IDs: {e}")
        # Fallback ID'ler
        return {
            "customer_ids": [
                "1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd",
                "postpaid_sadik_musteri",
                "postpaid_problemli_musteri", 
                "prepaid_sadik_musteri",
                "prepaid_problemli_musteri",
                "broadband_sadik_musteri",
                "broadband_problemli_musteri"
            ]
        }

@router.get("/test-scenarios")
async def get_test_scenarios() -> Dict[str, Any]:
    """
    Get test scenarios data for random customer ID selection
    """
    try:
        import json
        import os
        
        # Test scenarios dosyasının yolu
        scenarios_path = os.path.join(os.path.dirname(__file__), "../../GYK-capstone-project/data/artifacts/churn_test_scenarios.json")
        
        if not os.path.exists(scenarios_path):
            # Fallback scenarios
            return {
                "test_scenarios": {
                    "Postpaid": {
                        "low_risk": {
                            "test_data": {
                                "id": "postpaid_sadik_musteri",
                                "service_type": "Postpaid"
                            }
                        },
                        "high_risk": {
                            "test_data": {
                                "id": "postpaid_problemli_musteri",
                                "service_type": "Postpaid"
                            }
                        }
                    },
                    "Prepaid": {
                        "low_risk": {
                            "test_data": {
                                "id": "prepaid_sadik_musteri",
                                "service_type": "Prepaid"
                            }
                        },
                        "high_risk": {
                            "test_data": {
                                "id": "prepaid_problemli_musteri",
                                "service_type": "Prepaid"
                            }
                        }
                    },
                    "Broadband": {
                        "low_risk": {
                            "test_data": {
                                "id": "broadband_sadik_musteri",
                                "service_type": "Broadband"
                            }
                        },
                        "high_risk": {
                            "test_data": {
                                "id": "broadband_problemli_musteri",
                                "service_type": "Broadband"
                            }
                        }
                    }
                }
            }
        
        with open(scenarios_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data
    except Exception as e:
        logger.error(f"Error getting test scenarios: {e}")
        raise HTTPException(status_code=500, detail=str(e))
