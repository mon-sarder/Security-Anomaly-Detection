export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device_type: string;
}

export interface LoginEvent {
  _id: string;
  user_id: string;
  username: string;
  timestamp: string;
  ip_address: string;
  location: Location;
  device_info: DeviceInfo;
  success: boolean;
  risk_score: number;
  is_anomaly: boolean;
  anomaly_reasons: string[];
}

export interface LoginAnalysisRequest {
  user_id: string;
  username: string;
  ip_address: string;
  device_info: DeviceInfo;
  location?: Location;
  timestamp?: string;
  success?: boolean;
}

export interface LoginAnalysisResponse {
  login_event_id: string;
  is_anomaly: boolean;
  risk_score: number;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'normal';
  reasons: string[];
  alert_id?: string;
  message: string;
}

export interface LoginEventsResponse {
  events: LoginEvent[];
  count: number;
  total: number;
}