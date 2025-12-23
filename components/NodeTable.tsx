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
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20"><ShieldCheck size={12} className="mr-1"/> Active</span>;
      case NodeStatus.DELINQUENT:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20"><AlertCircle size={12} className="mr-1"/> Delinquent</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/10 text-muted border border-border"><WifiOff size={12} className="mr-1"/> Offline</span>;
    }
  };

  return (
    <div className="bg-surface-primary backdrop-blur-sm rounded-xl border border-border overflow-hidden flex flex-col h-full shadow-lg">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">pNode Registry</h3>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search pubkey, version..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors placeholder:text-muted"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-secondary text-muted text-xs uppercase font-semibold sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('identityPubkey')}>
                <div className="flex items-center">Node Identity <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors hidden sm:table-cell" onClick={() => handleSort('version')}>
                 <div className="flex items-center">Version <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('status')}>
                 <div className="flex items-center">Status <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
               <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors hidden md:table-cell" onClick={() => handleSort('uptime')}>
                 <div className="flex items-center">Uptime <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleSort('latency')}>
                 <div className="flex items-center justify-end">Latency <ArrowUpDown size={12} className="ml-1 opacity-50"/></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedNodes.map((node, idx) => (
              <tr key={node.identityPubkey + idx} className="hover:bg-surface-secondary/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3 text-xs font-bold border border-primary/30">
                      {node.identityPubkey.substring(0,2)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground font-mono truncate max-w-[140px] sm:max-w-[200px]" title={node.identityPubkey}>
                        {node.identityPubkey}
                      </div>
                      <div className="text-xs text-muted truncate max-w-[140px] hidden sm:block">
                        {node.gossipAddr}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-foreground-secondary bg-surface-secondary px-2 py-1 rounded border border-border">{node.version || 'Unknown'}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(node.status)}
                </td>
                 <td className="px-6 py-4 hidden md:table-cell">
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-surface-tertiary rounded-full overflow-hidden mr-2">
                      <div className={`h-full rounded-full ${node.uptime && node.uptime > 90 ? 'bg-success' : 'bg-warning'}`} style={{ width: `${node.uptime || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-muted">{node.uptime?.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-mono ${node.latency < 50 ? 'text-success' : node.latency < 150 ? 'text-warning' : 'text-error'}`}>
                    {node.latency}ms
                  </span>
                </td>
              </tr>
            ))}
            {filteredAndSortedNodes.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-muted">
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