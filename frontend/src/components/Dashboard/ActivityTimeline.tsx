import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimelineDataPoint } from '../../types/dashboard.types';
import { formatDate } from '../../utils/formatters';
import styles from './Dashboard.module.css';

interface ActivityTimelineProps {
  data: TimelineDataPoint[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ data }) => {
  const formattedData = data.map((point) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    normal_logins: point.total_logins - point.anomalous_logins,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Login Activity Timeline</h2>
      </div>

      <div className={styles.chartContainer}>
        {data.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No activity data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_logins"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Total Logins"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="anomalous_logins"
                stroke="#ef4444"
                strokeWidth={2}
                name="Anomalous Logins"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;