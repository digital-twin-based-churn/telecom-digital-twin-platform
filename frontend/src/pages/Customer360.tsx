import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [customerId, setCustomerId] = useState("")
  const [customerData, setCustomerData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const searchCustomer = () => {
    setLoading(true)
    // Simulate customer data (gerçekte API'den gelecek)
    setTimeout(() => {
      setCustomerData({
        id: customerId || "12345",
        name: "Ahmet Yılmaz",
        email: "ahmet.yilmaz@example.com",
        phone: "+90 532 123 4567",
        age: 35,
        serviceType: "Postpaid",
        monthlyCharge: 189,
        tenure: 24,
        dataUsage: 25,
        supportCalls: 3,
        autoPayment: true,
        satisfaction: "Yüksek",
        riskScore: 23,
        riskLevel: "Düşük",
        lastActivity: "2 gün önce",
        totalRevenue: 4536,
        predictedChurn: "14%"
      })
      setLoading(false)
    }, 1000)
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
              <span className="text-xl font-bold">ChurnGuard AI</span>
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
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="customer-id">Müşteri ID veya Telefon</Label>
                <Input
                  id="customer-id"
                  placeholder="Müşteri ID girin..."
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
                          <p className="text-sm text-muted-foreground">Ad Soyad</p>
                          <p className="font-semibold">{customerData.name}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Mail className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">E-posta</p>
                          <p className="font-semibold">{customerData.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm text-muted-foreground">Telefon</p>
                          <p className="font-semibold">{customerData.phone}</p>
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
                          <p className="text-sm text-muted-foreground">Son Aktivite</p>
                          <p className="font-semibold">{customerData.lastActivity}</p>
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
                      <p className="text-xs text-muted-foreground">Toplam Gelir</p>
                      <p className="text-lg font-bold">{customerData.totalRevenue.toLocaleString()} TL</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <CardTitle>Önerilen Aksiyonlar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-sm font-medium">• Sadakat programına dahil et</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <p className="text-sm font-medium">• Premium hizmet yükseltmesi öner</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-sm font-medium">• Ekstra veri paketi kampanyası</p>
                  </div>
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

