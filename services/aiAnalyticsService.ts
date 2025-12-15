import { PNode, GeminiReport } from '../types';

export interface AIInsight {
  type: 'anomaly' | 'recommendation' | 'prediction' | 'optimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  action?: string;
  timestamp: Date;
}

export interface AIAnalytics {
  healthScore: number;
  performanceTrend: 'improving' | 'stable' | 'degrading';
  predictedIssues: AIInsight[];
  optimizationOpportunities: AIInsight[];
  anomalies: AIInsight[];
  networkEfficiency: number;
}

export class AIAnalyticsEngine {
  static analyzeNetworkHealth(nodes: PNode[]): AIAnalytics {
    const activeNodes = nodes.filter(n => n.status === 'Active');
    const activeRatio = activeNodes.length / (nodes.length || 1);
    const avgLatency = nodes.reduce((acc, n) => acc + n.latency, 0) / (nodes.length || 1);
    const avgUptime = nodes.reduce((acc, n) => acc + (n.uptime || 0), 0) / (nodes.length || 1);

    // Calculate health score
    const healthScore = Math.round(
      activeRatio * 40 + 
      Math.max(0, (200 - avgLatency) / 200) * 30 + 
      (avgUptime / 100) * 30
    );

    // Detect anomalies
    const anomalies = this.detectAnomalies(nodes);
    
    // Generate predictions
    const predictedIssues = this.predictIssues(nodes);
    
    // Find optimization opportunities
    const optimizationOpportunities = this.findOptimizations(nodes);

    // Determine trend
    const performanceTrend: 'improving' | 'stable' | 'degrading' = 
      healthScore > 80 ? 'improving' : healthScore > 60 ? 'stable' : 'degrading';

    // Calculate network efficiency
    const networkEfficiency = Math.round(
      (activeRatio * 50) + 
      (Math.max(0, (150 - avgLatency) / 150) * 50)
    );

    return {
      healthScore,
      performanceTrend,
      predictedIssues,
      optimizationOpportunities,
      anomalies,
      networkEfficiency
    };
  }

  private static detectAnomalies(nodes: PNode[]): AIInsight[] {
    const anomalies: AIInsight[] = [];
    const avgLatency = nodes.reduce((acc, n) => acc + n.latency, 0) / (nodes.length || 1);

    // High latency nodes
    const highLatencyNodes = nodes.filter(n => n.latency > avgLatency * 2 && n.latency > 100);
    if (highLatencyNodes.length > 0) {
      anomalies.push({
        type: 'anomaly',
        severity: highLatencyNodes.length > 5 ? 'high' : 'medium',
        title: 'High Latency Detected',
        description: `${highLatencyNodes.length} nodes showing abnormally high latency (>${Math.round(avgLatency * 2)}ms)`,
        impact: 'May affect network responsiveness and user experience',
        action: 'Investigate network conditions and node configurations',
        timestamp: new Date()
      });
    }

    // Low uptime nodes
    const lowUptimeNodes = nodes.filter(n => (n.uptime || 0) < 95 && n.status === 'Active');
    if (lowUptimeNodes.length > 0) {
      anomalies.push({
        type: 'anomaly',
        severity: 'medium',
        title: 'Unstable Nodes Detected',
        description: `${lowUptimeNodes.length} active nodes with uptime below 95%`,
        impact: 'Reduced network reliability and potential data inconsistencies',
        action: 'Review node stability and consider replacing unreliable validators',
        timestamp: new Date()
      });
    }

    // Version fragmentation
    const versions = [...new Set(nodes.map(n => n.version).filter(Boolean))];
    if (versions.length > 3) {
      anomalies.push({
        type: 'anomaly',
        severity: 'low',
        title: 'Version Fragmentation',
        description: `Network running ${versions.length} different versions`,
        impact: 'May lead to consensus issues and reduced performance',
        action: 'Encourage validators to upgrade to latest stable version',
        timestamp: new Date()
      });
    }

    return anomalies;
  }

  private static predictIssues(nodes: PNode[]): AIInsight[] {
    const predictions: AIInsight[] = [];
    const activeNodes = nodes.filter(n => n.status === 'Active');
    const activeRatio = activeNodes.length / (nodes.length || 1);

    if (activeRatio < 0.85) {
      predictions.push({
        type: 'prediction',
        severity: activeRatio < 0.7 ? 'critical' : 'high',
        title: 'Network Availability Risk',
        description: `Active node ratio at ${Math.round(activeRatio * 100)}%, below optimal threshold`,
        impact: 'Risk of reduced network capacity and slower transaction processing',
        action: 'Monitor node status and prepare failover strategies',
        timestamp: new Date()
      });
    }

    // Storage capacity prediction
    const avgStorage = nodes.reduce((acc, n) => acc + (n.diskSpace || 0), 0) / (nodes.length || 1);
    if (avgStorage < 50) {
      predictions.push({
        type: 'prediction',
        severity: 'medium',
        title: 'Storage Capacity Planning',
        description: `Average node storage at ${Math.round(avgStorage)}TB, may need expansion`,
        impact: 'Future storage constraints could limit network growth',
        action: 'Plan for storage expansion across validator infrastructure',
        timestamp: new Date()
      });
    }

    return predictions;
  }

  private static findOptimizations(nodes: PNode[]): AIInsight[] {
    const optimizations: AIInsight[] = [];
    const avgLatency = nodes.reduce((acc, n) => acc + n.latency, 0) / (nodes.length || 1);

    if (avgLatency > 100) {
      optimizations.push({
        type: 'optimization',
        severity: 'medium',
        title: 'Latency Optimization Opportunity',
        description: `Network average latency at ${Math.round(avgLatency)}ms, could be improved`,
        impact: 'Reducing latency would improve transaction confirmation times',
        action: 'Consider geographic distribution of nodes and network topology optimization',
        timestamp: new Date()
      });
    }

    // Geographic distribution
    const locations = nodes.map(n => n.location).filter(Boolean);
    const locationSet = new Set(locations);
    if (locationSet.size < 3) {
      optimizations.push({
        type: 'optimization',
        severity: 'low',
        title: 'Geographic Diversity',
        description: `Network concentrated in ${locationSet.size} regions`,
        impact: 'Limited geographic diversity increases regional failure risk',
        action: 'Expand validator presence to additional geographic regions',
        timestamp: new Date()
      });
    }

    return optimizations;
  }

  static generateInsightsSummary(analytics: AIAnalytics): string {
    const { healthScore, performanceTrend, anomalies, predictedIssues } = analytics;
    
    let summary = `Network health score: ${healthScore}/100 (${performanceTrend}). `;
    
    if (anomalies.length > 0) {
      summary += `Detected ${anomalies.length} anomalies requiring attention. `;
    }
    
    if (predictedIssues.length > 0) {
      summary += `${predictedIssues.length} potential issues identified for proactive monitoring.`;
    } else {
      summary += 'No immediate issues predicted.';
    }
    
    return summary;
  }
}
