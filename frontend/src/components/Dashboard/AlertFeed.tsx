import React from 'react';
import { Alert } from '../../types/dashboard.types';
import { formatRelativeTime, getSeverityColor } from '../../utils/formatters';
import { dashboardService } from '../../services/dashboardService';
import styles from './Dashboard.module.css';

interface AlertFeedProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({ alerts, onRefresh }) => {
  const handleResolveAlert = async (alertId: string) => {
    try {
      await dashboardService.updateAlert(alertId, true);
      onRefresh();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Recent Alerts</h2>
        <span className={styles.badge}>{alerts.length}</span>
      </div>

      <div className={styles.alertList}>
        {alerts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className={styles.alertItem}>
              <div className={styles.alertHeader}>
                <span
                  className={styles.severityBadge}
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                >
                  {alert.severity.toUpperCase()}
                </span>
                <span className={styles.alertTime}>
                  {formatRelativeTime(alert.timestamp)}
                </span>
              </div>

              <p className={styles.alertDescription}>{alert.description}</p>

              <div className={styles.alertDetails}>
                <span className={styles.alertUser}>👤 {alert.username}</span>
                {alert.details.ip_address && (
                  <span className={styles.alertIp}>🌐 {alert.details.ip_address}</span>
                )}
              </div>

              {!alert.resolved && (
                <button
                  onClick={() => handleResolveAlert(alert._id)}
                  className={styles.resolveButton}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertFeed;