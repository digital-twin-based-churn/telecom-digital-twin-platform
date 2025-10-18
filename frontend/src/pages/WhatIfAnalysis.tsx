import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Calculator,
  Sparkles,
  LogOut,
  ChevronDown,
  User,
  Megaphone
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const WhatIfAnalysis = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Churn prediction inputs
  const [customerData, setCustomerData] = useState({
    id: "",
    age: 35,
    tenure: 24,
    service_type: "Postpaid",
    avg_call_duration: 120,
    data_usage: 2.5,
    roaming_usage: 0.1,
    monthly_charge: 45,
    overdue_payments: 0,
    auto_payment: true,
    avg_top_up_count: 0,
    call_drops: 2,
    customer_support_calls: 1,
    satisfaction_score: 4.2,
    apps: ["WhatsApp", "Instagram"]
  })
  
  // Prediction results
  const [predictionResult, setPredictionResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // Results
  const [results, setResults] = useState<any>(null)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const predictChurn = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData)
      })
      
      if (!response.ok) {
        throw new Error('Churn tahmini başarısız')
      }
      
      const result = await response.json()
      setPredictionResult(result)
    } catch (error) {
      console.error('Churn tahmini hatası:', error)
      alert('Churn tahmini yapılırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const runScenario = () => {
    // Calculate scenario impact
    const avgCustomerValue = 150 // TL/month
    const churnReduction = campaignType === "discount" ? discountPercent[0] * 0.5 : 
                          campaignType === "upgrade" ? 35 : 
                          campaignType === "retention" ? 45 : 30
    
    const costPerCustomer = campaignType === "discount" 
      ? avgCustomerValue * (discountPercent[0] / 100) * 3 // 3 ay indirim
      : campaignType === "upgrade" 
      ? 50 // Upgrade maliyeti
      : 25 // Call maliyeti
    
    const totalCost = costPerCustomer * targetCustomers[0]
    const retainedCustomers = Math.round(targetCustomers[0] * (churnReduction / 100))
    const revenueProtected = retainedCustomers * avgCustomerValue * 12 // Yıllık
    const roi = ((revenueProtected - totalCost) / totalCost) * 100

    setResults({
      totalCost,
      retainedCustomers,
      revenueProtected,
      roi,
      churnReduction,
      netBenefit: revenueProtected - totalCost
    })
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
                    <DropdownMenuItem className="bg-muted">
                      <Calculator className="w-4 h-4 mr-2" />
                      What-If Analizi ✓
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
          <h1 className="text-3xl font-bold mb-2">Risk Analizi - Churn Tahmini</h1>
          <p className="text-muted-foreground">
            Müşteri verilerini girerek churn riskini tahmin et ve analiz et
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Müşteri Bilgileri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Müşteri ID</Label>
                    <Input 
                      value={customerData.id}
                      onChange={(e) => setCustomerData({...customerData, id: e.target.value})}
                      placeholder="Müşteri ID girin"
                    />
                  </div>

                  <div>
                    <Label>Servis Türü</Label>
                    <Select 
                      value={customerData.service_type} 
                      onValueChange={(value) => setCustomerData({...customerData, service_type: value})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Postpaid">Postpaid</SelectItem>
                        <SelectItem value="Prepaid">Prepaid</SelectItem>
                        <SelectItem value="Broadband">Broadband</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Yaş</Label>
                    <Input 
                      type="number"
                      value={customerData.age}
                      onChange={(e) => setCustomerData({...customerData, age: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Müşteri Süresi (Ay)</Label>
                    <Input 
                      type="number"
                      value={customerData.tenure}
                      onChange={(e) => setCustomerData({...customerData, tenure: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Ortalama Arama Süresi (Dakika)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={customerData.avg_call_duration}
                      onChange={(e) => setCustomerData({...customerData, avg_call_duration: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Veri Kullanımı (GB)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={customerData.data_usage}
                      onChange={(e) => setCustomerData({...customerData, data_usage: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Roaming Kullanımı (GB)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={customerData.roaming_usage}
                      onChange={(e) => setCustomerData({...customerData, roaming_usage: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Aylık Ücret (TL)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      value={customerData.monthly_charge}
                      onChange={(e) => setCustomerData({...customerData, monthly_charge: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Geciken Ödemeler</Label>
                    <Input 
                      type="number"
                      value={customerData.overdue_payments}
                      onChange={(e) => setCustomerData({...customerData, overdue_payments: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Otomatik Ödeme</Label>
                    <Select 
                      value={customerData.auto_payment ? "true" : "false"} 
                      onValueChange={(value) => setCustomerData({...customerData, auto_payment: value === "true"})}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Evet</SelectItem>
                        <SelectItem value="false">Hayır</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ortalama Top-up Sayısı</Label>
                    <Input 
                      type="number"
                      value={customerData.avg_top_up_count}
                      onChange={(e) => setCustomerData({...customerData, avg_top_up_count: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Arama Düşmeleri</Label>
                    <Input 
                      type="number"
                      value={customerData.call_drops}
                      onChange={(e) => setCustomerData({...customerData, call_drops: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Müşteri Destek Çağrıları</Label>
                    <Input 
                      type="number"
                      value={customerData.customer_support_calls}
                      onChange={(e) => setCustomerData({...customerData, customer_support_calls: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Memnuniyet Skoru (1-5)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={customerData.satisfaction_score}
                      onChange={(e) => setCustomerData({...customerData, satisfaction_score: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label>Uygulamalar (Virgülle ayırın)</Label>
                    <Input 
                      value={customerData.apps.join(", ")}
                      onChange={(e) => setCustomerData({...customerData, apps: e.target.value.split(",").map(app => app.trim()).filter(app => app)})}
                      placeholder="WhatsApp, Instagram, Netflix"
                    />
                  </div>

                </div>

                <Button 
                  onClick={predictChurn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Tahmin Ediliyor...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Churn Tahmini Yap
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {predictionResult && (
              <>
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span>Churn Tahmini Sonuçları</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                      <p className="text-sm text-muted-foreground">Churn Olasılığı</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        %{(predictionResult.churn_probability * 100).toFixed(1)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Kullanılan Model</p>
                      <p className="text-lg font-bold text-purple-600">{predictionResult.model_used}</p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Servis Türü</p>
                      <p className="text-lg font-bold text-green-600">{predictionResult.service_type}</p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Threshold</p>
                      <p className="text-lg font-bold text-orange-600">%{(predictionResult.threshold_used * 100).toFixed(1)}</p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Kullanılan Özellikler</p>
                      <p className="text-sm text-gray-600">{predictionResult.features_used?.length || 0} özellik</p>
                    </div>

                    <Badge className={`w-full justify-center text-lg py-3 ${
                      predictionResult.churn_prediction ? 'bg-red-500' : 'bg-green-500'
                    } text-white`}>
                      {predictionResult.churn_prediction ? '⚠️ CHURN RİSKİ' : '✅ GÜVENLİ'}
                    </Badge>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20">
                      <p className="text-sm text-muted-foreground">Tahmin Zamanı</p>
                      <p className="text-sm text-gray-600">{predictionResult.timestamp}</p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!predictionResult && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Churn Tahmini</h3>
                  <p className="text-muted-foreground">
                    Müşteri bilgilerini girin ve "Churn Tahmini Yap" butonuna tıklayın
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatIfAnalysis

