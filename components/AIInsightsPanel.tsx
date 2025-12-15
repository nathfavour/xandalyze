import React from 'react';
import { AlertCircle, TrendingUp, Zap, AlertTriangle, CheckCircle, Brain } from 'lucide-react';
import { AIAnalytics, AIInsight } from '../services/aiAnalyticsService';

interface AIInsightsPanelProps {
  analytics: AIAnalytics | null;
  loading?: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="bg-surface-primary border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Brain className="text-primary animate-pulse" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-surface-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-surface-primary border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Brain className="text-primary" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        </div>
        <p className="text-muted text-sm">No analytics data available</p>
      </div>
    );
  }

  const renderInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle size={16} />;
      case 'prediction':
        return <TrendingUp size={16} />;
      case 'optimization':
        return <Zap size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-error/10 border-error/30 text-error';
      case 'high':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'medium':
        return 'bg-primary/10 border-primary/30 text-primary';
      default:
        return 'bg-muted/10 border-border text-muted';
    }
  };

  const allInsights = [
    ...analytics.anomalies,
    ...analytics.predictedIssues,
    ...analytics.optimizationOpportunities
  ].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className="bg-surface-primary border border-border rounded-xl overflow-hidden">
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
              <p className="text-xs text-muted">Real-time analytics & predictions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{analytics.healthScore}</div>
              <div className="text-xs text-muted">Health Score</div>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              analytics.healthScore >= 80 ? 'bg-success/20 text-success' :
              analytics.healthScore >= 60 ? 'bg-warning/20 text-warning' :
              'bg-error/20 text-error'
            }`}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-4">
          <div className="flex-1 bg-surface-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Network Efficiency</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${analytics.networkEfficiency}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground">{analytics.networkEfficiency}%</span>
            </div>
          </div>
          <div className="flex-1 bg-surface-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted mb-1">Performance Trend</div>
            <div className="flex items-center gap-2">
              <TrendingUp className={`${
                analytics.performanceTrend === 'improving' ? 'text-success' :
                analytics.performanceTrend === 'stable' ? 'text-primary' :
                'text-error'
              }`} size={16} />
              <span className="text-sm font-semibold text-foreground capitalize">
                {analytics.performanceTrend}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 max-h-[600px] overflow-y-auto">
        {allInsights.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="mx-auto mb-3 text-success" size={48} />
            <p className="text-foreground-secondary font-medium">All Systems Optimal</p>
            <p className="text-muted text-sm mt-1">No issues detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allInsights.map((insight, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {renderInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-current/10 capitalize">
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">{insight.description}</p>
                    <div className="text-xs opacity-75">
                      <span className="font-medium">Impact:</span> {insight.impact}
                    </div>
                    {insight.action && (
                      <div className="mt-2 text-xs opacity-75 bg-current/5 rounded px-2 py-1">
                        <span className="font-medium">Action:</span> {insight.action}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
