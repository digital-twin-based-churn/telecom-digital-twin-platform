import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Bot, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Zap
} from "lucide-react"
import { Link } from "react-router-dom"

const Statistics = () => {
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
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="bg-muted">
                <PieChart className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Link to="/chatbot">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
              <Link to="/simulation">
                <Button variant="ghost" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Simulation
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm">Export Data</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive statistical analysis of your digital twin churn prevention system
          </p>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="neural-border animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate Reduction</CardTitle>
              <TrendingDown className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">-43.7%</div>
              <p className="text-xs text-muted-foreground">
                vs. pre-digital twin baseline
              </p>
            </CardContent>
          </Card>

          <Card className="data-border animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
              <Target className="h-4 w-4 text-data" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success font-medium">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.4M</div>
              <p className="text-xs text-muted-foreground">
                Annual revenue protected
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift animate-scale-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
              <Zap className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247ms</div>
              <p className="text-xs text-muted-foreground">
                Average prediction latency
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Churn Analytics */}
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle>Churn Risk Distribution</CardTitle>
                <CardDescription>
                  Customer segmentation by digital twin churn predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* High Risk Segment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-destructive">Critical Risk (80-100%)</h4>
                        <p className="text-sm text-muted-foreground">Immediate intervention required</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">847</p>
                        <Badge variant="destructive" className="text-xs">3.4%</Badge>
                      </div>
                    </div>
                    <div className="bg-destructive/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-destructive h-full w-[3.4%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Medium-High Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-warning">High Risk (60-80%)</h4>
                        <p className="text-sm text-muted-foreground">Proactive retention campaigns</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">1,523</p>
                        <Badge className="text-xs bg-warning text-warning-foreground">6.2%</Badge>
                      </div>
                    </div>
                    <div className="bg-warning/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-warning h-full w-[6.2%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Medium Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Medium Risk (40-60%)</h4>
                        <p className="text-sm text-muted-foreground">Enhanced monitoring and engagement</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">4,672</p>
                        <Badge variant="secondary" className="text-xs">19.0%</Badge>
                      </div>
                    </div>
                    <div className="bg-muted rounded-full h-3 overflow-hidden">
                      <div className="bg-muted-foreground h-full w-[19%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Low Risk */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-success">Low Risk (0-40%)</h4>
                        <p className="text-sm text-muted-foreground">Stable customer base</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">17,529</p>
                        <Badge className="text-xs bg-success text-success-foreground">71.4%</Badge>
                      </div>
                    </div>
                    <div className="bg-success/10 rounded-full h-3 overflow-hidden">
                      <div className="bg-success h-full w-[71.4%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Performance */}
            <Card className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Digital Twin Model Performance</CardTitle>
                <CardDescription>
                  Real-time accuracy metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Precision Score</span>
                        <span className="text-lg font-bold">92.8%</span>
                      </div>
                      <div className="bg-neural/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-neural h-full w-[92.8%] rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Recall Score</span>
                        <span className="text-lg font-bold">89.4%</span>
                      </div>
                      <div className="bg-data/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-data h-full w-[89.4%] rounded-full"></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">F1 Score</span>
                        <span className="text-lg font-bold">91.1%</span>
                      </div>
                      <div className="bg-simulation/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-simulation h-full w-[91.1%] rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg neural-border">
                      <h4 className="font-semibold mb-2">True Positives</h4>
                      <p className="text-2xl font-bold text-success">8,947</p>
                      <p className="text-xs text-muted-foreground">Correctly identified churners</p>
                    </div>

                    <div className="p-4 rounded-lg data-border">
                      <h4 className="font-semibold mb-2">False Positives</h4>
                      <p className="text-2xl font-bold text-warning">721</p>
                      <p className="text-xs text-muted-foreground">Incorrectly flagged customers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Analytics */}
          <div className="space-y-6">
            {/* Campaign Effectiveness */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle>Campaign Effectiveness</CardTitle>
                <CardDescription>Digital twin simulation results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Email Campaigns</span>
                    <span className="font-medium text-success">+67% retention</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[67%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Discount Offers</span>
                    <span className="font-medium text-success">+43% retention</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[43%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Service Upgrades</span>
                    <span className="font-medium text-success">+81% retention</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[81%] rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Personal Calls</span>
                    <span className="font-medium text-success">+89% retention</span>
                  </div>
                  <div className="bg-success/10 rounded-full h-2">
                    <div className="bg-success h-full w-[89%] rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time-based Trends */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">January 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-12% churn</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">February 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-18% churn</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">March 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-24% churn</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">April 2024</span>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">-31% churn</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="p-3 rounded-lg bg-neural/10 border border-neural/20">
                  <p className="font-medium text-neural">Customer Behavior Pattern</p>
                  <p className="text-muted-foreground">
                    Digital twins identified decreased weekend usage as strongest churn predictor
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-data/10 border border-data/20">
                  <p className="font-medium text-data">Optimal Intervention Time</p>
                  <p className="text-muted-foreground">
                    Campaigns most effective when deployed 2-3 weeks before predicted churn
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-success">ROI Achievement</p>
                  <p className="text-muted-foreground">
                    247% return on investment achieved through targeted interventions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics