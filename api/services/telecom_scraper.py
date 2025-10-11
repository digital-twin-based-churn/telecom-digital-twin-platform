"""
Telecom Operator Web Scraper
Scrapes campaign and pricing information from Turkish telecom operators' official websites.
"""

import logging
from typing import List, Dict, Any, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import re

logger = logging.getLogger(__name__)


class TelecomScraper:
    """Web scraper for Turkish telecom operators"""
    
    def __init__(self, headless: bool = True):
        """
        Initialize the scraper
        
        Args:
            headless: Run browser in headless mode (no GUI)
        """
        self.headless = headless
        self.driver = None
        
    def _init_driver(self):
        """Initialize Selenium WebDriver"""
        try:
            chrome_options = Options()
            if self.headless:
                chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-gpu")
            chrome_options.add_argument("--window-size=1920,1080")
            chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            logger.info("Chrome WebDriver initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize WebDriver: {e}")
            raise
    
    def _close_driver(self):
        """Close the WebDriver"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("WebDriver closed")
            except Exception as e:
                logger.error(f"Error closing WebDriver: {e}")
    
    def _extract_price(self, text: str) -> Optional[str]:
        """Extract price from text (e.g., '250 TL', '250₺', '250 TL/ay')"""
        if not text:
            return None
        
        # Remove whitespace and normalize
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        # Pattern: number followed by TL, ₺, or /ay
        patterns = [
            r'(\d+(?:[.,]\d+)?)\s*(?:TL|₺)',  # 250 TL or 250₺
            r'(\d+(?:[.,]\d+)?)\s*TL/ay',     # 250 TL/ay
            r'₺\s*(\d+(?:[.,]\d+)?)',         # ₺250
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                price = match.group(1).replace(',', '.')
                return f"{price} TL"
        
        return None
    
    def _extract_data(self, text: str) -> Optional[str]:
        """Extract internet data from text (e.g., '20 GB', '20GB')"""
        if not text:
            return None
        
        # Pattern: number followed by GB
        match = re.search(r'(\d+(?:[.,]\d+)?)\s*(?:GB|gb)', text)
        if match:
            return f"{match.group(1)} GB"
        
        # Check for unlimited
        if any(word in text.lower() for word in ['sınırsız', 'unlimited', 'limitsiz']):
            return "Sınırsız"
        
        return None
    
    def _extract_minutes(self, text: str) -> Optional[str]:
        """Extract minutes from text (e.g., '1500 dk', '1500 dakika')"""
        if not text:
            return None
        
        # Pattern: number followed by dk, dakika, or minute
        match = re.search(r'(\d+)\s*(?:dk|dakika|minute|min)', text.lower())
        if match:
            return f"{match.group(1)} dk"
        
        # Check for unlimited
        if any(word in text.lower() for word in ['sınırsız', 'unlimited', 'limitsiz']):
            return "Sınırsız"
        
        return None
    
    def _extract_sms(self, text: str) -> Optional[str]:
        """Extract SMS count from text (e.g., '250 SMS')"""
        if not text:
            return None
        
        # Pattern: number followed by SMS
        match = re.search(r'(\d+)\s*(?:SMS|sms)', text)
        if match:
            return f"{match.group(1)} SMS"
        
        # Check for unlimited
        if any(word in text.lower() for word in ['sınırsız', 'unlimited', 'limitsiz']):
            return "Sınırsız"
        
        return None
    
    def scrape_turkcell(self) -> List[Dict[str, Any]]:
        """
        Scrape Turkcell campaigns
        URL: https://www.turkcell.com.tr/bireysel/kampanyalar
        """
        campaigns = []
        
        try:
            self._init_driver()
            logger.info("Scraping Turkcell campaigns...")
            
            # Navigate to Turkcell campaigns page
            url = "https://www.turkcell.com.tr/bireysel/kampanyalar"
            self.driver.get(url)
            time.sleep(5)  # Wait longer for page to load
            
            # Scroll to load more content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            # Get page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            page_text = soup.get_text()
            
            logger.info(f"Page loaded, analyzing content...")
            
            # Look for all text elements containing prices
            all_elements = soup.find_all(string=re.compile(r'\d+\s*(?:TL|₺|GB)', re.IGNORECASE))
            
            logger.info(f"Found {len(all_elements)} elements with pricing/data info")
            
            # Group elements by their parent containers
            processed_containers = set()
            
            for element in all_elements:
                try:
                    # Get parent container (go up a few levels to get the campaign card)
                    parent = element.parent
                    for _ in range(5):  # Go up 5 levels
                        if parent and parent.parent:
                            parent = parent.parent
                    
                    if not parent or id(parent) in processed_containers:
                        continue
                    
                    processed_containers.add(id(parent))
                    
                    parent_text = parent.get_text(separator=' ', strip=True)
                    
                    # Extract campaign info
                    price = self._extract_price(parent_text)
                    data = self._extract_data(parent_text)
                    minutes = self._extract_minutes(parent_text)
                    sms = self._extract_sms(parent_text)
                    
                    # Only add if we found at least price AND data
                    if price and data:
                        # Try to extract campaign name from heading in parent
                        name_elem = parent.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
                        if name_elem:
                            name = name_elem.get_text(strip=True)
                            # Clean up name
                            name = re.sub(r'\d+\s*(?:TL|₺|GB)', '', name).strip()
                        else:
                            name = "Turkcell Paket"
                        
                        if not name or len(name) < 3:
                            name = "Turkcell Kampanyası"
                        
                        campaign = {
                            'operator': 'Turkcell',
                            'name': name[:50],
                            'price': price,
                            'internet': data,
                            'minutes': minutes or 'Bilgi yok',
                            'sms': sms or 'Bilgi yok',
                            'source': url
                        }
                        
                        # Avoid duplicates
                        if not any(c['price'] == price and c['internet'] == data for c in campaigns):
                            campaigns.append(campaign)
                            logger.info(f"Found Turkcell campaign: {name} - {price} - {data}")
                        
                        if len(campaigns) >= 5:  # Limit to 5 campaigns
                            break
                        
                except Exception as e:
                    logger.warning(f"Error parsing element: {e}")
                    continue
            
            # If still no campaigns found, use fallback with realistic example data
            if not campaigns:
                logger.warning("No Turkcell campaigns found via scraping, using fallback")
                campaigns = [
                    {
                        'operator': 'Turkcell',
                        'name': 'Yeni Müşteri Paketi',
                        'price': '249 TL',
                        'internet': '25 GB',
                        'minutes': '1500 dk',
                        'sms': '250 SMS',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen turkcell.com.tr sitesini kontrol edin'
                    },
                    {
                        'operator': 'Turkcell',
                        'name': 'Fırsat Paketi',
                        'price': '299 TL',
                        'internet': '35 GB',
                        'minutes': '2000 dk',
                        'sms': '500 SMS',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen turkcell.com.tr sitesini kontrol edin'
                    }
                ]
            
        except Exception as e:
            logger.error(f"Error scraping Turkcell: {e}")
            campaigns = [{
                'operator': 'Turkcell',
                'name': 'Scraping Hatası',
                'price': '249 TL',
                'internet': '25 GB',
                'minutes': '1500 dk',
                'sms': '250 SMS',
                'source': url,
                'note': f'⚠️ Hata: {str(e)[:50]} - Örnek veri gösteriliyor'
            }]
        
        finally:
            self._close_driver()
        
        return campaigns
    
    def scrape_vodafone(self) -> List[Dict[str, Any]]:
        """
        Scrape Vodafone campaigns  
        URL: https://www.vodafone.com.tr
        """
        campaigns = []
        
        try:
            self._init_driver()
            logger.info("Scraping Vodafone campaigns...")
            
            url = "https://www.vodafone.com.tr/bireysel/kampanyalar"
            self.driver.get(url)
            time.sleep(5)
            
            # Scroll to load more content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            logger.info(f"Page loaded, analyzing content...")
            
            # Look for all text elements containing prices
            all_elements = soup.find_all(string=re.compile(r'\d+\s*(?:TL|₺|GB)', re.IGNORECASE))
            logger.info(f"Found {len(all_elements)} elements with pricing/data info")
            
            processed_containers = set()
            
            for element in all_elements:
                try:
                    parent = element.parent
                    for _ in range(5):
                        if parent and parent.parent:
                            parent = parent.parent
                    
                    if not parent or id(parent) in processed_containers:
                        continue
                    
                    processed_containers.add(id(parent))
                    parent_text = parent.get_text(separator=' ', strip=True)
                    
                    price = self._extract_price(parent_text)
                    data = self._extract_data(parent_text)
                    minutes = self._extract_minutes(parent_text)
                    sms = self._extract_sms(parent_text)
                    
                    if price and data:
                        name_elem = parent.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
                        if name_elem:
                            name = name_elem.get_text(strip=True)
                            name = re.sub(r'\d+\s*(?:TL|₺|GB)', '', name).strip()
                        else:
                            name = "Vodafone Paket"
                        
                        if not name or len(name) < 3:
                            name = "Vodafone Kampanyası"
                        
                        campaign = {
                            'operator': 'Vodafone',
                            'name': name[:50],
                            'price': price,
                            'internet': data,
                            'minutes': minutes or 'Bilgi yok',
                            'sms': sms or 'Bilgi yok',
                            'source': url
                        }
                        
                        if not any(c['price'] == price and c['internet'] == data for c in campaigns):
                            campaigns.append(campaign)
                            logger.info(f"Found Vodafone campaign: {name} - {price} - {data}")
                        
                        if len(campaigns) >= 5:
                            break
                        
                except Exception as e:
                    logger.warning(f"Error parsing element: {e}")
                    continue
            
            if not campaigns:
                logger.warning("No Vodafone campaigns found via scraping, using fallback")
                campaigns = [
                    {
                        'operator': 'Vodafone',
                        'name': 'Red Paket',
                        'price': '279 TL',
                        'internet': '30 GB',
                        'minutes': '2000 dk',
                        'sms': '500 SMS',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen vodafone.com.tr sitesini kontrol edin'
                    },
                    {
                        'operator': 'Vodafone',
                        'name': 'Süper Paket',
                        'price': '329 TL',
                        'internet': '40 GB',
                        'minutes': 'Sınırsız',
                        'sms': 'Sınırsız',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen vodafone.com.tr sitesini kontrol edin'
                    }
                ]
            
        except Exception as e:
            logger.error(f"Error scraping Vodafone: {e}")
            campaigns = [{
                'operator': 'Vodafone',
                'name': 'Scraping Hatası',
                'price': '279 TL',
                'internet': '30 GB',
                'minutes': '2000 dk',
                'sms': '500 SMS',
                'source': url if 'url' in locals() else 'https://www.vodafone.com.tr',
                'note': f'⚠️ Hata: {str(e)[:50]} - Örnek veri gösteriliyor'
            }]
        
        finally:
            self._close_driver()
        
        return campaigns
    
    def scrape_turktelekom(self) -> List[Dict[str, Any]]:
        """
        Scrape Türk Telekom campaigns
        URL: https://www.turktelekom.com.tr/mobil
        """
        campaigns = []
        
        try:
            self._init_driver()
            logger.info("Scraping Türk Telekom campaigns...")
            
            url = "https://www.turktelekom.com.tr/mobil/kampanyalar"
            self.driver.get(url)
            time.sleep(5)
            
            # Scroll to load more content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(2)
            
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            
            logger.info(f"Page loaded, analyzing content...")
            
            # Look for all text elements containing prices
            all_elements = soup.find_all(string=re.compile(r'\d+\s*(?:TL|₺|GB)', re.IGNORECASE))
            logger.info(f"Found {len(all_elements)} elements with pricing/data info")
            
            processed_containers = set()
            
            for element in all_elements:
                try:
                    parent = element.parent
                    for _ in range(5):
                        if parent and parent.parent:
                            parent = parent.parent
                    
                    if not parent or id(parent) in processed_containers:
                        continue
                    
                    processed_containers.add(id(parent))
                    parent_text = parent.get_text(separator=' ', strip=True)
                    
                    price = self._extract_price(parent_text)
                    data = self._extract_data(parent_text)
                    minutes = self._extract_minutes(parent_text)
                    sms = self._extract_sms(parent_text)
                    
                    if price and data:
                        name_elem = parent.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
                        if name_elem:
                            name = name_elem.get_text(strip=True)
                            name = re.sub(r'\d+\s*(?:TL|₺|GB)', '', name).strip()
                        else:
                            name = "Türk Telekom Paket"
                        
                        if not name or len(name) < 3:
                            name = "Türk Telekom Kampanyası"
                        
                        campaign = {
                            'operator': 'Türk Telekom',
                            'name': name[:50],
                            'price': price,
                            'internet': data,
                            'minutes': minutes or 'Bilgi yok',
                            'sms': sms or 'Bilgi yok',
                            'source': url
                        }
                        
                        if not any(c['price'] == price and c['internet'] == data for c in campaigns):
                            campaigns.append(campaign)
                            logger.info(f"Found Türk Telekom campaign: {name} - {price} - {data}")
                        
                        if len(campaigns) >= 5:
                            break
                        
                except Exception as e:
                    logger.warning(f"Error parsing element: {e}")
                    continue
            
            if not campaigns:
                logger.warning("No Türk Telekom campaigns found via scraping, using fallback")
                campaigns = [
                    {
                        'operator': 'Türk Telekom',
                        'name': 'Efsane Paket',
                        'price': '239 TL',
                        'internet': '20 GB',
                        'minutes': '1500 dk',
                        'sms': '1000 SMS',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen turktelekom.com.tr sitesini kontrol edin'
                    },
                    {
                        'operator': 'Türk Telekom',
                        'name': 'Süper Paket',
                        'price': '289 TL',
                        'internet': '30 GB',
                        'minutes': '2000 dk',
                        'sms': '1500 SMS',
                        'source': url,
                        'note': '⚠️ Örnek veri - Lütfen turktelekom.com.tr sitesini kontrol edin'
                    }
                ]
            
        except Exception as e:
            logger.error(f"Error scraping Türk Telekom: {e}")
            campaigns = [{
                'operator': 'Türk Telekom',
                'name': 'Scraping Hatası',
                'price': '239 TL',
                'internet': '20 GB',
                'minutes': '1500 dk',
                'sms': '1000 SMS',
                'source': url if 'url' in locals() else 'https://www.turktelekom.com.tr/mobil',
                'note': f'⚠️ Hata: {str(e)[:50]} - Örnek veri gösteriliyor'
            }]
        
        finally:
            self._close_driver()
        
        return campaigns
    
    def scrape_all_operators(self) -> List[Dict[str, Any]]:
        """
        Scrape all operators and return combined results
        
        Returns:
            List of campaign dictionaries from all operators
        """
        all_campaigns = []
        
        logger.info("Starting scraping for all operators...")
        
        # Scrape each operator
        turkcell_campaigns = self.scrape_turkcell()
        all_campaigns.extend(turkcell_campaigns)
        
        vodafone_campaigns = self.scrape_vodafone()
        all_campaigns.extend(vodafone_campaigns)
        
        turktelekom_campaigns = self.scrape_turktelekom()
        all_campaigns.extend(turktelekom_campaigns)
        
        logger.info(f"Total campaigns scraped: {len(all_campaigns)}")
        
        return all_campaigns


def get_live_campaigns() -> List[Dict[str, Any]]:
    """
    Convenience function to scrape all operators
    
    Returns:
        List of campaign dictionaries
    """
    scraper = TelecomScraper(headless=True)
    return scraper.scrape_all_operators()

