// Test senaryolarından müşteri ID'lerini çekmek için utility
export interface CustomerScenario {
  id: string;
  service_type: string;
  age: number;
  tenure: number;
  avg_call_duration?: number;
  data_usage: number;
  roaming_usage?: number;
  monthly_charge: number;
  overdue_payments?: number;
  auto_payment: boolean;
  avg_top_up_count?: number;
  call_drops?: number;
  customer_support_calls: number;
  satisfaction_score: number;
  apps: string[];
}

// Veritabanından random müşteri ID'sini çek
export const getRandomCustomerId = async (): Promise<string> => {
  try {
    const response = await fetch('/api/analytics/random-customer-ids');
    if (!response.ok) {
      throw new Error('Customer IDs could not be fetched');
    }
    
    const data = await response.json();
    const customerIds = data.customer_ids;
    
    // Random bir ID seç
    if (customerIds && customerIds.length > 0) {
      const randomIndex = Math.floor(Math.random() * customerIds.length);
      return customerIds[randomIndex];
    }
    
    // Fallback ID
    return "1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd";
  } catch (error) {
    console.error('Error fetching random customer ID:', error);
    // Fallback ID'ler
    const fallbackIds = [
      "1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd",
      "postpaid_sadik_musteri",
      "postpaid_problemli_musteri", 
      "prepaid_sadik_musteri",
      "prepaid_problemli_musteri",
      "broadband_sadik_musteri",
      "broadband_problemli_musteri"
    ];
    const randomIndex = Math.floor(Math.random() * fallbackIds.length);
    return fallbackIds[randomIndex];
  }
};

// Müşteri ID'lerini statik olarak döndür (API'ye ihtiyaç olmadan)
export const getStaticCustomerIds = (): string[] => {
  return [
    "1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd",
    "postpaid_sadik_musteri",
    "postpaid_problemli_musteri", 
    "prepaid_sadik_musteri",
    "prepaid_problemli_musteri",
    "broadband_sadik_musteri",
    "broadband_problemli_musteri"
  ];
};

// Random statik müşteri ID'si döndür
export const getRandomStaticCustomerId = (): string => {
  const ids = getStaticCustomerIds();
  const randomIndex = Math.floor(Math.random() * ids.length);
  return ids[randomIndex];
};
