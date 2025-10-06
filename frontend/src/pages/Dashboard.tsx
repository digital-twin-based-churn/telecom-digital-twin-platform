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
          <h1 className="text-3xl font-bold mb-2">Digital Twin Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights from your customer digital twins and churn prevention system
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-border animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Digital Twins</CardTitle>
              <Bot className="h-4 w-4 text-neural" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24,571</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="data-border animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Risk Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.4%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">-5.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers Retained</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,847</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+18%</span> this quarter
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Protected</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.8M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+24%</span> this quarter
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
                <CardTitle>Churn Prediction Overview</CardTitle>
                <CardDescription>
                  Real-time analysis of customer churn risk across segments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">High Risk Customers</p>
                      <p className="text-sm text-muted-foreground">
                        Churn probability &gt; 70%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-destructive">847</p>
                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                    </div>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Medium Risk Customers</p>
                      <p className="text-xs text-muted-foreground">Churn probability 40-70%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-warning">2,341</p>
                      <Badge variant="secondary" className="text-xs">Monitor</Badge>
                    </div>
                  </div>
                  <Progress value={58} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Low Risk Customers</p>
                      <p className="text-sm text-muted-foreground">
                        Churn probability &lt; 40%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">21,383</p>
                      <Badge className="text-xs bg-success text-success-foreground">Stable</Badge>
                    </div>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Digital Twin Insights */}
            <Card className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Recent Digital Twin Insights</CardTitle>
                <CardDescription>
                  Latest behavioral patterns detected by your digital twins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg neural-border">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Customer ID: 78291</p>
                      <p className="text-sm text-muted-foreground">
                        Digital twin detected 67% decrease in service usage. Predicted churn in 14 days.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg data-border">
                    <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Customer Segment: Premium</p>
                      <p className="text-sm text-muted-foreground">
                        Multiple twins showing reduced engagement. Recommending targeted campaign.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">4 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Campaign
                    </Button>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium">Retention Campaign Success</p>
                      <p className="text-sm text-muted-foreground">
                        Digital twin simulation correctly predicted 89% campaign success rate.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Results
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/simulation" className="block">
                  <Button variant="neural" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                </Link>
                <Link to="/chatbot" className="block">
                  <Button variant="data" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Assistant
                  </Button>
                </Link>
                <Link to="/statistics" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Digital Twin Engine</span>
                  <Badge className="bg-success text-success-foreground">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ML Models</span>
                  <Badge className="bg-success text-success-foreground">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Data Pipeline</span>
                  <Badge className="bg-success text-success-foreground">Streaming</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge className="bg-success text-success-foreground">Healthy</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Today's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Prediction Confidence</span>
                    <span className="font-medium">87.8%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Data Processing</span>
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