# digital_twin_service.py - Dijital İkiz Servisi
# ----------------------------------------------
# Dijital ikizleri veritabanı ile entegre eden servis sınıfı

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import json
import logging

from models import Customer, CustomerTwin
from services.digital_twin import DigitalTwin, DigitalTwinManager, CustomerFeatures, RiskLevel

logger = logging.getLogger(__name__)

class DigitalTwinService:
    """Dijital ikiz servisi - Veritabanı entegrasyonu"""
    
    def __init__(self, db: Session):
        self.db = db
        self.twin_manager = DigitalTwinManager()
    
    def create_customer_twin(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Müşteri için dijital ikiz oluşturur"""
        try:
            # Müşteri verilerini veritabanından al
            customer = self.db.query(Customer).filter(Customer.customer_id == customer_id).first()
            if not customer:
                logger.error(f"Müşteri bulunamadı: {customer_id}")
                return None
            
            # CustomerFeatures oluştur
            features = CustomerFeatures(
                customer_id=customer.customer_id,
                age=customer.age,
                tenure=customer.tenure,
                service_type=customer.service_type,
                avg_call_duration=customer.avg_call_duration,
                data_usage=customer.data_usage,
                roaming_usage=customer.roaming_usage,
                monthly_charge=customer.monthly_charge,
                overdue_payments=customer.overdue_payments,
                auto_payment=customer.auto_payment,
                avg_top_up_count=customer.avg_top_up_count,
                call_drops=customer.call_drops,
                customer_support_calls=customer.customer_support_calls,
                satisfaction_score=customer.satisfaction_score,
                apps=customer.apps
            )
            
            # Dijital ikiz oluştur
            twin = self.twin_manager.create_twin(customer_id, features)
            
            # Risk skorunu hesapla
            risk_data = twin.calculate_churn_risk()
            
            # Veritabanına kaydet
            db_twin = CustomerTwin(
                customer_id=customer_id,
                twin_data=json.dumps(twin.get_twin_data()),
                churn_risk_score=risk_data.get('churn_risk_score'),
                churn_probability=risk_data.get('churn_probability'),
                risk_level=risk_data.get('risk_level'),
                last_updated=datetime.now()
            )
            
            self.db.add(db_twin)
            self.db.commit()
            self.db.refresh(db_twin)
            
            logger.info(f"Dijital ikiz oluşturuldu: {customer_id}")
            return risk_data
            
        except Exception as e:
            logger.error(f"Dijital ikiz oluşturma hatası: {str(e)}")
            self.db.rollback()
            return None
    
    def update_customer_twin(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Müşteri dijital ikizini günceller"""
        try:
            # Müşteri verilerini al
            customer = self.db.query(Customer).filter(Customer.customer_id == customer_id).first()
            if not customer:
                return None
            
            # Mevcut dijital ikizi al
            twin = self.twin_manager.get_twin(customer_id)
            if not twin:
                # Yoksa oluştur
                return self.create_customer_twin(customer_id)
            
            # Features'ları güncelle
            features = CustomerFeatures(
                customer_id=customer.customer_id,
                age=customer.age,
                tenure=customer.tenure,
                service_type=customer.service_type,
                avg_call_duration=customer.avg_call_duration,
                data_usage=customer.data_usage,
                roaming_usage=customer.roaming_usage,
                monthly_charge=customer.monthly_charge,
                overdue_payments=customer.overdue_payments,
                auto_payment=customer.auto_payment,
                avg_top_up_count=customer.avg_top_up_count,
                call_drops=customer.call_drops,
                customer_support_calls=customer.customer_support_calls,
                satisfaction_score=customer.satisfaction_score,
                apps=customer.apps
            )
            
            # Dijital ikizi güncelle
            twin.update_features(features)
            risk_data = twin.calculate_churn_risk()
            
            # Veritabanını güncelle
            db_twin = self.db.query(CustomerTwin).filter(CustomerTwin.customer_id == customer_id).first()
            if db_twin:
                db_twin.twin_data = json.dumps(twin.get_twin_data())
                db_twin.churn_risk_score = risk_data.get('churn_risk_score')
                db_twin.churn_probability = risk_data.get('churn_probability')
                db_twin.risk_level = risk_data.get('risk_level')
                db_twin.last_updated = datetime.now()
                
                self.db.commit()
                self.db.refresh(db_twin)
            
            return risk_data
            
        except Exception as e:
            logger.error(f"Dijital ikiz güncelleme hatası: {str(e)}")
            self.db.rollback()
            return None
    
    def get_customer_twin(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Müşteri dijital ikizini getirir"""
        try:
            # Önce memory'den al
            twin = self.twin_manager.get_twin(customer_id)
            if twin:
                return twin.get_twin_data()
            
            # Veritabanından al
            db_twin = self.db.query(CustomerTwin).filter(CustomerTwin.customer_id == customer_id).first()
            if db_twin:
                twin_data = json.loads(db_twin.twin_data)
                return twin_data
            
            return None
            
        except Exception as e:
            logger.error(f"Dijital ikiz getirme hatası: {str(e)}")
            return None
    
    def get_all_twins(self) -> List[Dict[str, Any]]:
        """Tüm dijital ikizleri getirir"""
        try:
            db_twins = self.db.query(CustomerTwin).all()
            twins_data = []
            
            for db_twin in db_twins:
                twin_data = json.loads(db_twin.twin_data)
                twins_data.append(twin_data)
            
            return twins_data
            
        except Exception as e:
            logger.error(f"Tüm dijital ikizleri getirme hatası: {str(e)}")
            return []
    
    def get_high_risk_customers(self, threshold: float = 0.6) -> List[Dict[str, Any]]:
        """Yüksek riskli müşterileri getirir"""
        try:
            # Veritabanından yüksek riskli müşterileri al
            db_twins = self.db.query(CustomerTwin).filter(
                CustomerTwin.churn_probability >= threshold
            ).all()
            
            high_risk_customers = []
            for db_twin in db_twins:
                twin_data = json.loads(db_twin.twin_data)
                high_risk_customers.append(twin_data)
            
            return high_risk_customers
            
        except Exception as e:
            logger.error(f"Yüksek riskli müşterileri getirme hatası: {str(e)}")
            return []
    
    def simulate_intervention(self, customer_id: str, intervention_type: str, 
                             intervention_value: float) -> Optional[Dict[str, Any]]:
        """Müdahale simülasyonu yapar"""
        try:
            twin = self.twin_manager.get_twin(customer_id)
            if not twin:
                # Dijital ikizi oluştur
                self.create_customer_twin(customer_id)
                twin = self.twin_manager.get_twin(customer_id)
                if not twin:
                    return None
            
            # Müdahale simülasyonu
            intervention_result = twin.simulate_intervention(intervention_type, intervention_value)
            intervention_result['customer_id'] = customer_id
            
            return intervention_result
            
        except Exception as e:
            logger.error(f"Müdahale simülasyonu hatası: {str(e)}")
            return None
    
    def bulk_simulate_intervention(self, intervention_type: str, intervention_value: float,
                                 target_customers: List[str] = None) -> Dict[str, Any]:
        """Toplu müdahale simülasyonu"""
        try:
            if target_customers is None:
                # Tüm müşteriler için
                all_customers = self.db.query(Customer).all()
                target_customers = [c.customer_id for c in all_customers]
            
            # Dijital ikizleri oluştur
            for customer_id in target_customers:
                if not self.twin_manager.get_twin(customer_id):
                    self.create_customer_twin(customer_id)
            
            # Toplu simülasyon
            result = self.twin_manager.simulate_bulk_intervention(
                intervention_type, intervention_value, target_customers
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Toplu müdahale simülasyonu hatası: {str(e)}")
            return {}
    
    def create_all_twins(self) -> Dict[str, Any]:
        """Tüm müşteriler için dijital ikiz oluşturur"""
        try:
            customers = self.db.query(Customer).all()
            created_count = 0
            error_count = 0
            
            for customer in customers:
                result = self.create_customer_twin(customer.customer_id)
                if result:
                    created_count += 1
                else:
                    error_count += 1
            
            return {
                'total_customers': len(customers),
                'created_twins': created_count,
                'errors': error_count,
                'success_rate': created_count / len(customers) if customers else 0
            }
            
        except Exception as e:
            logger.error(f"Toplu dijital ikiz oluşturma hatası: {str(e)}")
            return {'error': str(e)}
    
    def get_risk_distribution(self) -> Dict[str, Any]:
        """Risk dağılımını getirir"""
        try:
            db_twins = self.db.query(CustomerTwin).all()
            
            risk_levels = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0, 'CRITICAL': 0}
            total_customers = len(db_twins)
            
            for db_twin in db_twins:
                risk_level = db_twin.risk_level
                if risk_level in risk_levels:
                    risk_levels[risk_level] += 1
            
            # Yüzdelik hesapla
            percentages = {}
            for level, count in risk_levels.items():
                percentages[level] = (count / total_customers * 100) if total_customers > 0 else 0
            
            return {
                'total_customers': total_customers,
                'risk_levels': risk_levels,
                'percentages': percentages
            }
            
        except Exception as e:
            logger.error(f"Risk dağılımı hesaplama hatası: {str(e)}")
            return {'error': str(e)}
    
    def get_customer_insights(self, customer_id: str) -> Optional[Dict[str, Any]]:
        """Müşteri için detaylı insights getirir"""
        try:
            twin = self.twin_manager.get_twin(customer_id)
            if not twin:
                # Dijital ikizi oluştur
                self.create_customer_twin(customer_id)
                twin = self.twin_manager.get_twin(customer_id)
                if not twin:
                    return None
            
            # Risk hesapla
            risk_data = twin.calculate_churn_risk()
            
            # Feature contributions
            feature_contributions = risk_data.get('feature_contributions', {})
            
            # En önemli risk faktörleri
            top_risk_factors = dict(sorted(feature_contributions.items(), 
                                         key=lambda x: abs(x[1]), reverse=True)[:5])
            
            # Öneriler
            recommendations = self._generate_recommendations(twin, feature_contributions)
            
            return {
                'customer_id': customer_id,
                'churn_probability': risk_data.get('churn_probability'),
                'risk_level': risk_data.get('risk_level'),
                'top_risk_factors': top_risk_factors,
                'recommendations': recommendations,
                'last_updated': risk_data.get('last_updated')
            }
            
        except Exception as e:
            logger.error(f"Müşteri insights hatası: {str(e)}")
            return None
    
    def _generate_recommendations(self, twin: DigitalTwin, 
                                 feature_contributions: Dict[str, float]) -> List[str]:
        """Müşteri için öneriler oluşturur"""
        recommendations = []
        
        # En yüksek risk faktörlerine göre öneriler
        sorted_factors = sorted(feature_contributions.items(), 
                               key=lambda x: abs(x[1]), reverse=True)
        
        for factor, contribution in sorted_factors[:3]:
            if factor == 'satisfaction_score' and contribution < 0:
                recommendations.append("Müşteri memnuniyetini artırmak için özel kampanyalar düzenleyin")
            elif factor == 'overdue_payments' and contribution > 0:
                recommendations.append("Geciken ödemeler için esnek ödeme planları sunun")
            elif factor == 'customer_support_calls' and contribution > 0:
                recommendations.append("Müşteri destek çağrılarını azaltmak için self-service seçenekleri geliştirin")
            elif factor == 'call_drops' and contribution > 0:
                recommendations.append("Ağ kalitesini iyileştirmek için teknik inceleme yapın")
            elif factor == 'data_usage' and contribution < 0:
                recommendations.append("Veri kullanımını artırmak için özel paketler sunun")
        
        return recommendations
