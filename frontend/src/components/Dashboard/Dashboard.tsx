import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats, Alert, TimelineDataPoint, TopRiskUser } from '../../types/dashboard.types';
import MetricsCards from './MetricsCards';
import AlertFeed from './AlertFeed';
import ActivityTimeline from './ActivityTimeline';
import TopRisksTable from './TopRisksTable';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { REFRESH_INTERVAL, TIME_RANGES } from '../../utils/constants';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<TimelineDataPoint[]>([]);
  const [topRisks, setTopRisks] = useState<TopRiskUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(24);

  const fetchDashboardData = async () => {
    try {
      setError(null);

      const [statsData, alertsData, timelineData, topRisksData] = await Promise.all([
        dashboardService.getStats(selectedTimeRange),
        dashboardService.getAlerts({ limit: 10, resolved: false }),
        dashboardService.getTimeline(selectedTimeRange),
        dashboardService.getTopRisks({ limit: 10, hours: selectedTimeRange }),
      ]);

      setStats(statsData);
      setAlerts(alertsData.alerts);
      setTimeline(timelineData.timeline);
      setTopRisks(topRisksData.top_risks);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up auto-refresh
    const interval = setInterval(fetchDashboardData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage message={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Security Dashboard</h1>
        <div className={styles.headerActions}>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            className={styles.timeRangeSelect}
          >
            {TIME_RANGES.map((range) => (
              <option key={range.hours} value={range.hours}>
                {range.label}
              </option>
            ))}
          </select>
          <button onClick={handleRefresh} className={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {stats && <MetricsCards stats={stats} />}

      <div className={styles.grid}>
        <div className={styles.gridItemLarge}>
          <ActivityTimeline data={timeline} />
        </div>

        <div className={styles.gridItemSmall}>
          <AlertFeed alerts={alerts} onRefresh={fetchDashboardData} />
        </div>
      </div>

      <div className={styles.gridFull}>
        <TopRisksTable users={topRisks} />
      </div>
    </div>
  );
};

export default Dashboard;