import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiService } from "@/services/api"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Bot, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  Target,
  Users,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  LogOut,
  ChevronDown,
  Calculator,
  Megaphone
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const Customer360 = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [customerId, setCustomerId] = useState("1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd")
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Sayfa yüklendiğinde varsayılan müşteri verilerini yükle
  useEffect(() => {
    const loadDefaultCustomer = async () => {
      try {
        // Varsayılan ID ile müşteri verilerini yükle
        const response = await apiService.getCustomer360(customerId)
        if (response.customer_profile) {
          const profile = response.customer_profile
          const risk = response.risk_analysis
          
          setCustomerData({
            id: profile.id,
            age: profile.age,
            serviceType: profile.service_type,
            monthlyCharge: profile.monthly_charge,
            tenure: profile.tenure,
            dataUsage: profile.data_usage,
            supportCalls: profile.support_calls,
            autoPayment: profile.auto_payment,
            satisfaction: profile.satisfaction_score,
            riskScore: risk.risk_score,
            riskLevel: risk.risk_level,
            predictedChurn: risk.predicted_churn,
            riskFactors: risk.risk_factors,
            recommendations: response.recommendations
          })
        }
      } catch (error) {
        console.error('Error loading default customer:', error)
      }
    }
    
    loadDefaultCustomer()
  }, []) // Sadece component mount olduğunda çalışsın

  const searchCustomer = async () => {
    if (!customerId.trim()) return
    
    setLoading(true)
    try {
      const response = await apiService.getCustomer360(customerId)
      if (response.customer_profile) {
        const profile = response.customer_profile
        const risk = response.risk_analysis
        
        setCustomerData({
          id: profile.id,
          age: profile.age,
          serviceType: profile.service_type,
          monthlyCharge: profile.monthly_charge,
          tenure: profile.tenure,
          dataUsage: profile.data_usage,
          supportCalls: profile.support_calls,
          autoPayment: profile.auto_payment,
          satisfaction: profile.satisfaction_score,
          riskScore: risk.risk_score,
          riskLevel: risk.risk_level,
          predictedChurn: risk.predicted_churn,
          riskFactors: risk.risk_factors,
          recommendations: response.recommendations
        })
      } else {
        setCustomerData(null)
      }
    } catch (error) {
      console.error('Customer search error:', error)
      setCustomerData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl hero-gradient flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">TelecomAI</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/"><Button variant="ghost" size="sm"><Home className="w-4 h-4 mr-2" />Ana Sayfa</Button></Link>
              <Link to="/dashboard"><Button variant="ghost" size="sm"><BarChart3 className="w-4 h-4 mr-2" />Panel</Button></Link>
              <Link to="/statistics"><Button variant="ghost" size="sm"><PieChart className="w-4 h-4 mr-2" />Analitik</Button></Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="bg-muted">
                    <Target className="w-4 h-4 mr-2" />
                    Analiz Araçları
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <Link to="/risk-analysis">
                    <DropdownMenuItem>
                      <Target className="w-4 h-4 mr-2" />
                      Risk Profil Analizi
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/segment-explorer">
                    <DropdownMenuItem>
                      <Users className="w-4 h-4 mr-2" />
                      Segment Explorer
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/what-if">
                    <DropdownMenuItem>
                      <Calculator className="w-4 h-4 mr-2" />
                      What-If Analizi
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/customer-360">
                    <DropdownMenuItem className="bg-muted">
                      <User className="w-4 h-4 mr-2" />
                      Müşteri 360° ✓
                    </DropdownMenuItem>
                  </Link>
                  <Link to="/campaign-tracker">
                    <DropdownMenuItem>
                      <Megaphone className="w-4 h-4 mr-2" />
                      Kampanya Tracker
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to="/chatbot"><Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />AI Asistan</Button></Link>
              <Link to="/simulation"><Button variant="ghost" size="sm"><Play className="w-4 h-4 mr-2" />Simülasyon</Button></Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Çıkış</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Müşteri 360° Görünümü</h1>
          <p className="text-muted-foreground">
            Müşteri detaylarını, risk profilini ve önerileri tek ekranda görüntüle
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Test için:</strong> Sayfa yüklendiğinde otomatik olarak örnek müşteri gösterilir. 
                Farklı bir müşteri aramak için ID girin ve "Ara" butonuna tıklayın.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="customer-id">Müşteri ID veya Telefon</Label>
                <Input
                  id="customer-id"
                  placeholder="Örnek ID: 1f3f1168-c2b0-41ad-a2f5-19c01f4c80fd"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
                />
              </div>
              <Button onClick={searchCustomer} disabled={loading} className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-500">
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Aranıyor...' : 'Ara'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Profile */}
        {customerData && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Müşteri Profili</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Müşteri ID</p>
                          <p className="font-semibold">{customerData.id}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Yaş</p>
                          <p className="font-semibold">{customerData.age}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Activity className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Hizmet Türü</p>
                          <p className="font-semibold">{customerData.serviceType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Müşteri Süresi</p>
                          <p className="font-semibold">{customerData.tenure} ay</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Aylık Ödeme</p>
                          <p className="font-semibold">{customerData.monthlyCharge} TL</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Activity className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Veri Kullanımı</p>
                          <p className="font-semibold">{customerData.dataUsage} GB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle>Kullanım İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <p className="text-sm text-muted-foreground">Hizmet Tipi</p>
                      <p className="text-lg font-bold">{customerData.serviceType}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <p className="text-sm text-muted-foreground">Veri Kullanımı</p>
                      <p className="text-lg font-bold">{customerData.dataUsage} GB</p>
                    </div>
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm text-muted-foreground">Destek Araması</p>
                      <p className="text-lg font-bold">{customerData.supportCalls}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                      <p className="text-sm text-muted-foreground">Oto Ödeme</p>
                      <p className="text-lg font-bold">{customerData.autoPayment ? '✓ Aktif' : '✗ Pasif'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Risk Profile Sidebar */}
            <div className="space-y-6">
              <Card className="animate-slide-in-right">
                <CardHeader>
                  <CardTitle>Risk Profili</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className={`text-5xl font-bold mb-2 ${
                      customerData.riskScore > 70 ? 'text-red-600' :
                      customerData.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {customerData.riskScore}%
                    </div>
                    <Badge className={`text-lg px-4 py-1 ${
                      customerData.riskScore > 70 ? 'bg-red-500' :
                      customerData.riskScore > 40 ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}>
                      {customerData.riskLevel} Risk
                    </Badge>
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      {customerData.riskScore > 70 ? (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <span className="text-sm font-medium">
                        {customerData.riskScore > 70 ? 'Acil müdahale!' : 'Kararlı müşteri'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Churn Tahmini</p>
                      <p className="text-lg font-bold">{customerData.predictedChurn}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Destek Araması</p>
                      <p className="text-lg font-bold">{customerData.supportCalls}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle>Risk Faktörleri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customerData.riskFactors && customerData.riskFactors.length > 0 ? (
                    customerData.riskFactors.map((factor: string, index: number) => (
                      <div key={index} className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-sm font-medium">• {factor}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <p className="text-sm font-medium">• Risk faktörü bulunamadı</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle>Önerilen Aksiyonlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customerData.recommendations && customerData.recommendations.length > 0 ? (
                    customerData.recommendations.map((recommendation: string, index: number) => (
                      <div key={index} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-sm font-medium">• {recommendation}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                      <p className="text-sm font-medium">• Öneri bulunamadı</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!customerData && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-2">Müşteri bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                Müşteri ID veya telefon numarası girerek arama yapın
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Customer360

