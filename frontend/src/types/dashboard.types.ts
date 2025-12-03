export interface DashboardStats {
  time_range_hours: number;
  total_logins: number;
  anomalous_logins: number;
  anomaly_rate: number;
  active_alerts: number;
  high_risk_logins: number;
  avg_risk_score: number;
}

export interface Alert {
  _id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  username: string;
  description: string;
  timestamp: string;
  login_event_id?: string;
  details: {
    risk_score?: number;
    reasons?: string[];
    ip_address?: string;
    location?: {
      city: string;
      country: string;
    };
  };
  resolved: boolean;
}

export interface AlertsResponse {
  alerts: Alert[];
  count: number;
  total: number;
}

export interface TimelineDataPoint {
  timestamp: string;
  total_logins: number;
  anomalous_logins: number;
}

export interface TimelineResponse {
  timeline: TimelineDataPoint[];
}

export interface TopRiskUser {
  user_id: string;
  username: string;
  max_risk_score: number;
  avg_risk_score: number;
  anomaly_count: number;
  total_logins: number;
}

export interface TopRisksResponse {
  top_risks: TopRiskUser[];
}