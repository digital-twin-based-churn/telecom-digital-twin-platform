import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Bot, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  Network, 
  Shield, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  LogOut,
  Target,
  Calculator,
  Megaphone,
  User,
  ChevronDown,
  Info,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  Sparkles,
  Zap,
  Star,
  Signal
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await apiService.getDashboardSummary()
        console.log('Dashboard data received:', data)
        setDashboardData(data)
      } catch (error) {
        console.error('Dashboard veri çekme hatası:', error)
        // Fallback data for development
        setDashboardData({
          total_customers: 10000000,
          churn_rate: 1.34,
          retention_rate: 98.66,
          churned_customers: 133653,
          active_customers: 9866347,
          risk_distribution: {
            high_risk: { count: 100000, percentage: 1.0 },
            medium_risk: { count: 500000, percentage: 5.0 },
            low_risk: { count: 9400000, percentage: 94.0 }
          },
          model_accuracy: 78.3,
          revenue_protected: 64.2
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Signal className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dijital İkiz Platformu</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="bg-muted">
                <BarChart3 className="w-4 h-4 mr-2" />
                Panel
              </Button>
              <Link to="/statistics">
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analitik
                </Button>
              </Link>
              
              {/* Dropdown for Analysis Tools */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
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
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Müşteri 360°
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
              
              <Link to="/chatbot">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Asistan
                </Button>
              </Link>
              <Link to="/agent-modeling">
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Agent-Based Modeling
                </Button>
              </Link>
              <Link to="/agent-modeling">
                <Button variant="ghost" size="sm">
                  <Network className="w-4 h-4 mr-2" />
                  Agent Modeling
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Hoş geldin, {user?.username || user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Dijital İkiz Kontrol Paneli</h1>
          <p className="text-muted-foreground">
            Müşteri dijital ikizleriniz ve kayıp önleme sisteminizden gerçek zamanlı içgörüler
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-border animate-scale-in bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktif Dijital İkizler</CardTitle>
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-neural" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary" />
                    </PopoverTrigger>
                    <PopoverContent side="top" className="max-w-xs">
                      <div className="p-2">
                        <p className="font-medium text-sm">Hesaplama Metodolojisi:</p>
                        <p className="text-xs mt-1">GYK-capstone-project'ten gelen 10M+ müşteri verisi</p>
                        <p className="text-xs mt-1">Elde tutma oranı = (Aktif müşteri / Toplam müşteri) × 100</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : dashboardData?.total_customers?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-success font-medium">%{dashboardData?.retention_rate || 0}</span> elde tutma oranı
                </p>
              </CardContent>
            </Card>

          <Card className="data-border animate-scale-in bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kayıp Risk Skoru</CardTitle>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary" />
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-xs">
                    <div className="p-2">
                      <p className="font-medium text-sm">Hesaplama Metodolojisi:</p>
                      <p className="text-xs mt-1">Churn oranı = (Churn müşteri / Toplam müşteri) × 100</p>
                      <p className="text-xs mt-1">GYK verilerinden: 133,653 churn / 10M müşteri = %1.34</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${dashboardData?.churn_rate || 0}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">Çok düşük</span> risk seviyesi
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elde Tutulan Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : dashboardData?.active_customers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">%{dashboardData?.retention_rate || 0}</span> başarı oranı
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kampanya ROI</CardTitle>
               <div className="flex items-center space-x-2">
                 <TrendingUpIcon className="h-4 w-4 text-success" />
                 <Popover>
                  <PopoverTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary" />
                  </PopoverTrigger>
                  <PopoverContent side="top" className="max-w-sm">
                    <div className="p-2">
                      <p className="font-medium text-sm">ROI Hesaplama Metodolojisi:</p>
                      <p className="text-xs mt-1">• Hedef: Top %1 riskli müşteri (100K müşteri)</p>
                      <p className="text-xs mt-1">• Kampanya maliyeti: ₺50/müşteri = ₺5M</p>
                      <p className="text-xs mt-1">• Başarı oranı: %15 (15K müşteri elde tutuldu)</p>
                      <p className="text-xs mt-1">• Korunan gelir: 15K × ₺480.4 × 12 ay = ₺86.5M</p>
                      <p className="text-xs mt-1">• ROI = (₺86.5M - ₺5M) / ₺5M × 100 = %1,629</p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {loading ? '...' : '1,629%'}
              </div>
              <p className="text-xs text-muted-foreground">
                ₺5M yatırım → ₺86.5M kazanç
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Churn Prediction Overview */}
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle>Kayıp Tahmin Özeti</CardTitle>
                <CardDescription>
                  Segmentler arası müşteri kayıp riskinin gerçek zamanlı analizi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Yüksek Riskli Müşteriler</p>
                      <p className="text-sm text-muted-foreground">
                        Kayıp olasılığı &gt; %70
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-destructive">
                        {loading ? '...' : dashboardData?.risk_distribution?.high_risk?.count?.toLocaleString() || '0'}
                      </p>
                      <Badge variant="destructive" className="text-xs">Yüksek Öncelik</Badge>
                    </div>
                  </div>
                  <Progress value={dashboardData?.risk_distribution?.high_risk?.percentage || 3.4} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Orta Riskli Müşteriler</p>
                      <p className="text-xs text-muted-foreground">Kayıp olasılığı %40-70</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-warning">
                        {loading ? '...' : dashboardData?.risk_distribution?.medium_risk?.count?.toLocaleString() || '0'}
                      </p>
                      <Badge variant="secondary" className="text-xs">İzleniyor</Badge>
                    </div>
                  </div>
                  <Progress value={dashboardData?.risk_distribution?.medium_risk?.percentage || 6.2} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Düşük Riskli Müşteriler</p>
                      <p className="text-sm text-muted-foreground">
                        Kayıp olasılığı &lt; %40
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">
                        {loading ? '...' : dashboardData?.risk_distribution?.low_risk?.count?.toLocaleString() || '0'}
                      </p>
                      <Badge className="text-xs bg-success text-success-foreground">Kararlı</Badge>
                    </div>
                  </div>
                  <Progress value={dashboardData?.risk_distribution?.low_risk?.percentage || 90.4} className="h-2" />
                </div>
              </CardContent>
            </Card>

             {/* Service Analysis */}
             <Card className="animate-fade-up bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/20 dark:to-blue-900/20 border-cyan-200 dark:border-cyan-800" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <PieChart className="h-4 w-4 text-cyan-600" />
                  <CardTitle>Servis Tipi Analizi</CardTitle>
                </div>
                <CardDescription>
                  GYK-capstone-project verilerinden servis dağılımı ve performans metrikleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.service_distribution?.map((service: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-1">
                        <p className="font-medium">{service.service_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.count?.toLocaleString()} müşteri (%{service.percentage})
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          {index === 0 ? "En Büyük Segment" : "Aktif"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

             {/* Model Performance Metrics */}
             <Card className="animate-fade-up bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/20 dark:to-pink-900/20 border-rose-200 dark:border-rose-800" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-rose-600" />
                  <CardTitle>Model Performans Metrikleri</CardTitle>
                </div>
                <CardDescription>
                  GYK-capstone-project'ten gelen gerçek model performans verileri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>AUC-ROC</span>
                      <span className="font-medium">{dashboardData?.model_metrics?.auc_roc || '0.783'}</span>
                    </div>
                    <Progress value={dashboardData?.model_metrics?.auc_roc * 100 || 78.3} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precision</span>
                      <span className="font-medium">{dashboardData?.model_metrics?.precision || '0.09'}</span>
                    </div>
                    <Progress value={dashboardData?.model_metrics?.precision * 100 || 9} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Recall</span>
                      <span className="font-medium">{dashboardData?.model_metrics?.recall || '0.16'}</span>
                    </div>
                    <Progress value={dashboardData?.model_metrics?.recall * 100 || 16} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>F1-Score</span>
                      <span className="font-medium">{dashboardData?.model_metrics?.f1_score || '0.115'}</span>
                    </div>
                    <Progress value={dashboardData?.model_metrics?.f1_score * 100 || 11.5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Digital Twin Insights */}
            <Card className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Son Dijital İkiz İçgörüleri</CardTitle>
                <CardDescription>
                  Dijital ikizleriniz tarafından tespit edilen en son davranış kalıpları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg neural-border">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Müşteri ID: 78291</p>
                      <p className="text-sm text-muted-foreground">
                        Dijital ikiz hizmet kullanımında %67 düşüş tespit etti. 14 gün içinde kayıp tahmini.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 saat önce</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Detaylar
                    </Button>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg data-border">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Müşteri Segmenti: Premium</p>
                      <p className="text-sm text-muted-foreground">
                        Birden fazla ikiz azalan etkileşim gösteriyor. Hedefli kampanya öneriliyor.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">4 saat önce</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Kampanya Görüntüle
                    </Button>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Elde Tutma Kampanyası Başarılı</p>
                      <p className="text-sm text-muted-foreground">
                        Dijital ikiz simülasyonu %89 kampanya başarı oranını doğru tahmin etti.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 gün önce</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Sonuçlar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle>Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/risk-analysis" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Target className="w-4 h-4 mr-2" />
                    Risk Analizi
                  </Button>
                </Link>
                <Link to="/segment-explorer" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    Segment Explorer
                  </Button>
                </Link>
                <Link to="/what-if" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Calculator className="w-4 h-4 mr-2" />
                    What-If Analizi
                  </Button>
                </Link>
                <Link to="/customer-360" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Müşteri 360
                  </Button>
                </Link>
                <Link to="/campaign-tracker" className="block">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Megaphone className="w-4 h-4 mr-2" />
                    Kampanya Tracker
                  </Button>
                </Link>
                <Link to="/chatbot" className="block">
                  <Button variant="data" className="w-full justify-start text-sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Asistan
                  </Button>
                </Link>
                <Link to="/agent-modeling" className="block">
                  <Button variant="neural" className="w-full justify-start text-sm">
                    <Play className="w-4 h-4 mr-2" />
                    Agent-Based Modeling
                  </Button>
                </Link>
                <Link to="/agent-modeling" className="block">
                  <Button variant="neural" className="w-full justify-start text-sm">
                    <Network className="w-4 h-4 mr-2" />
                    Agent Modeling
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Sistem Durumu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dijital İkiz Motoru</span>
                  <Badge className="bg-success text-success-foreground">Çalışıyor</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ML Modelleri</span>
                  <Badge className="bg-success text-success-foreground">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Veri Hattı</span>
                  <Badge className="bg-success text-success-foreground">Akışta</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Servisleri</span>
                  <Badge className="bg-success text-success-foreground">Sağlıklı</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="animate-slide-in-right bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <CardTitle>GYK Model Performansı</CardTitle>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary" />
                    </PopoverTrigger>
                     <PopoverContent side="left" className="max-w-xs">
                       <div className="p-2">
                         <p className="font-medium text-sm">Model Metrikleri:</p>
                         <p className="text-xs mt-1">• AUC-ROC: 0.783</p>
                         <p className="text-xs mt-1">• Precision: 0.09</p>
                         <p className="text-xs mt-1">• Recall: 0.16</p>
                         <p className="text-xs mt-1">• Veri: 10M+ kayıt analizi</p>
                       </div>
                     </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Doğruluğu</span>
                    <span className="font-medium">{dashboardData?.model_accuracy || 78.3}%</span>
                  </div>
                  <Progress value={dashboardData?.model_accuracy || 78.3} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AUC-ROC Skoru</span>
                    <span className="font-medium">{dashboardData?.model_metrics?.auc_roc || 0.783}</span>
                  </div>
                  <Progress value={(dashboardData?.model_metrics?.auc_roc || 0.783) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Veri Kalitesi</span>
                    <span className="font-medium">10M+ Kayıt</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Revenue Insights */}
            <Card className="animate-slide-in-right bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-yellow-600" />
                    <CardTitle>Gelir İçgörüleri</CardTitle>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary" />
                    </PopoverTrigger>
                    <PopoverContent side="left" className="max-w-sm">
                      <div className="p-2">
                        <p className="font-medium text-sm">Gelir Hesaplama Metodolojisi:</p>
                        <p className="text-xs mt-1">• CLV = Ortalama aylık ücret × Ortalama tenure</p>
                        <p className="text-xs mt-1">• CLV = ₺480.4 × 156 ay = ₺74,942</p>
                        <p className="text-xs mt-1">• Yıllık gelir = 10M × ₺480.4 × 12 = ₺57.6B</p>
                        <p className="text-xs mt-1">• Churn maliyeti = 133K × ₺480.4 × 12 = ₺770M</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Müşteri Yaşam Değeri</span>
                    <span className="font-medium text-success">₺74,942</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Ortalama 13 yıl tenure
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Yıllık Gelir</span>
                    <span className="font-medium">₺57.6B</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Churn Maliyeti</span>
                    <span className="font-medium text-destructive">₺770M</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Elde Tutma Değeri</span>
                    <span className="font-medium text-success">₺10B</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign ROI */}
            <Card className="animate-slide-in-right bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <CardTitle>Kampanya ROI</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ROI Oranı</span>
                    <span className="font-medium text-success">1,629%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Her ₺1 → ₺16.3 getiri
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Kampanya Maliyeti</span>
                    <span className="font-medium">₺5M</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Korunan Gelir</span>
                    <span className="font-medium text-success">₺86.5M</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Net Kar</span>
                    <span className="font-medium text-success">₺81.5M</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard