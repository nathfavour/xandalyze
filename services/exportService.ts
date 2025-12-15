import { PNode, NetworkStats, GeminiReport } from '../types';
import { AIAnalytics } from './aiAnalyticsService';

export class ExportService {
  static exportToCSV(nodes: PNode[], filename: string = 'xandalyze-nodes.csv') {
    const headers = ['Identity', 'Gossip Address', 'RPC Address', 'Version', 'Status', 'Latency (ms)', 'Location', 'Disk Space (TB)', 'Uptime (%)'];
    
    const rows = nodes.map(node => [
      node.identityPubkey,
      node.gossipAddr,
      node.rpcAddr || 'N/A',
      node.version || 'Unknown',
      node.status,
      node.latency.toString(),
      node.location || 'Unknown',
      node.diskSpace?.toString() || 'N/A',
      node.uptime?.toFixed(2) || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  static exportToJSON(data: any, filename: string = 'xandalyze-data.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  static exportAIReport(
    analytics: AIAnalytics,
    nodes: PNode[],
    stats: NetworkStats,
    geminiReport?: GeminiReport
  ) {
    const report = {
      generatedAt: new Date().toISOString(),
      networkStats: stats,
      aiAnalytics: {
        healthScore: analytics.healthScore,
        performanceTrend: analytics.performanceTrend,
        networkEfficiency: analytics.networkEfficiency,
        anomaliesCount: analytics.anomalies.length,
        predictedIssuesCount: analytics.predictedIssues.length,
        optimizationOpportunitiesCount: analytics.optimizationOpportunities.length,
        insights: [
          ...analytics.anomalies,
          ...analytics.predictedIssues,
          ...analytics.optimizationOpportunities
        ]
      },
      geminiReport,
      nodesSummary: {
        total: nodes.length,
        byStatus: {
          active: nodes.filter(n => n.status === 'Active').length,
          delinquent: nodes.filter(n => n.status === 'Delinquent').length,
          offline: nodes.filter(n => n.status === 'Offline').length
        },
        averageMetrics: {
          latency: stats.avgLatency,
          uptime: nodes.reduce((acc, n) => acc + (n.uptime || 0), 0) / (nodes.length || 1)
        }
      }
    };

    this.exportToJSON(report, `xandalyze-ai-report-${Date.now()}.json`);
  }

  static exportToMarkdown(
    analytics: AIAnalytics,
    nodes: PNode[],
    stats: NetworkStats
  ) {
    const markdown = `# Xandalyze Network Report
Generated: ${new Date().toLocaleString()}

## Network Overview
- **Total Nodes**: ${stats.totalNodes}
- **Active Nodes**: ${stats.activeNodes} (${Math.round((stats.activeNodes / stats.totalNodes) * 100)}%)
- **Total Storage**: ${stats.totalStorage.toLocaleString()} TB
- **Average Latency**: ${Math.round(stats.avgLatency)} ms

## AI Analytics
- **Health Score**: ${analytics.healthScore}/100
- **Performance Trend**: ${analytics.performanceTrend}
- **Network Efficiency**: ${analytics.networkEfficiency}%

### Anomalies Detected (${analytics.anomalies.length})
${analytics.anomalies.map(a => `- **${a.title}** [${a.severity}]: ${a.description}`).join('\n')}

### Predicted Issues (${analytics.predictedIssues.length})
${analytics.predictedIssues.map(p => `- **${p.title}** [${p.severity}]: ${p.description}`).join('\n')}

### Optimization Opportunities (${analytics.optimizationOpportunities.length})
${analytics.optimizationOpportunities.map(o => `- **${o.title}**: ${o.description}`).join('\n')}

## Top Performing Nodes
${nodes
  .sort((a, b) => a.latency - b.latency)
  .slice(0, 5)
  .map((node, i) => `${i + 1}. ${node.identityPubkey} - ${node.latency}ms latency`)
  .join('\n')}
`;

    this.downloadFile(markdown, `xandalyze-report-${Date.now()}.md`, 'text/markdown');
  }

  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
