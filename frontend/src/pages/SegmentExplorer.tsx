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
  Download,
  Filter,
  RefreshCw,
  LogOut,
  ChevronDown,
  Calculator,
  User,
  Megaphone,
  Signal,
  FileSpreadsheet
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
      const [services, churnServices, analysis] = await Promise.all([
        apiService.getServiceDistribution(),
        apiService.getChurnByService(),
        apiService.getSegmentAnalysis()
      ])
      setServiceData(services)
      setChurnByService(churnServices)
      setSegmentAnalysis(analysis)
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
          <Button onClick={exportToExcel} className="bg-gradient-to-r from-emerald-500 to-teal-500">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel'e Aktar
          </Button>
        </div>

        {/* Summary Cards */}
        {segmentAnalysis && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Müşteri</p>
                    <p className="text-2xl font-bold">{segmentAnalysis.total_customers?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Genel Churn Oranı</p>
                    <p className="text-2xl font-bold">{segmentAnalysis.overall_churn_rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aktif Segmentler</p>
                    <p className="text-2xl font-bold">{segmentAnalysis.segments?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ortalama Risk</p>
                    <p className="text-2xl font-bold">Orta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

