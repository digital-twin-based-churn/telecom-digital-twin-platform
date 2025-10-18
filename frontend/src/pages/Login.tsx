import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Bot, Shield, Zap, Users, Building2, Lock, Mail, Eye, EyeOff, CheckCircle, ArrowRight, Sparkles, Wifi, Signal, Smartphone, Radio, Satellite, Network } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard"
    navigate(from, { replace: true })
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      await login(email, password)
      const from = location.state?.from?.pathname || "/dashboard"
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılırken bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2e8f0%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40 animate-gradient-shift" />
      
      {/* Enhanced Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-gradient-to-r from-primary/40 to-accent/40 rounded-full animate-smooth-float-enhanced"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Data Flow Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-20">
          <defs>
            <linearGradient id="professionalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--accent))" />
              <stop offset="100%" stopColor="hsl(var(--neural))" />
            </linearGradient>
          </defs>
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={i}
              x1={`${Math.random() * 100}%`}
              y1={`${Math.random() * 100}%`}
              x2={`${Math.random() * 100}%`}
              y2={`${Math.random() * 100}%`}
              stroke="url(#professionalGradient)"
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

      {/* Sparkle Effects */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-accent/70 to-primary/70 rounded-full animate-smooth-wave"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen">
        {/* Left Panel - Company Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          {/* Modern geometric pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2280%22%20height%3D%2280%22%20viewBox%3D%220%200%2080%2080%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2240%22%20cy%3D%2240%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60 animate-gradient-shift" />
          
          {/* Floating orbs */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-smooth-float-enhanced"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl animate-smooth-float-enhanced" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-smooth-float-enhanced" style={{ animationDelay: '4s' }}></div>
          
          <div className="relative z-10 flex flex-col justify-center items-center w-full h-full text-white px-8">
            {/* Hero Section */}
            <div className="text-center mb-16 animate-professional-slide-up-enhanced w-full max-w-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto mb-8 animate-professional-scale-in-enhanced" style={{ animationDelay: '0.3s' }}>
                <Signal className="w-10 h-10 text-white animate-professional-icon-bounce-enhanced" />
              </div>
              
              <h1 className="text-4xl font-bold mb-4 leading-tight text-white animate-professional-fade-in-enhanced" style={{ animationDelay: '0.5s' }}>
                Dijital İkiz
              </h1>
              <h2 className="text-2xl font-semibold mb-6 text-slate-200 animate-professional-fade-in-enhanced" style={{ animationDelay: '0.6s' }}>
                Müşteri Kaybı Önleme
              </h2>
              
              <p className="text-slate-300 text-lg leading-relaxed animate-professional-fade-in-enhanced max-w-lg mx-auto" style={{ animationDelay: '0.7s' }}>
                AI destekli müşteri elde tutma sistemi ile müşteri kaybını önleyin ve işletmenizi büyütün.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 w-full max-w-lg mx-auto text-center">
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 animate-professional-slide-in-right-enhanced hover:bg-white/10 transition-all duration-300" style={{ animationDelay: '0.9s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl flex items-center justify-center">
                    <Network className="w-7 h-7 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Dijital İkiz Teknolojisi</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Geçmiş davranışlara dayalı olarak her müşteri için kişiselleştirilmiş sanal ajanlar oluşturun.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 animate-professional-slide-in-right-enhanced hover:bg-white/10 transition-all duration-300" style={{ animationDelay: '1.1s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-indigo-600/30 rounded-xl flex items-center justify-center">
                    <Wifi className="w-7 h-7 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Gerçek Zamanlı Tahminler</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Gelişmiş ML algoritmaları açıklanabilir AI içgörüleri ile müşteri kaybı riskini tahmin eder.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 animate-professional-slide-in-right-enhanced hover:bg-white/10 transition-all duration-300" style={{ animationDelay: '1.3s' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-7 h-7 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">Kampanya Simülasyonu</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Gerçek müşteri uygulamasından önce dijital ikizler üzerinde pazarlama stratejilerini test edin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8 animate-smooth-bounce-in">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-smooth-glow-pulse mx-auto mb-4 animate-smooth-scale-in" style={{ animationDelay: '0.2s' }}>
                <Building2 className="w-8 h-8 text-white animate-icon-bounce" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-smooth-fade-in" style={{ animationDelay: '0.3s' }}>
                Dijital İkiz Platformu
              </h1>
            </div>

            <Card className="professional-card animate-smooth-slide-up hover-lift smooth-transition">
              <CardHeader className="space-y-2 pb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-smooth-glow-pulse">
                    <Lock className="w-8 h-8 text-white animate-icon-bounce" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white animate-smooth-fade-in" style={{ animationDelay: '0.1s' }}>
                    Sisteme Giriş
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 animate-smooth-fade-in" style={{ animationDelay: '0.2s' }}>
                    Kurumsal hesabınızla giriş yapın
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2 animate-smooth-slide-right" style={{ animationDelay: '0.3s' }}>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      E-posta Adresi
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@turkcell.com.tr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10 h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 smooth-transition hover:shadow-md focus:scale-[1.01]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 animate-smooth-slide-right" style={{ animationDelay: '0.4s' }}>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Şifre
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10 pr-10 h-12 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 smooth-transition hover:shadow-md focus:scale-[1.01]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 smooth-transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between animate-smooth-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                        Beni hatırla
                      </Label>
                    </div>
                    <Link 
                      to="#" 
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium smooth-transition"
                    >
                      Şifremi unuttum
                    </Link>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium smooth-transition disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] animate-smooth-bounce-in"
                    style={{ animationDelay: '0.6s' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Giriş yapılıyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Giriş Yap</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>
                
                <Separator className="my-6" />
                
                <div className="text-center space-y-4 animate-smooth-fade-in" style={{ animationDelay: '0.7s' }}>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Demo hesap: admin</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Şifre: admin123</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Önce API'yi çalıştırın ve bir kullanıcı oluşturun
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 text-center animate-smooth-fade-in" style={{ animationDelay: '0.8s' }}>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Dijital İkiz Platformu. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login