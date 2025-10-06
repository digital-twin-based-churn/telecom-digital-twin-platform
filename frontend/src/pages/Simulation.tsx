import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  Bot, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  Settings,
  Users,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { Link } from "react-router-dom"

const Simulation = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [simulationResults, setSimulationResults] = useState(null)

  const runSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setSimulationResults(null)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          setSimulationResults({
            totalCustomers: 5000,
            predictedChurners: 1250,
            retentionRate: 73.4,
            campaignEffectiveness: 89.2,
            revenueProtected: 2.8,
            confidence: 94.7
          })
          return 100
        }
        return prev + 2
      })
    }, 100)
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
              <Link to="/statistics">
                <Button variant="ghost" size="sm">
                  <PieChart className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to="/chatbot">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="bg-muted">
                <Play className="w-4 h-4 mr-2" />
                Simulation
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="outline" size="sm">Export Results</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-bold mb-2">Digital Twin Simulation</h1>
          <p className="text-muted-foreground">
            Test marketing strategies and retention campaigns on digital twins before real customer deployment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulation Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Panel */}
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Simulation Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your digital twin simulation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer-segment">Customer Segment</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">Premium Customers</SelectItem>
                          <SelectItem value="standard">Standard Customers</SelectItem>
                          <SelectItem value="basic">Basic Customers</SelectItem>
                          <SelectItem value="all">All Customers</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Discount Offer</SelectItem>
                          <SelectItem value="upgrade">Service Upgrade</SelectItem>
                          <SelectItem value="retention">Retention Call</SelectItem>
                          <SelectItem value="email">Email Campaign</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sample-size">Sample Size</Label>
                      <Input type="number" placeholder="5000" defaultValue="5000" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="time-horizon">Time Horizon (days)</Label>
                      <Input type="number" placeholder="90" defaultValue="90" />
                    </div>

                    <div>
                      <Label htmlFor="confidence-level">Confidence Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="95%" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90%</SelectItem>
                          <SelectItem value="95">95%</SelectItem>
                          <SelectItem value="99">99%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="simulation-runs">Simulation Runs</Label>
                      <Input type="number" placeholder="1000" defaultValue="1000" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <Button 
                    variant="hero" 
                    size="lg"
                    onClick={runSimulation}
                    disabled={isRunning}
                    className="flex items-center space-x-2"
                  >
                    {isRunning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Running Simulation...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Run Simulation</span>
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" disabled={isRunning}>
                    Reset Parameters
                  </Button>
                </div>

                {/* Progress Bar */}
                {isRunning && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span>Processing digital twins...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            {simulationResults && (
              <Card className="animate-fade-up">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span>Simulation Results</span>
                  </CardTitle>
                  <CardDescription>
                    Digital twin simulation completed successfully
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg neural-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Total Customers Analyzed</span>
                          <Target className="w-4 h-4 text-neural" />
                        </div>
                        <p className="text-2xl font-bold">{simulationResults.totalCustomers.toLocaleString()}</p>
                      </div>

                      <div className="p-4 rounded-lg data-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Predicted Churners</span>
                          <AlertCircle className="w-4 h-4 text-warning" />
                        </div>
                        <p className="text-2xl font-bold text-warning">{simulationResults.predictedChurners.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {((simulationResults.predictedChurners / simulationResults.totalCustomers) * 100).toFixed(1)}% of total
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Expected Retention Rate</span>
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold text-success">{simulationResults.retentionRate}%</p>
                        <p className="text-xs text-muted-foreground">+18.3% improvement</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Campaign Effectiveness</span>
                          <Zap className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-2xl font-bold text-primary">{simulationResults.campaignEffectiveness}%</p>
                        <p className="text-xs text-muted-foreground">Success probability</p>
                      </div>

                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Revenue Protected</span>
                          <span className="text-lg">💰</span>
                        </div>
                        <p className="text-2xl font-bold text-accent">${simulationResults.revenueProtected}M</p>
                        <p className="text-xs text-muted-foreground">Estimated monthly impact</p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Confidence Level</span>
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-2xl font-bold">{simulationResults.confidence}%</p>
                        <p className="text-xs text-muted-foreground">Statistical confidence</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-neural/5 border border-neural/20">
                    <h4 className="font-semibold mb-3 text-neural">Digital Twin Insights</h4>
                    <div className="space-y-2 text-sm">
                      <p>• High-value customers show 67% higher retention rate with personalized offers</p>
                      <p>• Digital twins predict optimal campaign timing: 2-3 weeks before predicted churn</p>
                      <p>• Combined email + discount approach shows highest effectiveness (89.2%)</p>
                      <p>• Customer segments with high support interaction respond better to retention calls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Simulation History */}
            <Card className="animate-slide-in-right">
              <CardHeader>
                <CardTitle>Recent Simulations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Premium Discount Campaign</p>
                    <p className="text-xs text-muted-foreground">89.2% success rate</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-success/10 border border-success/20">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Service Upgrade Strategy</p>
                    <p className="text-xs text-muted-foreground">76.8% success rate</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Email Campaign Test</p>
                    <p className="text-xs text-muted-foreground">54.3% success rate</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Resources */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Digital Twin Models</span>
                    <span className="font-medium">24,571 active</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Simulation Capacity</span>
                    <span className="font-medium">73% available</span>
                  </div>
                  <Progress value={27} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Queue</span>
                    <span className="font-medium">12 pending</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>Simulation Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-neural/10 border border-neural/20">
                  <p className="font-medium text-neural">Sample Size</p>
                  <p className="text-muted-foreground">Use at least 1,000 customers for reliable results</p>
                </div>

                <div className="p-3 rounded-lg bg-data/10 border border-data/20">
                  <p className="font-medium text-data">Time Horizon</p>
                  <p className="text-muted-foreground">90-day periods provide optimal prediction accuracy</p>
                </div>

                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="font-medium text-success">Confidence Level</p>
                  <p className="text-muted-foreground">95% confidence recommended for business decisions</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulation