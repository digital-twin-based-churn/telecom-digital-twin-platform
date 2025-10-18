import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  LogOut,
  Home,
  BarChart3,
  Target,
  MessageSquare
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const Settings = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Settings states - Only working features
  const [preferences, setPreferences] = useState({
    theme: "system"
  })
  
  const [notifications, setNotifications] = useState({
    churnAlerts: true,
    systemUpdates: false
  })

  // Load settings on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    const savedNotifications = localStorage.getItem('userNotifications')
    
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      setPreferences(prefs)
      
      // Apply saved theme
      if (prefs.theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else if (prefs.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        // System theme
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      // Apply saved language
      if (prefs.language) {
        document.documentElement.lang = prefs.language
      }
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    localStorage.setItem('userNotifications', JSON.stringify(notifications))
    
    // Apply theme immediately
    if (preferences.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    console.log("Settings saved:", { notifications, preferences })
    
    // Show success toast
    toast({
      title: "✅ Ayarlar Kaydedildi",
      description: "Tercihleriniz başarıyla kaydedildi ve uygulandı.",
      duration: 3000,
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 dark:from-slate-900 dark:via-blue-900 dark:to-blue-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-blue-200/60 dark:border-gray-700/60 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Ayarlar
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sistem ve kullanıcı tercihleri
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Ayarlar</CardTitle>
                <CardDescription>Tercihlerinizi yönetin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg h-10 font-medium">
                    <Home className="w-4 h-4 mr-3" />
                    Ana Sayfa
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg h-10 font-medium">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/risk-analysis">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/80 dark:text-gray-300 dark:hover:text-cyan-400 dark:hover:bg-cyan-900/20 rounded-lg h-10 font-medium">
                    <Target className="w-4 h-4 mr-3" />
                    Risk Analizi
                  </Button>
                </Link>
                <Link to="/chatbot">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-green-600 hover:bg-green-50/80 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-green-900/20 rounded-lg h-10 font-medium">
                    <MessageSquare className="w-4 h-4 mr-3" />
                    AI Asistan
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/20 rounded-lg h-10 font-semibold border border-blue-200/50 dark:border-blue-800/50">
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Ayarlar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Preferences */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Temel Ayarlar</CardTitle>
                    <CardDescription>Görünüm tercihleri</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={preferences.theme} onValueChange={(value) => {
                      setPreferences(prev => ({ ...prev, theme: value }))
                      // Apply theme immediately
                      if (value === 'light') {
                        document.documentElement.classList.remove('dark')
                        toast({
                          title: "☀️ Açık Tema",
                          description: "Tema açık moda geçirildi.",
                          duration: 2000,
                        })
                      } else if (value === 'dark') {
                        document.documentElement.classList.add('dark')
                        toast({
                          title: "🌙 Koyu Tema",
                          description: "Tema koyu moda geçirildi.",
                          duration: 2000,
                        })
                      } else {
                        // System theme
                        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                        if (isDark) {
                          document.documentElement.classList.add('dark')
                        } else {
                          document.documentElement.classList.remove('dark')
                        }
                        toast({
                          title: "⚙️ Sistem Teması",
                          description: "Tema sistem tercihine ayarlandı.",
                          duration: 2000,
                        })
                      }
                    }}>
                      <SelectTrigger className="border-2 focus:border-blue-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Açık</SelectItem>
                        <SelectItem value="dark">Koyu</SelectItem>
                        <SelectItem value="system">Sistem</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tema değişikliği anında uygulanır ve kaydedilir.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Bildirim Ayarları</CardTitle>
                    <CardDescription>Hangi bildirimleri almak istediğinizi seçin</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="churn-alerts">Churn Uyarıları</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Yüksek riskli müşteri uyarıları</p>
                    </div>
                    <Switch 
                      id="churn-alerts"
                      checked={notifications.churnAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, churnAlerts: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="system-updates">Sistem Güncellemeleri</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Yeni özellikler ve güncellemeler</p>
                    </div>
                    <Switch 
                      id="system-updates"
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Kullanıcı Bilgileri</CardTitle>
                    <CardDescription>Hesap bilgileriniz</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kullanıcı Adı</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <span className="text-sm font-medium">{user?.username || user?.email || 'Kullanıcı'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <span className="text-sm font-medium">{user?.email || 'Belirtilmemiş'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                className="px-8"
                onClick={() => {
                  setPreferences({ theme: "system" })
                  setNotifications({ churnAlerts: true, systemUpdates: false })
                  // Apply system theme
                  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                  if (isDark) {
                    document.documentElement.classList.add('dark')
                  } else {
                    document.documentElement.classList.remove('dark')
                  }
                  
                  // Show reset toast
                  toast({
                    title: "🔄 Ayarlar Sıfırlandı",
                    description: "Tüm ayarlar varsayılan değerlere döndürüldü.",
                    duration: 3000,
                  })
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sıfırla
              </Button>
              <Button onClick={handleSaveSettings} className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Ayarları Kaydet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
