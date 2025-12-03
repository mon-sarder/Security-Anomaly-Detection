import pytest
import pandas as pd
from app.ml.data_generator import SyntheticLoginDataGenerator


def test_generator_initialization():
    """Test that generator initializes correctly"""
    generator = SyntheticLoginDataGenerator(num_users=10, days=7)

    assert generator.num_users == 10
    assert generator.days == 7
    assert len(generator.users) == 10
    assert len(generator.locations) > 0


def test_generate_normal_login():
    """Test normal login generation"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=1)
    user = generator.users[0]

    from datetime import datetime
    date = datetime.now().date()
    login = generator.generate_normal_login(user, date)

    assert 'user_id' in login
    assert 'username' in login
    assert 'timestamp' in login
    assert 'ip_address' in login
    assert 'location' in login
    assert 'device_info' in login
    assert login['is_anomaly'] is False
    assert login['success'] is True


def test_generate_anomalous_login():
    """Test anomalous login generation"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=1)
    user = generator.users[0]

    from datetime import datetime
    date = datetime.now().date()

    # Test different anomaly types
    anomaly_types = ['off_hours', 'unusual_location', 'new_device', 'failed_attempts']

    for anomaly_type in anomaly_types:
        login = generator.generate_anomalous_login(user, date, anomaly_type)
        assert login['is_anomaly'] is True


def test_generate_dataset():
    """Test complete dataset generation"""
    generator = SyntheticLoginDataGenerator(num_users=10, days=7)
    df = generator.generate_dataset(anomaly_percentage=0.1)

    assert isinstance(df, pd.DataFrame)
    assert len(df) > 0
    assert 'user_id' in df.columns
    assert 'timestamp' in df.columns
    assert 'is_anomaly' in df.columns

    # Check anomaly percentage is approximately correct (within 5%)
    anomaly_rate = df['is_anomaly'].mean()
    assert 0.05 <= anomaly_rate <= 0.15


def test_dataset_has_required_columns():
    """Test that generated dataset has all required columns"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=3)
    df = generator.generate_dataset()

    required_columns = [
        'user_id', 'username', 'timestamp', 'ip_address',
        'location', 'device_info', 'success', 'is_anomaly'
    ]

    for column in required_columns:
        assert column in df.columns


def test_ip_address_format():
    """Test that generated IP addresses are valid"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=1)
    df = generator.generate_dataset()

    import re
    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'

    for ip in df['ip_address']:
        assert re.match(ip_pattern, ip)


def test_location_structure():
    """Test that location data has correct structure"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=1)
    df = generator.generate_dataset()

    for location in df['location']:
        assert 'latitude' in location
        assert 'longitude' in location
        assert 'city' in location
        assert 'country' in location
        assert isinstance(location['latitude'], (int, float))
        assert isinstance(location['longitude'], (int, float))


def test_device_info_structure():
    """Test that device_info has correct structure"""
    generator = SyntheticLoginDataGenerator(num_users=5, days=1)
    df = generator.generate_dataset()

    for device_info in df['device_info']:
        assert 'browser' in device_info
        assert 'os' in device_info
        assert 'device_type' in device_info