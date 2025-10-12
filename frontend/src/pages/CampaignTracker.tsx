import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Megaphone,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  ChevronDown,
  Calculator,
  User,
  PieChart
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

const CampaignTracker = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const campaigns = [
    {
      id: 1,
      name: "Premium Müşteri İndirim Kampanyası",
      status: "active",
      startDate: "1 Ocak 2025",
      endDate: "31 Mart 2025",
      target: 5000,
      reached: 3247,
      budget: 250000,
      spent: 162000,
      roi: 187,
      retention: 89,
      segment: "Premium"
    },
    {
      id: 2,
      name: "Yeni Müşteri Hoş Geldin Paketi",
      status: "active",
      startDate: "15 Ocak 2025",
      endDate: "15 Nisan 2025",
      target: 10000,
      reached: 7823,
      budget: 500000,
      spent: 391000,
      roi: 156,
      retention: 76,
      segment: "Yeni Müşteri"
    },
    {
      id: 3,
      name: "Postpaid Yükseltme Kampanyası",
      status: "completed",
      startDate: "1 Aralık 2024",
      endDate: "31 Aralık 2024",
      target: 3000,
      reached: 3421,
      budget: 150000,
      spent: 142000,
      roi: 214,
      retention: 94,
      segment: "Prepaid"
    }
  ]

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
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
                    <DropdownMenuItem className="bg-muted">
                      <Megaphone className="w-4 h-4 mr-2" />
                      Kampanya Tracker ✓
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
            <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Çıkış</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Kampanya Performans Takibi</h1>
          <p className="text-muted-foreground">
            Aktif kampanyaları izle, performans metriklerini analiz et
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Aktif Kampanyalar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Toplam Hedef</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.filter(c => c.status === 'active').reduce((sum, c) => sum + c.target, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Ortalama ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                %{Math.round(campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Toplam Bütçe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {campaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()} TL
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign List */}
        <div className="space-y-6">
          {campaigns.map((campaign, index) => (
            <Card key={campaign.id} className="animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Megaphone className="w-5 h-5" />
                      <span>{campaign.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.startDate} - {campaign.endDate}
                    </CardDescription>
                  </div>
                  <Badge className={`${
                    campaign.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  } text-white`}>
                    {campaign.status === 'active' ? 'Aktif' : 'Tamamlandı'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>Hedef İlerleme</span>
                        <span className="font-medium">{campaign.reached.toLocaleString()} / {campaign.target.toLocaleString()}</span>
                      </div>
                      <Progress value={(campaign.reached / campaign.target) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        %{Math.round((campaign.reached / campaign.target) * 100)} tamamlandı
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2 text-sm">
                        <span>Bütçe Kullanımı</span>
                        <span className="font-medium">{campaign.spent.toLocaleString()} / {campaign.budget.toLocaleString()} TL</span>
                      </div>
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        %{Math.round((campaign.spent / campaign.budget) * 100)} harçandı
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                      <p className="text-xs text-muted-foreground mb-1">ROI</p>
                      <p className="text-2xl font-bold text-green-600">%{campaign.roi}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                      <p className="text-xs text-muted-foreground mb-1">Retention</p>
                      <p className="text-2xl font-bold text-blue-600">%{campaign.retention}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <p className="text-xs text-muted-foreground mb-1">Segment</p>
                      <p className="text-sm font-bold">{campaign.segment}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                      <p className="text-xs text-muted-foreground mb-1">Durum</p>
                      <p className="text-sm font-bold">{campaign.status === 'active' ? 'Devam Ediyor' : 'Bitti'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CampaignTracker

