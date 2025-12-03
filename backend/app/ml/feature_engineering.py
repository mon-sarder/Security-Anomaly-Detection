import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
from geopy.distance import geodesic


class LoginFeatureEngineer:
    """Extract features from login events for anomaly detection"""

    def __init__(self):
        self.user_profiles = {}

    def extract_temporal_features(self, timestamp: datetime) -> Dict:
        """Extract time-based features"""
        return {
            'hour': timestamp.hour,
            'day_of_week': timestamp.weekday(),
            'is_weekend': 1 if timestamp.weekday() >= 5 else 0,
            'is_work_hours': 1 if 9 <= timestamp.hour <= 17 else 0,
            'is_night': 1 if timestamp.hour >= 22 or timestamp.hour <= 5 else 0
        }

    def extract_location_features(self, location: Dict, user_id: str = None) -> Dict:
        """Extract location-based features"""
        features = {
            'latitude': location['latitude'],
            'longitude': location['longitude']
        }

        # Calculate distance from user's typical location if available
        if user_id and user_id in self.user_profiles:
            typical_loc = self.user_profiles[user_id].get('typical_location')
            if typical_loc:
                distance = geodesic(
                    (location['latitude'], location['longitude']),
                    (typical_loc['latitude'], typical_loc['longitude'])
                ).kilometers
                features['distance_from_typical'] = distance
            else:
                features['distance_from_typical'] = 0
        else:
            features['distance_from_typical'] = 0

        return features

    def extract_device_features(self, device_info: Dict, user_id: str = None) -> Dict:
        """Extract device-based features"""
        # Encode browser
        browser_encoding = {
            'Chrome': 1, 'Firefox': 2, 'Safari': 3, 'Edge': 4, 'TOR Browser': 5
        }

        # Encode OS
        os_encoding = {
            'Windows': 1, 'macOS': 2, 'Linux': 3, 'iOS': 4, 'Android': 5, 'iPhone': 4
        }

        features = {
            'browser': browser_encoding.get(device_info['browser'], 0),
            'os': os_encoding.get(device_info['os'], 0),
            'is_mobile': 1 if device_info['device_type'] == 'mobile' else 0
        }

        # Check if device is typical for user
        if user_id and user_id in self.user_profiles:
            typical_devices = self.user_profiles[user_id].get('devices', [])
            device_string = f"{device_info['browser']}/{device_info['os']}"
            features['is_typical_device'] = 1 if device_string in typical_devices else 0
        else:
            features['is_typical_device'] = 1

        return features

    def build_user_profile(self, historical_data: pd.DataFrame, user_id: str):
        """Build a behavioral profile for a user based on historical data"""
        user_data = historical_data[historical_data['user_id'] == user_id]

        if len(user_data) == 0:
            return None

        profile = {
            'user_id': user_id,
            'typical_hours': user_data['timestamp'].dt.hour.mode().tolist(),
            'typical_location': {
                'latitude': user_data['location'].apply(lambda x: x['latitude']).median(),
                'longitude': user_data['location'].apply(lambda x: x['longitude']).median()
            },
            'devices': user_data.apply(
                lambda row: f"{row['device_info']['browser']}/{row['device_info']['os']}",
                axis=1
            ).unique().tolist(),
            'avg_logins_per_day': len(user_data) / user_data['timestamp'].dt.date.nunique(),
            'typical_days': user_data['timestamp'].dt.weekday.mode().tolist()
        }

        return profile

    def build_all_profiles(self, historical_data: pd.DataFrame):
        """Build profiles for all users"""
        user_ids = historical_data['user_id'].unique()
        for user_id in user_ids:
            profile = self.build_user_profile(historical_data, user_id)
            if profile:
                self.user_profiles[user_id] = profile

        print(f"Built profiles for {len(self.user_profiles)} users")

    def engineer_features(self, login_event: Dict) -> Dict:
        """
        Engineer all features for a single login event

        Args:
            login_event: Dictionary containing login event data

        Returns:
            Dictionary of engineered features
        """
        timestamp = pd.to_datetime(login_event['timestamp'])
        user_id = login_event['user_id']

        features = {}

        # Temporal features
        features.update(self.extract_temporal_features(timestamp))

        # Location features
        features.update(self.extract_location_features(
            login_event['location'], user_id
        ))

        # Device features
        features.update(self.extract_device_features(
            login_event['device_info'], user_id
        ))

        # Additional features
        features['success'] = 1 if login_event['success'] else 0

        return features

    def engineer_features_batch(self, login_events: pd.DataFrame) -> pd.DataFrame:
        """Engineer features for a batch of login events"""
        feature_list = []

        for _, event in login_events.iterrows():
            event_dict = event.to_dict()
            features = self.engineer_features(event_dict)
            features['user_id'] = event['user_id']
            features['timestamp'] = event['timestamp']
            feature_list.append(features)

        return pd.DataFrame(feature_list)


if __name__ == '__main__':
    # Test feature engineering
    from data_generator import SyntheticLoginDataGenerator

    # Generate sample data
    generator = SyntheticLoginDataGenerator(num_users=10, days=30)
    df = generator.generate_dataset(anomaly_percentage=0.10)

    # Engineer features
    engineer = LoginFeatureEngineer()
    engineer.build_all_profiles(df)

    features_df = engineer.engineer_features_batch(df)
    print("\nEngineered features:")
    print(features_df.head())
    print(f"\nFeature columns: {features_df.columns.tolist()}")