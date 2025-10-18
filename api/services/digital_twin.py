# digital_twin.py - Dijital İkiz Tabanlı Churn Tahmini
# -----------------------------------------------------
# Her müşteriyi temsil eden dijital ikiz sınıfı
# Mevcut churn modelini kullanarak kendi riskini hesaplar

import numpy as np
import pandas as pd
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import logging
from dataclasses import dataclass, asdict
from enum import Enum

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM" 
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

@dataclass
class CustomerFeatures:
    """Müşteri özelliklerini tutan veri sınıfı"""
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
    
    # Missing value flags
    avg_call_duration_missing: Optional[float] = None
    call_drops_missing: Optional[float] = None
    data_usage_missing: Optional[float] = None
    monthly_charge_missing: Optional[float] = None
    auto_payment_missing: Optional[float] = None

class DigitalTwin:
    """Dijital İkiz sınıfı - Her müşteriyi temsil eder"""
    
    def __init__(self, customer_id: str, features: CustomerFeatures):
        self.customer_id = customer_id
        self.features = features
        self.churn_risk_score: Optional[float] = None
        self.churn_probability: Optional[float] = None
        self.risk_level: Optional[RiskLevel] = None
        self.last_updated = datetime.now()
        self.model_weights = self._get_model_weights()
        
    def _get_model_weights(self) -> Dict[str, float]:
        """Churn modelinin ağırlıklarını döndürür (gerçek modelden alınacak)"""
        # Bu ağırlıklar gerçek churn modelinden alınmalı
        # Şimdilik örnek ağırlıklar kullanıyoruz
        return {
            'satisfaction_score': -0.3,
            'overdue_payments': 0.4,
            'customer_support_calls': 0.2,
            'call_drops': 0.15,
            'data_usage': -0.1,
            'tenure': -0.2,
            'monthly_charge': 0.1,
            'auto_payment': -0.25,
            'satisfaction_low': 0.35,
            'has_overdue_flag': 0.3,
            'support_calls_rate': 0.2,
            'drops_per_min': 0.15,
            'charge_per_gb': 0.1,
            'usage_per_tenure': -0.1,
            'charge_per_tenure': 0.1,
            'has_any_app': -0.1,
            'apps_count': -0.05,
            'overdue_ratio': 0.25,
            'avg_call_duration_missing': 0.1,
            'call_drops_missing': 0.05,
            'data_usage_missing': 0.05,
            'monthly_charge_missing': 0.1,
            'auto_payment_missing': 0.05
        }
    
    def _engineer_features(self) -> CustomerFeatures:
        """Müşteri özelliklerinden engineered features üretir"""
        features = self.features
        
        # Apps count
        if features.apps:
            features.apps_count = len(features.apps)
        else:
            features.apps_count = 0
            
        # Safe division helper
        def safe_div(numerator: Optional[float], denominator: Optional[float], default: float = 0.0) -> float:
            if denominator is None or denominator == 0:
                return default
            if numerator is None:
                return default
            return numerator / denominator
        
        # Engineered ratios
        features.overdue_ratio = safe_div(features.overdue_payments, features.tenure, 0.0)
        features.support_calls_rate = safe_div(features.customer_support_calls, features.tenure, 0.0)
        features.charge_per_gb = safe_div(features.monthly_charge, features.data_usage, 0.0)
        features.drops_per_min = safe_div(features.call_drops, features.avg_call_duration, 0.0)
        features.usage_per_tenure = safe_div(features.data_usage, features.tenure, 0.0)
        features.charge_per_tenure = safe_div(features.monthly_charge, features.tenure, 0.0)
        
        # Binary flags
        features.has_overdue_flag = 1.0 if (features.overdue_payments and features.overdue_payments > 0) else 0.0
        features.satisfaction_low = 1.0 if (features.satisfaction_score and features.satisfaction_score <= 4.0) else 0.0
        features.has_any_app = 1.0 if (features.apps_count and features.apps_count > 0) else 0.0
        
        # Missing value flags
        features.avg_call_duration_missing = 1.0 if features.avg_call_duration is None else 0.0
        features.call_drops_missing = 1.0 if features.call_drops is None else 0.0
        features.data_usage_missing = 1.0 if features.data_usage is None else 0.0
        features.monthly_charge_missing = 1.0 if features.monthly_charge is None else 0.0
        features.auto_payment_missing = 1.0 if features.auto_payment is None else 0.0
        
        return features
    
    def calculate_churn_risk(self) -> Dict[str, Any]:
        """Churn risk skorunu hesaplar"""
        try:
            # Önce engineered features'ları hesapla
            self.features = self._engineer_features()
            
            # Feature vector oluştur
            feature_vector = self._create_feature_vector()
            
            # Risk skorunu hesapla (linear combination)
            risk_score = self._calculate_linear_score(feature_vector)
            
            # Probability'ye çevir (sigmoid)
            probability = self._sigmoid(risk_score)
            
            # Risk seviyesini belirle
            risk_level = self._determine_risk_level(probability)
            
            # Sonuçları güncelle
            self.churn_risk_score = risk_score
            self.churn_probability = probability
            self.risk_level = risk_level
            self.last_updated = datetime.now()
            
            return {
                'customer_id': self.customer_id,
                'churn_risk_score': risk_score,
                'churn_probability': probability,
                'risk_level': risk_level.value,
                'last_updated': self.last_updated.isoformat(),
                'feature_contributions': self._get_feature_contributions(feature_vector)
            }
            
        except Exception as e:
            logger.error(f"Churn risk hesaplama hatası - Customer {self.customer_id}: {str(e)}")
            return {
                'customer_id': self.customer_id,
                'error': str(e),
                'churn_risk_score': None,
                'churn_probability': None,
                'risk_level': None
            }
    
    def _create_feature_vector(self) -> Dict[str, float]:
        """Feature vector oluşturur"""
        features = self.features
        vector = {}
        
        # Numeric features
        numeric_features = [
            'age', 'tenure', 'avg_call_duration', 'data_usage', 'roaming_usage',
            'monthly_charge', 'overdue_payments', 'avg_top_up_count', 'call_drops',
            'customer_support_calls', 'satisfaction_score', 'apps_count',
            'overdue_ratio', 'support_calls_rate', 'charge_per_gb', 'drops_per_min',
            'usage_per_tenure', 'charge_per_tenure', 'has_overdue_flag',
            'satisfaction_low', 'has_any_app', 'avg_call_duration_missing',
            'call_drops_missing', 'data_usage_missing', 'monthly_charge_missing',
            'auto_payment_missing'
        ]
        
        for feature in numeric_features:
            value = getattr(features, feature, None)
            vector[feature] = float(value) if value is not None else 0.0
        
        # Categorical features
        vector['auto_payment'] = 1.0 if features.auto_payment else 0.0
        
        # Service type encoding
        if features.service_type == 'Postpaid':
            vector['service_type_postpaid'] = 1.0
            vector['service_type_prepaid'] = 0.0
        elif features.service_type == 'Prepaid':
            vector['service_type_postpaid'] = 0.0
            vector['service_type_prepaid'] = 1.0
        else:
            vector['service_type_postpaid'] = 0.0
            vector['service_type_prepaid'] = 0.0
            
        return vector
    
    def _calculate_linear_score(self, feature_vector: Dict[str, float]) -> float:
        """Linear combination ile risk skoru hesaplar"""
        score = 0.0
        
        for feature, value in feature_vector.items():
            weight = self.model_weights.get(feature, 0.0)
            score += weight * value
            
        return score
    
    def _sigmoid(self, x: float) -> float:
        """Sigmoid fonksiyonu ile probability hesaplar"""
        try:
            return 1.0 / (1.0 + np.exp(-x))
        except OverflowError:
            return 1.0 if x > 0 else 0.0
    
    def _determine_risk_level(self, probability: float) -> RiskLevel:
        """Probability'ye göre risk seviyesi belirler"""
        if probability >= 0.8:
            return RiskLevel.CRITICAL
        elif probability >= 0.6:
            return RiskLevel.HIGH
        elif probability >= 0.4:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _get_feature_contributions(self, feature_vector: Dict[str, float]) -> Dict[str, float]:
        """Her feature'ın risk skoruna katkısını hesaplar"""
        contributions = {}
        
        for feature, value in feature_vector.items():
            weight = self.model_weights.get(feature, 0.0)
            contributions[feature] = weight * value
            
        # En yüksek katkıları sırala
        sorted_contributions = dict(sorted(contributions.items(), 
                                        key=lambda x: abs(x[1]), reverse=True))
        
        return sorted_contributions
    
    def update_features(self, new_features: CustomerFeatures):
        """Müşteri özelliklerini günceller"""
        self.features = new_features
        self.last_updated = datetime.now()
        
    def get_twin_data(self) -> Dict[str, Any]:
        """Dijital ikiz verilerini döndürür"""
        return {
            'customer_id': self.customer_id,
            'features': asdict(self.features),
            'churn_risk_score': self.churn_risk_score,
            'churn_probability': self.churn_probability,
            'risk_level': self.risk_level.value if self.risk_level else None,
            'last_updated': self.last_updated.isoformat()
        }
    
    def simulate_intervention(self, intervention_type: str, intervention_value: float) -> Dict[str, Any]:
        """Müdahale simülasyonu yapar"""
        original_features = self.features
        
        # Müdahale türüne göre feature'ı güncelle
        if intervention_type == 'satisfaction_improvement':
            self.features.satisfaction_score = min(10.0, 
                (self.features.satisfaction_score or 5.0) + intervention_value)
        elif intervention_type == 'support_calls_reduction':
            self.features.customer_support_calls = max(0, 
                (self.features.customer_support_calls or 0) - intervention_value)
        elif intervention_type == 'payment_reminder':
            self.features.overdue_payments = max(0, 
                (self.features.overdue_payments or 0) - intervention_value)
        elif intervention_type == 'service_upgrade':
            self.features.data_usage = (self.features.data_usage or 0) + intervention_value
            self.features.monthly_charge = (self.features.monthly_charge or 0) + intervention_value * 0.1
        
        # Yeni risk skorunu hesapla
        new_risk = self.calculate_churn_risk()
        
        # Orijinal features'ları geri yükle
        self.features = original_features
        
        return {
            'intervention_type': intervention_type,
            'intervention_value': intervention_value,
            'original_probability': self.churn_probability,
            'new_probability': new_risk.get('churn_probability'),
            'improvement': (self.churn_probability or 0) - (new_risk.get('churn_probability') or 0)
        }

class DigitalTwinManager:
    """Dijital ikizleri yöneten sınıf"""
    
    def __init__(self):
        self.twins: Dict[str, DigitalTwin] = {}
    
    def create_twin(self, customer_id: str, features: CustomerFeatures) -> DigitalTwin:
        """Yeni dijital ikiz oluşturur"""
        twin = DigitalTwin(customer_id, features)
        self.twins[customer_id] = twin
        return twin
    
    def get_twin(self, customer_id: str) -> Optional[DigitalTwin]:
        """Dijital ikizi getirir"""
        return self.twins.get(customer_id)
    
    def update_twin(self, customer_id: str, features: CustomerFeatures) -> Optional[DigitalTwin]:
        """Dijital ikizi günceller"""
        if customer_id in self.twins:
            self.twins[customer_id].update_features(features)
            return self.twins[customer_id]
        return None
    
    def calculate_all_risks(self) -> List[Dict[str, Any]]:
        """Tüm dijital ikizlerin risk skorlarını hesaplar"""
        results = []
        for twin in self.twins.values():
            risk_data = twin.calculate_churn_risk()
            results.append(risk_data)
        return results
    
    def get_high_risk_customers(self, threshold: float = 0.6) -> List[Dict[str, Any]]:
        """Yüksek riskli müşterileri getirir"""
        high_risk = []
        for twin in self.twins.values():
            if twin.churn_probability and twin.churn_probability >= threshold:
                high_risk.append(twin.get_twin_data())
        return high_risk
    
    def simulate_bulk_intervention(self, intervention_type: str, 
                                 intervention_value: float, 
                                 target_customers: List[str] = None) -> Dict[str, Any]:
        """Toplu müdahale simülasyonu"""
        if target_customers is None:
            target_customers = list(self.twins.keys())
        
        results = []
        for customer_id in target_customers:
            twin = self.twins.get(customer_id)
            if twin:
                intervention_result = twin.simulate_intervention(intervention_type, intervention_value)
                intervention_result['customer_id'] = customer_id
                results.append(intervention_result)
        
        # Toplu istatistikler
        total_improvement = sum(r.get('improvement', 0) for r in results)
        avg_improvement = total_improvement / len(results) if results else 0
        
        return {
            'intervention_type': intervention_type,
            'intervention_value': intervention_value,
            'target_customers_count': len(target_customers),
            'results': results,
            'total_improvement': total_improvement,
            'average_improvement': avg_improvement
        }
