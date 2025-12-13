import React, { useState, useMemo } from 'react';
import { PNode, NodeStatus, SortConfig } from '../types';
import { ArrowUpDown, ShieldCheck, AlertCircle, WifiOff, Search } from 'lucide-react';

interface NodeTableProps {
  nodes: PNode[];
}

export const NodeTable: React.FC<NodeTableProps> = ({ nodes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'latency', direction: 'asc' });

  const handleSort = (key: keyof PNode) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedNodes = useMemo(() => {
    let result = [...nodes];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(n => 
        n.identityPubkey.toLowerCase().includes(lowerTerm) ||
        (n.version && n.version.toLowerCase().includes(lowerTerm)) ||
        (n.location && n.location.toLowerCase().includes(lowerTerm))
      );
    }

    result.sort((a, b) => {
      // Handle nulls safely
      const valA = a[sortConfig.key] ?? '';
      const valB = b[sortConfig.key] ?? '';

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [nodes, searchTerm, sortConfig]);

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case NodeStatus.ACTIVE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck size={12} className="mr-1"/> Active</span>;
      case NodeStatus.DELINQUENT:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"><AlertCircle size={12} className="mr-1"/> Delinquent</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><WifiOff size={12} className="mr-1"/> Offline</span>;
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-white">pNode Registry</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search pubkey, version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900/40 text-slate-400 text-xs uppercase font-semibold sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('identityPubkey')}>
                <div className="flex items-center">Node Identity <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors hidden sm:table-cell" onClick={() => handleSort('version')}>
                 <div className="flex items-center">Version <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => handleSort('status')}>
                 <div className="flex items-center">Status <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
               <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors hidden md:table-cell" onClick={() => handleSort('uptime')}>
                 <div className="flex items-center">Uptime <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-indigo-400 transition-colors text-right" onClick={() => handleSort('latency')}>
                 <div className="flex items-center justify-end">Latency <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {filteredAndSortedNodes.map((node, idx) => (
              <tr key={node.identityPubkey + idx} className="hover:bg-slate-700/20 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mr-3 text-xs font-bold border border-indigo-500/30">
                      {node.identityPubkey.substring(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white font-mono truncate max-w-[140px] sm:max-w-[200px]" title={node.identityPubkey}>
                        {node.identityPubkey}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[140px] hidden sm:block">
                        {node.gossipAddr}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">{node.version || 'Unknown'}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(node.status)}
                </td>
                 <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden mr-2">
                      <div className={`h-full rounded-full ${node.uptime && node.uptime > 90 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${node.uptime || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400">{node.uptime?.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-mono ${node.latency < 50 ? 'text-emerald-400' : node.latency < 150 ? 'text-yellow-400' : 'text-rose-400'}`}>
                    {node.latency}ms
                  </span>
                </td>
              </tr>
            ))}
            {filteredAndSortedNodes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <Search size={32} className="mb-2 opacity-50"/>
                    <p>No nodes found matching your criteria</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};