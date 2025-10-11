import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Bot, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  Settings,
  Users,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { Link } from "react-router-dom"

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [simulationResults, setSimulationResults] = useState(null)

  const runSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setSimulationResults(null)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setSimulationResults({
            totalCustomers: 5000,
            predictedChurners: 1250,
            retentionRate: 73.4,
            campaignEffectiveness: 89.2,
            revenueProtected: 2.8,
            confidence: 94.7
          })
          return 100
        }
        return prev + 2
      })
    }, 100)
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
              <Link to="/chatbot">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Asistan
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="bg-muted">
                <Play className="w-4 h-4 mr-2" />
                Simülasyon
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm">Sonuçları Dışa Aktar</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Dijital İkiz Simülasyonu</h1>
          <p className="text-muted-foreground">
            Gerçek müşterilere uygulamadan önce dijital ikizler üzerinde pazarlama stratejilerini ve elde tutma kampanyalarını test edin
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulation Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Panel */}
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Simülasyon Yapılandırması</span>
                </CardTitle>
                <CardDescription>
                  Dijital ikiz simülasyon parametrelerinizi yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer-segment">Müşteri Segmenti</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Segment seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium Müşteriler</SelectItem>
                          <SelectItem value="standard">Standart Müşteriler</SelectItem>
                          <SelectItem value="basic">Temel Müşteriler</SelectItem>
                          <SelectItem value="all">Tüm Müşteriler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="campaign-type">Kampanya Tipi</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Kampanya seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">İndirim Teklifi</SelectItem>
                          <SelectItem value="upgrade">Hizmet Yükseltme</SelectItem>
                          <SelectItem value="retention">Elde Tutma Araması</SelectItem>
                          <SelectItem value="email">E-posta Kampanyası</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sample-size">Örnek Boyutu</Label>
                      <Input type="number" placeholder="5000" defaultValue="5000" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="time-horizon">Zaman Ufku (gün)</Label>
                      <Input type="number" placeholder="90" defaultValue="90" />
                    </div>

                    <div>
                      <Label htmlFor="confidence-level">Güven Seviyesi</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="95%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="simulation-runs">Simülasyon Çalıştırma Sayısı</Label>
                      <Input type="number" placeholder="1000" defaultValue="1000" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="flex items-center space-x-2"
                  >
                    {isRunning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Simülasyon Çalışıyor...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Simülasyonu Başlat</span>
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" disabled={isRunning}>
                    Parametreleri Sıfırla
                  </Button>
                </div>

                {/* Progress Bar */}
                {isRunning && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span>Dijital ikizler işleniyor...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            {simulationResults && (
              <Card className="animate-fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Simülasyon Sonuçları</span>
                  </CardTitle>
                  <CardDescription>
                    Dijital ikiz simülasyonu başarıyla tamamlandı
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg neural-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Analiz Edilen Toplam Müşteri</span>
                          <Target className="w-4 h-4 text-neural" />
                        </div>
                        <p className="text-2xl font-bold">{simulationResults.totalCustomers.toLocaleString()}</p>
                      </div>

                      <div className="p-4 rounded-lg data-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tahmin Edilen Kayıplar</span>
                          <AlertCircle className="w-4 h-4 text-warning" />
                        </div>
                        <p className="text-2xl font-bold text-warning">{simulationResults.predictedChurners.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          toplam müşterinin %{((simulationResults.predictedChurners / simulationResults.totalCustomers) * 100).toFixed(1)}'i
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Beklenen Elde Tutma Oranı</span>
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-success">%{simulationResults.retentionRate}</p>
                        <p className="text-xs text-muted-foreground">+%18.3 iyileşme</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Kampanya Etkinliği</span>
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-primary">%{simulationResults.campaignEffectiveness}</p>
                        <p className="text-xs text-muted-foreground">Başarı olasılığı</p>
                      </div>

                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Korunan Gelir</span>
                          <span className="text-lg">💰</span>
                        </div>
                        <p className="text-2xl font-bold text-accent">${simulationResults.revenueProtected}M</p>
                        <p className="text-xs text-muted-foreground">Tahmini aylık etki</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Güven Seviyesi</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold">%{simulationResults.confidence}</p>
                        <p className="text-xs text-muted-foreground">İstatistiksel güven</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-neural/5 border border-neural/20">
                    <h4 className="font-semibold mb-3 text-neural">Dijital İkiz İçgörüleri</h4>
                    <div className="space-y-2 text-sm">
                      <p>• Yüksek değerli müşteriler kişiselleştirilmiş tekliflerle %67 daha yüksek elde tutma oranı gösteriyor</p>
                      <p>• Dijital ikizler optimal kampanya zamanlamasını tahmin ediyor: tahmin edilen kayıptan 2-3 hafta önce</p>
                      <p>• E-posta + indirim kombinasyonu en yüksek etkinliği gösteriyor (%89.2)</p>
                      <p>• Yüksek destek etkileşimli müşteri segmentleri elde tutma aramalarına daha iyi yanıt veriyor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Simulation History */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle>Son Simülasyonlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Premium İndirim Kampanyası</p>
                    <p className="text-xs text-muted-foreground">%89.2 başarı oranı</p>
                    <p className="text-xs text-muted-foreground">2 saat önce</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Hizmet Yükseltme Stratejisi</p>
                    <p className="text-xs text-muted-foreground">%76.8 başarı oranı</p>
                    <p className="text-xs text-muted-foreground">1 gün önce</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">E-posta Kampanyası Testi</p>
                    <p className="text-xs text-muted-foreground">%54.3 başarı oranı</p>
                    <p className="text-xs text-muted-foreground">3 gün önce</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Sistem Kaynakları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dijital İkiz Modelleri</span>
                    <span className="font-medium">24,571 aktif</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simülasyon Kapasitesi</span>
                    <span className="font-medium">%73 müsait</span>
                  </div>
                  <Progress value={27} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>İşlem Kuyruğu</span>
                    <span className="font-medium">12 bekliyor</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Simülasyon İpuçları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-neural/10 border border-neural/20">
                  <p className="font-medium text-neural">Örnek Boyutu</p>
                  <p className="text-muted-foreground">Güvenilir sonuçlar için en az 1.000 müşteri kullanın</p>
                </div>

                <div className="p-3 rounded-lg bg-data/10 border border-data/20">
                  <p className="font-medium text-data">Zaman Ufku</p>
                  <p className="text-muted-foreground">90 günlük periyotlar optimal tahmin doğruluğu sağlar</p>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-success">Güven Seviyesi</p>
                  <p className="text-muted-foreground">İş kararları için %95 güven önerilir</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulation