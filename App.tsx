import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Server, 
  Map as MapIcon, 
  Settings, 
  Activity, 
  Database, 
  Globe, 
  RefreshCw,
  Sparkles,
  Bot,
  Brain
} from 'lucide-react';
import { PNode, NetworkStats, GeminiReport } from './types';
import { fetchPNodes } from './services/pNodeService';
import { generateNetworkReport } from './services/geminiService';
import { AIAnalyticsEngine, AIAnalytics } from './services/aiAnalyticsService';
import { StatCard } from './components/StatCard';
import { NodeTable } from './components/NodeTable';
import { StatusPieChart, LatencyChart } from './components/DashboardCharts';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { ThemeToggle } from './components/ThemeToggle';
import { NAV_ITEMS } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  
  // Gemini State
  const [aiReport, setAiReport] = useState<GeminiReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  
  // AI Analytics State
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [showAiInsights, setShowAiInsights] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPNodes();
    setNodes(data);
    setLastRefreshed(new Date());
    
    // Generate AI analytics
    const analytics = AIAnalyticsEngine.analyzeNetworkHealth(data);
    setAiAnalytics(analytics);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh every 30s
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setAiLoading(true);
    setAiError(null);
    setIsAiModalOpen(true);
    
    // Check if API key is present in env (simulated check)
    if (!process.env.API_KEY) {
      setAiError("Gemini API Key missing. Please configure process.env.API_KEY to use AI features.");
      setAiLoading(false);
      return;
    }

    try {
      const report = await generateNetworkReport(nodes);
      setAiReport(report);
    } catch (err) {
      setAiError("Failed to generate AI report. The service might be unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  const calculateStats = (): NetworkStats => {
    const active = nodes.filter(n => n.status === 'Active').length;
    const storage = nodes.reduce((acc, n) => acc + (n.diskSpace || 0), 0);
    const lat = nodes.reduce((acc, n) => acc + n.latency, 0) / (nodes.length || 1);
    
    return {
      totalNodes: nodes.length,
      activeNodes: active,
      totalStorage: storage,
      avgLatency: lat
    };
  };

  const stats = calculateStats();

  return (
    <div className="flex h-screen bg-bg-primary text-foreground overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-surface-primary border-r border-border flex flex-col items-center lg:items-stretch transition-all duration-300 z-20 shadow-xl">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
             <Activity className="text-primary-foreground" size={20} />
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted">
            Xandalyze
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {NAV_ITEMS.map((item) => {
             const Icon = item.icon === 'Server' ? Server : item.icon === 'Map' ? MapIcon : item.icon === 'Sparkles' ? Sparkles : LayoutDashboard;
             const active = activeTab === item.id;
             return (
               <button
                 key={item.id}
                 onClick={() => item.id === 'ai' ? handleGenerateReport() : setActiveTab(item.id)}
                 className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                   active 
                     ? 'bg-primary/10 text-primary shadow-sm border border-primary/20' 
                     : 'text-muted hover:bg-surface-secondary hover:text-foreground'
                 }`}
               >
                 <Icon size={20} className={active ? 'text-primary' : 'text-muted group-hover:text-foreground'} />
                 <span className="ml-3 font-medium hidden lg:block">{item.name}</span>
                 {item.id === 'ai' && <span className="ml-auto hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded font-bold">BETA</span>}
               </button>
             );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center justify-center lg:justify-start w-full text-muted hover:text-foreground transition-colors p-2 rounded-lg hover:bg-surface-secondary/50">
            <Settings size={20} />
            <span className="ml-3 text-sm font-medium hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-surface-primary/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 z-10 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground capitalize">{activeTab === 'map' ? 'Network Map' : 'Dashboard Overview'}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted font-mono hidden sm:block">
              Last update: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : '...'}
            </span>
            <ThemeToggle />
            <button 
              onClick={loadData}
              disabled={loading}
              className={`p-2 rounded-lg bg-surface-secondary border border-border text-muted hover:text-foreground hover:border-primary/50 transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent border-2 border-border shadow-lg"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth bg-bg-secondary">
          
          {/* AI Insights Toggle */}
          {aiAnalytics && (
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowAiInsights(!showAiInsights)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-all duration-200 font-medium"
              >
                <Brain size={18} />
                {showAiInsights ? 'Hide' : 'Show'} AI Insights
              </button>
            </div>
          )}

          {/* AI Insights Panel */}
          {showAiInsights && (
            <div className="mb-8">
              <AIInsightsPanel analytics={aiAnalytics} loading={loading} />
            </div>
          )}
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total pNodes" 
              value={stats.totalNodes} 
              subValue="+12" 
              trend="up" 
              icon={<Server size={20} />} 
              color="blue"
            />
            <StatCard 
              title="Active Nodes" 
              value={stats.activeNodes} 
              subValue={`${Math.round((stats.activeNodes / stats.totalNodes) * 100)}% uptime`} 
              trend="up" 
              icon={<Activity size={20} />} 
              color="green"
            />
            <StatCard 
              title="Storage Capacity" 
              value={`${stats.totalStorage.toLocaleString()} TB`} 
              subValue="+1.2 PB" 
              trend="up" 
              icon={<Database size={20} />} 
              color="purple"
            />
            <StatCard 
              title="Avg Latency" 
              value={`${Math.round(stats.avgLatency)} ms`} 
              subValue="-5 ms" 
              trend="down" 
              icon={<Globe size={20} />} 
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <LatencyChart nodes={nodes} />
            </div>
            <div>
              <StatusPieChart nodes={nodes} />
            </div>
          </div>

          {/* Node Table */}
          <div className="h-[600px] mb-8">
            <NodeTable nodes={nodes} />
          </div>
        </div>
      </main>

      {/* Gemini AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-primary border border-primary/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Xandalyze AI Architect</h3>
                  <p className="text-xs text-muted">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-muted hover:text-foreground">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-primary animate-pulse">Analyzing pNode gossip protocols...</p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-center">
                  <p>{aiError}</p>
                  <button onClick={() => setIsAiModalOpen(false)} className="mt-4 px-4 py-2 bg-surface-secondary rounded-lg text-sm hover:bg-surface-tertiary">Close</button>
                </div>
              ) : aiReport ? (
                <div className="space-y-6">
                  {/* Health Score */}
                  <div className="flex items-center justify-between bg-surface-secondary/50 p-4 rounded-xl border border-border">
                    <span className="text-muted font-medium">Network Health Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-surface-tertiary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-error via-warning to-success" 
                          style={{ width: `${aiReport.healthScore}%` }}
                        />
                      </div>
                      <span className="text-xl font-bold text-foreground">{aiReport.healthScore}/100</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h4 className="text-primary font-medium text-sm uppercase tracking-wide">Analysis Summary</h4>
                    <p className="text-foreground-secondary leading-relaxed bg-surface-secondary/30 p-4 rounded-xl border border-border">
                      {aiReport.summary}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-success font-medium text-sm uppercase tracking-wide">Optimization Recommendations</h4>
                    <ul className="space-y-2">
                      {aiReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-foreground-secondary bg-surface-secondary/30 p-3 rounded-lg border border-border/50">
                          <span className="text-success font-bold">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {!aiLoading && !aiError && (
              <div className="p-4 border-t border-border bg-surface-primary/50 flex justify-end">
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-6 py-2 bg-surface-secondary hover:bg-surface-tertiary text-foreground rounded-lg transition-colors font-medium"
                >
                  Close Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;