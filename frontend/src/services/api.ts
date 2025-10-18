const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('access_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: options.headers
    });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Success:', data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async loginWithJson(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = data.access_token;
    localStorage.setItem('access_token', data.access_token);
    return data;
  }

  async register(userData: RegisterRequest): Promise<User> {
    return this.request<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/auth/me');
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('access_token');
    // Optionally call logout endpoint
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout endpoint errors
    }
  }

  async verifyToken(): Promise<{ valid: boolean; user: string }> {
    return this.request<{ valid: boolean; user: string }>('/api/auth/verify-token');
  }

  // User methods
  async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return this.request<User[]>(`/api/users/?skip=${skip}&limit=${limit}`);
  }

  async getUser(userId: number): Promise<User> {
    return this.request<User>(`/api/users/${userId}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }

  // Test API connection
  async testConnection(): Promise<void> {
    console.log('Testing API connection...');
    console.log('Base URL:', this.baseURL);
    
    try {
      const health = await this.healthCheck();
      console.log('API connection successful:', health);
    } catch (error) {
      console.error('API connection failed:', error);
      throw error;
    }
  }

  // Set token manually (for testing)
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Chatbot API methods
  async chatWithBot(message: string, conversationId?: string): Promise<any> {
    return await this.request('/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      }),
    });
  }

  // Customer 360 API methods
  async getCustomer360(customerId: string): Promise<any> {
    return await this.request(`/api/analytics/customer-360/${customerId}`, {
      method: 'GET',
    });
  }

  async getCompetitorAnalysis(updateData: boolean = false): Promise<any> {
    return await this.request('/api/chatbot/competitor-analysis', {
      method: 'POST',
      body: JSON.stringify({
        update_data: updateData
      }),
    });
  }

  async updateKnowledgeBase(): Promise<any> {
    return await this.request('/api/chatbot/update-knowledge', {
      method: 'POST',
    });
  }

  async getChatbotHealth(): Promise<any> {
    return await this.request('/api/chatbot/health', {
      method: 'GET',
    });
  }

  // Analytics API methods
  async getDashboardSummary(): Promise<any> {
    return await this.request('/api/analytics/dashboard-summary', {
      method: 'GET',
    });
  }

  async getChurnStats(): Promise<any> {
    return await this.request('/api/analytics/churn-stats', {
      method: 'GET',
    });
  }

  async getServiceDistribution(): Promise<any> {
    return await this.request('/api/analytics/service-distribution', {
      method: 'GET',
    });
  }


  async getCustomerSupportImpact(): Promise<any> {
    return await this.request('/api/analytics/customer-support-impact', {
      method: 'GET',
    });
  }

  async getPaymentAnalysis(): Promise<any> {
    return await this.request('/api/analytics/payment-analysis', {
      method: 'GET',
    });
  }

  async getKeyInsights(): Promise<any> {
    return await this.request('/api/analytics/key-insights', {
      method: 'GET',
    });
  }

  async getServiceComparison(): Promise<any> {
    return await this.request('/api/analytics/service-comparison', {
      method: 'GET',
    });
  }

  async getModelPerformance(): Promise<any> {
    return await this.request('/api/analytics/model-performance', {
      method: 'GET',
    });
  }

  async getPercentileAnalysis(): Promise<any> {
    return await this.request('/api/analytics/percentile-analysis', {
      method: 'GET',
    });
  }

  async getRevenueAnalysis(): Promise<any> {
    return await this.request('/api/analytics/revenue-analysis', {
      method: 'GET',
    });
  }

  async getCampaignROI(): Promise<any> {
    return await this.request('/api/analytics/campaign-roi', {
      method: 'GET',
    });
  }

  async getSegmentAnalysis(): Promise<any> {
    return await this.request('/api/analytics/segment-analysis', {
      method: 'GET',
    });
  }

  // GYK ML Service churn prediction via Backend API
  async predictChurn(data: any): Promise<any> {
    return await this.request('/api/analytics/churn-prediction', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
