# telecom_agent_modeling.py - Telekomünikasyon Agent-Based Modeling Router
# ---------------------------------------------------------------------
# 3 servis türü için özelleştirilmiş agent-based modeling API endpoints

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
import networkx as nx

from database import get_db
from models import User
from auth import get_current_user
from services.telecom_agent_modeling import (
    TelecomAgentBasedModelingSystem, ServiceType, TelecomCustomerSegment
)

router = APIRouter(prefix="/telecom-agent-modeling", tags=["Telecom Agent-Based Modeling"])
logger = logging.getLogger(__name__)

# Global telecom agent modeling system instance
telecom_agent_system = TelecomAgentBasedModelingSystem()

@router.get("/test")
async def test_telecom_agent_modeling():
    """Test endpoint - authentication gerektirmez"""
    return {
        "success": True,
        "message": "Telecom Agent-Based Modeling sistemi çalışıyor",
        "available_endpoints": [
            "POST /create-telecom-agent",
            "POST /simulate-service-decision", 
            "POST /simulate-collective-by-service",
            "GET /service-type-analysis",
            "GET /market-conditions"
        ]
    }

@router.post("/create-telecom-agent-demo")
async def create_telecom_agent_demo(
    request: Dict[str, Any]
):
    """Demo endpoint - authentication gerektirmez"""
    try:
        customer_id = request.get('customer_id')
        service_type = request.get('service_type')
        features = request.get('features', {})
        
        # Servis türü doğrulama
        valid_service_types = [st.value for st in ServiceType]
        if service_type not in valid_service_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Geçersiz servis türü. Geçerli türler: {valid_service_types}"
            )
        
        agent = telecom_agent_system.create_telecom_agent(
            customer_id=customer_id,
            service_type=service_type,
            features=features
        )
        
        return {
            "success": True,
            "message": f"Demo telecom agent oluşturuldu: {customer_id}",
            "agent_data": {
                "customer_id": agent.customer_id,
                "service_type": agent.service_type.value,
                "segment": agent.segment.value,
                "loyalty_score": agent.loyalty_score,
                "social_influence": agent.social_influence,
                "price_sensitivity": agent.price_sensitivity,
                "service_quality_expectation": agent.service_quality_expectation
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Demo telecom agent oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo telecom agent oluşturma hatası: {str(e)}")

@router.post("/simulate-collective-demo")
async def simulate_collective_demo(
    request: Dict[str, Any]
):
    """Demo toplu simülasyon - authentication gerektirmez"""
    try:
        # Tüm agent'ları al
        target_customers = list(telecom_agent_system.agents.keys())
        intervention = request.get('intervention')
        
        results = telecom_agent_system.simulate_collective_effects_by_service(target_customers, intervention)
        
        return {
            "success": True,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Demo toplu etki simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo toplu etki simülasyonu hatası: {str(e)}")

@router.get("/market-conditions-demo")
async def get_telecom_market_conditions_demo():
    """Demo pazar koşulları - authentication gerektirmez"""
    try:
        conditions = telecom_agent_system.market_conditions
        
        return {
            "success": True,
            "market_conditions": {
                "competitor_pressure": conditions.competitor_pressure,
                "economic_conditions": conditions.economic_conditions,
                "technology_trends": conditions.technology_trends,
                "regulatory_changes": conditions.regulatory_changes,
                "seasonal_factors": conditions.seasonal_factors,
                "network_quality": conditions.network_quality,
                "price_competition": conditions.price_competition,
                "service_innovation": conditions.service_innovation,
                "customer_expectations": conditions.customer_expectations
            }
        }
        
    except Exception as e:
        logger.error(f"Demo pazar koşulları getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo pazar koşulları getirme hatası: {str(e)}")

@router.post("/load-real-data")
async def load_real_data_from_gyk():
    """GYK verilerinden gerçek agent'lar oluştur"""
    try:
        import json
        import os
        
        # GYK veri dosyası yolu
        data_path = "/Users/sultan/Desktop/proje/GYK-capstone-project/data/capstone.1.jsonl"
        
        if not os.path.exists(data_path):
            raise HTTPException(status_code=404, detail="GYK veri dosyası bulunamadı")
        
        loaded_agents = []
        sample_size = 100  # İlk 100 kayıt
        
        with open(data_path, 'r') as file:
            for i, line in enumerate(file):
                if i >= sample_size:
                    break
                    
                try:
                    data = json.loads(line.strip())
                    logger.info(f"Satır {i+1} işleniyor: {data.get('id', 'N/A')}")
                    
                    # Veri temizleme ve dönüştürme
                    features = {
                        "age": data.get("age", 35),
                        "tenure": data.get("tenure", 24),
                        "avg_call_duration": data.get("avg_call_duration", 0) or 0,
                        "data_usage": data.get("data_usage", 0) or 0,
                        "monthly_charge": data.get("monthly_charge", 0) or 0,
                        "overdue_payments": data.get("overdue_payments", 0) or 0,
                        "auto_payment": data.get("auto_payment", False),
                        "call_drops": data.get("call_drops", 0) or 0,
                        "customer_support_calls": data.get("customer_support_calls", 0) or 0,
                        "satisfaction_score": data.get("satisfaction_score", 5.0) or 5.0,
                        "apps": data.get("apps", []),
                        "avg_top_up_count": data.get("avg_top_up_count", 0) if data.get("service_type") == "Prepaid" else None,
                        "roaming_usage": data.get("roaming_usage", 0) if data.get("service_type") == "Prepaid" else None
                    }
                    
                    # Agent oluştur ve sisteme ekle
                    agent = telecom_agent_system.create_telecom_agent(
                        customer_id=data["id"],
                        service_type=data["service_type"],
                        features=features
                    )
                    
                    # Agent'ı global sisteme ekle (manuel olarak)
                    telecom_agent_system.agents[agent.customer_id] = agent
                    telecom_agent_system.social_network.add_node(agent.customer_id, agent=agent)
                    
                    loaded_agents.append({
                        "customer_id": agent.customer_id,
                        "service_type": agent.service_type.value,
                        "segment": agent.segment.value,
                        "loyalty_score": agent.loyalty_score,
                        "social_influence": agent.social_influence,
                        "price_sensitivity": agent.price_sensitivity,
                        "service_quality_expectation": agent.service_quality_expectation,
                        "churn": data.get("churn", False)
                    })
                    
                except Exception as e:
                    logger.warning(f"Satır {i+1} işlenemedi: {str(e)}")
                    continue
        
        # Eğer agent'lar zaten yüklüyse, mevcut agent'ları döndür
        if len(loaded_agents) == 0 and len(telecom_agent_system.agents) > 0:
            existing_agents = []
            for agent_id, agent in telecom_agent_system.agents.items():
                existing_agents.append({
                    "customer_id": agent.customer_id,
                    "service_type": agent.service_type.value,
                    "segment": agent.segment.value,
                    "loyalty_score": agent.loyalty_score,
                    "social_influence": agent.social_influence,
                    "price_sensitivity": agent.price_sensitivity,
                    "service_quality_expectation": agent.service_quality_expectation,
                    "churn": False
                })
            
            return {
                "success": True,
                "message": f"Zaten {len(existing_agents)} agent mevcut",
                "agents": existing_agents,
                "total_agents": len(existing_agents)
            }
        
        return {
            "success": True,
            "message": f"{len(loaded_agents)} gerçek agent GYK verilerinden yüklendi",
            "agents": loaded_agents,
            "sample_size": sample_size
        }
        
    except Exception as e:
        logger.error(f"Gerçek veri yükleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gerçek veri yükleme hatası: {str(e)}")

@router.get("/network-analysis-demo")
async def get_telecom_network_analysis_demo():
    """Demo ağ analizi - authentication gerektirmez"""
    try:
        network = telecom_agent_system.social_network
        
        # Ağ metrikleri - boş ağ kontrolü
        total_nodes = network.number_of_nodes()
        total_edges = network.number_of_edges()
        
        if total_nodes == 0:
            return {
                "success": True,
                "network_metrics": {
                    "total_nodes": 0,
                    "total_edges": 0,
                    "connected_components": 0,
                    "average_clustering": 0.0,
                    "network_density": 0.0,
                    "message": "Henüz agent oluşturulmamış"
                }
            }
        
        metrics = {
            "total_nodes": total_nodes,
            "total_edges": total_edges,
            "connected_components": len(list(nx.connected_components(network))),
            "average_clustering": nx.average_clustering(network) if total_nodes > 0 else 0.0,
            "network_density": nx.density(network) if total_nodes > 1 else 0.0
        }
        
        # Detaylı sosyal ağ verisi
        network_details = []
        for node in network.nodes():
            if node in telecom_agent_system.agents:
                agent = telecom_agent_system.agents[node]
                neighbors = list(network.neighbors(node))
                
                # Komşu detayları
                neighbor_details = []
                for neighbor in neighbors:
                    if neighbor in telecom_agent_system.agents:
                        neighbor_agent = telecom_agent_system.agents[neighbor]
                        edge_data = network.get_edge_data(node, neighbor)
                        
                        neighbor_details.append({
                            "customer_id": neighbor,
                            "service_type": neighbor_agent.service_type.value,
                            "relationship": edge_data.get('relationship', 'unknown'),
                            "influence_strength": edge_data.get('influence_strength', 0.0)
                        })
                
                network_details.append({
                    "customer_id": node,
                    "service_type": agent.service_type.value,
                    "segment": agent.segment.value,
                    "age": agent.features.age,
                    "monthly_charge": agent.features.monthly_charge,
                    "connections": len(neighbors),
                    "neighbors": neighbor_details
                })
        
        return {
            "success": True,
            "network_metrics": metrics,
            "network_details": network_details
        }
        
    except Exception as e:
        logger.error(f"Demo ağ analizi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo ağ analizi hatası: {str(e)}")

@router.post("/create-telecom-agent")
async def create_telecom_agent(
    customer_id: str,
    service_type: str,
    features: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Telekomünikasyon agent'ı oluşturur (3 servis türü için)"""
    try:
        # Servis türü doğrulama
        valid_service_types = [st.value for st in ServiceType]
        if service_type not in valid_service_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Geçersiz servis türü. Geçerli türler: {valid_service_types}"
            )
        
        agent = telecom_agent_system.create_telecom_agent(
            customer_id=customer_id,
            service_type=service_type,
            features=features
        )
        
        return {
            "success": True,
            "message": f"Telecom agent oluşturuldu: {customer_id}",
            "agent_data": {
                "customer_id": agent.customer_id,
                "service_type": agent.service_type.value,
                "segment": agent.segment.value,
                "loyalty_score": agent.loyalty_score,
                "social_influence": agent.social_influence,
                "price_sensitivity": agent.price_sensitivity,
                "service_quality_expectation": agent.service_quality_expectation
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Telecom agent oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Telecom agent oluşturma hatası: {str(e)}")

@router.post("/simulate-service-decision")
async def simulate_service_decision(
    customer_id: str,
    intervention: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
):
    """Servis türüne özel karar simülasyonu"""
    try:
        decision = telecom_agent_system.simulate_service_specific_decision(customer_id, intervention)
        
        return {
            "success": True,
            "decision": decision
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Servis karar simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Servis karar simülasyonu hatası: {str(e)}")

@router.post("/simulate-collective-by-service")
async def simulate_collective_by_service(
    target_customers: List[str],
    intervention: Optional[Dict[str, Any]] = None,
    current_user: User = Depends(get_current_user)
):
    """Servis türüne göre toplu etkileri simüle eder"""
    try:
        results = telecom_agent_system.simulate_collective_effects_by_service(target_customers, intervention)
        
        return {
            "success": True,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Servis türü toplu etki simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Servis türü toplu etki simülasyonu hatası: {str(e)}")

@router.get("/service-type-analysis")
async def get_service_type_analysis(
    current_user: User = Depends(get_current_user)
):
    """Servis türüne göre analiz"""
    try:
        agents = telecom_agent_system.agents
        
        # Servis türüne göre grupla
        service_analysis = {}
        for service_type in ServiceType:
            service_agents = [agent for agent in agents.values() if agent.service_type == service_type]
            
            if service_agents:
                service_analysis[service_type.value] = {
                    'total_agents': len(service_agents),
                    'segment_distribution': {},
                    'average_loyalty': sum(agent.loyalty_score for agent in service_agents) / len(service_agents),
                    'average_satisfaction': sum(agent.current_satisfaction for agent in service_agents) / len(service_agents),
                    'average_price_sensitivity': sum(agent.price_sensitivity for agent in service_agents) / len(service_agents),
                    'high_influence_agents': len([agent for agent in service_agents if agent.social_influence > 0.7])
                }
                
                # Segment dağılımı
                segment_counts = {}
                for agent in service_agents:
                    segment = agent.segment.value
                    segment_counts[segment] = segment_counts.get(segment, 0) + 1
                service_analysis[service_type.value]['segment_distribution'] = segment_counts
        
        return {
            "success": True,
            "service_analysis": service_analysis
        }
        
    except Exception as e:
        logger.error(f"Servis türü analizi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Servis türü analizi hatası: {str(e)}")

@router.get("/telecom-agent-insights/{customer_id}")
async def get_telecom_agent_insights(
    customer_id: str,
    current_user: User = Depends(get_current_user)
):
    """Telecom agent için detaylı insights"""
    try:
        insights = telecom_agent_system.get_agent_insights(customer_id)
        
        if not insights:
            raise HTTPException(status_code=404, detail="Telecom agent bulunamadı")
        
        return {
            "success": True,
            "insights": insights
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Telecom agent insights hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Telecom agent insights hatası: {str(e)}")

@router.post("/bulk-create-telecom-agents")
async def bulk_create_telecom_agents(
    agents_data: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user)
):
    """Toplu telecom agent oluşturur"""
    try:
        created_agents = []
        errors = []
        
        for agent_data in agents_data:
            try:
                agent = telecom_agent_system.create_telecom_agent(
                    customer_id=agent_data['customer_id'],
                    service_type=agent_data['service_type'],
                    features=agent_data['features']
                )
                created_agents.append({
                    'customer_id': agent.customer_id,
                    'service_type': agent.service_type.value,
                    'segment': agent.segment.value
                })
            except Exception as e:
                errors.append({
                    "customer_id": agent_data.get('customer_id', 'unknown'),
                    "error": str(e)
                })
        
        return {
            "success": True,
            "created_agents": len(created_agents),
            "errors": len(errors),
            "created_agent_details": created_agents,
            "error_details": errors
        }
        
    except Exception as e:
        logger.error(f"Toplu telecom agent oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Toplu telecom agent oluşturma hatası: {str(e)}")

@router.get("/market-conditions")
async def get_telecom_market_conditions(
    current_user: User = Depends(get_current_user)
):
    """Telekomünikasyon pazar koşullarını getirir"""
    try:
        conditions = telecom_agent_system.market_conditions
        
        return {
            "success": True,
            "market_conditions": {
                "competitor_pressure": conditions.competitor_pressure,
                "economic_conditions": conditions.economic_conditions,
                "technology_trends": conditions.technology_trends,
                "regulatory_changes": conditions.regulatory_changes,
                "seasonal_factors": conditions.seasonal_factors,
                "network_quality": conditions.network_quality,
                "price_competition": conditions.price_competition,
                "service_innovation": conditions.service_innovation,
                "customer_expectations": conditions.customer_expectations
            }
        }
        
    except Exception as e:
        logger.error(f"Pazar koşulları getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pazar koşulları getirme hatası: {str(e)}")

@router.post("/update-telecom-market-conditions")
async def update_telecom_market_conditions(
    market_conditions: Dict[str, float],
    current_user: User = Depends(get_current_user)
):
    """Telekomünikasyon pazar koşullarını günceller"""
    try:
        # Pazar koşullarını güncelle
        for key, value in market_conditions.items():
            if hasattr(telecom_agent_system.market_conditions, key):
                setattr(telecom_agent_system.market_conditions, key, value)
        
        return {
            "success": True,
            "message": "Telecom pazar koşulları güncellendi",
            "updated_conditions": market_conditions
        }
        
    except Exception as e:
        logger.error(f"Pazar koşulları güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Pazar koşulları güncelleme hatası: {str(e)}")

@router.get("/service-specific-interventions")
async def get_service_specific_interventions(
    current_user: User = Depends(get_current_user)
):
    """Servis türüne özel müdahale türlerini getirir"""
    try:
        interventions = {
            "Postpaid": [
                {"type": "satisfaction_boost", "description": "Memnuniyet artırma", "max_value": 2.0},
                {"type": "price_discount", "description": "Fiyat indirimi", "max_value": 0.3},
                {"type": "service_improvement", "description": "Hizmet iyileştirme", "max_value": 1.5},
                {"type": "loyalty_program", "description": "Sadakat programı", "max_value": 0.2}
            ],
            "Prepaid": [
                {"type": "satisfaction_boost", "description": "Memnuniyet artırma", "max_value": 2.0},
                {"type": "price_discount", "description": "Fiyat indirimi", "max_value": 0.4},
                {"type": "top_up_bonus", "description": "Yükleme bonusu", "max_value": 0.3},
                {"type": "loyalty_program", "description": "Sadakat programı", "max_value": 0.2}
            ],
            "Broadband": [
                {"type": "satisfaction_boost", "description": "Memnuniyet artırma", "max_value": 2.0},
                {"type": "price_discount", "description": "Fiyat indirimi", "max_value": 0.2},
                {"type": "speed_upgrade", "description": "Hız yükseltme", "max_value": 1.0},
                {"type": "service_improvement", "description": "Hizmet iyileştirme", "max_value": 1.5}
            ]
        }
        
        return {
            "success": True,
            "interventions": interventions
        }
        
    except Exception as e:
        logger.error(f"Müdahale türleri getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Müdahale türleri getirme hatası: {str(e)}")

@router.get("/network-analysis")
async def get_telecom_network_analysis(
    current_user: User = Depends(get_current_user)
):
    """Telecom sosyal ağ analizi"""
    try:
        network = telecom_agent_system.social_network
        
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
        
        # Servis türüne göre etki analizi
        service_influence = {}
        for service_type in ServiceType:
            service_agents = [agent for agent in telecom_agent_system.agents.values() 
                            if agent.service_type == service_type]
            if service_agents:
                avg_influence = sum(agent.social_influence for agent in service_agents) / len(service_agents)
                service_influence[service_type.value] = {
                    'average_influence': avg_influence,
                    'high_influence_count': len([a for a in service_agents if a.social_influence > 0.7])
                }
        
        return {
            "success": True,
            "network_metrics": metrics,
            "top_influencers": [
                {"customer_id": customer_id, "centrality": centrality, "service_type": telecom_agent_system.agents.get(customer_id, {}).service_type.value if customer_id in telecom_agent_system.agents else "Unknown"}
                for customer_id, centrality in top_influencers
            ],
            "service_influence_analysis": service_influence
        }
        
    except Exception as e:
        logger.error(f"Ağ analizi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ağ analizi hatası: {str(e)}")

@router.get("/simulation-history")
async def get_telecom_simulation_history(
    customer_id: Optional[str] = None,
    service_type: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Telecom simülasyon geçmişini getirir"""
    try:
        if customer_id:
            if customer_id not in telecom_agent_system.agents:
                raise HTTPException(status_code=404, detail="Agent bulunamadı")
            
            agent = telecom_agent_system.agents[customer_id]
            return {
                "success": True,
                "customer_id": customer_id,
                "service_type": agent.service_type.value,
                "decision_history": agent.decision_history,
                "last_decision": agent.last_decision.value if agent.last_decision else None
            }
        else:
            # Filtreleme
            all_history = {}
            for customer_id, agent in telecom_agent_system.agents.items():
                if service_type and agent.service_type.value != service_type:
                    continue
                
                all_history[customer_id] = {
                    "service_type": agent.service_type.value,
                    "segment": agent.segment.value,
                    "decision_history": agent.decision_history,
                    "last_decision": agent.last_decision.value if agent.last_decision else None
                }
            
            return {
                "success": True,
                "filtered_by_service_type": service_type,
                "all_agents_history": all_history
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Simülasyon geçmişi hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Simülasyon geçmişi hatası: {str(e)}")

@router.post("/simulate-time-series-demo")
async def simulate_time_series_demo(
    request: Dict[str, Any]
):
    """Demo zaman serisi simülasyonu - authentication gerektirmez"""
    try:
        steps = request.get('steps', 10)
        intervention_schedule = request.get('intervention_schedule', {})
        
        # Tüm agent'ları al
        target_customers = list(telecom_agent_system.agents.keys())
        
        if not target_customers:
            return {
                "success": False,
                "message": "Henüz agent yüklenmemiş"
            }
        
        # Zaman serisi simülasyonu
        simulation_steps = []
        
        for step in range(1, steps + 1):
            # Bu adımda müdahale var mı?
            current_intervention = intervention_schedule.get(step, None)
            
            # Simülasyon çalıştır
            results = telecom_agent_system.simulate_collective_effects_by_service(
                target_customers, 
                current_intervention
            )
            
            # Adım sonuçlarını kaydet
            step_result = {
                "step": step,
                "intervention": current_intervention,
                "collective_metrics": results.get('collective_metrics', {}),
                "individual_decisions": results.get('individual_decisions', [])[:10],  # İlk 10 karar
                "timestamp": f"Adım {step}"
            }
            
            simulation_steps.append(step_result)
            
            # Pazar koşullarını güncelle (dinamik)
            telecom_agent_system._update_dynamic_market_conditions()
        
        return {
            "success": True,
            "simulation_steps": simulation_steps,
            "total_steps": steps,
            "intervention_schedule": intervention_schedule,
            "final_results": simulation_steps[-1] if simulation_steps else {}
        }
        
    except Exception as e:
        logger.error(f"Demo zaman serisi simülasyonu hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo zaman serisi simülasyonu hatası: {str(e)}")
