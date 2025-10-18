"""
Analytics endpoints for dashboard data using GYK-capstone-project
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import logging
import requests

from services.analytics_service import analytics_service

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
        ml_service_url = "http://localhost:8000/score"
        response = requests.post(ml_service_url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ML Service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
