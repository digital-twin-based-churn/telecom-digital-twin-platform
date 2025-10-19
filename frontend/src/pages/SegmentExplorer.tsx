import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
  Download,
  Filter,
  RefreshCw,
  LogOut,
  ChevronDown,
  Calculator,
  User,
  Megaphone,
  Signal,
  FileSpreadsheet,
  Eye,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Percent,
  Activity
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"

const SegmentExplorer = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [serviceData, setServiceData] = useState<any[]>([])
  const [churnByService, setChurnByService] = useState<any[]>([])
  const [segmentAnalysis, setSegmentAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedServices, setSelectedServices] = useState<string[]>(["Prepaid", "Postpaid", "Broadband"])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const exportToExcel = () => {
    if (!segmentAnalysis?.segments) return

    // Create CSV content
    const headers = [
      'Segment',
      'Müşteri Sayısı',
      'Pazar Payı (%)',
      'Churn Oranı (%)',
      'Ortalama Aylık Ücret (₺)',
      'Aylık Gelir (₺)',
      'Risk Seviyesi'
    ]

    const rows = segmentAnalysis.segments.map((segment: any) => [
      segment.service_type,
      segment.customer_count,
      segment.percentage,
      segment.churn_rate,
      segment.avg_monthly_charge,
      segment.monthly_revenue,
      segment.risk_level
    ])

    // Add summary row
    const summaryRow = [
      'TOPLAM',
      segmentAnalysis.total_customers,
      '100.00',
      segmentAnalysis.overall_churn_rate,
      '',
      segmentAnalysis.segments.reduce((sum: number, seg: any) => sum + seg.monthly_revenue, 0),
      ''
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      summaryRow.join(',')
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `segment-analizi-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [services, analysis] = await Promise.all([
        apiService.getServiceDistribution(),
        apiService.getSegmentAnalysis()
      ])
      setServiceData(services)
      setSegmentAnalysis(analysis)
      
      // Churn verilerini segment analysis'ten çıkar
      if (analysis && analysis.segments) {
        const churnData = analysis.segments.map(segment => [
          {
            service_type: segment.service_type,
            churn: true,
            count: Math.round(segment.customer_count * segment.churn_rate / 100)
          },
          {
            service_type: segment.service_type,
            churn: false,
            count: segment.customer_count - Math.round(segment.customer_count * segment.churn_rate / 100)
          }
        ]).flat()
        setChurnByService(churnData)
      }
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
                  <Signal className="w-6 h-6 text-primary-foreground" />
                </div>
              <span className="text-xl font-bold">Dijital İkiz Platformu</span>
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
              <Link to="/agent-modeling"><Button variant="ghost" size="sm"><Play className="w-4 h-4 mr-2" />Agent-Based Modeling</Button></Link>
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
        {/* Professional Header */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                    <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Segment Explorer</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-xl">
                      Müşteri segmentlerini karşılaştır ve analiz et
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="font-medium">10M+ Gerçek Müşteri Verisi</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-full">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Canlı Analiz</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-full">
                    <Shield className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">Güvenli Veri</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={exportToExcel} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl px-6 py-3 shadow-lg"
                  size="lg"
                >
                  <FileSpreadsheet className="w-5 h-5 mr-2" />
                  Excel'e Aktar
                </Button>
                <Button 
                  onClick={fetchData} 
                  variant="outline"
                  className="border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Verileri Yenile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Summary Cards */}
        {segmentAnalysis && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                    <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">+12%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Toplam Müşteri</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{segmentAnalysis.total_customers?.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Bu ay artış</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl">
                    <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <TrendingDown className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">-0.3%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Churn Oranı</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{segmentAnalysis.overall_churn_rate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">İyileşme trendi</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                    <PieChart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">Aktif</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Aktif Segmentler</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{segmentAnalysis.segments?.length || 0}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tümü çalışır durumda</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl">
                    <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Güncel</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Risk Seviyesi</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">Orta</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Son güncelleme</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Professional Filters */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-700 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                <Filter className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">Segment Filtreleri</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analiz için segment seçimi yapın</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-wrap items-center gap-8">
              <div className="flex items-center space-x-6">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Hizmet Türleri:</span>
                <div className="flex items-center space-x-4">
                  {["Prepaid", "Postpaid", "Broadband"].map(service => (
                    <div key={service} className="flex items-center space-x-3">
                      <Checkbox
                        id={service}
                        checked={selectedServices.includes(service)}
                        onCheckedChange={() => toggleService(service)}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 w-5 h-5"
                      />
                      <label htmlFor={service} className="text-lg font-medium cursor-pointer text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={fetchData} 
                  className="border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl px-6 py-3"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Verileri Yenile
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={exportToExcel} 
                  className="border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-2xl px-6 py-3"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {serviceData.filter(s => selectedServices.includes(s.service_type)).map((service, index) => {
            const churnRate = parseFloat(getChurnRate(service.service_type))
            const riskLevel = churnRate > 2 ? 'high' : churnRate > 1 ? 'medium' : 'low'
            const riskColors = {
              high: 'from-red-500 to-red-600',
              medium: 'from-yellow-500 to-orange-500',
              low: 'from-green-500 to-emerald-500'
            }
            
            return (
              <Card key={service.service_type} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 rounded-3xl overflow-hidden">
                <CardHeader className="pb-6 p-8">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl ${
                        riskLevel === 'high' ? 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20' :
                        riskLevel === 'medium' ? 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20' :
                        'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20'
                      }`}>
                        <Signal className={`w-8 h-8 ${
                          riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                          riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{service.service_type}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Segment Analizi</p>
                      </div>
                    </div>
                    <Badge className={`px-4 py-2 text-lg font-semibold rounded-2xl ${
                      riskLevel === 'high' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' :
                      riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                    }`}>
                      {service.percentage}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mx-auto mb-4">
                        <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Toplam Müşteri</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{service.count?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-fit mx-auto mb-4">
                        <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">Churn Oranı</p>
                      <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{getChurnRate(service.service_type)}%</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Risk Analizi</span>
                      <div className="flex items-center space-x-3">
                        {riskLevel === 'high' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {riskLevel === 'medium' && <Clock className="w-5 h-5 text-yellow-500" />}
                        {riskLevel === 'low' && <CheckCircle className="w-5 h-5 text-green-500" />}
                        <span className={`text-lg font-semibold ${
                          riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                          riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {riskLevel === 'high' ? 'Yüksek Risk' : 
                           riskLevel === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Risk Seviyesi</span>
                        <span>{churnRate.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={churnRate * 50} 
                        className={`h-3 rounded-full ${
                          riskLevel === 'high' ? '[&>div]:bg-red-500' :
                          riskLevel === 'medium' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Segment Analysis */}
        {segmentAnalysis && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span>Gelişmiş Segment Analizi</span>
              </CardTitle>
              <CardDescription>GYK-capstone-project'ten gelen detaylı segment metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {segmentAnalysis.segments?.map((segment: any, index: number) => (
                  <div key={segment.service_type} className="p-4 rounded-lg border bg-background/50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{segment.service_type}</h3>
                      <Badge variant={segment.risk_level === 'Yüksek' ? 'destructive' : segment.risk_level === 'Orta' ? 'secondary' : 'default'}>
                        {segment.risk_level} Risk
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Müşteri Sayısı:</span>
                        <span className="font-medium">{segment.customer_count?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pazar Payı:</span>
                        <span className="font-medium">{segment.percentage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ortalama Ücret:</span>
                        <span className="font-medium">₺{segment.avg_monthly_charge?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <span>Aylık Gelir:</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                <Calculator className="h-3 w-3 text-blue-500" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-blue-600">Aylık Gelir Hesaplama Formülü</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Formül:</strong></p>
                                  <p className="bg-blue-50 p-2 rounded font-mono text-xs">
                                    Aylık Gelir = Müşteri Sayısı × Ortalama Aylık Ücret
                                  </p>
                                  <p><strong>Bu Segment İçin:</strong></p>
                                  <p className="bg-green-50 p-2 rounded text-xs">
                                    {segment.customer_count?.toLocaleString()} × ₺{segment.avg_monthly_charge?.toLocaleString()} = ₺{(segment.monthly_revenue / 1000000).toFixed(1)}M
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    GYK-capstone-project'ten gelen gerçek veriler kullanılmaktadır.
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <span className="font-medium text-green-600">₺{(segment.monthly_revenue / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <span>Churn Oranı:</span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                <Calculator className="h-3 w-3 text-orange-500" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-600">Churn Oranı Hesaplama</h4>
                                <div className="text-sm space-y-1">
                                  <p><strong>Segment Bazlı Churn Oranları:</strong></p>
                                  <p className="bg-orange-50 p-2 rounded text-xs">
                                    <strong>Prepaid:</strong> %1.8 (Yüksek - kolay terk edilebilir)
                                  </p>
                                  <p className="bg-yellow-50 p-2 rounded text-xs">
                                    <strong>Postpaid:</strong> %1.2 (Orta - kontrat bağlayıcılığı)
                                  </p>
                                  <p className="bg-green-50 p-2 rounded text-xs">
                                    <strong>Broadband:</strong> %0.9 (Düşük - hizmet bağımlılığı)
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    GYK-capstone-project verilerine dayalı segment özelliklerine göre hesaplanmıştır.
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <span className="font-medium text-orange-600">{segment.churn_rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Detaylı Segment Karşılaştırması</CardTitle>
                <CardDescription>Yan yana segment metriklerini görüntüle</CardDescription>
              </div>
              <Button onClick={exportToExcel} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel'e Aktar
              </Button>
            </div>
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
                    <td className="p-4 font-medium">
                      <div className="flex items-center space-x-1">
                        <span>Churn Oranı</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Calculator className="h-3 w-3 text-orange-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-orange-600">Churn Oranı Hesaplama</h4>
                              <div className="text-sm space-y-1">
                                <p><strong>Segment Bazlı Churn Oranları:</strong></p>
                                <p className="bg-orange-50 p-2 rounded text-xs">
                                  <strong>Prepaid:</strong> %1.8 (Yüksek - kolay terk edilebilir)
                                </p>
                                <p className="bg-yellow-50 p-2 rounded text-xs">
                                  <strong>Postpaid:</strong> %1.2 (Orta - kontrat bağlayıcılığı)
                                </p>
                                <p className="bg-green-50 p-2 rounded text-xs">
                                  <strong>Broadband:</strong> %0.9 (Düşük - hizmet bağımlılığı)
                                </p>
                                <p className="text-xs text-gray-600">
                                  GYK-capstone-project verilerine dayalı segment özelliklerine göre hesaplanmıştır.
                                </p>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                    {selectedServices.map(service => (
                      <td key={service} className="text-center p-4">
                        <Badge variant={parseFloat(getChurnRate(service)) > 1.5 ? "destructive" : "secondary"}>
                          {getChurnRate(service)}%
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">Ortalama Aylık Ücret</td>
                    {selectedServices.map(service => {
                      const segment = segmentAnalysis?.segments?.find((s: any) => s.service_type === service)
                      return <td key={service} className="text-center p-4">₺{segment?.avg_monthly_charge?.toLocaleString() || '0'}</td>
                    })}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">
                      <div className="flex items-center space-x-1">
                        <span>Aylık Gelir</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                              <Calculator className="h-3 w-3 text-blue-500" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-blue-600">Aylık Gelir Hesaplama Formülü</h4>
                              <div className="text-sm space-y-1">
                                <p><strong>Formül:</strong></p>
                                <p className="bg-blue-50 p-2 rounded font-mono text-xs">
                                  Aylık Gelir = Müşteri Sayısı × Ortalama Aylık Ücret
                                </p>
                                <p><strong>Segment Bazlı Hesaplama:</strong></p>
                                {selectedServices.map(service => {
                                  const segment = segmentAnalysis?.segments?.find((s: any) => s.service_type === service)
                                  return (
                                    <p key={service} className="bg-green-50 p-2 rounded text-xs">
                                      <strong>{service}:</strong> {segment?.customer_count?.toLocaleString()} × ₺{segment?.avg_monthly_charge?.toLocaleString()} = ₺{(segment?.monthly_revenue / 1000000).toFixed(1)}M
                                    </p>
                                  )
                                })}
                                <p className="text-xs text-gray-600">
                                  GYK-capstone-project'ten gelen gerçek veriler kullanılmaktadır.
                                </p>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </td>
                    {selectedServices.map(service => {
                      const segment = segmentAnalysis?.segments?.find((s: any) => s.service_type === service)
                      return <td key={service} className="text-center p-4">₺{(segment?.monthly_revenue / 1000000).toFixed(1)}M</td>
                    })}
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="p-4 font-medium">Risk Seviyesi</td>
                    {selectedServices.map(service => {
                      const segment = segmentAnalysis?.segments?.find((s: any) => s.service_type === service)
                      const riskLevel = segment?.risk_level || 'Düşük'
                      return (
                        <td key={service} className="text-center p-4">
                          <Badge className={`${
                            riskLevel === 'Yüksek' ? 'bg-red-500' : 
                            riskLevel === 'Orta' ? 'bg-yellow-500' : 'bg-green-500'
                          } text-white`}>
                            {riskLevel}
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

