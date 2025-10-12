"""
Analytics endpoints for dashboard data
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import logging

from services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/analytics",
    tags=["analytics"]
)

@router.get("/dashboard-summary")
async def get_dashboard_summary() -> Dict[str, Any]:
    """
    Get comprehensive dashboard summary with real EDA data
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
    Get churn statistics
    """
    try:
        return analytics_service.get_churn_statistics()
    except Exception as e:
        logger.error(f"Error getting churn stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/service-distribution")
async def get_service_distribution() -> List[Dict[str, Any]]:
    """
    Get service type distribution
    """
    try:
        return analytics_service.get_service_type_distribution()
    except Exception as e:
        logger.error(f"Error getting service distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/churn-by-service")
async def get_churn_by_service() -> List[Dict[str, Any]]:
    """
    Get churn distribution by service type
    """
    try:
        return analytics_service.get_churn_by_service_type()
    except Exception as e:
        logger.error(f"Error getting churn by service: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/customer-support-impact")
async def get_customer_support_impact() -> List[Dict[str, Any]]:
    """
    Get customer support impact on churn
    """
    try:
        return analytics_service.get_customer_support_impact()
    except Exception as e:
        logger.error(f"Error getting support impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/payment-analysis")
async def get_payment_analysis() -> List[Dict[str, Any]]:
    """
    Get auto payment vs churn analysis
    """
    try:
        return analytics_service.get_payment_analysis()
    except Exception as e:
        logger.error(f"Error getting payment analysis: {e}")
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
            "total_customers": churn_stats['total_customers']
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

