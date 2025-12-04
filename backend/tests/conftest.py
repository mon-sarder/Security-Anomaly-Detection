import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, mongo
from app.config import TestingConfig
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import numpy as np


@pytest.fixture(scope='session', autouse=True)
def setup_ml_model():
    """Create a minimal ML model for testing"""
    model_dir = './ml_models'
    os.makedirs(model_dir, exist_ok=True)

    # Create minimal model
    model = IsolationForest(contamination=0.1, random_state=42, n_estimators=10)
    scaler = StandardScaler()

    # Train on dummy data (13 features to match the real model)
    X = np.random.rand(100, 13)
    X_scaled = scaler.fit_transform(X)
    model.fit(X_scaled)

    # Feature columns matching the real model
    feature_columns = [
        'hour', 'day_of_week', 'is_weekend', 'is_work_hours', 'is_night',
        'latitude', 'longitude', 'distance_from_typical',
        'browser', 'os', 'is_mobile', 'is_typical_device', 'success'
    ]

    # Save model files
    joblib.dump(model, os.path.join(model_dir, 'login_anomaly_detector.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'login_anomaly_detector_scaler.pkl'))
    joblib.dump(feature_columns, os.path.join(model_dir, 'login_anomaly_detector_features.pkl'))
    joblib.dump({}, os.path.join(model_dir, 'login_anomaly_detector_user_profiles.pkl'))

    print("✅ Created minimal ML model for testing")

    yield

    # Cleanup is optional - GitHub Actions creates fresh environment each time


@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app('testing')

    with app.app_context():
        # Clear test database before each test
        mongo.db.users.delete_many({})
        mongo.db.login_events.delete_many({})
        mongo.db.alerts.delete_many({})

        yield app

        # Cleanup after test
        mongo.db.users.delete_many({})
        mongo.db.login_events.delete_many({})
        mongo.db.alerts.delete_many({})


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Create authenticated headers for testing"""
    # Register and login a test user
    client.post('/api/Auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    response = client.post('/api/Auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    token = response.get_json()['token']

    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }