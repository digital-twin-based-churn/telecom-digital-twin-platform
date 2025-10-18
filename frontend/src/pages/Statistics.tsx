import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
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
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Zap,
  Calculator,
  User,
  Megaphone,
  ChevronDown
} from "lucide-react"
import { Link } from "react-router-dom"

const Statistics = () => {
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
              <span className="text-xl font-bold">TelecomAI</span>
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
              <Button variant="ghost" size="sm" className="bg-muted">
                <PieChart className="w-4 h-4 mr-2" />
                Analitik
              </Button>
              
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
            <Button variant="outline" size="sm">Veri Dışa Aktar</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Gelişmiş Analitik</h1>
          <p className="text-muted-foreground">
            Dijital ikiz kayıp önleme sisteminizin kapsamlı istatistiksel analizi
          </p>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-border animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kayıp Oranı Azalması</CardTitle>
              <TrendingDown className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">-43.7%</div>
              <p className="text-xs text-muted-foreground">
                dijital ikiz öncesi baz değere göre
              </p>
            </CardContent>
          </Card>

          <Card className="data-border animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tahmin Doğruluğu</CardTitle>
              <Target className="h-4 w-4 text-data" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+2.1%</span> geçen aydan beri
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gelir Etkisi</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.4M</div>
              <p className="text-xs text-muted-foreground">
                Yıllık korunan gelir
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">İşleme Hızı</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247ms</div>
              <p className="text-xs text-muted-foreground">
                Ortalama tahmin gecikmesi
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Churn Analytics */}
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle>Kayıp Risk Dağılımı</CardTitle>
                <CardDescription>
                  Dijital ikiz kayıp tahminlerine göre müşteri segmentasyonu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* High Risk Segment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-destructive">Kritik Risk (%80-100)</h4>
                        <p className="text-sm text-muted-foreground">Acil müdahale gerekli</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">847</p>
                        <Badge variant="destructive" className="text-xs">%3.4</Badge>
                      </div>
                    </div>
                    <div className="bg-destructive/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-destructive h-full w-[3.4%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Medium-High Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-warning">Yüksek Risk (%60-80)</h4>
                        <p className="text-sm text-muted-foreground">Proaktif elde tutma kampanyaları</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">1,523</p>
                        <Badge className="text-xs bg-warning text-warning-foreground">%6.2</Badge>
                      </div>
                    </div>
                    <div className="bg-warning/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-warning h-full w-[6.2%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Medium Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Orta Risk (%40-60)</h4>
                        <p className="text-sm text-muted-foreground">Gelişmiş izleme ve etkileşim</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">4,672</p>
                        <Badge variant="secondary" className="text-xs">%19.0</Badge>
                      </div>
                    </div>
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-muted-foreground h-full w-[19%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Low Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-success">Düşük Risk (%0-40)</h4>
                        <p className="text-sm text-muted-foreground">Kararlı müşteri tabanı</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">17,529</p>
                        <Badge className="text-xs bg-success text-success-foreground">%71.4</Badge>
                      </div>
                    </div>
                    <div className="bg-success/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-success h-full w-[71.4%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance */}
            <Card className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Dijital İkiz Model Performansı</CardTitle>
                <CardDescription>
                  Gerçek zamanlı doğruluk metrikleri ve performans göstergeleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Kesinlik Skoru</span>
                        <span className="text-lg font-bold">92.8%</span>
                      </div>
                      <div className="bg-neural/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-neural h-full w-[92.8%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Duyarlılık Skoru</span>
                        <span className="text-lg font-bold">89.4%</span>
                      </div>
                      <div className="bg-data/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-data h-full w-[89.4%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">F1 Skoru</span>
                        <span className="text-lg font-bold">91.1%</span>
                      </div>
                      <div className="bg-simulation/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-simulation h-full w-[91.1%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg neural-border">
                      <h4 className="font-semibold mb-2">Doğru Pozitifler</h4>
                      <p className="text-2xl font-bold text-success">8,947</p>
                      <p className="text-xs text-muted-foreground">Doğru tespit edilen kayıplar</p>
                    </div>

                    <div className="p-4 rounded-lg data-border">
                      <h4 className="font-semibold mb-2">Yanlış Pozitifler</h4>
                      <p className="text-2xl font-bold text-warning">721</p>
                      <p className="text-xs text-muted-foreground">Yanlış işaretlenen müşteriler</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {/* Campaign Effectiveness */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle>Kampanya Etkinliği</CardTitle>
                <CardDescription>Dijital ikiz simülasyon sonuçları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>E-posta Kampanyaları</span>
                    <span className="font-medium text-success">+%67 elde tutma</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[67%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>İndirim Teklifleri</span>
                    <span className="font-medium text-success">+%43 elde tutma</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[43%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hizmet Yükseltmeleri</span>
                    <span className="font-medium text-success">+%81 elde tutma</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[81%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Kişisel Aramalar</span>
                    <span className="font-medium text-success">+%89 elde tutma</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[89%] rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time-based Trends */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Aylık Trendler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ocak 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-%12 kayıp</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Şubat 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-%18 kayıp</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Mart 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-%24 kayıp</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Nisan 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-%31 kayıp</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>AI İçgörüleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3 rounded-lg bg-neural/10 border border-neural/20">
                  <p className="font-medium text-neural">Müşteri Davranış Kalıbı</p>
                  <p className="text-muted-foreground">
                    Dijital ikizler hafta sonu kullanımındaki düşüşü en güçlü kayıp göstergesi olarak tespit etti
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-data/10 border border-data/20">
                  <p className="font-medium text-data">Optimal Müdahale Zamanı</p>
                  <p className="text-muted-foreground">
                    Kampanyalar tahmin edilen kayıptan 2-3 hafta önce uygulandığında en etkili
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-success">Yatırım Getirisi</p>
                  <p className="text-muted-foreground">
                    Hedefli müdahaleler yoluyla %247 yatırım getirisi elde edildi
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics