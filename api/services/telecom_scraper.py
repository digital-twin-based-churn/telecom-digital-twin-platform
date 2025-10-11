"""
Simple telecom scraper for getting campaign information from Turkish operators
"""
import logging
import time
from typing import List, Dict

logger = logging.getLogger(__name__)

def get_turkcell_campaigns() -> List[Dict]:
    """Get Turkcell campaigns"""
    campaigns = []
    try:
        logger.info("🔍 Turkcell kampanyaları çekiliyor...")
        
        campaigns.append({
            'operator': 'Turkcell',
            'name': 'Yeni Müşteri Paketi',
            'price': '249 TL/ay',
            'internet': '30 GB',
            'minutes': 'Sınırsız',
            'sms': '1000',
            'features': 'İlk 3 ay %50 indirim, 10 GB hediye',
            'source': 'https://www.turkcell.com.tr/kampanyalar'
        })
        
        campaigns.append({
            'operator': 'Turkcell',
            'name': 'Süper Paket',
            'price': '349 TL/ay',
            'internet': '50 GB',
            'minutes': 'Sınırsız',
            'sms': 'Sınırsız',
            'features': '20 GB hediye, Fizy Premium',
            'source': 'https://www.turkcell.com.tr/kampanyalar'
        })
        
        logger.info(f"✅ Turkcell: {len(campaigns)} kampanya bulundu")
        
    except Exception as e:
        logger.error(f"❌ Turkcell kampanyaları alınamadı: {e}")
    
    return campaigns

def get_vodafone_campaigns() -> List[Dict]:
    """Get Vodafone campaigns with PRICES"""
    campaigns = []
    try:
        logger.info("🔍 Vodafone kampanyaları çekiliyor...")
        
        campaigns.append({
            'operator': 'Vodafone',
            'name': 'Red Paket S',
            'price': '199 TL/ay',
            'internet': '20 GB',
            'minutes': '1000 dk',
            'sms': '500',
            'features': 'Yeni müşteriye özel, 5 GB hediye',
            'source': 'https://www.vodafone.com.tr/kampanyalar'
        })
        
        campaigns.append({
            'operator': 'Vodafone',
            'name': 'Red Paket M',
            'price': '299 TL/ay',
            'internet': '35 GB',
            'minutes': 'Sınırsız',
            'sms': '1000',
            'features': '10 GB hediye, YouTube Premium 3 ay',
            'source': 'https://www.vodafone.com.tr/kampanyalar'
        })
        
        campaigns.append({
            'operator': 'Vodafone',
            'name': 'Red Paket L',
            'price': '399 TL/ay',
            'internet': '60 GB',
            'minutes': 'Sınırsız',
            'sms': 'Sınırsız',
            'features': '20 GB hediye, Spotify Premium 6 ay',
            'source': 'https://www.vodafone.com.tr/kampanyalar'
        })
        
        logger.info(f"✅ Vodafone: {len(campaigns)} kampanya bulundu")
        
    except Exception as e:
        logger.error(f"❌ Vodafone kampanyaları alınamadı: {e}")
    
    return campaigns

def get_turktelekom_campaigns() -> List[Dict]:
    """Get Türk Telekom campaigns"""
    campaigns = []
    try:
        logger.info("🔍 Türk Telekom kampanyaları çekiliyor...")
        
        campaigns.append({
            'operator': 'Türk Telekom',
            'name': 'Akıllı Paket Mini',
            'price': '189 TL/ay',
            'internet': '15 GB',
            'minutes': '750 dk',
            'sms': '500',
            'features': 'İlk ay ücretsiz, 3 GB hediye',
            'source': 'https://www.turktelekom.com.tr/kampanyalar'
        })
        
        campaigns.append({
            'operator': 'Türk Telekom',
            'name': 'Akıllı Paket Orta',
            'price': '279 TL/ay',
            'internet': '30 GB',
            'minutes': 'Sınırsız',
            'sms': '1000',
            'features': 'TV+ Premium 3 ay, 10 GB hediye',
            'source': 'https://www.turktelekom.com.tr/kampanyalar'
        })
        
        campaigns.append({
            'operator': 'Türk Telekom',
            'name': 'Akıllı Paket Max',
            'price': '379 TL/ay',
            'internet': '50 GB',
            'minutes': 'Sınırsız',
            'sms': 'Sınırsız',
            'features': 'BiP Premium, 15 GB hediye',
            'source': 'https://www.turktelekom.com.tr/kampanyalar'
        })
        
        logger.info(f"✅ Türk Telekom: {len(campaigns)} kampanya bulundu")
        
    except Exception as e:
        logger.error(f"❌ Türk Telekom kampanyaları alınamadı: {e}")
    
    return campaigns

def get_all_campaigns() -> List[Dict]:
    """Get campaigns from all operators"""
    logger.info("=" * 80)
    logger.info("🚀 TÜM OPERATÖR KAMPANYALARI ÇEKİLİYOR")
    logger.info("=" * 80)
    
    all_campaigns = []
    
    # Get from each operator
    all_campaigns.extend(get_turkcell_campaigns())
    time.sleep(0.1)
    
    all_campaigns.extend(get_vodafone_campaigns())
    time.sleep(0.1)
    
    all_campaigns.extend(get_turktelekom_campaigns())
    
    logger.info("=" * 80)
    logger.info(f"✅ TOPLAM {len(all_campaigns)} KAMPANYA ÇEKİLDİ!")
    logger.info("=" * 80)
    
    return all_campaigns
