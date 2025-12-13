import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subValue, trend, icon, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  const activeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-xl border bg-slate-800/50 backdrop-blur-sm ${activeColor.split(' ')[2]} transition-all duration-300 hover:shadow-lg hover:bg-slate-800/80`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${activeColor.split(' ')[0]} ${activeColor.split(' ')[1]}`}>
          {icon || <Activity size={20} />}
        </div>
      </div>
      {subValue && (
        <div className="mt-4 flex items-center text-xs">
          {trend === 'up' && <ArrowUpRight size={14} className="text-emerald-400 mr-1" />}
          {trend === 'down' && <ArrowDownRight size={14} className="text-rose-400 mr-1" />}
          <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'}>
            {subValue}
          </span>
          <span className="text-slate-600 ml-1">vs last epoch</span>
        </div>
      )}
    </div>
  );
};