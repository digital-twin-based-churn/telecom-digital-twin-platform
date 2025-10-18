import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Bot, 
  BarChart3, 
  MessageSquare, 
  Play, 
  Shield, 
  Zap, 
  Users, 
  Brain, 
  Target, 
  TrendingUp,
  Network,
  Smartphone,
  Radio,
  Satellite,
  Wifi,
  Signal,
  Building2,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Globe,
  Cpu,
  Database,
  Lock,
  Eye,
  RefreshCw,
  Award,
  DollarSign,
  Percent,
  Clock,
  Star,
  LogOut
} from "lucide-react"

const HomePage = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Signal className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dijital İkiz Platformu
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/statistics" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Analitik
            </Link>
            <Link to="/chatbot" className="text-sm font-medium hover:text-blue-600 transition-colors">
              AI Asistan
            </Link>
            <Link to="/simulation" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Simülasyon
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                  Hoş geldin, {user?.username || user?.email}
                </span>
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Giriş Yap</Button>
                </Link>
                <Link to="/login">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Demo Başlat</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 animate-pulse" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '7s', animationDelay: '4s' }}></div>
        
        {/* Data Flow Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-20">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {Array.from({ length: 6 }).map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="url(#flowGradient)"
                strokeWidth="1"
                strokeDasharray="20,10"
                className="opacity-40"
                style={{
                  animation: `flow-line ${6 + Math.random() * 4}s linear infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </svg>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-5xl mx-auto">
            <Badge className="mb-6 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
              Yenilikçi AI Teknolojisi
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
                Dijital İkiz Tabanlı
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                Churn Önleme Sistemi
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Telekomünikasyon sektöründe müşteri kaybını önlemek için geliştirilen yenilikçi yapay zeka çözümü. 
              Her abonenin geçmiş davranış verilerine dayanarak oluşturulan kişiselleştirilmiş dijital ikizler ile 
              gerçek müşteriler üzerinde uygulamadan önce kampanya stratejilerini test edin.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 h-12 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <BarChart3 className="w-5 h-5 mr-2 animate-pulse" />
                      Dashboard'a Git
                    </Button>
                  </Link>
                  <Link to="/simulation">
                    <Button size="lg" variant="outline" className="text-lg px-8 h-12 border-blue-200 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <Eye className="w-5 h-5 mr-2" />
                      Simülasyon İncele
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 h-12 transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                      <Play className="w-5 h-5 mr-2 animate-pulse" />
                      Demo Başlat
                    </Button>
                  </Link>
                  <Link to="/simulation">
                    <Button size="lg" variant="outline" className="text-lg px-8 h-12 border-blue-200 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                      <Eye className="w-5 h-5 mr-2" />
                      Simülasyon İncele
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1s' }}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
                  <Percent className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white animate-count-up">%20-30</h3>
                <p className="text-gray-600 dark:text-gray-300">Müşteri Kaybı Azaltma</p>
              </div>
              <div className="text-center animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1.2s' }}>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white animate-count-up">%15-25</h3>
                <p className="text-gray-600 dark:text-gray-300">Pazarlama Verimliliği</p>
              </div>
              <div className="text-center animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1.4s' }}>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce" style={{ animationDuration: '2s', animationDelay: '1s' }}>
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Gerçek Zamanlı</h3>
                <p className="text-gray-600 dark:text-gray-300">Sürekli Öğrenme</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-50/50 to-green-50/50 dark:from-red-900/10 dark:to-green-900/10 animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Telekomünikasyon Sektörünün Kritik Sorunu
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Müşteri kaybı (churn), telekomünikasyon şirketlerinin karşılaştığı en kritik sorunlardan biridir. 
                Yeni müşteri edinme maliyeti, mevcut müşteriyi elde tutma maliyetinin 5-25 katıdır.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-in-left">
                <h3 className="text-2xl font-bold mb-6 text-red-600 dark:text-red-400">Geleneksel Yaklaşımın Sorunları</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                      <span className="text-red-600 dark:text-red-400 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Reaktif yaklaşım - müşteri kaybedildikten sonra müdahale</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                      <span className="text-red-600 dark:text-red-400 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Segment bazlı tahminler - bireysel müşteri davranışlarını göz ardı eder</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.6s' }}>
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                      <span className="text-red-600 dark:text-red-400 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Kampanya optimizasyonu sorunları - hedefsiz ve maliyetli</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '0.8s' }}>
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-pulse">
                      <span className="text-red-600 dark:text-red-400 text-sm">✗</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Kara kutu AI - kararların gerekçesi belirsiz</p>
                  </div>
                </div>
              </div>

              <div className="animate-slide-in-right">
                <h3 className="text-2xl font-bold mb-6 text-green-600 dark:text-green-400">Dijital İkiz Çözümü</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1s' }}>
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-bounce">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Proaktif yaklaşım - sorunlar ortaya çıkmadan önce müdahale</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1.2s' }}>
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Kişiselleştirilmiş dijital ikizler - her müşteri için özel model</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1.4s' }}>
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-bounce" style={{ animationDelay: '1s' }}>
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Sanal laboratuvar - kampanyaları dijital ikizlerde test et</p>
                  </div>
                  <div className="flex items-start space-x-3 animate-fade-in-up hover:scale-105 transition-all duration-300" style={{ animationDelay: '1.6s' }}>
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1 animate-bounce" style={{ animationDelay: '1.5s' }}>
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Açıklanabilir AI - her kararın şeffaf gerekçesi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Özgün Teknolojik Yenilikler
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistemimiz, telekomünikasyon sektöründe ilk kez "sanal laboratuvar" mantığıyla çalışan 
              yenilikçi teknolojiler sunmaktadır.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-blue-200 dark:border-blue-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 animate-bounce">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Çok Katmanlı Temsili Öğrenme</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Abonenin demografik, davranışsal ve duygusal verilerini bütünleştiren derin temsili öğrenme modelleri
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-green-200 dark:border-green-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4 animate-bounce" style={{ animationDelay: '0.5s' }}>
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-900 dark:text-green-100">Agent-Based Modeling</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Müşterileri aktif karar vericiler olarak modelleyen, sosyal ağ etkilerini de dahil eden sistem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-purple-200 dark:border-purple-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4 animate-bounce" style={{ animationDelay: '1s' }}>
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-900 dark:text-purple-100">Nedensel Çıkarım Motorları</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Müşteri davranışları arasındaki gerçek nedensellik ilişkilerini tespit eden algoritmalar
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-orange-200 dark:border-orange-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4 animate-bounce" style={{ animationDelay: '1.5s' }}>
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-orange-900 dark:text-orange-100">Açıklanabilir AI (XAI)</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Karmaşık yapay zeka kararlarını insan kullanıcılar için anlaşılır hale getiren arayüz
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-indigo-200 dark:border-indigo-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4 animate-spin" style={{ animationDuration: '3s' }}>
                  <RefreshCw className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-indigo-900 dark:text-indigo-100">Transfer Öğrenme Mimarisi</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Bir segmentten öğrenilen davranış kalıplarını diğer segmentlere aktarabilen adaptif sistem
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-cyan-200 dark:border-cyan-800 animate-fade-in-up hover:scale-105 transform" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mb-4 animate-pulse">
                  <Play className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">Sanal Laboratuvar</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Gerçek müşterilere uygulamadan önce kampanya stratejilerini dijital ikizlerde test etme
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact & Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Etki ve Sürdürülebilirlik
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistemimiz, telekomünikasyon operatörlerine önemli ölçüde maliyet tasarrufu ve gelir artışı sağlar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-900 dark:text-green-100">Ekonomik Etki</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>%3-7 yıllık gelir koruması</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>%15-20 pazarlama verimliliği</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>5-7 kat müşteri edinme maliyeti tasarrufu</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Sosyal Etki</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Kişiselleştirilmiş hizmet deneyimi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Artırılmış müşteri memnuniyeti</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>Dijital eşitlik desteği</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-900 dark:text-purple-100">Sürdürülebilirlik</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>Sürekli kendini güncelleyen yapı</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>Modüler ve ölçeklenebilir mimari</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span>IoT ve 5G entegrasyonu</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Hedef Kitle ve Kullanım Alanları
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sistemimiz öncelikle telekomünikasyon operatörleri için tasarlanmış olup, 
              benzer sorunlar yaşayan diğer sektörlere de uyarlanabilir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-sm">Telekom Operatörleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Mobil ve sabit hat operatörleri
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-sm">İnternet Servis Sağlayıcıları</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Fiber ve kablolu internet sağlayıcıları
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-sm">Dijital Abonelik Hizmetleri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Streaming ve dijital platformlar
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-sm">Diğer Sektörler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Bankacılık, sigorta, e-ticaret
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Dijital Dönüşümünüzü Başlatın
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Telekomünikasyon sektörünün önde gelen şirketleri dijital ikiz teknolojimizi kullanarak 
              müşteri kaybını azaltıyor ve müşteri yaşam boyu değerini artırıyor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 h-12">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Dashboard'a Git
                    </Button>
                  </Link>
                  <Link to="/chatbot">
                    <Button size="lg" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 h-12">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      AI Asistan ile Konuş
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 h-12">
                      <Play className="w-5 h-5 mr-2" />
                      Demo Başlat
                    </Button>
                  </Link>
                  <Link to="/chatbot">
                    <Button size="lg" className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 h-12">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      AI Asistan ile Konuş
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Signal className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Dijital İkiz Platformu</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-center md:text-right">
              © 2025 Dijital İkiz Tabanlı Churn Önleme Sistemi. Gelişmiş AI ile desteklenmektedir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage