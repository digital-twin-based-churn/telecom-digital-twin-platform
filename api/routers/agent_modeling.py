# agent_modeling.py - Agent-Based Modeling Router
# ----------------------------------------------
# Agent-based modeling API endpoints

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from database import get_db
from models import User
from auth import get_current_user
from services.agent_based_modeling import (
    AgentBasedModelingSystem, CustomerSegment, MarketCondition
)
import networkx as nx

router = APIRouter(prefix="/agent-modeling", tags=["Agent-Based Modeling"])
logger = logging.getLogger(__name__)

# Global agent modeling system instance
agent_system = AgentBasedModelingSystem()

@router.post("/create-agent")
async def create_customer_agent(
    customer_id: str,
    segment: str,
    satisfaction: float,
    price_sensitivity: float,
    service_quality_expectation: float,
    current_user: User = Depends(get_current_user)
):
    """Müşteri agent'ı oluşturur"""
    try:
        segment_enum = CustomerSegment(segment.upper())
        
        agent = agent_system.create_customer_agent(
            customer_id=customer_id,
            segment=segment_enum,
            satisfaction=satisfaction,
            price_sensitivity=price_sensitivity,
            service_quality_expectation=service_quality_expectation
        )
        
        return {
            "success": True,
            "message": f"Agent oluşturuldu: {customer_id}",
            "agent_data": {
                "customer_id": agent.customer_id,
                "segment": agent.segment.value,
                "loyalty_score": agent.loyalty_score,
                "social_influence": agent.social_influence
            }
        }
        
    except Exception as e:
        logger.error(f"Agent oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent oluşturma hatası: {str(e)}")

@router.post("/create-social-network")
async def create_social_network(
    customer_id: str,
    connections: List[str],
    current_user: User = Depends(get_current_user)
):
    """Sosyal ağ bağlantıları oluşturur"""
    try:
        agent_system.create_social_connections(customer_id, connections)
        
        return {
            "success": True,
            "message": f"Sosyal bağlantılar oluşturuldu: {customer_id}",
            "connections_count": len(connections)
        }
        
    except Exception as e:
        logger.error(f"Sosyal ağ oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sosyal ağ oluşturma hatası: {str(e)}")

@router.post("/simulate-individual-decision")
async def simulate_individual_decision(
    customer_id: str,
    intervention: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
):
    """Bireysel müşteri kararını simüle eder"""
    try:
        decision = agent_system.simulate_individual_decision(customer_id, intervention)
        
        return {
            "success": True,
            "decision": decision
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Bireysel karar simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simülasyon hatası: {str(e)}")

@router.post("/simulate-collective-effects")
async def simulate_collective_effects(
    target_customers: List[str],
    intervention: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
):
    """Toplu etkileri simüle eder"""
    try:
        results = agent_system.simulate_collective_effects(target_customers, intervention)
        
        return {
            "success": True,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Toplu etki simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Toplu etki simülasyonu hatası: {str(e)}")

@router.post("/run-multi-step-simulation")
async def run_multi_step_simulation(
    steps: int = 10,
    intervention_schedule: Optional[Dict[int, Dict[str, Any]]] = None,
    current_user: User = Depends(get_current_user)
):
    """Çok adımlı simülasyon çalıştırır"""
    try:
        results = agent_system.run_multi_step_simulation(steps, intervention_schedule)
        
        return {
            "success": True,
            "simulation_steps": len(results),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Çok adımlı simülasyon hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Çok adımlı simülasyon hatası: {str(e)}")

@router.post("/update-market-conditions")
async def update_market_conditions(
    market_conditions: Dict[str, float],
    current_user: User = Depends(get_current_user)
):
    """Pazar koşullarını günceller"""
    try:
        agent_system.update_market_conditions(**market_conditions)
        
        return {
            "success": True,
            "message": "Pazar koşulları güncellendi",
            "market_conditions": {
                "competitor_pressure": agent_system.market_conditions.competitor_pressure,
                "economic_conditions": agent_system.market_conditions.economic_conditions,
                "technology_trends": agent_system.market_conditions.technology_trends,
                "regulatory_changes": agent_system.market_conditions.regulatory_changes,
                "seasonal_factors": agent_system.market_conditions.seasonal_factors
            }
        }
        
    except Exception as e:
        logger.error(f"Pazar koşulları güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pazar koşulları güncelleme hatası: {str(e)}")

@router.get("/agent-insights/{customer_id}")
async def get_agent_insights(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Agent için detaylı insights"""
    try:
        insights = agent_system.get_agent_insights(customer_id)
        
        if not insights:
            raise HTTPException(status_code=404, detail="Agent bulunamadı")
        
        return {
            "success": True,
            "insights": insights
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Agent insights hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent insights hatası: {str(e)}")

@router.get("/network-analysis")
async def get_network_analysis(
    current_user: User = Depends(get_current_user)
):
    """Sosyal ağ analizi"""
    try:
        network = agent_system.social_network
        
        # Ağ metrikleri
        metrics = {
            "total_nodes": network.number_of_nodes(),
            "total_edges": network.number_of_edges(),
            "connected_components": len(list(nx.connected_components(network))),
            "average_clustering": nx.average_clustering(network),
            "network_density": nx.density(network)
        }
        
        # En etkili agent'lar
        centrality = nx.degree_centrality(network)
        top_influencers = sorted(centrality.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "success": True,
            "network_metrics": metrics,
            "top_influencers": [
                {"customer_id": customer_id, "centrality": centrality}
                for customer_id, centrality in top_influencers
            ]
        }
        
    except Exception as e:
        logger.error(f"Ağ analizi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ağ analizi hatası: {str(e)}")

@router.get("/market-conditions")
async def get_market_conditions(
    current_user: User = Depends(get_current_user)
):
    """Mevcut pazar koşullarını getirir"""
    try:
        conditions = agent_system.market_conditions
        
        return {
            "success": True,
            "market_conditions": {
                "competitor_pressure": conditions.competitor_pressure,
                "economic_conditions": conditions.economic_conditions,
                "technology_trends": conditions.technology_trends,
                "regulatory_changes": conditions.regulatory_changes,
                "seasonal_factors": conditions.seasonal_factors
            }
        }
        
    except Exception as e:
        logger.error(f"Pazar koşulları getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pazar koşulları getirme hatası: {str(e)}")

@router.post("/bulk-create-agents")
async def bulk_create_agents(
    agents_data: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user)
):
    """Toplu agent oluşturur"""
    try:
        created_agents = []
        errors = []
        
        for agent_data in agents_data:
            try:
                agent = agent_system.create_customer_agent(
                    customer_id=agent_data['customer_id'],
                    segment=CustomerSegment(agent_data['segment'].upper()),
                    satisfaction=agent_data['satisfaction'],
                    price_sensitivity=agent_data['price_sensitivity'],
                    service_quality_expectation=agent_data['service_quality_expectation']
                )
                created_agents.append(agent.customer_id)
            except Exception as e:
                errors.append({
                    "customer_id": agent_data.get('customer_id', 'unknown'),
                    "error": str(e)
                })
        
        return {
            "success": True,
            "created_agents": len(created_agents),
            "errors": len(errors),
            "created_agent_ids": created_agents,
            "error_details": errors
        }
        
    except Exception as e:
        logger.error(f"Toplu agent oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Toplu agent oluşturma hatası: {str(e)}")

@router.get("/simulation-history")
async def get_simulation_history(
    customer_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Simülasyon geçmişini getirir"""
    try:
        if customer_id:
            if customer_id not in agent_system.agents:
                raise HTTPException(status_code=404, detail="Agent bulunamadı")
            
            agent = agent_system.agents[customer_id]
            return {
                "success": True,
                "customer_id": customer_id,
                "decision_history": agent.decision_history,
                "last_decision": agent.last_decision.value if agent.last_decision else None
            }
        else:
            # Tüm agent'ların geçmişi
            all_history = {}
            for customer_id, agent in agent_system.agents.items():
                all_history[customer_id] = {
                    "decision_history": agent.decision_history,
                    "last_decision": agent.last_decision.value if agent.last_decision else None
                }
            
            return {
                "success": True,
                "all_agents_history": all_history
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simülasyon geçmişi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simülasyon geçmişi hatası: {str(e)}")
