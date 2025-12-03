from datetime import datetime
from typing import Dict, Optional
from bson import ObjectId


class LoginEvent:
    """Model for login events stored in MongoDB"""

    def __init__(self,
                 user_id: str,
                 username: str,
                 timestamp: datetime,
                 ip_address: str,
                 location: Dict[str, float],
                 device_info: Dict[str, str],
                 success: bool,
                 risk_score: Optional[float] = None,
                 is_anomaly: Optional[bool] = None,
                 anomaly_reasons: Optional[list] = None):
        self.user_id = user_id
        self.username = username
        self.timestamp = timestamp
        self.ip_address = ip_address
        self.location = location  # {latitude, longitude, city, country}
        self.device_info = device_info  # {browser, os, device_type}
        self.success = success
        self.risk_score = risk_score
        self.is_anomaly = is_anomaly
        self.anomaly_reasons = anomaly_reasons or []

    def to_dict(self) -> Dict:
        """Convert to dictionary for MongoDB storage"""
        return {
            'user_id': self.user_id,
            'username': self.username,
            'timestamp': self.timestamp,
            'ip_address': self.ip_address,
            'location': self.location,
            'device_info': self.device_info,
            'success': self.success,
            'risk_score': self.risk_score,
            'is_anomaly': self.is_anomaly,
            'anomaly_reasons': self.anomaly_reasons
        }

    @staticmethod
    def from_dict(data: Dict) -> 'LoginEvent':
        """Create LoginEvent from dictionary"""
        return LoginEvent(
            user_id=data['user_id'],
            username=data['username'],
            timestamp=data['timestamp'],
            ip_address=data['ip_address'],
            location=data['location'],
            device_info=data['device_info'],
            success=data['success'],
            risk_score=data.get('risk_score'),
            is_anomaly=data.get('is_anomaly'),
            anomaly_reasons=data.get('anomaly_reasons', [])
        )