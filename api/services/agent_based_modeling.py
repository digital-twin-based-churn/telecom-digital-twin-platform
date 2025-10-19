# agent_based_modeling.py - Agent-Based Modeling Sistemi
# -----------------------------------------------------
# Bireysel müşteri kararlarının toplu etkilerini analiz eden sistem

import numpy as np
import pandas as pd
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum
import networkx as nx
from collections import defaultdict
import random

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomerSegment(Enum):
    PREMIUM = "PREMIUM"
    STANDARD = "STANDARD"
    BASIC = "BASIC"
    BUDGET = "BUDGET"

class DecisionType(Enum):
    CHURN = "CHURN"
    UPGRADE = "UPGRADE"
    DOWNGRADE = "DOWNGRADE"
    STAY = "STAY"
    SWITCH_PROVIDER = "SWITCH_PROVIDER"

@dataclass
class SocialNetworkNode:
    """Sosyal ağ düğümü - müşteri ve bağlantıları"""
    customer_id: str
    segment: CustomerSegment
    influence_score: float  # Etki gücü (0-1)
    susceptibility: float  # Dış etkilere açıklık (0-1)
    connections: List[str]  # Bağlı olduğu müşteri ID'leri
    social_media_activity: float  # Sosyal medya aktivitesi
    word_of_mouth_potential: float  # Ağızdan ağıza yayma potansiyeli

@dataclass
class MarketCondition:
    """Pazar koşulları"""
    competitor_pressure: float  # Rekabet baskısı (0-1)
    economic_conditions: float  # Ekonomik koşullar (0-1)
    technology_trends: float  # Teknoloji trendleri (0-1)
    regulatory_changes: float  # Düzenleyici değişiklikler (0-1)
    seasonal_factors: float  # Mevsimsel faktörler (0-1)

@dataclass
class CustomerAgent:
    """Müşteri agent'ı - aktif karar verici"""
    customer_id: str
    segment: CustomerSegment
    current_satisfaction: float
    price_sensitivity: float
    service_quality_expectation: float
    loyalty_score: float
    social_influence: float
    decision_history: List[Dict[str, Any]]
    last_decision: Optional[DecisionType] = None
    decision_timestamp: Optional[datetime] = None

