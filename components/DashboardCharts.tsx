import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PNode, NodeStatus } from '../types';

interface ChartProps {
  nodes: PNode[];
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Success, Warning, Error

export const StatusPieChart: React.FC<ChartProps> = ({ nodes }) => {
  const data = [
    { name: 'Active', value: nodes.filter(n => n.status === NodeStatus.ACTIVE).length },
    { name: 'Delinquent', value: nodes.filter(n => n.status === NodeStatus.DELINQUENT).length },
    { name: 'Offline', value: nodes.filter(n => n.status === NodeStatus.OFFLINE).length },
  ];

  return (
    <div className="h-[300px] w-full bg-surface-primary backdrop-blur-sm rounded-xl border border-border p-6 shadow-lg">
      <h3 className="text-foreground-secondary font-semibold mb-4 text-sm uppercase tracking-wider">Node Status Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-primary)', 
              borderColor: 'var(--border)', 
              color: 'var(--foreground)',
              borderRadius: '0.5rem'
            }}
            itemStyle={{ color: 'var(--foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 -mt-8">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center text-xs text-muted">
            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
};

export const LatencyChart: React.FC<ChartProps> = ({ nodes }) => {
  // Simulate historical data based on current nodes
  const data = Array.from({ length: 24 }).map((_, i) => ({
    time: `${i}:00`,
    latency: Math.floor(nodes.reduce((acc, n) => acc + (n.latency || 0), 0) / (nodes.length || 1) + Math.random() * 20 - 10)
  }));

  return (
    <div className="h-[300px] w-full bg-surface-primary backdrop-blur-sm rounded-xl border border-border p-6 shadow-lg">
       <h3 className="text-foreground-secondary font-semibold mb-4 text-sm uppercase tracking-wider">Average Network Latency (24h)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="var(--muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="var(--muted)" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(val) => `${val}ms`} 
          />
          <Tooltip 
             contentStyle={{ 
               backgroundColor: 'var(--surface-primary)', 
               borderColor: 'var(--border)', 
               color: 'var(--foreground)',
               borderRadius: '0.5rem'
             }}
             itemStyle={{ color: '#6366f1' }}
          />
          <Area type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};