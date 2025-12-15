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
    blue: "bg-primary/10 text-primary border-primary/20",
    green: "bg-success/10 text-success border-success/20",
    purple: "bg-accent/10 text-accent border-accent/20",
    orange: "bg-warning/10 text-warning border-warning/20",
  };

  const activeColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-xl border bg-surface-primary backdrop-blur-sm ${activeColor.split(' ')[2]} transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/10 hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground tracking-tight">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${activeColor.split(' ')[0]} ${activeColor.split(' ')[1]}`}>
          {icon || <Activity size={20} />}
        </div>
      </div>
      {subValue && (
        <div className="mt-4 flex items-center text-xs">
          {trend === 'up' && <ArrowUpRight size={14} className="text-success mr-1" />}
          {trend === 'down' && <ArrowDownRight size={14} className="text-error mr-1" />}
          <span className={trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-muted'}>
            {subValue}
          </span>
          <span className="text-muted ml-1 opacity-70">vs last epoch</span>
        </div>
      )}
    </div>
  );
};