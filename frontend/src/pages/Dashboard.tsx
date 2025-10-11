import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Bot, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  LogOut
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
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
                <Button variant="ghost" size="sm" className="hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="bg-muted">
                <BarChart3 className="w-4 h-4 mr-2" />
                Panel
              </Button>
              <Link to="/statistics">
                <Button variant="ghost" size="sm" className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analitik
                </Button>
              </Link>
              <Link to="/chatbot">
                <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Asistan
                </Button>
              </Link>
              <Link to="/simulation">
                <Button variant="ghost" size="sm" className="hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/20 dark:hover:text-purple-400">
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
          <h1 className="text-3xl font-bold mb-2">Dijital İkiz Kontrol Paneli</h1>
          <p className="text-muted-foreground">
            Müşteri dijital ikizleriniz ve kayıp önleme sisteminizden gerçek zamanlı içgörüler
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-border animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktif Dijital İkizler</CardTitle>
              <Bot className="h-4 w-4 text-neural" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24,571</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+12%</span> geçen aydan beri
              </p>
            </CardContent>
          </Card>

          <Card className="data-border animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kayıp Risk Skoru</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.4%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">-5.2%</span> geçen aydan beri
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Elde Tutulan Müşteriler</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,847</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+18%</span> bu çeyrekte
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Korunan Gelir</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.8M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+24%</span> bu çeyrekte
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
                      <p className="text-2xl font-bold text-destructive">847</p>
                      <Badge variant="destructive" className="text-xs">Yüksek Öncelik</Badge>
                    </div>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Orta Riskli Müşteriler</p>
                      <p className="text-xs text-muted-foreground">Kayıp olasılığı %40-70</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-warning">2,341</p>
                      <Badge variant="secondary" className="text-xs">İzleniyor</Badge>
                    </div>
                  </div>
                  <Progress value={58} className="h-2" />
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
                      <p className="text-2xl font-bold text-success">21,383</p>
                      <Badge className="text-xs bg-success text-success-foreground">Kararlı</Badge>
                    </div>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Digital Twin Insights */}
            <Card className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
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
              <CardContent className="space-y-3">
                <Link to="/simulation" className="block">
                  <Button variant="neural" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    Simülasyon Çalıştır
                  </Button>
                </Link>
                <Link to="/chatbot" className="block">
                  <Button variant="data" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Asistan
                  </Button>
                </Link>
                <Link to="/statistics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analitikleri Görüntüle
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
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Bugünün Performansı</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Doğruluğu</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tahmin Güvenilirliği</span>
                    <span className="font-medium">87.8%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Veri İşleme</span>
                    <span className="font-medium">99.1%</span>
                  </div>
                  <Progress value={99} className="h-2" />
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