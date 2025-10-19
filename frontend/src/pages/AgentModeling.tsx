import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
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
  Users,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Network,
  Brain,
  Activity,
  GitBranch,
  GitCommit,
  Settings,
  Megaphone,
  ChevronDown,
  User,
  Globe,
  Shield,
  TrendingDown,
  CreditCard,
  Download,
  FileSpreadsheet,
  Signal
} from "lucide-react"
import { Link } from "react-router-dom"
import { apiService } from "@/services/api"

const AgentModeling = () => {
  const { toast } = useToast()
  const [isRunning, setIsRunning] = useState(false)

  // Excel export fonksiyonu
  const exportToExcel = () => {
    if (!simulationResults) {
      toast({
        title: "Hata",
        description: "Önce simülasyon çalıştırın",
        variant: "destructive"
      })
      return
    }

    try {
      let csvContent = ""
      let filename = ""

      if (simulationResults.type === 'time_series' && simulationResults.simulation_steps) {
        // Zaman serisi için
        csvContent = "Adım,Tarih,Müşteri Sayısı,Elde Tutma %,Churn %,Yükseltme %,Müdahale\n"
        
        simulationResults.simulation_steps.forEach((step: any) => {
          csvContent += `${step.step},${step.timestamp},${step.collective_metrics?.total_customers || 0},${((step.collective_metrics?.overall_retention_rate || 0) * 100).toFixed(2)},${((step.collective_metrics?.overall_churn_rate || 0) * 100).toFixed(2)},${((step.collective_metrics?.overall_upgrade_rate || 0) * 100).toFixed(2)},${step.intervention ? 'Evet' : 'Hayır'}\n`
        })
        
        filename = `zaman_serisi_simulasyon_${new Date().toISOString().split('T')[0]}.csv`
      } else {
        // Normal simülasyon için
        csvContent = "Müşteri ID,Servis Türü,Karar\n"
        
        if (simulationResults.individual_decisions) {
          simulationResults.individual_decisions.forEach((decision: any) => {
            csvContent += `${decision.customer_id},${decision.service_type || 'N/A'},${decision.decision || 'N/A'}\n`
          })
        }
        
        filename = `agent_simulasyon_${new Date().toISOString().split('T')[0]}.csv`
      }

      // CSV dosyasını indir
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Başarılı",
        description: `${filename} dosyası indirildi`,
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Dosya indirme hatası",
        variant: "destructive"
      })
    }
  }
  const [progress, setProgress] = useState(0)
  const [simulationResults, setSimulationResults] = useState(null)
  const [agents, setAgents] = useState([])
  const [networkMetrics, setNetworkMetrics] = useState(null)
  const [networkDetails, setNetworkDetails] = useState(null)
  const [marketConditions, setMarketConditions] = useState({
    competitor_pressure: 0.5,
    economic_conditions: 0.5,
    technology_trends: 0.5,
    regulatory_changes: 0.5,
    seasonal_factors: 0.5,
    network_quality: 0.5,
    price_competition: 0.5,
    service_innovation: 0.5,
    customer_expectations: 0.5
  })

  // Agent oluşturma formu
  const [newAgent, setNewAgent] = useState({
    customer_id: "",
    segment: "Postpaid", // Artık servis türü
    age: 35,
    tenure: 24,
    avg_call_duration: 120.5,
    data_usage: 2.5,
    monthly_charge: 45.0,
    satisfaction: 7.0,
    price_sensitivity: 0.5,
    service_quality_expectation: 8.0,
    overdue_payments: 0,
    auto_payment: true,
    call_drops: 2,
    customer_support_calls: 1,
    apps: ["WhatsApp", "Instagram", "Netflix"],
    avg_top_up_count: null,
    roaming_usage: null
  })

  // Müdahale parametreleri
  const [intervention, setIntervention] = useState({
    type: "satisfaction_boost",
    value: 1.0
  })

  useEffect(() => {
    loadNetworkMetrics()
    loadMarketConditions()
  }, [])

  const loadNetworkMetrics = async () => {
    try {
      const response = await apiService.get('/telecom-agent-modeling/network-analysis-demo')
      setNetworkMetrics(response.network_metrics)
      setNetworkDetails(response.network_details)
    } catch (error) {
      console.error('Ağ metrikleri yüklenemedi:', error)
    }
  }

  const loadMarketConditions = async () => {
    try {
      const response = await apiService.get('/telecom-agent-modeling/market-conditions-demo')
      setMarketConditions(response.market_conditions)
    } catch (error) {
      console.error('Pazar koşulları yüklenemedi:', error)
    }
  }

  const createAgent = async () => {
    try {
      console.log('createAgent fonksiyonu çağrıldı')
      console.log('newAgent state:', newAgent)
      
      // Form validasyonu
      if (!newAgent.customer_id || !newAgent.customer_id.trim()) {
        toast({
          title: "Hata",
          description: "Müşteri ID gerekli!",
          variant: "destructive"
        })
        return
      }
      
      if (agents?.some(agent => agent.customer_id === newAgent.customer_id)) {
        toast({
          title: "Hata",
          description: "Bu müşteri ID zaten mevcut!",
          variant: "destructive"
        })
        return
      }

      console.log('Agent oluşturuluyor:', newAgent)
      
      const requestData = {
        customer_id: newAgent.customer_id,
        service_type: newAgent.segment,
        features: {
          age: newAgent.age,
          tenure: newAgent.tenure,
          avg_call_duration: newAgent.avg_call_duration,
          data_usage: newAgent.data_usage,
          monthly_charge: newAgent.monthly_charge,
          overdue_payments: newAgent.overdue_payments,
          auto_payment: newAgent.auto_payment,
          call_drops: newAgent.call_drops,
          customer_support_calls: newAgent.customer_support_calls,
          satisfaction_score: newAgent.satisfaction,
          apps: newAgent.apps,
          avg_top_up_count: newAgent.segment === "Prepaid" ? newAgent.avg_top_up_count || 3 : null,
          roaming_usage: newAgent.segment === "Prepaid" ? newAgent.roaming_usage || 0.5 : null
        }
      }
      
      console.log('Request data:', requestData)
      
      const response = await apiService.post('/telecom-agent-modeling/create-telecom-agent-demo', requestData)
      
      console.log('Backend response:', response)
      
      if (response && response.success) {
        setAgents(prevAgents => [...prevAgents, response.agent_data])
        setNewAgent({
          customer_id: "",
          segment: "Postpaid",
          age: 35,
          tenure: 24,
          avg_call_duration: 120.5,
          data_usage: 2.5,
          monthly_charge: 45.0,
          satisfaction: 7.0,
          price_sensitivity: 0.5,
          service_quality_expectation: 8.0,
          overdue_payments: 0,
          auto_payment: true,
          call_drops: 2,
          customer_support_calls: 1,
          apps: ["WhatsApp", "Instagram", "Netflix"],
          avg_top_up_count: null,
          roaming_usage: null
        })
        toast({
          title: "Başarılı",
          description: "Agent başarıyla oluşturuldu!",
          variant: "default"
        })
      } else {
        toast({
          title: "Hata",
          description: "Agent oluşturulamadı: " + (response?.message || 'Bilinmeyen hata'),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Agent oluşturma hatası:', error)
      toast({
        title: "Hata",
        description: "Agent oluşturma hatası: " + (error?.message || 'Bilinmeyen hata'),
        variant: "destructive"
      })
    }
  }

  const loadRealData = async () => {
    try {
      const response = await apiService.post('/telecom-agent-modeling/load-real-data')
      console.log('Load real data response:', response)
      
      if (response.success) {
        if (response.agents && response.agents.length > 0) {
          setAgents(response.agents)
          console.log(`${response.agents.length} gerçek agent yüklendi`)
          toast({
            title: "Başarılı",
            description: `${response.agents.length} agent başarıyla yüklendi!`,
            variant: "default"
          })
        } else {
          console.log('Agent listesi boş veya undefined')
          toast({
            title: "Uyarı",
            description: "Agent listesi boş!",
            variant: "destructive"
          })
        }
      } else {
        console.log('Backend response success: false')
        toast({
          title: "Hata",
          description: "Agent yükleme başarısız: " + (response.message || 'Bilinmeyen hata'),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Gerçek veri yükleme hatası:', error)
      toast({
        title: "Hata",
        description: "Gerçek veri yükleme hatası: " + error.message,
        variant: "destructive"
      })
    }
  }

  const runCollectiveSimulation = async () => {
    setIsRunning(true)
    setProgress(0)
    setSimulationResults(null)

    try {
      // Progress simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsRunning(false)
            return 100
          }
          return prev + 10
        })
      }, 200)

      // Simülasyon çalıştır
      const agentIds = agents?.map(agent => agent.customer_id) || []
      const response = await apiService.post('/telecom-agent-modeling/simulate-collective-demo', {
        target_customers: agentIds,
        intervention: intervention
      })

      if (response.success) {
        setSimulationResults(response.results)
        toast({
          title: "Simülasyon Tamamlandı",
          description: `Churn oranı: %${(response.results.collective_metrics.overall_churn_rate * 100).toFixed(1)}`,
          variant: "default"
        })
      } else {
        toast({
          title: "Hata",
          description: "Simülasyon başarısız: " + (response.message || 'Bilinmeyen hata'),
          variant: "destructive"
        })
      }

      clearInterval(interval)
      setIsRunning(false)
    } catch (error) {
      console.error('Toplu simülasyon hatası:', error)
      toast({
        title: "Hata",
        description: "Simülasyon hatası: " + error.message,
        variant: "destructive"
      })
      setIsRunning(false)
    }
  }

  const runMultiStepSimulation = async () => {
    setIsRunning(true)
    setProgress(0)

    try {
      // Progress simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      const response = await apiService.post('/telecom-agent-modeling/simulate-time-series-demo', {
        steps: 10,
        intervention_schedule: {
          3: intervention,  // 3. adımda müdahale
          7: intervention    // 7. adımda müdahale
        }
      })

      if (response.success) {
        setSimulationResults({
          type: 'time_series',
          simulation_steps: response.simulation_steps,
          total_steps: response.total_steps,
          intervention_schedule: response.intervention_schedule,
          final_results: response.final_results
        })
        
        toast({
          title: "Zaman Serisi Tamamlandı",
          description: `${response.total_steps} adımda simülasyon tamamlandı`,
          variant: "default"
        })
      } else {
        toast({
          title: "Hata",
          description: "Zaman serisi simülasyonu başarısız: " + (response.message || 'Bilinmeyen hata'),
          variant: "destructive"
        })
      }

      clearInterval(interval)
      setIsRunning(false)
    } catch (error) {
      console.error('Zaman serisi simülasyonu hatası:', error)
      toast({
        title: "Hata",
        description: "Zaman serisi simülasyonu hatası: " + error.message,
        variant: "destructive"
      })
      setIsRunning(false)
    }
  }

  const updateMarketConditions = async () => {
    try {
      const response = await apiService.post('/telecom-agent-modeling/update-telecom-market-conditions', marketConditions)
      if (response.success) {
        console.log('Pazar koşulları güncellendi')
        toast({
          title: "Başarılı",
          description: "Pazar koşulları başarıyla güncellendi!",
          variant: "default"
        })
      } else {
        toast({
          title: "Hata",
          description: "Pazar koşulları güncellenemedi: " + (response.message || 'Bilinmeyen hata'),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Pazar koşulları güncelleme hatası:', error)
      toast({
        title: "Hata",
        description: "Pazar koşulları güncelleme hatası: " + error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Signal className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dijital İkiz
                </span>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Analiz
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
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
                <Button variant="ghost" size="sm" className="bg-muted">
                  <Network className="w-4 h-4 mr-2" />
                  Agent Modeling
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" size="sm">Sonuçları Dışa Aktar</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Telekomünikasyon Agent-Based Modeling</h1>
          <p className="text-muted-foreground">
            3 servis türü (Postpaid, Prepaid, Broadband) için özelleştirilmiş agent-based modeling sistemi
          </p>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agents">Agent Yönetimi</TabsTrigger>
            <TabsTrigger value="simulation">Simülasyon</TabsTrigger>
            <TabsTrigger value="network">Sosyal Ağ</TabsTrigger>
            <TabsTrigger value="market">Pazar Koşulları</TabsTrigger>
          </TabsList>

          {/* Agent Yönetimi */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Agent Oluşturma - Gelişmiş Form */}
              <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-xl">Yeni Agent Oluştur</span>
                      <p className="text-sm text-muted-foreground font-normal mt-1">
                        GYK verilerinize uygun müşteri agent'ı oluşturun
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {/* Temel Bilgiler */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Temel Bilgiler</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customer_id" className="text-sm font-medium">
                          Müşteri ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="customer_id"
                          value={newAgent.customer_id}
                          onChange={(e) => setNewAgent({...newAgent, customer_id: e.target.value})}
                          placeholder="CUST_001"
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="segment" className="text-sm font-medium">
                          Servis Türü <span className="text-red-500">*</span>
                        </Label>
                        <Select value={newAgent.segment} onValueChange={(value) => setNewAgent({...newAgent, segment: value})}>
                          <SelectTrigger className="border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Postpaid">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Postpaid - Aylık Faturalandırma</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Prepaid">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>Prepaid - Ön Ödemeli</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Broadband">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Broadband - Genişbant</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Demografik Bilgiler */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Demografik Bilgiler</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm font-medium">Yaş</Label>
                        <Input
                          id="age"
                          type="number"
                          value={newAgent.age}
                          onChange={(e) => setNewAgent({...newAgent, age: parseInt(e.target.value) || 0})}
                          placeholder="35"
                          className="border-green-200 focus:border-green-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tenure" className="text-sm font-medium">Müşteri Süresi (Ay)</Label>
                        <Input
                          id="tenure"
                          type="number"
                          value={newAgent.tenure}
                          onChange={(e) => setNewAgent({...newAgent, tenure: parseInt(e.target.value) || 0})}
                          placeholder="24"
                          className="border-green-200 focus:border-green-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kullanım Bilgileri */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Kullanım Bilgileri</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="avg_call_duration" className="text-sm font-medium">Ortalama Arama Süresi (dk)</Label>
                        <Input
                          id="avg_call_duration"
                          type="number"
                          step="0.1"
                          value={newAgent.avg_call_duration}
                          onChange={(e) => setNewAgent({...newAgent, avg_call_duration: parseFloat(e.target.value) || 0})}
                          placeholder="120.5"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_usage" className="text-sm font-medium">Veri Kullanımı (GB)</Label>
                        <Input
                          id="data_usage"
                          type="number"
                          step="0.1"
                          value={newAgent.data_usage}
                          onChange={(e) => setNewAgent({...newAgent, data_usage: parseFloat(e.target.value) || 0})}
                          placeholder="2.5"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="monthly_charge" className="text-sm font-medium">Aylık Ücret (TL)</Label>
                        <Input
                          id="monthly_charge"
                          type="number"
                          step="0.1"
                          value={newAgent.monthly_charge}
                          onChange={(e) => setNewAgent({...newAgent, monthly_charge: parseFloat(e.target.value) || 0})}
                          placeholder="45.0"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="overdue_payments" className="text-sm font-medium">Geciken Ödemeler</Label>
                        <Input
                          id="overdue_payments"
                          type="number"
                          value={newAgent.overdue_payments}
                          onChange={(e) => setNewAgent({...newAgent, overdue_payments: parseInt(e.target.value) || 0})}
                          placeholder="0"
                          className="border-purple-200 focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prepaid Özel Alanlar */}
                  {newAgent.segment === "Prepaid" && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CreditCard className="w-4 h-4 text-orange-600" />
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100">Prepaid Özel Bilgiler</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="avg_top_up_count" className="text-sm font-medium">Ortalama Yükleme Sayısı</Label>
                          <Input
                            id="avg_top_up_count"
                            type="number"
                            value={newAgent.avg_top_up_count || ""}
                            onChange={(e) => setNewAgent({...newAgent, avg_top_up_count: parseInt(e.target.value) || null})}
                            placeholder="3"
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="roaming_usage" className="text-sm font-medium">Roaming Kullanımı (GB)</Label>
                          <Input
                            id="roaming_usage"
                            type="number"
                            step="0.1"
                            value={newAgent.roaming_usage || ""}
                            onChange={(e) => setNewAgent({...newAgent, roaming_usage: parseFloat(e.target.value) || null})}
                            placeholder="0.5"
                            className="border-orange-200 focus:border-orange-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Davranış Parametreleri */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Brain className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Davranış Parametreleri</h4>
                    </div>

                    <div className="space-y-6">
                      {/* Memnuniyet Skoru */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Memnuniyet Skoru</Label>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {newAgent.satisfaction}/10
                          </Badge>
                        </div>
                        <Slider
                          value={[newAgent.satisfaction]}
                          onValueChange={([value]) => setNewAgent({...newAgent, satisfaction: value})}
                          max={10}
                          min={1}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Çok Memnun Değil</span>
                          <span>Çok Memnun</span>
                        </div>
                      </div>

                      {/* Fiyat Hassasiyeti */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Fiyat Hassasiyeti</Label>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {newAgent.price_sensitivity.toFixed(1)}
                          </Badge>
                        </div>
                        <Slider
                          value={[newAgent.price_sensitivity]}
                          onValueChange={([value]) => setNewAgent({...newAgent, price_sensitivity: value})}
                          max={1}
                          min={0}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Fiyat Duyarsız</span>
                          <span>Çok Fiyat Hassas</span>
                        </div>
                      </div>

                      {/* Servis Kalitesi Beklentisi */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium">Servis Kalitesi Beklentisi</Label>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {newAgent.service_quality_expectation}/10
                          </Badge>
                        </div>
                        <Slider
                          value={[newAgent.service_quality_expectation]}
                          onValueChange={([value]) => setNewAgent({...newAgent, service_quality_expectation: value})}
                          max={10}
                          min={1}
                          step={0.1}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Düşük Beklenti</span>
                          <span>Yüksek Beklenti</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Oluştur Butonları */}
                  <div className="pt-4 border-t space-y-3">
                    <Button 
                      onClick={createAgent} 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                      disabled={!newAgent.customer_id.trim()}
                    >
                      <Bot className="w-5 h-5 mr-2" />
                      Akıllı Agent Oluştur
                    </Button>
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">veya</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={loadRealData} 
                      variant="outline"
                      className="w-full border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 text-green-700 font-semibold py-3 rounded-lg transition-all duration-200"
                    >
                      <Activity className="w-5 h-5 mr-2" />
                      GYK Gerçek Verilerini Yükle (100 Agent)
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Agent oluşturulduktan sonra sosyal ağa dahil edilecek
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Mevcut Agent'lar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-data" />
                    <span>Mevcut Agent'lar ({agents?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {agents?.map((agent, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{agent.customer_id}</span>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{agent.service_type}</Badge>
                            <Badge variant="secondary">{agent.segment}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Sadakat: {(agent.loyalty_score * 100).toFixed(0)}%</div>
                          <div>Etki: {(agent.social_influence * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Simülasyon */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Simülasyon Kontrolleri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Play className="w-5 h-5 text-simulation" />
                    <span>Kampanya Simülasyonu</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kampanya etkisini test edin
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="intervention_type">Müdahale Türü</Label>
                    <Select value={intervention.type} onValueChange={(value) => setIntervention({...intervention, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satisfaction_boost">Memnuniyet Artırma</SelectItem>
                        <SelectItem value="price_discount">Fiyat İndirimi</SelectItem>
                        <SelectItem value="service_improvement">Hizmet İyileştirme</SelectItem>
                        <SelectItem value="loyalty_program">Sadakat Programı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Kampanya Etkisi</Label>
                      <span className="text-sm font-bold text-blue-600">{intervention.value}</span>
                    </div>
                    
                    <Slider
                      value={[intervention.value]}
                      onValueChange={([value]) => setIntervention({...intervention, value})}
                      max={1.0}
                      min={-1.0}
                      step={0.1}
                      className="mt-2"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Olumsuz (-1.0)</span>
                      <span>Nötr (0.0)</span>
                      <span>Pozitif (+1.0)</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={runCollectiveSimulation} disabled={isRunning || (agents?.length || 0) === 0} className="flex-1">
                      <Activity className="w-4 h-4 mr-2" />
                      Kampanyayı Test Et
                    </Button>
                    <Button onClick={runMultiStepSimulation} disabled={isRunning || (agents?.length || 0) === 0} variant="outline" className="flex-1">
                      <GitCommit className="w-4 h-4 mr-2" />
                      Zaman Serisi
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    {(agents?.length || 0) === 0 ? "Önce agent'ları yükleyin" : `${agents?.length || 0} agent hazır`}
                  </div>

                  {isRunning && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Simülasyon çalışıyor...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Simülasyon Sonuçları */}
              {simulationResults && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span>Simülasyon Sonuçları</span>
                      </CardTitle>
                      <Button 
                        onClick={exportToExcel}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Excel'e İndir</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Zaman Serisi Sonuçları */}
                    {simulationResults.type === 'time_series' && simulationResults.simulation_steps && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold mb-2">Zaman Serisi Simülasyonu</h3>
                          <p className="text-sm text-muted-foreground">
                            {simulationResults.total_steps} adımda tamamlandı
                          </p>
                        </div>

                        {/* Adım Adım Sonuçlar */}
                        <div className="space-y-4">
                          {simulationResults.simulation_steps.map((step: any, index: number) => (
                            <div key={step.step} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">
                                    {step.step}
                                  </div>
                                  <span className="font-medium">Adım {step.step}</span>
                                  {step.intervention && (
                                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded">
                                      Kampanya Müdahalesi
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">{step.timestamp}</span>
                              </div>

                              {step.collective_metrics && (
                                <div className="grid grid-cols-3 gap-4 mb-3">
                                  <div className="text-center">
                                    <div className="text-sm text-muted-foreground">Elde Tutma</div>
                                    <div className="text-lg font-bold text-green-600">
                                      {(step.collective_metrics.overall_retention_rate * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-muted-foreground">Churn</div>
                                    <div className="text-lg font-bold text-red-600">
                                      {(step.collective_metrics.overall_churn_rate * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-sm text-muted-foreground">Yükseltme</div>
                                    <div className="text-lg font-bold text-blue-600">
                                      {(step.collective_metrics.overall_upgrade_rate * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              )}

                              {step.individual_decisions && step.individual_decisions.length > 0 && (
                                <div className="mt-3">
                                  <div className="text-sm font-medium mb-2">Örnek Kararlar:</div>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {step.individual_decisions.slice(0, 4).map((decision: any, idx: number) => (
                                      <div key={idx} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                        <span className="truncate">{decision.customer_id.substring(0, 8)}...</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          decision.decision === 'STAY' ? 'bg-green-100 text-green-800' :
                                          decision.decision === 'CHURN' ? 'bg-red-100 text-red-800' :
                                          decision.decision === 'UPGRADE' ? 'bg-blue-100 text-blue-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {decision.decision}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Final Sonuçlar */}
                        {simulationResults.final_results && (
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg">
                            <h4 className="font-semibold mb-3 text-center">Final Sonuçlar</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Toplam Müşteri</div>
                                <div className="text-2xl font-bold">
                                  {simulationResults.final_results.collective_metrics?.total_customers || 0}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-muted-foreground">Elde Tutma Oranı</div>
                                <div className="text-2xl font-bold text-green-600">
                                  {((simulationResults.final_results.collective_metrics?.overall_retention_rate || 0) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Normal Simülasyon Sonuçları */}
                    {simulationResults.type !== 'time_series' && simulationResults.collective_metrics && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-success/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Elde Tutma Oranı</div>
                            <div className="text-2xl font-bold text-success">
                              {(simulationResults.collective_metrics.overall_retention_rate * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div className="p-3 bg-warning/10 rounded-lg">
                            <div className="text-sm text-muted-foreground">Churn Oranı</div>
                            <div className="text-2xl font-bold text-warning">
                              {(simulationResults.collective_metrics.overall_churn_rate * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Karar Dağılımı</div>
                          {Object.entries(simulationResults.collective_metrics.decision_distribution).map(([decision, count]) => (
                            <div key={decision} className="flex justify-between text-sm">
                              <span>{decision}</span>
                              <span>{String(count)} müşteri</span>
                            </div>
                          ))}
                        </div>

                        {/* Sosyal Ağ Etkisi Bilgisi */}
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Network className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Sosyal Ağ Etkisi</span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Bu sonuçlar sosyal ağ etkileşimleri ile oluşturuldu. Müşteriler birbirini etkileyerek karar veriyor.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sosyal Ağ */}
          <TabsContent value="network" className="space-y-6">
            {/* Sosyal Ağ Açıklaması */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-neural" />
                  <span>Sosyal Ağ Analizi</span>
                </CardTitle>
                <CardDescription>
                  Müşteriler arasındaki gerçek ilişkiler ve etkileşimler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Aile Ağı (Family Network)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Aynı aileden müşteriler (yaş ±10 yıl, aynı servis türü)
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Güçlü Etki (%80)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">İş Ağı (Work Network)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      İş arkadaşları (benzer gelir, aynı servis türü)
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Orta Etki (%60)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Yaş Grubu Ağı (Age Network)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Benzer yaştaki müşteriler (yaş ±5 yıl, benzer teknoloji)
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">Hafif Etki (%40)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Servis Türü Ağı (Service Network)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Aynı servis türündeki müşteriler (Postpaid, Prepaid, Broadband)
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Zayıf Etki (%30)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {networkMetrics && (
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Network className="w-4 h-4 text-neural" />
                      <span className="text-sm font-medium">Toplam Müşteri</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{networkMetrics.total_nodes}</div>
                    <p className="text-xs text-muted-foreground mt-1">Aktif agent sayısı</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-data" />
                      <span className="text-sm font-medium">Sosyal Bağlantı</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{networkMetrics.total_edges}</div>
                    <p className="text-xs text-muted-foreground mt-1">Ortalama {(networkMetrics.total_edges / networkMetrics.total_nodes).toFixed(1)} bağlantı/kişi</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-simulation" />
                      <span className="text-sm font-medium">Küme Katsayısı</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{(networkMetrics.average_clustering * 100).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Arkadaşların arkadaşları da tanışıyor</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium">Ağ Yoğunluğu</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">{(networkMetrics.network_density * 100).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Müşteriler arası bağlantı oranı</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Detaylı Müşteri Bağlantıları */}
            {networkDetails && networkDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-neural" />
                    <span>Müşteri Bağlantıları</span>
                  </CardTitle>
                  <CardDescription>
                    Hangi müşteri hangi müşteriyle bağlantılı - Detaylı sosyal ağ analizi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {networkDetails.slice(0, 10).map((customer, index) => (
                      <div key={customer.customer_id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="font-medium text-sm">
                              {customer.customer_id.substring(0, 8)}...
                            </span>
                            <Badge variant="outline">{customer.service_type}</Badge>
                            <Badge variant="secondary">{customer.segment}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer.connections} bağlantı
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          Yaş: {customer.age} | Aylık Ücret: {customer.monthly_charge.toFixed(0)} TL
                        </div>
                        
                        {customer.neighbors.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Bağlantılar:</div>
                            <div className="grid grid-cols-2 gap-1">
                              {customer.neighbors.slice(0, 6).map((neighbor, idx) => (
                                <div key={idx} className="flex items-center space-x-1 text-xs">
                                  <div className={`w-2 h-2 rounded-full ${
                                    neighbor.relationship === 'family' ? 'bg-red-500' :
                                    neighbor.relationship === 'work' ? 'bg-orange-500' :
                                    neighbor.relationship === 'age_peer' ? 'bg-yellow-500' :
                                    neighbor.relationship === 'service_peer' ? 'bg-green-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  <span className="truncate">
                                    {neighbor.customer_id.substring(0, 6)}... ({neighbor.service_type})
                                  </span>
                                </div>
                              ))}
                              {customer.neighbors.length > 6 && (
                                <div className="text-xs text-muted-foreground">
                                  +{customer.neighbors.length - 6} daha...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {networkDetails.length > 10 && (
                      <div className="text-center text-sm text-muted-foreground py-2">
                        +{networkDetails.length - 10} müşteri daha...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pazar Koşulları */}
          <TabsContent value="market" className="space-y-6">
            {/* Ana Pazar Koşulları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-accent" />
                  <span>Pazar Koşulları Yönetimi</span>
                </CardTitle>
                <CardDescription>
                  Dış faktörlerin agent kararlarına etkisini ayarlayın. Değişiklikler simülasyon sonuçlarını etkiler.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Rekabet ve Ekonomi */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Rekabet Baskısı</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-red-600">
                          {(marketConditions.competitor_pressure * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.competitor_pressure > 0.7 ? "Yüksek" : 
                           marketConditions.competitor_pressure > 0.4 ? "Orta" : "Düşük"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.competitor_pressure]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, competitor_pressure: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.competitor_pressure > 0.7 ? 
                        "Yüksek rekabet: Vodafone (%30) + Türk Telekom (%25) agresif kampanyalar" :
                        marketConditions.competitor_pressure > 0.4 ?
                        "Orta rekabet: Dengeli pazar payı dağılımı" :
                        "Düşük rekabet: Turkcell dominant pazar lideri (%45+ pay)"
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Ekonomik Koşullar</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-green-600">
                          {(marketConditions.economic_conditions * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.economic_conditions > 0.7 ? "İyi" : 
                           marketConditions.economic_conditions > 0.4 ? "Orta" : "Kötü"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.economic_conditions]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, economic_conditions: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.economic_conditions > 0.7 ? 
                        "İyi ekonomi: Düşük enflasyon, yüksek GSYİH büyümesi" :
                        marketConditions.economic_conditions > 0.4 ?
                        "Orta ekonomi: Dengeli makro ekonomik koşullar" :
                        "Kötü ekonomi: Yüksek enflasyon (%65+), düşük büyüme"
                      }
                    </p>
                  </div>
                </div>

                {/* Teknoloji ve Düzenleme */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Teknoloji Trendleri</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-blue-600">
                          {(marketConditions.technology_trends * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.technology_trends > 0.7 ? "Yüksek" : 
                           marketConditions.technology_trends > 0.4 ? "Orta" : "Düşük"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.technology_trends]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, technology_trends: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.technology_trends > 0.7 ? 
                        "Yüksek teknoloji: 5G kapsama %70+, IoT cihaz sayısı 20M+" :
                        marketConditions.technology_trends > 0.4 ?
                        "Orta teknoloji: 5G kapsama %50, IoT cihaz sayısı 15M" :
                        "Düşük teknoloji: 5G kapsama %30-, IoT cihaz sayısı 10M-"
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Düzenleyici Değişiklikler</Label>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {(marketConditions.regulatory_changes * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[marketConditions.regulatory_changes]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, regulatory_changes: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Yasal düzenlemeler ve sektör standartları
                    </p>
                  </div>
                </div>

                {/* Mevsimsel ve Ağ Kalitesi */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Mevsimsel Faktörler</Label>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {(marketConditions.seasonal_factors * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      value={[marketConditions.seasonal_factors]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, seasonal_factors: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tatil sezonu, özel günler ve mevsimsel kullanım
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Ağ Kalitesi</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-cyan-600">
                          {(marketConditions.network_quality * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.network_quality > 0.7 ? "Yüksek" : 
                           marketConditions.network_quality > 0.4 ? "Orta" : "Düşük"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.network_quality]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, network_quality: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.network_quality > 0.7 ? 
                        "Yüksek kalite: Ortalama hız 50+ Mbps, kapsama %95+" :
                        marketConditions.network_quality > 0.4 ?
                        "Orta kalite: Ortalama hız 25-50 Mbps, kapsama %85-95" :
                        "Düşük kalite: Ortalama hız 25- Mbps, kapsama %85-"
                      }
                    </p>
                  </div>
                </div>

                {/* Fiyat Rekabeti ve Servis İnovasyonu */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Fiyat Rekabeti</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-yellow-600">
                          {(marketConditions.price_competition * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.price_competition > 0.7 ? "Yüksek" : 
                           marketConditions.price_competition > 0.4 ? "Orta" : "Düşük"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.price_competition]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, price_competition: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.price_competition > 0.7 ? 
                        "Yüksek fiyat rekabeti: ARPU 35- TL, fiyat artışı %30+" :
                        marketConditions.price_competition > 0.4 ?
                        "Orta fiyat rekabeti: ARPU 40-50 TL, fiyat artışı %20-30" :
                        "Düşük fiyat rekabeti: ARPU 50+ TL, fiyat artışı %20-"
                      }
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <Label className="text-sm font-medium">Servis İnovasyonu</Label>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-600">
                          {(marketConditions.service_innovation * 100).toFixed(0)}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {marketConditions.service_innovation > 0.7 ? "Yüksek" : 
                           marketConditions.service_innovation > 0.4 ? "Orta" : "Düşük"}
                        </div>
                      </div>
                    </div>
                    <Slider
                      value={[marketConditions.service_innovation]}
                      onValueChange={([value]) => setMarketConditions({...marketConditions, service_innovation: value})}
                      max={1}
                      min={0}
                      step={0.05}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {marketConditions.service_innovation > 0.7 ? 
                        "Yüksek inovasyon: Yılda 15+ yeni servis, memnuniyet %80+" :
                        marketConditions.service_innovation > 0.4 ?
                        "Orta inovasyon: Yılda 10-15 yeni servis, memnuniyet %70-80" :
                        "Düşük inovasyon: Yılda 10- yeni servis, memnuniyet %70-"
                      }
                    </p>
                  </div>
                </div>

                {/* Müşteri Beklentileri */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <Label className="text-sm font-medium">Müşteri Beklentileri</Label>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-pink-600">
                        {(marketConditions.customer_expectations * 100).toFixed(0)}%
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {marketConditions.customer_expectations > 0.7 ? "Yüksek" : 
                         marketConditions.customer_expectations > 0.4 ? "Orta" : "Düşük"}
                      </div>
                    </div>
                  </div>
                  <Slider
                    value={[marketConditions.customer_expectations]}
                    onValueChange={([value]) => setMarketConditions({...marketConditions, customer_expectations: value})}
                    max={1}
                    min={0}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {marketConditions.customer_expectations > 0.7 ? 
                      "Yüksek beklenti: Memnuniyet %80+, şikayet %5-" :
                      marketConditions.customer_expectations > 0.4 ?
                      "Orta beklenti: Memnuniyet %70-80, şikayet %5-10" :
                      "Düşük beklenti: Memnuniyet %70-, şikayet %10+"
                    }
                  </p>
                </div>

                {/* Güncelleme Butonu */}
                <div className="pt-4 border-t">
                  <Button onClick={updateMarketConditions} className="w-full" size="lg">
                    <Settings className="w-4 h-4 mr-2" />
                    Pazar Koşullarını Güncelle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pazar Koşulları Veri Kaynakları */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  <span>Pazar Verilerinin Kaynakları</span>
                </CardTitle>
                <CardDescription>
                  Bu değerlerin nereden geldiği ve nasıl hesaplandığı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Rekabet Baskısı */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <h4 className="font-semibold">Rekabet Baskısı: %55</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> BTK pazar payı raporları</p>
                      <p><strong>Hesaplama:</strong> 1 - Turkcell pazar payı (45%) = %55</p>
                      <p><strong>Açıklama:</strong> Vodafone (%30) + Türk Telekom (%25) rekabet yoğunluğu</p>
                    </div>
                  </div>

                  {/* Ekonomik Koşullar */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h4 className="font-semibold">Ekonomik Koşullar: %13</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> TÜİK makro ekonomik veriler</p>
                      <p><strong>Hesaplama:</strong> (GSYİH %3.2 - Enflasyon %65/10) / 10 = %13</p>
                      <p><strong>Açıklama:</strong> Yüksek enflasyon (%65) ekonomik koşulları olumsuz etkiliyor</p>
                    </div>
                  </div>

                  {/* Teknoloji Trendleri */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h4 className="font-semibold">Teknoloji Trendleri: %27</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> 5G kapsama haritaları, IoT cihaz sayıları</p>
                      <p><strong>Hesaplama:</strong> (5G %45 × 0.4 + IoT 15M × 0.6) / 100 = %27</p>
                      <p><strong>Açıklama:</strong> 5G kapsama %45, IoT cihaz sayısı 15 milyon</p>
                    </div>
                  </div>

                  {/* Ağ Kalitesi */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <h4 className="font-semibold">Ağ Kalitesi: %68</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> Operatör performans raporları</p>
                      <p><strong>Hesaplama:</strong> (Ortalama hız 25 Mbps × 0.3 + Kapsama %95 × 0.7) / 100 = %68</p>
                      <p><strong>Açıklama:</strong> Ortalama hız 25 Mbps, kapsama alanı %95</p>
                    </div>
                  </div>

                  {/* Fiyat Rekabeti */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <h4 className="font-semibold">Fiyat Rekabeti: %50</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> ARPU verileri, fiyat değişim analizi</p>
                      <p><strong>Hesaplama:</strong> Fiyat artışı %25 / 50 = %50</p>
                      <p><strong>Açıklama:</strong> Ortalama ARPU 45 TL, yıllık fiyat artışı %25</p>
                    </div>
                  </div>

                  {/* Servis İnovasyonu */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <h4 className="font-semibold">Servis İnovasyonu: %74</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> Yeni servis sayıları, müşteri memnuniyet anketleri</p>
                      <p><strong>Hesaplama:</strong> (Yeni servis 12 × 0.4 + Memnuniyet %72 × 0.6) / 100 = %74</p>
                      <p><strong>Açıklama:</strong> Yılda 12 yeni servis, müşteri memnuniyeti %72</p>
                    </div>
                  </div>

                  {/* Müşteri Beklentileri */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                      <h4 className="font-semibold">Müşteri Beklentileri: %64</h4>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Veri Kaynağı:</strong> Müşteri memnuniyet anketleri, şikayet verileri</p>
                      <p><strong>Hesaplama:</strong> (Memnuniyet %72 - Şikayet %8) / 100 = %64</p>
                      <p><strong>Açıklama:</strong> Müşteri memnuniyeti %72, şikayet oranı %8</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AgentModeling
