import React from 'react';
import { LoginEvent } from '../../types/login.types';
import { formatDate } from '../../utils/formatters';
import RiskScoreBadge from './RiskScoreBadge';
import './LoginEventDetails.css';

interface LoginEventDetailsProps {
  event: LoginEvent;
  onClose: () => void;
}

export const LoginEventDetails: React.FC<LoginEventDetailsProps> = ({ event, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Login Event Details</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>User Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Username:</span>
                <span className="detail-value">{event.username}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{event.user_id}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Timestamp</h3>
            <div className="detail-item">
              <span className="detail-value">{formatDate(event.timestamp)}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Network Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">IP Address:</span>
                <span className="detail-value">{event.ip_address}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">
                  {event.location.city}, {event.location.country}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Device Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Browser:</span>
                <span className="detail-value">{event.device_info.browser}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Operating System:</span>
                <span className="detail-value">{event.device_info.os}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Device Type:</span>
                <span className="detail-value">{event.device_info.device_type}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Risk Assessment</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Risk Score:</span>
                <RiskScoreBadge score={event.risk_score} size="medium" />
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${event.is_anomaly ? 'anomaly' : 'normal'}`}>
                  {event.is_anomaly ? 'Anomaly Detected' : 'Normal'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Login Result:</span>
                <span className={`status-badge ${event.success ? 'success' : 'failed'}`}>
                  {event.success ? 'Successful' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {event.anomaly_reasons && event.anomaly_reasons.length > 0 && (
            <div className="detail-section">
              <h3>Anomaly Reasons</h3>
              <ul className="reasons-list">
                {event.anomaly_reasons.map((reason, index) => (
                  <li key={index} className="reason-item">
                    ⚠️ {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LoginEventDetails;