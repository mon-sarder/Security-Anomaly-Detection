export const REFRESH_INTERVAL = parseInt(
  process.env.REACT_APP_REFRESH_INTERVAL || '30000'
); // 30 seconds

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ALERT_TYPES = {
  SUSPICIOUS_LOGIN: 'suspicious_login',
  UNUSUAL_LOCATION: 'unusual_location',
  OFF_HOURS: 'off_hours',
  FAILED_ATTEMPTS: 'failed_attempts',
} as const;

export const RISK_THRESHOLDS = {
  LOW: 0.3,
  MEDIUM: 0.6,
  HIGH: 0.8,
} as const;

export const PAGE_SIZES = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 50,
} as const;

export const TIME_RANGES = [
  { label: 'Last Hour', hours: 1 },
  { label: 'Last 6 Hours', hours: 6 },
  { label: 'Last 24 Hours', hours: 24 },
  { label: 'Last 7 Days', hours: 168 },
  { label: 'Last 30 Days', hours: 720 },
] as const;