class AgentBasedModelingSystem:
    """Agent-Based Modeling Sistemi"""
    
    def __init__(self):
        self.agents: Dict[str, CustomerAgent] = {}
        self.social_network: nx.Graph = nx.Graph()
        self.market_conditions = MarketCondition(
            competitor_pressure=0.5,
            economic_conditions=0.5,
            technology_trends=0.5,
            regulatory_changes=0.5,
            seasonal_factors=0.5
        )
        self.decision_weights = self._initialize_decision_weights()
        self.simulation_results = []
        
    def _initialize_decision_weights(self) -> Dict[str, float]:
        """Karar verme ağırlıklarını başlatır"""
        return {
            'satisfaction': 0.3,
            'price_sensitivity': 0.25,
            'social_influence': 0.2,
            'loyalty': 0.15,
            'market_conditions': 0.1
        }
    
    def create_customer_agent(self, customer_id: str, segment: CustomerSegment,
                           satisfaction: float, price_sensitivity: float,
                           service_quality_expectation: float) -> CustomerAgent:
        """Müşteri agent'ı oluşturur"""
        agent = CustomerAgent(
            customer_id=customer_id,
            segment=segment,
            current_satisfaction=satisfaction,
            price_sensitivity=price_sensitivity,
            service_quality_expectation=service_quality_expectation,
            loyalty_score=self._calculate_initial_loyalty(segment, satisfaction),
            social_influence=random.uniform(0.1, 0.9),
            decision_history=[],
            last_decision=None,
            decision_timestamp=None
        )
        
        self.agents[customer_id] = agent
        self.social_network.add_node(customer_id)
        
        return agent
    
    def _calculate_initial_loyalty(self, segment: CustomerSegment, satisfaction: float) -> float:
        """Segment ve memnuniyete göre başlangıç sadakat skoru"""
        base_loyalty = {
            CustomerSegment.PREMIUM: 0.8,
            CustomerSegment.STANDARD: 0.6,
            CustomerSegment.BASIC: 0.4,
            CustomerSegment.BUDGET: 0.3
        }
        
        satisfaction_factor = satisfaction / 10.0  # 0-1 arası
        return min(1.0, base_loyalty[segment] + satisfaction_factor * 0.2)
    
    def create_social_connections(self, customer_id: str, connections: List[str]):
        """Sosyal bağlantılar oluşturur"""
        for connection_id in connections:
            if connection_id in self.agents:
                self.social_network.add_edge(customer_id, connection_id)
    
    def update_market_conditions(self, **kwargs):
        """Pazar koşullarını günceller"""
        for key, value in kwargs.items():
            if hasattr(self.market_conditions, key):
                setattr(self.market_conditions, key, value)
    
    def simulate_individual_decision(self, customer_id: str, 
                                   intervention: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Bireysel müşteri kararını simüle eder"""
        if customer_id not in self.agents:
            raise ValueError(f"Agent bulunamadı: {customer_id}")
        
        agent = self.agents[customer_id]
        
        # Müdahale varsa etkileri uygula
        if intervention:
            agent = self._apply_intervention(agent, intervention)
        
        # Karar faktörlerini hesapla
        decision_factors = self._calculate_decision_factors(agent)
        
        # Karar ver
        decision = self._make_decision(agent, decision_factors)
        
        # Kararı kaydet
        decision_record = {
            'customer_id': customer_id,
            'decision': decision.value,
            'timestamp': datetime.now().isoformat(),
            'factors': decision_factors,
            'intervention': intervention
        }
        
        agent.decision_history.append(decision_record)
        agent.last_decision = decision
        agent.last_decision_timestamp = datetime.now()
        
        return decision_record
    
    def _apply_intervention(self, agent: CustomerAgent, intervention: Dict[str, Any]) -> CustomerAgent:
        """Müdahale etkilerini uygular"""
        intervention_type = intervention.get('type')
        intervention_value = intervention.get('value', 0)
        
        if intervention_type == 'satisfaction_boost':
            agent.current_satisfaction = min(10.0, agent.current_satisfaction + intervention_value)
        elif intervention_type == 'price_discount':
            agent.price_sensitivity = max(0.0, agent.price_sensitivity - intervention_value)
        elif intervention_type == 'service_improvement':
            agent.service_quality_expectation = min(10.0, agent.service_quality_expectation + intervention_value)
        elif intervention_type == 'loyalty_program':
            agent.loyalty_score = min(1.0, agent.loyalty_score + intervention_value)
        
        return agent
    
    def _calculate_decision_factors(self, agent: CustomerAgent) -> Dict[str, float]:
        """Karar faktörlerini hesaplar"""
        # Temel faktörler
        satisfaction_factor = agent.current_satisfaction / 10.0
        price_factor = 1.0 - agent.price_sensitivity  # Düşük fiyat hassasiyeti = yüksek faktör
        loyalty_factor = agent.loyalty_score
        
        # Sosyal etki faktörü
        social_factor = self._calculate_social_influence(agent.customer_id)
        
        # Pazar koşulları faktörü
        market_factor = self._calculate_market_influence()
        
        return {
            'satisfaction': satisfaction_factor,
            'price_sensitivity': price_factor,
            'loyalty': loyalty_factor,
            'social_influence': social_factor,
            'market_conditions': market_factor
        }
    
    def _calculate_social_influence(self, customer_id: str) -> float:
        """Sosyal etki faktörünü hesaplar"""
        if customer_id not in self.social_network:
            return 0.0
        
        neighbors = list(self.social_network.neighbors(customer_id))
        if not neighbors:
            return 0.0
        
        # Komşuların kararlarını analiz et
        churn_influence = 0.0
        upgrade_influence = 0.0
        
        for neighbor_id in neighbors:
            if neighbor_id in self.agents:
                neighbor = self.agents[neighbor_id]
                if neighbor.last_decision == DecisionType.CHURN:
                    churn_influence += neighbor.social_influence
                elif neighbor.last_decision == DecisionType.UPGRADE:
                    upgrade_influence += neighbor.social_influence
        
        # Net sosyal etki
        net_influence = upgrade_influence - churn_influence
        return max(-1.0, min(1.0, net_influence / len(neighbors)))
    
    def _calculate_market_influence(self) -> float:
        """Pazar koşulları etkisini hesaplar"""
        # Rekabet baskısı (negatif etki)
        competitor_effect = -self.market_conditions.competitor_pressure
        
        # Ekonomik koşullar
        economic_effect = self.market_conditions.economic_conditions * 0.5
        
        # Teknoloji trendleri (pozitif etki)
        tech_effect = self.market_conditions.technology_trends * 0.3
        
        return competitor_effect + economic_effect + tech_effect
    
    def _make_decision(self, agent: CustomerAgent, factors: Dict[str, float]) -> DecisionType:
        """Karar verir"""
        # Ağırlıklı skor hesapla
        decision_score = 0.0
        for factor, value in factors.items():
            weight = self.decision_weights.get(factor, 0.0)
            decision_score += weight * value
        
        # Karar eşikleri
        if decision_score < -0.3:
            return DecisionType.CHURN
        elif decision_score < -0.1:
            return DecisionType.SWITCH_PROVIDER
        elif decision_score > 0.3:
            return DecisionType.UPGRADE
        elif decision_score > 0.1:
            return DecisionType.STAY
        else:
            return DecisionType.STAY
    
    def simulate_collective_effects(self, target_customers: List[str],
                                  intervention: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Toplu etkileri simüle eder"""
        results = {
            'individual_decisions': [],
            'collective_metrics': {},
            'network_effects': {},
            'market_impact': {}
        }
        
        # Bireysel kararları simüle et
        for customer_id in target_customers:
            if customer_id in self.agents:
                decision = self.simulate_individual_decision(customer_id, intervention)
                results['individual_decisions'].append(decision)
        
        # Toplu metrikleri hesapla
        results['collective_metrics'] = self._calculate_collective_metrics(results['individual_decisions'])
        
        # Ağ etkilerini analiz et
        results['network_effects'] = self._analyze_network_effects(target_customers)
        
        # Pazar etkisini hesapla
        results['market_impact'] = self._calculate_market_impact(results['individual_decisions'])
        
        return results
    
    def _calculate_collective_metrics(self, decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Toplu metrikleri hesaplar"""
        total_customers = len(decisions)
        if total_customers == 0:
            return {}
        
        decision_counts = defaultdict(int)
        for decision in decisions:
            decision_counts[decision['decision']] += 1
        
        return {
            'total_customers': total_customers,
            'churn_rate': decision_counts['CHURN'] / total_customers,
            'upgrade_rate': decision_counts['UPGRADE'] / total_customers,
            'retention_rate': decision_counts['STAY'] / total_customers,
            'switch_rate': decision_counts['SWITCH_PROVIDER'] / total_customers,
            'decision_distribution': dict(decision_counts)
        }
    
    def _analyze_network_effects(self, target_customers: List[str]) -> Dict[str, Any]:
        """Ağ etkilerini analiz eder"""
        network_metrics = {
            'connected_components': nx.number_connected_components(self.social_network),
            'average_clustering': nx.average_clustering(self.social_network),
            'network_density': nx.density(self.social_network),
            'influence_cascade': self._analyze_influence_cascade(target_customers)
        }
        
        return network_metrics
    
    def _analyze_influence_cascade(self, target_customers: List[str]) -> Dict[str, Any]:
        """Etki kaskadını analiz eder"""
        cascade_effects = {
            'primary_influencers': [],
            'secondary_effects': [],
            'cascade_depth': 0
        }
        
        # Birincil etki yaratan müşteriler
        for customer_id in target_customers:
            if customer_id in self.agents:
                agent = self.agents[customer_id]
                if agent.social_influence > 0.7:  # Yüksek etki gücü
                    cascade_effects['primary_influencers'].append({
                        'customer_id': customer_id,
                        'influence_score': agent.social_influence,
                        'decision': agent.last_decision.value if agent.last_decision else None
                    })
        
        return cascade_effects
    
    def _calculate_market_impact(self, decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Pazar etkisini hesaplar"""
        churn_count = sum(1 for d in decisions if d['decision'] == 'CHURN')
        upgrade_count = sum(1 for d in decisions if d['decision'] == 'UPGRADE')
        
        return {
            'revenue_impact': (upgrade_count - churn_count) * 50,  # Örnek hesaplama
            'market_share_change': (upgrade_count - churn_count) / len(decisions),
            'competitive_position': self._assess_competitive_position(decisions)
        }
    
    def _assess_competitive_position(self, decisions: List[Dict[str, Any]]) -> str:
        """Rekabetçi pozisyonu değerlendirir"""
        churn_rate = sum(1 for d in decisions if d['decision'] == 'CHURN') / len(decisions)
        upgrade_rate = sum(1 for d in decisions if d['decision'] == 'UPGRADE') / len(decisions)
        
        if churn_rate > 0.3:
            return "WEAK"
        elif upgrade_rate > 0.2:
            return "STRONG"
        else:
            return "STABLE"
    
    def run_multi_step_simulation(self, steps: int = 10, 
                                intervention_schedule: Optional[Dict[int, Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
        """Çok adımlı simülasyon çalıştırır"""
        simulation_results = []
        
        for step in range(steps):
            step_results = {
                'step': step,
                'timestamp': datetime.now().isoformat(),
                'market_conditions': asdict(self.market_conditions),
                'agent_decisions': []
            }
            
            # Her adımda tüm agent'ların kararlarını simüle et
            for customer_id, agent in self.agents.items():
                # Müdahale varsa uygula
                intervention = intervention_schedule.get(step) if intervention_schedule else None
                
                decision = self.simulate_individual_decision(customer_id, intervention)
                step_results['agent_decisions'].append(decision)
            
            # Pazar koşullarını güncelle (rastgele değişiklikler)
            self._update_market_conditions_dynamically()
            
            simulation_results.append(step_results)
        
        return simulation_results
    
    def _update_market_conditions_dynamically(self):
        """Pazar koşullarını dinamik olarak günceller"""
        # Rastgele değişiklikler (gerçek uygulamada dış veri kaynaklarından gelecek)
        self.market_conditions.competitor_pressure += random.uniform(-0.1, 0.1)
        self.market_conditions.economic_conditions += random.uniform(-0.05, 0.05)
        self.market_conditions.technology_trends += random.uniform(-0.02, 0.02)
        
        # Sınırları koru
        for attr in ['competitor_pressure', 'economic_conditions', 'technology_trends', 
                    'regulatory_changes', 'seasonal_factors']:
            value = getattr(self.market_conditions, attr)
            setattr(self.market_conditions, attr, max(0.0, min(1.0, value)))
    
    def get_agent_insights(self, customer_id: str) -> Dict[str, Any]:
        """Agent için detaylı insights"""
        if customer_id not in self.agents:
            return {}
        
        agent = self.agents[customer_id]
        
        return {
            'customer_id': customer_id,
            'segment': agent.segment.value,
            'current_satisfaction': agent.current_satisfaction,
            'loyalty_score': agent.loyalty_score,
            'social_influence': agent.social_influence,
            'decision_history': agent.decision_history[-5:],  # Son 5 karar
            'last_decision': agent.last_decision.value if agent.last_decision else None,
            'network_connections': len(list(self.social_network.neighbors(customer_id))),
            'influence_potential': self._calculate_influence_potential(customer_id)
        }
    
    def _calculate_influence_potential(self, customer_id: str) -> float:
        """Etki potansiyelini hesaplar"""
        if customer_id not in self.agents:
            return 0.0
        
        agent = self.agents[customer_id]
        connections = list(self.social_network.neighbors(customer_id))
        
        if not connections:
            return 0.0
        
        # Sosyal ağ merkeziyeti
        centrality = nx.degree_centrality(self.social_network).get(customer_id, 0.0)
        
        # Agent'ın kendi etki gücü
        agent_influence = agent.social_influence
        
        return (centrality + agent_influence) / 2.0
