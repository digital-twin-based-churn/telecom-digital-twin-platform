import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  DollarSign,
  Users,
  Phone,
  CreditCard,
  Wifi,
  Calendar,
  LogOut,
  ChevronDown,
  Calculator,
  User,
  Megaphone
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const RiskAnalysis = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Form states
  const [age, setAge] = useState([35])
  const [serviceType, setServiceType] = useState("Postpaid")
  const [supportCalls, setSupportCalls] = useState([5])
  const [autoPayment, setAutoPayment] = useState("True")
  const [monthlyCharge, setMonthlyCharge] = useState([150])
  const [dataUsage, setDataUsage] = useState([20])
  const [tenure, setTenure] = useState([24])
  
  // Risk calculation
  const [riskScore, setRiskScore] = useState(0)
  const [riskLevel, setRiskLevel] = useState("Düşük")
  const [recommendations, setRecommendations] = useState<string[]>([])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Calculate risk score based on inputs
  useEffect(() => {
    calculateRisk()
  }, [age, serviceType, supportCalls, autoPayment, monthlyCharge, dataUsage, tenure])

  const calculateRisk = () => {
    let score = 0
    let recs: string[] = []

    // Age factor (18-25 daha yüksek risk)
    if (age[0] < 25) {
      score += 15
      recs.push("Genç müşteri segmenti - hedefli kampanyalar öner")
    } else if (age[0] > 60) {
      score += 10
      recs.push("Yaşlı müşteri segmenti - kişiselleştirilmiş destek sun")
    }

    // Service type (Prepaid daha riskli)
    if (serviceType === "Prepaid") {
      score += 20
      recs.push("Prepaid → Postpaid geçiş kampanyası öner")
    }

    // Support calls (çok fazla veya çok az risk)
    if (supportCalls[0] === 0) {
      score += 25
      recs.push("Hiç destek araması yok - proaktif iletişim kur")
    } else if (supportCalls[0] > 15) {
      score += 30
      recs.push("Yüksek destek ihtiyacı - hizmet kalitesi sorunları kontrol et")
    }

    // Auto payment (olmayan daha riskli)
    if (autoPayment === "False") {
      score += 15
      recs.push("Otomatik ödeme aktif değil - kampanya ile teşvik et")
    }

    // Monthly charge (çok yüksek veya düşük)
    if (monthlyCharge[0] < 50) {
      score += 10
      recs.push("Düşük gelir müşterisi - sadakat programı öner")
    } else if (monthlyCharge[0] > 300) {
      score += 12
      recs.push("Premium müşteri - VIP hizmet ve avantajlar sun")
    }

    // Tenure (yeni müşteriler riskli)
    if (tenure[0] < 6) {
      score += 25
      recs.push("Yeni müşteri - hoş geldin kampanyası ve eğitim")
    } else if (tenure[0] > 60) {
      score -= 10
      recs.push("Sadık müşteri - sadakat ödülleri sun")
    }

    // Data usage (düşük kullanım = ilgisizlik)
    if (dataUsage[0] < 5) {
      score += 20
      recs.push("Düşük veri kullanımı - hizmet kullanım eğitimi ver")
    }

    // Cap score at 100
    score = Math.min(Math.max(score, 0), 100)

    // Determine risk level
    let level = "Düşük"
    if (score > 70) {
      level = "Kritik"
    } else if (score > 40) {
      level = "Orta"
    }

    setRiskScore(score)
    setRiskLevel(level)
    setRecommendations(recs)
  }

  const getRiskColor = () => {
    if (riskScore > 70) return "text-red-600 dark:text-red-400"
    if (riskScore > 40) return "text-yellow-600 dark:text-yellow-400"
    return "text-green-600 dark:text-green-400"
  }

  const getRiskBgColor = () => {
    if (riskScore > 70) return "from-red-500 to-red-600"
    if (riskScore > 40) return "from-yellow-500 to-yellow-600"
    return "from-green-500 to-green-600"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Panel
                </Button>
              </Link>
              <Link to="/statistics">
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analitik
                </Button>
              </Link>
              
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
                    <DropdownMenuItem className="bg-muted">
                      <Target className="w-4 h-4 mr-2" />
                      Risk Profil Analizi ✓
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
              <Link to="/simulation">
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Simülasyon
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
          <h1 className="text-3xl font-bold mb-2">Müşteri Risk Profil Analizi</h1>
          <p className="text-muted-foreground">
            Gerçek EDA verileriyle anlık müşteri kayıp riski tahmini ve akıllı öneriler
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Müşteri Profili Gir</span>
                </CardTitle>
                <CardDescription>
                  Müşteri özelliklerini girerek anlık churn riski hesaplayın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Age */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Yaş</span>
                      </Label>
                      <Badge variant="outline">{age[0]} yaş</Badge>
                    </div>
                    <Slider
                      value={age}
                      onValueChange={setAge}
                      min={18}
                      max={80}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Service Type */}
                  <div className="space-y-3">
                    <Label className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4" />
                      <span>Hizmet Tipi</span>
                    </Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Prepaid">Prepaid (Ön Ödemeli)</SelectItem>
                        <SelectItem value="Postpaid">Postpaid (Faturalı)</SelectItem>
                        <SelectItem value="Broadband">Broadband (İnternet)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Support Calls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Destek Araması</span>
                      </Label>
                      <Badge variant="outline">{supportCalls[0]} arama</Badge>
                    </div>
                    <Slider
                      value={supportCalls}
                      onValueChange={setSupportCalls}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Auto Payment */}
                  <div className="space-y-3">
                    <Label className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Otomatik Ödeme</span>
                    </Label>
                    <Select value={autoPayment} onValueChange={setAutoPayment}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="True">Aktif ✓</SelectItem>
                        <SelectItem value="False">Pasif ✗</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monthly Charge */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>Aylık Ücret</span>
                      </Label>
                      <Badge variant="outline">{monthlyCharge[0]} TL</Badge>
                    </div>
                    <Slider
                      value={monthlyCharge}
                      onValueChange={setMonthlyCharge}
                      min={20}
                      max={500}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  {/* Data Usage */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4" />
                        <span>Veri Kullanımı</span>
                      </Label>
                      <Badge variant="outline">{dataUsage[0]} GB</Badge>
                    </div>
                    <Slider
                      value={dataUsage}
                      onValueChange={setDataUsage}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Tenure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Müşteri Süresi</span>
                      </Label>
                      <Badge variant="outline">{tenure[0]} ay</Badge>
                    </div>
                    <Slider
                      value={tenure}
                      onValueChange={setTenure}
                      min={1}
                      max={72}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Satisfaction */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Memnuniyet</span>
                      </Label>
                      <Badge variant="outline">{monthlyCharge[0] > 200 ? "Yüksek" : "Orta"}</Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  onClick={calculateRisk}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Risk Hesapla
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Risk Results Sidebar */}
          <div className="space-y-6">
            {/* Risk Gauge */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Risk Skoru</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* Circular Progress */}
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - riskScore / 100)}`}
                        className={`${getRiskColor()} transition-all duration-1000`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getRiskColor()}`}>
                        {riskScore}%
                      </span>
                      <span className="text-sm text-muted-foreground">Risk</span>
                    </div>
                  </div>

                  {/* Risk Level Badge */}
                  <Badge 
                    className={`text-lg px-6 py-2 bg-gradient-to-r ${getRiskBgColor()} text-white`}
                  >
                    {riskLevel} Risk
                  </Badge>

                  {/* Risk Icon */}
                  <div className="flex items-center space-x-2">
                    {riskScore > 70 ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : riskScore > 40 ? (
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                    <span className="text-sm font-medium">
                      {riskScore > 70 
                        ? "Acil müdahale gerekli!" 
                        : riskScore > 40 
                        ? "Elde tutma kampanyası öner" 
                        : "Müşteri kararlı"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>AI Önerileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/60 dark:border-cyan-800/60"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          • {rec}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Risk faktörleri analiz ediliyor...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Profil Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Segment:</span>
                  <span className="font-medium">{serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Müşteri Değeri:</span>
                  <span className="font-medium">
                    {monthlyCharge[0] > 200 ? "Yüksek" : monthlyCharge[0] > 100 ? "Orta" : "Düşük"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sadakat:</span>
                  <span className="font-medium">
                    {tenure[0] > 36 ? "Sadık" : tenure[0] > 12 ? "Orta" : "Yeni"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Etkileşim:</span>
                  <span className="font-medium">
                    {supportCalls[0] > 10 ? "Yüksek" : supportCalls[0] > 5 ? "Orta" : "Düşük"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RiskAnalysis

