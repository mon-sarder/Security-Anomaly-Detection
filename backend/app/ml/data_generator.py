import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json


class SyntheticLoginDataGenerator:
    """Generate synthetic login data with normal patterns and anomalies"""

    def __init__(self, num_users=50, days=30):
        self.num_users = num_users
        self.days = days
        self.users = self._generate_users()
        self.locations = self._get_locations()

    def _generate_users(self):
        """Generate user profiles with normal behavior patterns"""
        users = []
        for i in range(self.num_users):
            user = {
                'user_id': f'user_{i:03d}',
                'username': f'employee_{i:03d}',
                'typical_work_hours': (9, 17),  # 9 AM to 5 PM
                'typical_location': random.choice(['US-CA', 'US-NY', 'US-TX', 'US-FL', 'US-WA']),
                'login_frequency': random.randint(1, 5),  # logins per day
                'devices': random.choice([
                    ['Chrome/Windows', 'Safari/iPhone'],
                    ['Firefox/macOS', 'Chrome/Android'],
                    ['Edge/Windows']
                ])
            }
            users.append(user)
        return users

    def _get_locations(self):
        """Define locations with coordinates"""
        return {
            'US-CA': {'lat': 37.7749, 'lon': -122.4194, 'city': 'San Francisco', 'country': 'USA'},
            'US-NY': {'lat': 40.7128, 'lon': -74.0060, 'city': 'New York', 'country': 'USA'},
            'US-TX': {'lat': 29.7604, 'lon': -95.3698, 'city': 'Houston', 'country': 'USA'},
            'US-FL': {'lat': 25.7617, 'lon': -80.1918, 'city': 'Miami', 'country': 'USA'},
            'US-WA': {'lat': 47.6062, 'lon': -122.3321, 'city': 'Seattle', 'country': 'USA'},
            'CN': {'lat': 39.9042, 'lon': 116.4074, 'city': 'Beijing', 'country': 'China'},
            'RU': {'lat': 55.7558, 'lon': 37.6173, 'city': 'Moscow', 'country': 'Russia'},
            'BR': {'lat': -23.5505, 'lon': -46.6333, 'city': 'São Paulo', 'country': 'Brazil'},
        }

    def generate_normal_login(self, user, date):
        """Generate a normal login event for a user"""
        # Login during typical work hours
        start_hour, end_hour = user['typical_work_hours']
        hour = random.randint(start_hour, end_hour)
        minute = random.randint(0, 59)
        timestamp = datetime.combine(date, datetime.min.time()) + timedelta(hours=hour, minutes=minute)

        # Typical location
        location_key = user['typical_location']
        location = self.locations[location_key]

        # Add small random variation to coordinates
        location = {
            'latitude': location['lat'] + random.uniform(-0.1, 0.1),
            'longitude': location['lon'] + random.uniform(-0.1, 0.1),
            'city': location['city'],
            'country': location['country']
        }

        # Typical device
        device = random.choice(user['devices'])
        browser, os = device.split('/')

        return {
            'user_id': user['user_id'],
            'username': user['username'],
            'timestamp': timestamp.isoformat(),
            'ip_address': self._generate_ip(),
            'location': location,
            'device_info': {
                'browser': browser,
                'os': os,
                'device_type': 'desktop' if os in ['Windows', 'macOS'] else 'mobile'
            },
            'success': True,
            'is_anomaly': False
        }

    def generate_anomalous_login(self, user, date, anomaly_type):
        """Generate an anomalous login event"""
        normal_login = self.generate_normal_login(user, date)

        if anomaly_type == 'off_hours':
            # Login at unusual time (late night or early morning)
            hour = random.choice([2, 3, 4, 22, 23])
            minute = random.randint(0, 59)
            timestamp = datetime.combine(date, datetime.min.time()) + timedelta(hours=hour, minutes=minute)
            normal_login['timestamp'] = timestamp.isoformat()

        elif anomaly_type == 'unusual_location':
            # Login from foreign country
            foreign_location_key = random.choice(['CN', 'RU', 'BR'])
            location = self.locations[foreign_location_key]
            normal_login['location'] = {
                'latitude': location['lat'] + random.uniform(-0.1, 0.1),
                'longitude': location['lon'] + random.uniform(-0.1, 0.1),
                'city': location['city'],
                'country': location['country']
            }

        elif anomaly_type == 'impossible_travel':
            # Two logins from distant locations within short time
            # This will be handled by generating two events
            pass

        elif anomaly_type == 'new_device':
            # Login from completely new device
            normal_login['device_info'] = {
                'browser': 'TOR Browser',
                'os': 'Linux',
                'device_type': 'desktop'
            }

        elif anomaly_type == 'failed_attempts':
            # Multiple failed login attempts
            normal_login['success'] = False

        normal_login['is_anomaly'] = True
        return normal_login

    def _generate_ip(self):
        """Generate random IP address"""
        return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"

    def generate_dataset(self, anomaly_percentage=0.1):
        """
        Generate complete dataset with normal and anomalous logins

        Args:
            anomaly_percentage: Percentage of anomalous logins (0.0 to 1.0)

        Returns:
            pandas DataFrame with login events
        """
        events = []
        start_date = datetime.now() - timedelta(days=self.days)

        for day in range(self.days):
            current_date = start_date + timedelta(days=day)

            for user in self.users:
                # Determine number of logins for this user today
                num_logins = random.randint(user['login_frequency'] - 1, user['login_frequency'] + 1)
                num_logins = max(1, num_logins)

                for _ in range(num_logins):
                    # Decide if this should be anomalous
                    if random.random() < anomaly_percentage:
                        anomaly_type = random.choice([
                            'off_hours', 'unusual_location', 'new_device', 'failed_attempts'
                        ])
                        event = self.generate_anomalous_login(user, current_date, anomaly_type)
                    else:
                        event = self.generate_normal_login(user, current_date)

                    events.append(event)

        df = pd.DataFrame(events)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        return df

    def save_dataset(self, filepath, anomaly_percentage=0.1):
        """Generate and save dataset to CSV"""
        df = self.generate_dataset(anomaly_percentage)
        df.to_csv(filepath, index=False)
        print(f"Dataset saved to {filepath}")
        print(f"Total events: {len(df)}")
        print(f"Anomalous events: {df['is_anomaly'].sum()} ({df['is_anomaly'].mean() * 100:.2f}%)")
        return df


if __name__ == '__main__':
    # Generate dataset
    generator = SyntheticLoginDataGenerator(num_users=50, days=30)
    df = generator.save_dataset('../data/synthetic/login_events.csv', anomaly_percentage=0.10)
    print("\nDataset preview:")
    print(df.head())