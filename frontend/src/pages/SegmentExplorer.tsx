import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Checkbox } from "@/components/ui/checkbox"
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
  Download,
  Filter,
  RefreshCw,
  LogOut,
  ChevronDown,
  Calculator,
  User,
  Megaphone
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"

const SegmentExplorer = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [serviceData, setServiceData] = useState<any[]>([])
  const [churnByService, setChurnByService] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedServices, setSelectedServices] = useState<string[]>(["Prepaid", "Postpaid", "Broadband"])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [services, churnServices] = await Promise.all([
        apiService.getServiceDistribution(),
        apiService.getChurnByService()
      ])
      setServiceData(services)
      setChurnByService(churnServices)
    } catch (error) {
      console.error('Segment veri çekme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleService = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const getChurnRate = (serviceType: string) => {
    const serviceChurn = churnByService.filter(d => d.service_type === serviceType)
    const churned = serviceChurn.find(d => d.churn === true)?.count || 0
    const active = serviceChurn.find(d => d.churn === false)?.count || 0
    const total = churned + active
    return total > 0 ? ((churned / total) * 100).toFixed(2) : '0'
  }

  const exportData = () => {
    alert('Excel export özelliği yakında eklenecek!')
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
                    <DropdownMenuItem className="bg-muted">
                      <Users className="w-4 h-4 mr-2" />
                      Segment Explorer ✓
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
              
              <Link to="/chatbot"><Button variant="ghost" size="sm"><MessageSquare className="w-4 h-4 mr-2" />AI Asistan</Button></Link>
              <Link to="/simulation"><Button variant="ghost" size="sm"><Play className="w-4 h-4 mr-2" />Simülasyon</Button></Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Çıkış
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Segment Explorer</h1>
            <p className="text-muted-foreground">
              Müşteri segmentlerini karşılaştır ve analiz et - 10M gerçek müşteri verisi
            </p>
          </div>
          <Button onClick={exportData} className="bg-gradient-to-r from-emerald-500 to-teal-500">
            <Download className="w-4 h-4 mr-2" />
            Excel'e Aktar
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Segment Filtreleri</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              {["Prepaid", "Postpaid", "Broadband"].map(service => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedServices.includes(service)}
                    onCheckedChange={() => toggleService(service)}
                  />
                  <label className="text-sm font-medium">{service}</label>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {serviceData.filter(s => selectedServices.includes(s.service_type)).map((service, index) => (
            <Card key={service.service_type} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{service.service_type}</span>
                  <Badge variant="outline">{service.percentage}%</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                  <p className="text-2xl font-bold">{service.count?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Churn Oranı</p>
                  <p className="text-xl font-bold text-warning">{getChurnRate(service.service_type)}%</p>
                </div>
                <div className="pt-2">
                  <Badge className={`w-full justify-center ${
                    parseFloat(getChurnRate(service.service_type)) > 2 
                      ? 'bg-red-500' 
                      : parseFloat(getChurnRate(service.service_type)) > 1 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}>
                    {parseFloat(getChurnRate(service.service_type)) > 2 ? 'Yüksek Risk' : 
                     parseFloat(getChurnRate(service.service_type)) > 1 ? 'Orta Risk' : 'Düşük Risk'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detaylı Segment Karşılaştırması</CardTitle>
            <CardDescription>Yan yana segment metriklerini görüntüle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">Metrik</th>
                    {selectedServices.map(service => (
                      <th key={service} className="text-center p-4 font-semibold">{service}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Müşteri Sayısı</td>
                    {selectedServices.map(service => {
                      const data = serviceData.find(s => s.service_type === service)
                      return <td key={service} className="text-center p-4">{data?.count?.toLocaleString() || '0'}</td>
                    })}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Pazar Payı</td>
                    {selectedServices.map(service => {
                      const data = serviceData.find(s => s.service_type === service)
                      return <td key={service} className="text-center p-4">{data?.percentage || '0'}%</td>
                    })}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Churn Oranı</td>
                    {selectedServices.map(service => (
                      <td key={service} className="text-center p-4">
                        <Badge variant={parseFloat(getChurnRate(service)) > 1.5 ? "destructive" : "secondary"}>
                          {getChurnRate(service)}%
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="p-4 font-medium">Risk Seviyesi</td>
                    {selectedServices.map(service => {
                      const rate = parseFloat(getChurnRate(service))
                      return (
                        <td key={service} className="text-center p-4">
                          <Badge className={`${
                            rate > 2 ? 'bg-red-500' : rate > 1 ? 'bg-yellow-500' : 'bg-green-500'
                          } text-white`}>
                            {rate > 2 ? 'Yüksek' : rate > 1 ? 'Orta' : 'Düşük'}
                          </Badge>
                        </td>
                      )
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SegmentExplorer

