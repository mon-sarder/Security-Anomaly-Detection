import React, { useState, useEffect } from 'react';
import { loginService } from '../../services/loginService';
import { LoginEvent } from '../../types/login.types';
import { formatDate } from '../../utils/formatters';
import RiskScoreBadge from './RiskScoreBadge';
import LoginEventDetails from './LoginEventDetails';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import './LoginEventsList.css';

export const LoginEventsList: React.FC = () => {
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<LoginEvent | null>(null);
  const [filterAnomalies, setFilterAnomalies] = useState<boolean | undefined>(undefined);

  const fetchEvents = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await loginService.getLoginEvents({
        limit: 50,
        is_anomaly: filterAnomalies,
      });
      setEvents(response.events);
    } catch (err: any) {
      setError(err.message || 'Failed to load login events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterAnomalies]);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading login events..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchEvents} />;
  }

  return (
    <div className="login-events-container">
      <div className="events-header">
        <h1 className="events-title">Login Events</h1>
        <div className="filter-buttons">
          <button
            onClick={() => setFilterAnomalies(undefined)}
            className={`filter-btn ${filterAnomalies === undefined ? 'active' : ''}`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterAnomalies(true)}
            className={`filter-btn ${filterAnomalies === true ? 'active' : ''}`}
          >
            Anomalies Only
          </button>
          <button
            onClick={() => setFilterAnomalies(false)}
            className={`filter-btn ${filterAnomalies === false ? 'active' : ''}`}
          >
            Normal Only
          </button>
        </div>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No login events found</p>
          </div>
        ) : (
          <table className="events-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Device</th>
                <th>Risk Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id} className={event.is_anomaly ? 'anomaly-row' : ''}>
                  <td>{formatDate(event.timestamp)}</td>
                  <td>
                    <div className="user-cell">
                      <span className="username">{event.username}</span>
                      <span className="user-id">{event.user_id}</span>
                    </div>
                  </td>
                  <td>{event.ip_address}</td>
                  <td>
                    {event.location.city}, {event.location.country}
                  </td>
                  <td>
                    <div className="device-cell">
                      <span>{event.device_info.browser}</span>
                      <span className="device-os">{event.device_info.os}</span>
                    </div>
                  </td>
                  <td>
                    <RiskScoreBadge score={event.risk_score} size="small" />
                  </td>
                  <td>
                    {event.is_anomaly ? (
                      <span className="status-badge anomaly">Anomaly</span>
                    ) : (
                      <span className="status-badge normal">Normal</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="details-btn"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedEvent && (
        <LoginEventDetails
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default LoginEventsList;