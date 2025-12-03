from datetime import datetime
from typing import Dict, Optional
from enum import Enum


class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Alert:
    """Model for security alerts"""

    def __init__(self,
                 alert_type: str,
                 severity: AlertSeverity,
                 user_id: str,
                 username: str,
                 description: str,
                 timestamp: datetime,
                 login_event_id: Optional[str] = None,
                 details: Optional[Dict] = None,
                 resolved: bool = False):
        self.alert_type = alert_type
        self.severity = severity
        self.user_id = user_id
        self.username = username
        self.description = description
        self.timestamp = timestamp
        self.login_event_id = login_event_id
        self.details = details or {}
        self.resolved = resolved

    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB storage"""
        return {
            'alert_type': self.alert_type,
            'severity': self.severity.value,
            'user_id': self.user_id,
            'username': self.username,
            'description': self.description,
            'timestamp': self.timestamp,
            'login_event_id': self.login_event_id,
            'details': self.details,
            'resolved': self.resolved
        }

    @staticmethod
    def from_dict(data: Dict) -> 'Alert':
        """Create Alert from dictionary"""
        return Alert(
            alert_type=data['alert_type'],
            severity=AlertSeverity(data['severity']),
            user_id=data['user_id'],
            username=data['username'],
            description=data['description'],
            timestamp=data['timestamp'],
            login_event_id=data.get('login_event_id'),
            details=data.get('details', {}),
            resolved=data.get('resolved', False)
        )