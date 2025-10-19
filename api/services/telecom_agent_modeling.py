# telecom_agent_modeling.py - Telekomünikasyon Servis Türü Özel Agent-Based Modeling
# -----------------------------------------------------------------------------------
# 3 servis türü için özelleştirilmiş agent-based modeling sistemi

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

class ServiceType(Enum):
    POSTPAID = "Postpaid"
    PREPAID = "Prepaid"
    BROADBAND = "Broadband"

class TelecomCustomerSegment(Enum):
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
    TOP_UP = "TOP_UP"  # Prepaid özel
    SERVICE_UPGRADE = "SERVICE_UPGRADE"  # Broadband özel

@dataclass
class TelecomCustomerFeatures:
    """Telekomünikasyon müşteri özellikleri - servis türüne göre"""
    customer_id: str
    service_type: ServiceType
    
    # Temel özellikler (tüm servis türleri)
    age: Optional[int] = None
    tenure: Optional[int] = None
    avg_call_duration: Optional[float] = None
    data_usage: Optional[float] = None
    monthly_charge: Optional[float] = None
    overdue_payments: Optional[int] = None
    auto_payment: Optional[bool] = None
    call_drops: Optional[int] = None
    customer_support_calls: Optional[int] = None
    satisfaction_score: Optional[float] = None
    apps: Optional[List[str]] = None
    
    # Prepaid özel özellikler
    avg_top_up_count: Optional[int] = None
    roaming_usage: Optional[float] = None
    
    # Engineered features
    apps_count: Optional[int] = None
    overdue_ratio: Optional[float] = None
    support_calls_rate: Optional[float] = None
    charge_per_gb: Optional[float] = None
    drops_per_min: Optional[float] = None
    usage_per_tenure: Optional[float] = None
    charge_per_tenure: Optional[float] = None
    has_overdue_flag: Optional[float] = None
    satisfaction_low: Optional[float] = None
    has_any_app: Optional[float] = None
    
    # Prepaid özel engineered features
    top_up_rate: Optional[float] = None
    frequent_top_up: Optional[float] = None
    has_roaming: Optional[float] = None
    
    # Broadband özel engineered features
    high_usage: Optional[float] = None

@dataclass
class TelecomMarketCondition:
    """Telekomünikasyon pazar koşulları"""
    competitor_pressure: float  # Rekabet baskısı (0-1)
    economic_conditions: float  # Ekonomik koşullar (0-1)
    technology_trends: float  # Teknoloji trendleri (0-1)
    regulatory_changes: float  # Düzenleyici değişiklikler (0-1)
    seasonal_factors: float  # Mevsimsel faktörler (0-1)
    
    # Telekomünikasyon özel faktörler
    network_quality: float  # Ağ kalitesi (0-1)
    price_competition: float  # Fiyat rekabeti (0-1)
    service_innovation: float  # Hizmet inovasyonu (0-1)
    customer_expectations: float  # Müşteri beklentileri (0-1)

class TelecomCustomerAgent:
    """Telekomünikasyon müşteri agent'ı - servis türüne özel"""
    
    def __init__(self, customer_id: str, service_type: ServiceType, features: TelecomCustomerFeatures):
        self.customer_id = customer_id
        self.service_type = service_type
        self.features = features
        self.segment = self._determine_segment()
        
        # Agent özellikleri
        self.current_satisfaction = features.satisfaction_score or 5.0
        self.price_sensitivity = self._calculate_price_sensitivity()
        self.service_quality_expectation = self._calculate_service_expectation()
        self.loyalty_score = self._calculate_initial_loyalty()
        self.social_influence = random.uniform(0.1, 0.9)
        
        # Karar geçmişi
        self.decision_history: List[Dict[str, Any]] = []
        self.last_decision: Optional[DecisionType] = None
        self.decision_timestamp: Optional[datetime] = None
        
        # Servis türü özel ağırlıklar
        self.decision_weights = self._get_service_specific_weights()
        
    def _determine_segment(self) -> TelecomCustomerSegment:
        """Servis türü ve özelliklere göre segment belirle"""
        if self.service_type == ServiceType.POSTPAID:
            if self.features.monthly_charge and self.features.monthly_charge > 100:
                return TelecomCustomerSegment.PREMIUM
            elif self.features.monthly_charge and self.features.monthly_charge > 50:
                return TelecomCustomerSegment.STANDARD
            else:
                return TelecomCustomerSegment.BASIC
        elif self.service_type == ServiceType.PREPAID:
            if self.features.avg_top_up_count and self.features.avg_top_up_count > 5:
                return TelecomCustomerSegment.STANDARD
            else:
                return TelecomCustomerSegment.BASIC
        else:  # BROADBAND
            if self.features.data_usage and self.features.data_usage > 50:
                return TelecomCustomerSegment.PREMIUM
            elif self.features.data_usage and self.features.data_usage > 20:
                return TelecomCustomerSegment.STANDARD
            else:
                return TelecomCustomerSegment.BASIC
    
    def _calculate_price_sensitivity(self) -> float:
        """Fiyat hassasiyetini hesapla"""
        base_sensitivity = 0.5
        
        # Segment etkisi
        if self.segment == TelecomCustomerSegment.PREMIUM:
            base_sensitivity -= 0.2
        elif self.segment == TelecomCustomerSegment.BUDGET:
            base_sensitivity += 0.3
        
        # Servis türü etkisi
        if self.service_type == ServiceType.PREPAID:
            base_sensitivity += 0.1  # Prepaid müşteriler daha fiyat hassas
        
        return max(0.0, min(1.0, base_sensitivity))
    
    def _calculate_service_expectation(self) -> float:
        """Hizmet kalitesi beklentisini hesapla"""
        base_expectation = 7.0
        
        # Segment etkisi
        if self.segment == TelecomCustomerSegment.PREMIUM:
            base_expectation += 1.5
        elif self.segment == TelecomCustomerSegment.BUDGET:
            base_expectation -= 1.0
        
        # Servis türü etkisi
        if self.service_type == ServiceType.BROADBAND:
            base_expectation += 0.5  # Broadband müşteriler yüksek kalite bekler
        
        return max(1.0, min(10.0, base_expectation))
    
    def _calculate_initial_loyalty(self) -> float:
        """Başlangıç sadakat skorunu hesapla"""
        base_loyalty = {
            TelecomCustomerSegment.PREMIUM: 0.8,
            TelecomCustomerSegment.STANDARD: 0.6,
            TelecomCustomerSegment.BASIC: 0.4,
            TelecomCustomerSegment.BUDGET: 0.3
        }
        
        loyalty = base_loyalty[self.segment]
        
        # Tenure etkisi
        if self.features.tenure and self.features.tenure > 24:
            loyalty += 0.1
        elif self.features.tenure and self.features.tenure < 6:
            loyalty -= 0.1
        
        # Satisfaction etkisi
        if self.features.satisfaction_score:
            loyalty += (self.features.satisfaction_score - 5.0) * 0.05
        
        return max(0.0, min(1.0, loyalty))
    
    def _get_service_specific_weights(self) -> Dict[str, float]:
        """Servis türüne özel karar ağırlıkları"""
        if self.service_type == ServiceType.POSTPAID:
            return {
                'satisfaction': 0.3,
                'price_sensitivity': 0.25,
                'loyalty': 0.2,
                'social_influence': 0.15,
                'market_conditions': 0.1
            }
        elif self.service_type == ServiceType.PREPAID:
            return {
                'satisfaction': 0.25,
                'price_sensitivity': 0.35,  # Prepaid'de fiyat daha önemli
                'loyalty': 0.15,
                'social_influence': 0.15,
                'market_conditions': 0.1
            }
        else:  # BROADBAND
            return {
                'satisfaction': 0.35,  # Broadband'de memnuniyet daha önemli
                'price_sensitivity': 0.2,
                'loyalty': 0.25,
                'social_influence': 0.1,
                'market_conditions': 0.1
            }
    
    def calculate_decision_factors(self, social_influence: float, market_influence: float) -> Dict[str, float]:
        """Karar faktörlerini hesapla - Daha pozitif"""
        # Normalizasyon: -1 ile +1 arası (daha pozitif)
        satisfaction_norm = (self.current_satisfaction - 6.0) / 4.0  # Daha pozitif satisfaction
        loyalty_norm = (self.loyalty_score - 0.6) * 2.5  # Daha pozitif loyalty
        price_norm = (self.price_sensitivity - 0.5) * -1.5  # Daha az negatif price sensitivity
        
        return {
            'satisfaction': satisfaction_norm,
            'price_sensitivity': price_norm,
            'loyalty': loyalty_norm,
            'social_influence': social_influence,
            'market_conditions': market_influence
        }
    
    def make_decision(self, factors: Dict[str, float]) -> DecisionType:
        """Karar ver"""
        # Ağırlıklı skor hesapla
        decision_score = 0.0
        for factor, value in factors.items():
            weight = self.decision_weights.get(factor, 0.0)
            decision_score += weight * value
        
        
        # Servis türüne özel karar eşikleri
        if self.service_type == ServiceType.POSTPAID:
            return self._postpaid_decision(decision_score)
        elif self.service_type == ServiceType.PREPAID:
            return self._prepaid_decision(decision_score)
        else:  # BROADBAND
            return self._broadband_decision(decision_score)
    
    def _postpaid_decision(self, score: float) -> DecisionType:
        """Postpaid karar mantığı - Gerçekçi eşikler"""
        if score < -0.3:  # Çok düşük skor
            return DecisionType.CHURN
        elif score < -0.1:  # Düşük skor
            return DecisionType.SWITCH_PROVIDER
        elif score > 0.4:  # Yüksek skor
            return DecisionType.UPGRADE
        else:
            return DecisionType.STAY
    
    def _prepaid_decision(self, score: float) -> DecisionType:
        """Prepaid karar mantığı - Gerçekçi eşikler"""
        if score < -0.4:  # Çok düşük skor (Prepaid daha hassas)
            return DecisionType.CHURN
        elif score < -0.2:  # Düşük skor
            return DecisionType.SWITCH_PROVIDER
        elif score > 0.3:  # Yüksek skor
            return DecisionType.TOP_UP
        else:
            return DecisionType.STAY
    
    def _broadband_decision(self, score: float) -> DecisionType:
        """Broadband karar mantığı - Gerçekçi eşikler"""
        if score < -0.2:  # Düşük skor (Broadband daha stabil)
            return DecisionType.CHURN
        elif score < 0.0:  # Orta skor
            return DecisionType.SWITCH_PROVIDER
        elif score > 0.5:  # Yüksek skor
            return DecisionType.SERVICE_UPGRADE
        else:
            return DecisionType.STAY

class TelecomAgentBasedModelingSystem:
    """Telekomünikasyon Agent-Based Modeling Sistemi"""
    
    def __init__(self):
        self.agents: Dict[str, TelecomCustomerAgent] = {}
        self.social_network: nx.Graph = nx.Graph()
        self.market_conditions = TelecomMarketCondition(
            competitor_pressure=0.5,
            economic_conditions=0.5,
            technology_trends=0.5,
            regulatory_changes=0.5,
            seasonal_factors=0.5,
            network_quality=0.7,
            price_competition=0.6,
            service_innovation=0.5,
            customer_expectations=0.6
        )
        self.simulation_results = []
        
    def create_telecom_agent(self, customer_id: str, service_type: str, 
                           features: Dict[str, Any]) -> TelecomCustomerAgent:
        """Telekomünikasyon agent'ı oluşturur"""
        try:
            service_enum = ServiceType(service_type)
            
            # Features'ları TelecomCustomerFeatures'a dönüştür
            telecom_features = self._convert_to_telecom_features(customer_id, service_enum, features)
            
            # Agent oluştur
            agent = TelecomCustomerAgent(customer_id, service_enum, telecom_features)
            
            self.agents[customer_id] = agent
            self.social_network.add_node(customer_id)
            
            logger.info(f"Telecom agent oluşturuldu: {customer_id} ({service_type})")
            return agent
            
        except Exception as e:
            logger.error(f"Telecom agent oluşturma hatası: {str(e)}")
            raise
    
    def _convert_to_telecom_features(self, customer_id: str, service_type: ServiceType, 
                                   features: Dict[str, Any]) -> TelecomCustomerFeatures:
        """Dict'ten TelecomCustomerFeatures'a dönüştür"""
        return TelecomCustomerFeatures(
            customer_id=customer_id,
            service_type=service_type,
            age=features.get('age'),
            tenure=features.get('tenure'),
            avg_call_duration=features.get('avg_call_duration'),
            data_usage=features.get('data_usage'),
            monthly_charge=features.get('monthly_charge'),
            overdue_payments=features.get('overdue_payments'),
            auto_payment=features.get('auto_payment'),
            call_drops=features.get('call_drops'),
            customer_support_calls=features.get('customer_support_calls'),
            satisfaction_score=features.get('satisfaction_score'),
            apps=features.get('apps', []),
            avg_top_up_count=features.get('avg_top_up_count'),
            roaming_usage=features.get('roaming_usage')
        )
    
    def simulate_service_specific_decision(self, customer_id: str, 
                                        intervention: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Servis türüne özel karar simülasyonu"""
        if customer_id not in self.agents:
            raise ValueError(f"Agent bulunamadı: {customer_id}")
        
        agent = self.agents[customer_id]
        
        # Müdahale varsa uygula
        if intervention:
            agent = self._apply_service_intervention(agent, intervention)
        
        # Sosyal etki hesapla
        social_influence = self._calculate_social_influence(customer_id)
        
        # Pazar etkisi hesapla
        market_influence = self._calculate_market_influence(agent.service_type)
        
        # Karar faktörlerini hesapla
        factors = agent.calculate_decision_factors(social_influence, market_influence)
        
        # Karar ver
        decision = agent.make_decision(factors)
        
        # Kararı kaydet
        decision_record = {
            'customer_id': customer_id,
            'service_type': agent.service_type.value,
            'segment': agent.segment.value,
            'decision': decision.value,
            'timestamp': datetime.now().isoformat(),
            'factors': factors,
            'intervention': intervention
        }
        
        agent.decision_history.append(decision_record)
        agent.last_decision = decision
        agent.last_decision_timestamp = datetime.now()
        
        return decision_record
    
    def _apply_service_intervention(self, agent: TelecomCustomerAgent, 
                                  intervention: Dict[str, Any]) -> TelecomCustomerAgent:
        """Servis türüne özel müdahale uygula"""
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
        elif intervention_type == 'top_up_bonus' and agent.service_type == ServiceType.PREPAID:
            # Prepaid özel müdahale
            agent.loyalty_score = min(1.0, agent.loyalty_score + intervention_value * 0.5)
        elif intervention_type == 'speed_upgrade' and agent.service_type == ServiceType.BROADBAND:
            # Broadband özel müdahale
            agent.service_quality_expectation = min(10.0, agent.service_quality_expectation + intervention_value)
        
        return agent
    
    def add_agent(self, agent: 'TelecomCustomerAgent'):
        """Mevcut agent'ı sisteme ekle"""
        self.agents[agent.customer_id] = agent
        self.social_network.add_node(agent.customer_id, agent=agent)
    
    def _calculate_social_influence(self, customer_id: str) -> float:
        """Sosyal etki faktörünü hesapla"""
        if customer_id not in self.social_network:
            return 0.0
        
        neighbors = list(self.social_network.neighbors(customer_id))
        if not neighbors:
            return 0.0
        
        # Komşuların kararlarını analiz et
        churn_influence = 0.0
        positive_influence = 0.0
        
        for neighbor_id in neighbors:
            if neighbor_id in self.agents:
                neighbor = self.agents[neighbor_id]
                if neighbor.last_decision in [DecisionType.CHURN, DecisionType.SWITCH_PROVIDER]:
                    churn_influence += neighbor.social_influence
                elif neighbor.last_decision in [DecisionType.UPGRADE, DecisionType.TOP_UP, DecisionType.SERVICE_UPGRADE]:
                    positive_influence += neighbor.social_influence
        
        # Net sosyal etki
        net_influence = positive_influence - churn_influence
        return max(-1.0, min(1.0, net_influence / len(neighbors)))
    
    def _calculate_market_influence(self, service_type: ServiceType) -> float:
        """Servis türüne özel pazar etkisi hesapla"""
        base_influence = 0.0
        
        # Genel pazar koşulları
        base_influence -= self.market_conditions.competitor_pressure * 0.3
        base_influence += self.market_conditions.economic_conditions * 0.2
        base_influence += self.market_conditions.technology_trends * 0.2
        
        # Servis türü özel etkiler
        if service_type == ServiceType.POSTPAID:
            base_influence += self.market_conditions.customer_expectations * 0.3
        elif service_type == ServiceType.PREPAID:
            base_influence -= self.market_conditions.price_competition * 0.4
        else:  # BROADBAND
            base_influence += self.market_conditions.service_innovation * 0.3
            base_influence += self.market_conditions.network_quality * 0.2
        
        return max(-1.0, min(1.0, base_influence))
    
    def simulate_collective_effects_by_service(self, target_customers: List[str],
                                             intervention: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Gerçek Agent-Based Modeling - Sosyal etkileşimli toplu simülasyon"""
        import random
        import time
        
        # Sabit random seed - her simülasyonda aynı sonuçlar
        random.seed(42)
        
        results = {
            'individual_decisions': [],
            'service_type_analysis': {},
            'collective_metrics': {},
            'network_effects': {}
        }
        
        # 1. Sosyal ağ bağlantılarını oluştur
        self._create_dynamic_social_network(target_customers)
        
        # 2. Pazar koşullarını güncelle
        self._update_dynamic_market_conditions()
        
        # 3. Agent'ları karar verme sırasına göre sırala (sosyal etki için)
        decision_order = self._determine_decision_order(target_customers)
        
        # 4. Her agent için dinamik karar simülasyonu
        for i, customer_id in enumerate(decision_order):
            if customer_id in self.agents:
                # Sosyal etkiyi hesapla (önceki kararlardan etkilenir)
                social_influence = self._calculate_dynamic_social_influence(customer_id, results['individual_decisions'])
                
                # Pazar etkisi (dinamik)
                market_influence = self._calculate_dynamic_market_influence(customer_id, i, len(target_customers))
                
                # Agent'ın kararını simüle et
                decision = self._simulate_agent_decision_with_social_effects(customer_id, social_influence, market_influence, intervention)
                results['individual_decisions'].append(decision)
        
        # Servis türüne göre analiz
        results['service_type_analysis'] = self._analyze_by_service_type(results['individual_decisions'])
        
        # Toplu metrikler
        results['collective_metrics'] = self._calculate_collective_metrics(results['individual_decisions'])
        
        # Ağ etkileri
        results['network_effects'] = self._analyze_network_effects(target_customers)
        
        return results
    
    def _create_dynamic_social_network(self, target_customers: List[str]):
        """Gerçek telekomünikasyon sosyal ağı oluştur"""
        import random
        
        # Mevcut bağlantıları temizle
        for customer_id in target_customers:
            if customer_id in self.social_network:
                self.social_network.remove_node(customer_id)
        
        # Agent'ları ağa ekle
        for customer_id in target_customers:
            if customer_id in self.agents:
                self.social_network.add_node(customer_id, agent=self.agents[customer_id])
        
        # 1. AİLE AĞI (Family Network) - %30 olasılık
        self._create_family_network(target_customers)
        
        # 2. İŞ AĞI (Work Network) - %25 olasılık  
        self._create_work_network(target_customers)
        
        # 3. YAŞ GRUBU AĞI (Age Network) - %20 olasılık
        self._create_age_network(target_customers)
        
        # 4. SERVİS TÜRÜ AĞI (Service Network) - %15 olasılık
        self._create_service_network(target_customers)
        
        # 5. Rastgele bağlantılar (Random Network) - %10 olasılık
        self._create_random_network(target_customers)
    
    def _create_family_network(self, target_customers: List[str]):
        """Aile ağı oluştur - aynı yaş grubu ve servis türü"""
        import random
        
        for customer_id in target_customers:
            if customer_id not in self.agents:
                continue
                
            agent = self.agents[customer_id]
            
            # Aile üyeleri bul (yaş ±10, aynı servis türü)
            family_members = []
            for other_id in target_customers:
                if other_id != customer_id and other_id in self.agents:
                    other_agent = self.agents[other_id]
                    
                    # Yaş farkı ±10 yıl ve aynı servis türü
                    age_diff = abs(agent.features.age - other_agent.features.age)
                    same_service = agent.service_type == other_agent.service_type
                    
                    if age_diff <= 10 and same_service and random.random() < 0.3:
                        family_members.append(other_id)
            
            # Aile bağlantıları oluştur (güçlü etki)
            for member in family_members[:3]:  # Max 3 aile üyesi
                if member in self.social_network:
                    self.social_network.add_edge(customer_id, member, 
                                               relationship='family', 
                                               influence_strength=0.8)
    
    def _create_work_network(self, target_customers: List[str]):
        """İş ağı oluştur - benzer gelir ve servis türü"""
        import random
        
        for customer_id in target_customers:
            if customer_id not in self.agents:
                continue
                
            agent = self.agents[customer_id]
            
            # İş arkadaşları bul (benzer gelir, aynı servis türü)
            work_colleagues = []
            for other_id in target_customers:
                if other_id != customer_id and other_id in self.agents:
                    other_agent = self.agents[other_id]
                    
                    # Benzer gelir seviyesi (±20%) ve aynı servis türü
                    income_diff = abs(agent.features.monthly_charge - other_agent.features.monthly_charge)
                    avg_income = (agent.features.monthly_charge + other_agent.features.monthly_charge) / 2
                    income_ratio = income_diff / avg_income if avg_income > 0 else 1
                    same_service = agent.service_type == other_agent.service_type
                    
                    if income_ratio <= 0.2 and same_service and random.random() < 0.25:
                        work_colleagues.append(other_id)
            
            # İş bağlantıları oluştur (orta etki)
            for colleague in work_colleagues[:2]:  # Max 2 iş arkadaşı
                if colleague in self.social_network:
                    self.social_network.add_edge(customer_id, colleague, 
                                               relationship='work', 
                                               influence_strength=0.6)
    
    def _create_age_network(self, target_customers: List[str]):
        """Yaş grubu ağı oluştur - benzer yaş ve teknoloji kullanımı"""
        import random
        
        for customer_id in target_customers:
            if customer_id not in self.agents:
                continue
                
            agent = self.agents[customer_id]
            
            # Yaş grubu arkadaşları bul
            age_peers = []
            for other_id in target_customers:
                if other_id != customer_id and other_id in self.agents:
                    other_agent = self.agents[other_id]
                    
                    # Benzer yaş (±5 yıl) ve benzer teknoloji kullanımı
                    age_diff = abs(agent.features.age - other_agent.features.age)
                    tech_similarity = abs(len(agent.features.apps) - len(other_agent.features.apps))
                    
                    if age_diff <= 5 and tech_similarity <= 2 and random.random() < 0.2:
                        age_peers.append(other_id)
            
            # Yaş grubu bağlantıları oluştur (hafif etki)
            for peer in age_peers[:4]:  # Max 4 yaş grubu arkadaşı
                if peer in self.social_network:
                    self.social_network.add_edge(customer_id, peer, 
                                               relationship='age_peer', 
                                               influence_strength=0.4)
    
    def _create_service_network(self, target_customers: List[str]):
        """Servis türü ağı oluştur - aynı servis türündeki müşteriler"""
        import random
        
        for customer_id in target_customers:
            if customer_id not in self.agents:
                continue
                
            agent = self.agents[customer_id]
            
            # Aynı servis türündeki müşteriler
            service_peers = []
            for other_id in target_customers:
                if other_id != customer_id and other_id in self.agents:
                    other_agent = self.agents[other_id]
                    
                    # Aynı servis türü ve benzer kullanım
                    same_service = agent.service_type == other_agent.service_type
                    usage_similarity = abs(agent.features.data_usage - other_agent.features.data_usage)
                    
                    if same_service and usage_similarity <= 5 and random.random() < 0.15:
                        service_peers.append(other_id)
            
            # Servis türü bağlantıları oluştur (orta etki)
            for peer in service_peers[:3]:  # Max 3 servis türü arkadaşı
                if peer in self.social_network:
                    self.social_network.add_edge(customer_id, peer, 
                                               relationship='service_peer', 
                                               influence_strength=0.5)
    
    def _create_random_network(self, target_customers: List[str]):
        """Rastgele bağlantılar oluştur"""
        import random
        
        for customer_id in target_customers:
            if customer_id not in self.agents:
                continue
                
            # Rastgele bağlantılar (zayıf etki)
            num_random = random.randint(0, 2)
            potential_connections = [c for c in target_customers if c != customer_id]
            random_connections = random.sample(potential_connections, 
                                             min(num_random, len(potential_connections)))
            
            for connection in random_connections:
                if connection in self.social_network:
                    self.social_network.add_edge(customer_id, connection, 
                                               relationship='random', 
                                               influence_strength=0.2)
    
    def _update_dynamic_market_conditions(self):
        """Gerçek pazar verilerine dayalı dinamik koşullar"""
        import random
        from datetime import datetime
        
        # Gerçek Türkiye pazar verileri (2024)
        current_month = datetime.now().month
        
        # 1. REKABET BASKISI - Gerçek veriler
        # Türkiye'de 3 ana operatör + yeni girişler
        market_share_turkcell = 0.45  # %45 pazar payı
        market_share_vodafone = 0.30  # %30 pazar payı  
        market_share_turk_telekom = 0.25  # %25 pazar payı
        
        # Rekabet yoğunluğu = 1 - en büyük operatörün payı
        self.market_conditions.competitor_pressure = 1 - market_share_turkcell  # %55 rekabet
        
        # 2. EKONOMİK KOŞULLAR - Gerçek makro veriler
        # Türkiye 2024: GSYİH %3.2, Enflasyon %65, İşsizlik %10.2
        gdp_growth = 3.2
        inflation = 65.0
        unemployment = 10.2
        
        # Ekonomik koşul skoru (0-1 arası)
        economic_score = max(0, min(1, (gdp_growth - inflation/10) / 10))
        self.market_conditions.economic_conditions = economic_score  # %13 (kötü ekonomi)
        
        # 3. TEKNOLOJİ TRENDLERİ - 5G ve IoT verileri
        # Türkiye 5G kapsama: %45, IoT cihaz sayısı: 15M
        g5_coverage = 45.0  # %45
        iot_devices = 15.0  # Milyon cihaz
        technology_score = (g5_coverage * 0.4 + iot_devices * 0.6) / 100
        self.market_conditions.technology_trends = min(1.0, technology_score)  # %27
        
        # 4. AĞ KALİTESİ - Gerçek performans verileri
        # Ortalama hız: 25 Mbps, Kapsama: %95
        avg_speed = 25.0  # Mbps
        coverage = 95.0   # %
        network_score = (avg_speed * 0.3 + coverage * 0.7) / 100
        self.market_conditions.network_quality = min(1.0, network_score)  # %68
        
        # 5. FİYAT REKABETİ - ARPU ve fiyat değişimleri
        # Türkiye ortalama ARPU: 45 TL, Fiyat artışı: %25
        avg_arpu = 45.0  # TL
        price_increase = 25.0  # %
        price_competition = min(1.0, price_increase / 50)  # %50'ye normalize et
        self.market_conditions.price_competition = price_competition  # %50
        
        # 6. SERVİS İNOVASYONU - Yeni servis sayısı
        # Yılda 12 yeni servis, Müşteri memnuniyeti: %72
        new_services = 12  # Yılda
        customer_satisfaction = 72.0  # %
        innovation_score = (new_services * 0.4 + customer_satisfaction * 0.6) / 100
        self.market_conditions.service_innovation = min(1.0, innovation_score)  # %74
        
        # 7. MÜŞTERİ BEKLENTİLERİ - Memnuniyet ve şikayet verileri
        # Memnuniyet: %72, Şikayet oranı: %8
        satisfaction = 72.0  # %
        complaint_rate = 8.0  # %
        expectation_score = (satisfaction - complaint_rate) / 100
        self.market_conditions.customer_expectations = max(0, min(1.0, expectation_score))  # %64
        
        # 8. DÜZENLEYİCİ DEĞİŞİKLİKLER - Yasal güncellemeler
        # Yılda 3 yasal değişiklik, Uyum oranı: %85
        regulatory_changes = 3  # Yılda
        compliance_rate = 85.0  # %
        regulatory_score = (compliance_rate - regulatory_changes * 5) / 100
        self.market_conditions.regulatory_changes = max(0, min(1.0, regulatory_score))  # %70
        
        # 9. MEVSİMSEL FAKTÖRLER - Tatil ve özel günler
        # Yaz tatili (Haziran-Ağustos) ve yılbaşı etkisi
        if current_month in [6, 7, 8]:  # Yaz tatili
            seasonal_factor = 0.8
        elif current_month in [12, 1]:  # Yılbaşı
            seasonal_factor = 0.9
        else:
            seasonal_factor = 0.5
        self.market_conditions.seasonal_factors = seasonal_factor
    
    def _determine_decision_order(self, target_customers: List[str]) -> List[str]:
        """Karar verme sırasını belirle (sosyal etki için)"""
        import random
        
        # Sosyal etki için rastgele sıralama
        return random.sample(target_customers, len(target_customers))
    
    def _calculate_dynamic_social_influence(self, customer_id: str, previous_decisions: List[Dict[str, Any]]) -> float:
        """Gerçek sosyal etki hesapla - ilişki türüne göre"""
        if customer_id not in self.social_network:
            return 0.0
        
        neighbors = list(self.social_network.neighbors(customer_id))
        if not neighbors:
            return 0.0
        
        # İlişki türüne göre sosyal etki
        churn_influence = 0.0
        positive_influence = 0.0
        
        for decision in previous_decisions:
            if decision['customer_id'] in neighbors:
                # İlişki türünü ve etki gücünü al
                edge_data = self.social_network.get_edge_data(customer_id, decision['customer_id'])
                if edge_data:
                    relationship = edge_data.get('relationship', 'random')
                    influence_strength = edge_data.get('influence_strength', 0.2)
                    
                    # İlişki türüne göre etki çarpanı (daha dengeli)
                    if relationship == 'family':
                        multiplier = 0.8  # Aile etkisi orta
                    elif relationship == 'work':
                        multiplier = 0.6  # İş etkisi hafif
                    elif relationship == 'age_peer':
                        multiplier = 0.4  # Yaş grubu etkisi zayıf
                    elif relationship == 'service_peer':
                        multiplier = 0.3  # Servis türü etkisi çok zayıf
                    else:  # random
                        multiplier = 0.2  # Rastgele etkisi minimal
                    
                    # Karar türüne göre etki
                    if decision['decision'] in ['CHURN', 'SWITCH_PROVIDER']:
                        churn_influence += influence_strength * multiplier
                    elif decision['decision'] in ['UPGRADE', 'TOP_UP', 'SERVICE_UPGRADE']:
                        positive_influence += influence_strength * multiplier
        
        # Net sosyal etki
        net_influence = positive_influence - churn_influence
        return max(-1.0, min(1.0, net_influence))
    
    def _calculate_dynamic_market_influence(self, customer_id: str, position: int, total: int) -> float:
        """Dinamik pazar etkisi hesapla"""
        # Pozisyona göre pazar etkisi (erken karar verenler daha etkili)
        position_factor = 1.0 - (position / total) * 0.3
        
        base_influence = self._calculate_market_influence(self.agents[customer_id].service_type)
        return base_influence * position_factor
    
    def _simulate_agent_decision_with_social_effects(self, customer_id: str, social_influence: float, 
                                                   market_influence: float, intervention: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Sosyal etkilerle agent kararını simüle et"""
        agent = self.agents[customer_id]
        
        # Müdahale varsa uygula
        if intervention:
            agent = self._apply_service_intervention(agent, intervention)
        
        # Karar faktörlerini hesapla
        factors = agent.calculate_decision_factors(social_influence, market_influence)
        
        # Karar ver
        decision = agent.make_decision(factors)
        
        # Kararı kaydet
        decision_record = {
            'customer_id': customer_id,
            'service_type': agent.service_type.value,
            'segment': agent.segment.value,
            'decision': decision.value,
            'timestamp': datetime.now().isoformat(),
            'factors': factors,
            'social_influence': social_influence,
            'market_influence': market_influence,
            'intervention': intervention
        }
        
        agent.decision_history.append(decision_record)
        agent.last_decision = decision
        agent.last_decision_timestamp = datetime.now()
        
        return decision_record
    
    def _analyze_by_service_type(self, decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Servis türüne göre analiz"""
        service_analysis = {}
        
        for service_type in ServiceType:
            service_decisions = [d for d in decisions if d.get('service_type') == service_type.value]
            
            if service_decisions:
                service_analysis[service_type.value] = {
                    'total_customers': len(service_decisions),
                    'churn_rate': sum(1 for d in service_decisions if d['decision'] in ['CHURN', 'SWITCH_PROVIDER']) / len(service_decisions),
                    'retention_rate': sum(1 for d in service_decisions if d['decision'] == 'STAY') / len(service_decisions),
                    'upgrade_rate': sum(1 for d in service_decisions if d['decision'] in ['UPGRADE', 'TOP_UP', 'SERVICE_UPGRADE']) / len(service_decisions),
                    'decision_distribution': self._get_decision_distribution(service_decisions)
                }
        
        return service_analysis
    
    def _get_decision_distribution(self, decisions: List[Dict[str, Any]]) -> Dict[str, int]:
        """Karar dağılımını hesapla"""
        distribution = defaultdict(int)
        for decision in decisions:
            distribution[decision['decision']] += 1
        return dict(distribution)
    
    def _calculate_collective_metrics(self, decisions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Toplu metrikleri hesapla"""
        total_customers = len(decisions)
        if total_customers == 0:
            return {}
        
        return {
            'total_customers': total_customers,
            'overall_churn_rate': sum(1 for d in decisions if d['decision'] in ['CHURN', 'SWITCH_PROVIDER']) / total_customers,
            'overall_retention_rate': sum(1 for d in decisions if d['decision'] == 'STAY') / total_customers,
            'overall_upgrade_rate': sum(1 for d in decisions if d['decision'] in ['UPGRADE', 'TOP_UP', 'SERVICE_UPGRADE']) / total_customers,
            'decision_distribution': self._get_decision_distribution(decisions)
        }
    
    def _analyze_network_effects(self, target_customers: List[str]) -> Dict[str, Any]:
        """Ağ etkilerini analiz et"""
        return {
            'connected_components': nx.number_connected_components(self.social_network),
            'average_clustering': nx.average_clustering(self.social_network),
            'network_density': nx.density(self.social_network),
            'influence_cascade': self._analyze_influence_cascade(target_customers)
        }
    
    def _analyze_influence_cascade(self, target_customers: List[str]) -> Dict[str, Any]:
        """Etki kaskadını analiz et"""
        cascade_effects = {
            'primary_influencers': [],
            'secondary_effects': [],
            'cascade_depth': 0
        }
        
        # Birincil etki yaratan müşteriler
        for customer_id in target_customers:
            if customer_id in self.agents:
                agent = self.agents[customer_id]
                if agent.social_influence > 0.7:
                    cascade_effects['primary_influencers'].append({
                        'customer_id': customer_id,
                        'service_type': agent.service_type.value,
                        'segment': agent.segment.value,
                        'influence_score': agent.social_influence,
                        'decision': agent.last_decision.value if agent.last_decision else None
                    })
        
        return cascade_effects
    
    def get_agent_insights(self, customer_id: str) -> Dict[str, Any]:
        """Agent için detaylı insights"""
        if customer_id not in self.agents:
            return {}
        
        agent = self.agents[customer_id]
        
        return {
            'customer_id': customer_id,
            'service_type': agent.service_type.value,
            'segment': agent.segment.value,
            'current_satisfaction': agent.current_satisfaction,
            'loyalty_score': agent.loyalty_score,
            'social_influence': agent.social_influence,
            'price_sensitivity': agent.price_sensitivity,
            'service_quality_expectation': agent.service_quality_expectation,
            'decision_history': agent.decision_history[-5:],
            'last_decision': agent.last_decision.value if agent.last_decision else None,
            'network_connections': len(list(self.social_network.neighbors(customer_id))),
            'influence_potential': self._calculate_influence_potential(customer_id)
        }
    
    def _calculate_influence_potential(self, customer_id: str) -> float:
        """Etki potansiyelini hesapla"""
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
        
        # Servis türü etkisi
        service_multiplier = {
            ServiceType.POSTPAID: 1.0,
            ServiceType.PREPAID: 0.8,  # Prepaid müşteriler daha az etkili
            ServiceType.BROADBAND: 1.2  # Broadband müşteriler daha etkili
        }
        
        return (centrality + agent_influence) / 2.0 * service_multiplier.get(agent.service_type, 1.0)
