import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Bot, 
  BarChart3,
  MessageSquare,
  Play,
  Home,
  PieChart,
  Send,
  Sparkles,
  User,
  Brain,
  Zap,
  Plus,
  Search,
  Settings,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  RefreshCw,
  Clock,
  Star,
  ChevronRight,
  MessageCircle,
  TrendingUp,
  Users,
  Target,
  Shield,
  Cpu,
  Database,
  Network,
  LogOut
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { apiService } from "@/services/api"

const Chatbot = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "assistant",
      content: "Merhaba! Dijital İkiz Tabanlı Churn Önleme Sistemi'nin AI asistanıyım. Müşteri davranışlarını analiz etme, churn risklerini tahmin etme ve elde tutma stratejileri önerme konularında size yardımcı olabilirim. Bugün size nasıl yardımcı olabilirim?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 2,
      type: "user",
      content: "Premium segmentindeki müşterilerin mevcut churn riski nedir?",
      timestamp: new Date(Date.now() - 4 * 60 * 1000)
    },
    {
      id: 3,
      type: "assistant",
      content: "En son dijital ikiz analizine göre, Premium segmenti orta düzeyde %28.4 churn riski gösteriyor. İşte detaylı analiz:\n\n• Yüksek riskli müşteriler: 127 (%7.2)\n• Orta riskli müşteriler: 374 (%21.2)\n• Düşük riskli müşteriler: 1,265 (%71.6)\n\nTespit edilen ana risk faktörleri:\n1. Hizmet kullanımında azalma (son 30 günde -%23)\n2. Müşteri destek etkileşimlerinde azalma\n3. Rekabetçi fiyatlandırma baskısı\n\nHedefli elde tutma stratejileri önermemi ister misiniz?",
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    }
  ])

  const [conversations, setConversations] = useState([
    { id: 1, title: "Premium Segment Churn Analizi", active: true, time: "2 dakika önce" },
    { id: 2, title: "Dijital İkiz Simülasyon Sonuçları", active: false, time: "1 saat önce" },
    { id: 3, title: "Müşteri Davranış Kalıpları", active: false, time: "3 saat önce" },
    { id: 4, title: "Kampanya Optimizasyon Önerileri", active: false, time: "1 gün önce" },
    { id: 5, title: "Yüksek Risk Müşteri Segmentleri", active: false, time: "2 gün önce" }
  ])

  const [recentConversations, setRecentConversations] = useState([
    { id: 6, title: "Churn Tahmin Modeli Performansı", time: "3 gün önce" },
    { id: 7, title: "Müşteri Yaşam Boyu Değer Analizi", time: "4 gün önce" },
    { id: 8, title: "Pazarlama Kampanyası ROI", time: "5 gün önce" }
  ])

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleClearAllConversations = () => {
    // Tüm sohbetleri sil
    setConversations([])
    setRecentConversations([])
    // Mesajları başlangıç durumuna getir
    setMessages([
      {
        id: 1,
        type: "assistant",
        content: "Merhaba! Dijital İkiz Tabanlı Churn Önleme Sistemi'nin AI asistanıyım. Müşteri davranışlarını analiz etme, churn risklerini tahmin etme ve elde tutma stratejileri önerme konularında size yardımcı olabilirim. Bugün size nasıl yardımcı olabilirim?",
        timestamp: new Date()
      }
    ])
  }

  const handleNewChat = () => {
    // Yeni sohbet başlat - mevcut mesajları temizle
    setMessages([
      {
        id: 1,
        type: "assistant",
        content: "Merhaba! Dijital İkiz Tabanlı Churn Önleme Sistemi'nin AI asistanıyım. Müşteri davranışlarını analiz etme, churn risklerini tahmin etme ve elde tutma stratejileri önerme konularında size yardımcı olabilirim. Bugün size nasıl yardımcı olabilirim?",
        timestamp: new Date()
      }
    ])
    // Tüm sohbetleri aktif olmayan duruma getir
    setConversations(prev => prev.map(conv => ({ ...conv, active: false })))
  }

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: message,
      timestamp: new Date()
    }

    setMessages([...messages, newMessage])
    const currentMessage = message
    setMessage("")

    try {
      // Call RAG chatbot API
      const response = await apiService.chatWithBot(currentMessage)
      
      const aiResponse = {
        id: messages.length + 2,
        type: "assistant" as const,
        content: response.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Chat error:', error)
      const errorResponse = {
        id: messages.length + 2,
        type: "assistant" as const,
        content: "Üzgünüm, şu anda bir hata oluştu. Lütfen tekrar deneyin.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    }
  }

  const quickQuestions = [
    "Türkiye'deki telekomünikasyon rakiplerinin son kampanyaları neler?",
    "Turkcell, Vodafone ve Türk Telekom'un müşteri tekliflerini karşılaştır",
    "Rakip analizi yap ve rekabet avantajları öner",
    "Yeni müşteri kazanma stratejileri neler olabilir?",
    "Churn önleme için en etkili yöntemler nelerdir?"
  ]

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border-r border-blue-200/60 dark:border-gray-700/60 flex flex-col shadow-xl h-full">
        {/* Header */}
        <div className="p-6 border-b border-blue-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">CHAT A.I+</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dijital İkiz Asistanı</p>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleNewChat}
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Sohbet Başlat
          </Button>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Sohbet geçmişinde ara..." 
              className="pl-10 bg-gray-50/80 dark:bg-gray-700/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl h-11"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-3 border-b border-blue-200/60 dark:border-gray-700/60">
          <div className="space-y-1">
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
            <Link to="/statistics">
              <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg h-10 font-medium">
                <PieChart className="w-4 h-4 mr-3" />
                Analitik
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600 bg-blue-50/80 dark:text-blue-400 dark:bg-blue-900/20 rounded-lg h-10 font-semibold border border-blue-200/50 dark:border-blue-800/50">
              <MessageSquare className="w-4 h-4 mr-3" />
              AI Asistan
            </Button>
            <Link to="/simulation">
              <Button variant="ghost" size="sm" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg h-10 font-medium">
                <Play className="w-4 h-4 mr-3" />
                Simülasyon
              </Button>
            </Link>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Sohbet Geçmişi</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg"
                onClick={handleClearAllConversations}
                title="Tüm sohbetleri sil"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    conv.active 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/60 dark:border-blue-800/60 shadow-sm' 
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-700/80 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        conv.active 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {conv.title}
                      </p>
                      <p className={`text-xs mt-1 font-medium ${
                        conv.active 
                          ? 'text-blue-600 dark:text-blue-300' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conv.time}
                      </p>
                    </div>
                    {conv.active && (
                      <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Son 7 Gün</h3>
            </div>
            
            <div className="space-y-1">
              {recentConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="p-3 rounded-lg cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-all duration-200 hover:shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {conv.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3 mb-3">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.username || user?.email || 'Kullanıcı'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Aktif</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border-b border-blue-200/60 dark:border-gray-700/60 p-6 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 bg-clip-text text-transparent">CHAT A.I+</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Dijital İkiz Tabanlı Churn Önleme Asistanı</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Çevrimiçi
              </Badge>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages - Fixed Height with Scroll */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[80%] flex items-start space-x-4 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600'
                    }`}>
                      {msg.type === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                    <div className={`rounded-2xl p-5 shadow-sm ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' 
                        : 'bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60'
                    }`}>
                      <div className="text-sm leading-relaxed font-medium prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            table: ({ children, ...props }) => (
                              <div className="overflow-x-auto my-4">
                                <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm" {...props}>
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children, ...props }) => (
                              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600" {...props}>
                                {children}
                              </thead>
                            ),
                            tbody: ({ children, ...props }) => (
                              <tbody className="bg-white dark:bg-gray-800" {...props}>
                                {children}
                              </tbody>
                            ),
                            tr: ({ children, ...props }) => (
                              <tr className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" {...props}>
                                {children}
                              </tr>
                            ),
                            th: ({ children, ...props }) => (
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 last:border-r-0" {...props}>
                                {children}
                              </th>
                            ),
                            td: ({ children, ...props }) => (
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-600 last:border-r-0" {...props}>
                                {children}
                              </td>
                            ),
                            h1: ({ children, ...props }) => (
                              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 mt-6 first:mt-0" {...props}>
                                {children}
                              </h1>
                            ),
                            h2: ({ children, ...props }) => (
                              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 mt-5 first:mt-0" {...props}>
                                {children}
                              </h2>
                            ),
                            h3: ({ children, ...props }) => (
                              <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4 first:mt-0" {...props}>
                                {children}
                              </h3>
                            ),
                            p: ({ children, ...props }) => (
                              <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-300" {...props}>
                                {children}
                              </p>
                            ),
                            ul: ({ children, ...props }) => (
                              <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
                                {children}
                              </ul>
                            ),
                            ol: ({ children, ...props }) => (
                              <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
                                {children}
                              </ol>
                            ),
                            li: ({ children, ...props }) => (
                              <li className="text-gray-700 dark:text-gray-300" {...props}>
                                {children}
                              </li>
                            ),
                            strong: ({ children, ...props }) => (
                              <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props}>
                                {children}
                              </strong>
                            ),
                            em: ({ children, ...props }) => (
                              <em className="italic text-gray-600 dark:text-gray-400" {...props}>
                                {children}
                              </em>
                            ),
                            code: ({ children, ...props }) => (
                              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props}>
                                {children}
                              </code>
                            ),
                            pre: ({ children, ...props }) => (
                              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-3" {...props}>
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children, ...props }) => (
                              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 mb-3" {...props}>
                                {children}
                              </blockquote>
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div className={`flex items-center justify-between mt-4 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <span className="text-xs font-medium">
                          {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.type === 'assistant' && (
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border-t border-blue-200/60 dark:border-gray-700/60 p-6 shadow-lg flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="pr-14 h-14 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 bg-gray-50/80 dark:bg-gray-700/80 rounded-2xl text-base font-medium"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-10 w-10 p-0 rounded-xl shadow-lg"
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
            
            {/* Quick Questions */}
            <div className="mt-6 flex flex-wrap gap-3">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(question)}
                  className="text-sm h-9 bg-blue-50/80 hover:bg-blue-100/80 dark:bg-gray-700/80 dark:hover:bg-gray-600/80 border-blue-200/60 dark:border-gray-600/60 text-blue-700 dark:text-blue-300 rounded-xl font-medium hover:shadow-sm transition-all duration-200"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Analytics & Quick Actions */}
      <div className="w-80 bg-white/98 dark:bg-gray-800/98 backdrop-blur-md border-l border-blue-200/60 dark:border-gray-700/60 flex flex-col shadow-xl h-full">
        {/* Analytics Header */}
        <div className="p-6 border-b border-blue-200/60 dark:border-gray-700/60">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Canlı Analitik</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Gerçek Zamanlı Metrikler</p>
            </div>
          </div>
        </div>

        {/* Churn Risk Indicators */}
        <div className="p-4 border-b border-blue-200/60 dark:border-gray-700/60">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2 text-blue-500" />
            Churn Risk Durumu
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200/60 dark:border-red-800/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Yüksek Risk</span>
              </div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">127</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Orta Risk</span>
              </div>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">374</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Düşük Risk</span>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">1,265</span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="p-4 border-b border-blue-200/60 dark:border-gray-700/60">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-blue-500" />
            Sistem Performansı
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Dijital İkiz Modelleri</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-3/4 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Veri İşleme</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-4/5 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">80%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">AI Tahmin Doğruluğu</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="w-5/6 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                </div>
                <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">83%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-blue-200/60 dark:border-gray-700/60">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-blue-500" />
            Hızlı İşlemler
          </h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300">
              <Users className="w-4 h-4 mr-2" />
              Risk Analizi Çalıştır
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-sm h-9 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
              <Database className="w-4 h-4 mr-2" />
              Veri Güncelle
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-sm h-9 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300"
              onClick={async () => {
                try {
                  const analysis = await apiService.getCompetitorAnalysis(true)
                  const analysisMessage = {
                    id: messages.length + 1,
                    type: "assistant" as const,
                    content: analysis.analysis,
                    timestamp: new Date()
                  }
                  setMessages(prev => [...prev, analysisMessage])
                } catch (error) {
                  console.error('Analysis error:', error)
                }
              }}
            >
              <Network className="w-4 h-4 mr-2" />
              Rakip Analizi
            </Button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="flex-1 p-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2 text-blue-500" />
            Son Uyarılar
          </h4>
          <div className="space-y-2">
            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Premium segment churn riski %28.4'e yükseldi</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">2 dakika önce</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/60 dark:border-blue-800/60">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Yeni dijital ikiz modeli eğitildi</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">15 dakika önce</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">Kampanya başarı oranı %73'e ulaştı</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">1 saat önce</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">Sistem Aktif</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Son güncelleme: Şimdi</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot