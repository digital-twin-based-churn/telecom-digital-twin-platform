import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import RiskAnalysis from "./pages/RiskAnalysis";
import SegmentExplorer from "./pages/SegmentExplorer";
import WhatIfAnalysis from "./pages/WhatIfAnalysis";
import Customer360 from "./pages/Customer360";
import CampaignTracker from "./pages/CampaignTracker";
import Chatbot from "./pages/Chatbot";
import Simulation from "./pages/Simulation";
import Settings from "./pages/Settings";
import ApiTest from "./pages/ApiTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="churnguard-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/statistics" 
                element={
                  <ProtectedRoute>
                    <Statistics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/risk-analysis" 
                element={
                  <ProtectedRoute>
                    <RiskAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/segment-explorer" 
                element={
                  <ProtectedRoute>
                    <SegmentExplorer />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/what-if" 
                element={
                  <ProtectedRoute>
                    <WhatIfAnalysis />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/customer-360" 
                element={
                  <ProtectedRoute>
                    <Customer360 />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaign-tracker" 
                element={
                  <ProtectedRoute>
                    <CampaignTracker />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chatbot" 
                element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/simulation" 
                element={
                  <ProtectedRoute>
                    <Simulation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="/api-test" element={<ApiTest />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
