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
  
  // Scenario inputs
  const [campaignType, setCampaignType] = useState("discount")
  const [targetSegment, setTargetSegment] = useState("high-risk")
  const [budget, setBudget] = useState([50000])
  const [discountPercent, setDiscountPercent] = useState([20])
  const [targetCustomers, setTargetCustomers] = useState([1000])
  
  // Results
  const [results, setResults] = useState<any>(null)

  const handleLogout = () => {
    logout()
    navigate("/login")
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
          <h1 className="text-3xl font-bold mb-2">What-If Senaryo Analizi</h1>
          <p className="text-muted-foreground">
            Kampanya senaryolarını test et, ROI hesapla ve etkisini önceden gör
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Senaryo Parametreleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label>Kampanya Tipi</Label>
                    <Select value={campaignType} onValueChange={setCampaignType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">İndirim Kampanyası</SelectItem>
                        <SelectItem value="upgrade">Hizmet Yükseltme</SelectItem>
                        <SelectItem value="retention">Elde Tutma Araması</SelectItem>
                        <SelectItem value="email">E-posta Kampanyası</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Hedef Segment</Label>
                    <Select value={targetSegment} onValueChange={setTargetSegment}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-risk">Yüksek Risk Müşteriler</SelectItem>
                        <SelectItem value="medium-risk">Orta Risk Müşteriler</SelectItem>
                        <SelectItem value="low-risk">Düşük Risk Müşteriler</SelectItem>
                        <SelectItem value="all">Tüm Müşteriler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Kampanya Bütçesi</Label>
                      <Badge variant="outline">{budget[0].toLocaleString()} TL</Badge>
                    </div>
                    <Slider value={budget} onValueChange={setBudget} min={10000} max={500000} step={5000} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>İndirim Oranı (%)</Label>
                      <Badge variant="outline">%{discountPercent[0]}</Badge>
                    </div>
                    <Slider value={discountPercent} onValueChange={setDiscountPercent} min={5} max={50} step={5} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>Hedef Müşteri Sayısı</Label>
                      <Badge variant="outline">{targetCustomers[0].toLocaleString()}</Badge>
                    </div>
                    <Slider value={targetCustomers} onValueChange={setTargetCustomers} min={100} max={10000} step={100} />
                  </div>
                </div>

                <Button 
                  onClick={runScenario}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Senaryoyu Hesapla
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {results && (
              <>
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-success" />
                      <span>Tahmin Edilen Sonuçlar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        %{results.roi.toFixed(0)}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Kampanya Maliyeti</p>
                      <p className="text-xl font-bold text-red-600">{results.totalCost.toLocaleString()} TL</p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Elde Tutulacak Müşteri</p>
                      <p className="text-xl font-bold text-blue-600">{results.retainedCustomers} kişi</p>
                    </div>

                    <div className="p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground">Korunacak Gelir (Yıllık)</p>
                      <p className="text-xl font-bold text-green-600">{results.revenueProtected.toLocaleString()} TL</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <p className="text-sm text-muted-foreground">Net Kazanç</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {results.netBenefit.toLocaleString()} TL
                      </p>
                    </div>

                    <Badge className={`w-full justify-center text-lg py-3 ${
                      results.roi > 100 ? 'bg-green-500' : results.roi > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    } text-white`}>
                      {results.roi > 100 ? '✓ Çok Karlı!' : results.roi > 50 ? '⚠ Kabul Edilebilir' : '✗ Karlı Değil'}
                    </Badge>
                  </CardContent>
                </Card>
              </>
            )}

            {!results && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calculator className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Senaryo parametrelerini ayarlayın ve "Senaryoyu Hesapla" butonuna tıklayın
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

