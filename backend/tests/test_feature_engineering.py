import pytest
import pandas as pd
from datetime import datetime
from app.ml.feature_engineering import LoginFeatureEngineer
from app.ml.data_generator import SyntheticLoginDataGenerator


@pytest.fixture
def engineer():
    """Create a LoginFeatureEngineer instance"""
    return LoginFeatureEngineer()


@pytest.fixture
def sample_data():
    """Generate sample login data"""
    generator = SyntheticLoginDataGenerator(num_users=10, days=7)
    return generator.generate_dataset(anomaly_percentage=0.1)


def test_extract_temporal_features(engineer):
    """Test temporal feature extraction"""
    timestamp = datetime(2024, 1, 15, 14, 30, 0)  # Monday, 2:30 PM
    features = engineer.extract_temporal_features(timestamp)

    assert 'hour' in features
    assert 'day_of_week' in features
    assert 'is_weekend' in features
    assert 'is_work_hours' in features
    assert 'is_night' in features

    assert features['hour'] == 14
    assert features['day_of_week'] == 0  # Monday
    assert features['is_weekend'] == 0
    assert features['is_work_hours'] == 1
    assert features['is_night'] == 0


def test_extract_temporal_features_weekend(engineer):
    """Test temporal features for weekend"""
    timestamp = datetime(2024, 1, 20, 10, 0, 0)  # Saturday, 10 AM
    features = engineer.extract_temporal_features(timestamp)

    assert features['is_weekend'] == 1
    assert features['day_of_week'] == 5  # Saturday


def test_extract_temporal_features_night(engineer):
    """Test temporal features for night time"""
    timestamp = datetime(2024, 1, 15, 23, 0, 0)  # 11 PM
    features = engineer.extract_temporal_features(timestamp)

    assert features['is_night'] == 1
    assert features['is_work_hours'] == 0


def test_extract_location_features(engineer):
    """Test location feature extraction"""
    location = {
        'latitude': 37.7749,
        'longitude': -122.4194,
        'city': 'San Francisco',
        'country': 'USA'
    }

    features = engineer.extract_location_features(location)

    assert 'latitude' in features
    assert 'longitude' in features
    assert 'distance_from_typical' in features
    assert features['latitude'] == 37.7749
    assert features['longitude'] == -122.4194


def test_extract_device_features(engineer):
    """Test device feature extraction"""
    device_info = {
        'browser': 'Chrome',
        'os': 'Windows',
        'device_type': 'desktop'
    }

    features = engineer.extract_device_features(device_info)

    assert 'browser' in features
    assert 'os' in features
    assert 'is_mobile' in features
    assert 'is_typical_device' in features

    assert features['browser'] > 0
    assert features['os'] > 0
    assert features['is_mobile'] == 0


def test_extract_device_features_mobile(engineer):
    """Test device features for mobile device"""
    device_info = {
        'browser': 'Safari',
        'os': 'iOS',
        'device_type': 'mobile'
    }

    features = engineer.extract_device_features(device_info)

    assert features['is_mobile'] == 1


def test_build_user_profile(engineer, sample_data):
    """Test user profile building"""
    user_id = sample_data['user_id'].iloc[0]
    profile = engineer.build_user_profile(sample_data, user_id)

    assert profile is not None
    assert 'user_id' in profile
    assert 'typical_hours' in profile
    assert 'typical_location' in profile
    assert 'devices' in profile
    assert 'avg_logins_per_day' in profile
    assert 'typical_days' in profile


def test_build_all_profiles(engineer, sample_data):
    """Test building profiles for all users"""
    engineer.build_all_profiles(sample_data)

    assert len(engineer.user_profiles) > 0

    # Check that profiles have correct structure
    for user_id, profile in engineer.user_profiles.items():
        assert 'typical_location' in profile
        assert 'devices' in profile


def test_engineer_features(engineer, sample_data):
    """Test feature engineering for single event"""
    engineer.build_all_profiles(sample_data)

    event = sample_data.iloc[0].to_dict()
    features = engineer.engineer_features(event)

    # Check temporal features
    assert 'hour' in features
    assert 'day_of_week' in features
    assert 'is_weekend' in features
    assert 'is_work_hours' in features
    assert 'is_night' in features

    # Check location features
    assert 'latitude' in features
    assert 'longitude' in features
    assert 'distance_from_typical' in features

    # Check device features
    assert 'browser' in features
    assert 'os' in features
    assert 'is_mobile' in features
    assert 'is_typical_device' in features

    # Check other features
    assert 'success' in features


def test_engineer_features_batch(engineer, sample_data):
    """Test batch feature engineering"""
    engineer.build_all_profiles(sample_data)

    features_df = engineer.engineer_features_batch(sample_data)

    assert isinstance(features_df, pd.DataFrame)
    assert len(features_df) == len(sample_data)
    assert 'hour' in features_df.columns
    assert 'latitude' in features_df.columns
    assert 'browser' in features_df.columns


def test_feature_types(engineer, sample_data):
    """Test that features have correct data types"""
    engineer.build_all_profiles(sample_data)

    event = sample_data.iloc[0].to_dict()
    features = engineer.engineer_features(event)

    # All features should be numeric
    for key, value in features.items():
        if key not in ['user_id', 'timestamp']:
            assert isinstance(value, (int, float)), f"{key} should be numeric, got {type(value)}"