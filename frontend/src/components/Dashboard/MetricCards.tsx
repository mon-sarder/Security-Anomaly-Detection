import React from 'react';
import { DashboardStats } from '../../types/dashboard.types';
import { formatPercentage, formatRiskScore } from '../../utils/formatters';
import styles from './Dashboard.module.css';

interface MetricsCardsProps {
  stats: DashboardStats;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ stats }) => {
  const metrics = [
    {
      title: 'Total Logins',
      value: stats.total_logins.toLocaleString(),
      icon: '👥',
      color: 'blue',
    },
    {
      title: 'Anomalous Logins',
      value: stats.anomalous_logins.toLocaleString(),
      subtitle: formatPercentage(stats.anomaly_rate),
      icon: '⚠️',
      color: stats.anomaly_rate > 0.1 ? 'red' : 'yellow',
    },
    {
      title: 'Active Alerts',
      value: stats.active_alerts.toLocaleString(),
      icon: '🚨',
      color: stats.active_alerts > 5 ? 'red' : 'green',
    },
    {
      title: 'High Risk Logins',
      value: stats.high_risk_logins.toLocaleString(),
      icon: '🔴',
      color: stats.high_risk_logins > 0 ? 'red' : 'green',
    },
    {
      title: 'Avg Risk Score',
      value: formatRiskScore(stats.avg_risk_score),
      icon: '📊',
      color: stats.avg_risk_score > 0.5 ? 'orange' : 'green',
    },
  ];

  return (
    <div className={styles.metricsGrid}>
      {metrics.map((metric, index) => (
        <div key={index} className={`${styles.metricCard} ${styles[metric.color]}`}>
          <div className={styles.metricIcon}>{metric.icon}</div>
          <div className={styles.metricContent}>
            <h3 className={styles.metricTitle}>{metric.title}</h3>
            <p className={styles.metricValue}>{metric.value}</p>
            {metric.subtitle && (
              <p className={styles.metricSubtitle}>{metric.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;