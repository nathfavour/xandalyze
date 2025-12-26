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
  Menu,
  X
} from 'lucide-react';
import { PNode, NetworkStats, GeminiReport } from './types';
import { fetchPNodes } from './services/pNodeService';
import { generateNetworkReport } from './services/geminiService';
import { StatCard } from './components/StatCard';
import { NodeTable } from './components/NodeTable';
import { StatusPieChart, LatencyChart } from './components/DashboardCharts';
import { NAV_ITEMS } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [nodes, setNodes] = useState<PNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Gemini State
  const [aiReport, setAiReport] = useState<GeminiReport | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPNodes();
    setNodes(data);
    setLastRefreshed(new Date());
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
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col items-center lg:items-stretch transition-all duration-300 z-20">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <Activity className="text-white" size={20} />
          </div>
          <span className="ml-3 font-bold text-xl tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
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
                     ? 'bg-indigo-600/10 text-indigo-400 shadow-sm border border-indigo-500/20' 
                     : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                 }`}
               >
                 <Icon size={20} className={active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'} />
                 <span className="ml-3 font-medium hidden lg:block">{item.name}</span>
                 {item.id === 'ai' && <span className="ml-auto hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-indigo-500 text-white rounded font-bold">BETA</span>}
               </button>
             );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center justify-center lg:justify-start w-full text-slate-500 hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-800/50">
            <Settings size={20} />
            <span className="ml-3 text-sm font-medium hidden lg:block">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-white capitalize">{activeTab === 'map' ? 'Network Map' : 'Dashboard Overview'}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 font-mono hidden sm:block">
              Last update: {lastRefreshed ? lastRefreshed.toLocaleTimeString() : '...'}
            </span>
            <button 
              onClick={loadData}
              disabled={loading}
              className={`p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-slate-800 shadow-lg"></div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scroll-smooth">
          
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
          <div className="bg-slate-900 border border-indigo-500/30 w-full max-w-2xl rounded-2xl shadow-2xl shadow-indigo-900/20 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Xandalyze AI Architect</h3>
                  <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-indigo-300 animate-pulse">Analyzing pNode gossip protocols...</p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-center">
                  <p>{aiError}</p>
                  <button onClick={() => setIsAiModalOpen(false)} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-sm hover:bg-slate-700">Close</button>
                </div>
              ) : aiReport ? (
                <div className="space-y-6">
                  {/* Health Score */}
                  <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <span className="text-slate-400 font-medium">Network Health Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-rose-500 via-yellow-500 to-emerald-500" 
                          style={{ width: `${aiReport.healthScore}%` }}
                        />
                      </div>
                      <span className="text-xl font-bold text-white">{aiReport.healthScore}/100</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h4 className="text-indigo-400 font-medium text-sm uppercase tracking-wide">Analysis Summary</h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                      {aiReport.summary}
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <h4 className="text-emerald-400 font-medium text-sm uppercase tracking-wide">Optimization Recommendations</h4>
                    <ul className="space-y-2">
                      {aiReport.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-300 bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                          <span className="text-emerald-500 font-bold">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {!aiLoading && !aiError && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
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