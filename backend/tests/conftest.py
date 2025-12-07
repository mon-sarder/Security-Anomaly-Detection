import pytest
import sys
import os
import tempfile
import shutil

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
    # Create temporary directory for models
    model_dir = tempfile.mkdtemp()

    # Update the model path in TestingConfig
    TestingConfig.MODEL_PATH = model_dir

    try:
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

        print(f"✅ Created minimal ML model for testing in {model_dir}")

        yield

    finally:
        # Cleanup temporary directory
        shutil.rmtree(model_dir, ignore_errors=True)


@pytest.fixture
def app():
    """Create application for testing"""
    # Set testing environment variables
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['MONGO_URI'] = 'mongodb://localhost:27017/security_detection_test'

    app = create_app('testing')

    with app.app_context():
        # Clear test database before each test
        try:
            mongo.db.users.delete_many({})
            mongo.db.login_events.delete_many({})
            mongo.db.alerts.delete_many({})
        except Exception as e:
            print(f"Warning: Could not clear test database: {e}")

        yield app

        # Cleanup after test
        try:
            mongo.db.users.delete_many({})
            mongo.db.login_events.delete_many({})
            mongo.db.alerts.delete_many({})
        except Exception as e:
            print(f"Warning: Could not cleanup test database: {e}")


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    """Create authenticated headers for testing"""
    # Register and login a test user
    register_response = client.post('/api/Auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    # Check if registration was successful
    if register_response.status_code != 201:
        print(f"Registration failed with status {register_response.status_code}: {register_response.get_json()}")

    login_response = client.post('/api/Auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    # Check if login was successful
    if login_response.status_code != 200:
        print(f"Login failed with status {login_response.status_code}: {login_response.get_json()}")
        # Return empty headers if login fails
        return {
            'Authorization': 'Bearer invalid-token',
            'Content-Type': 'application/json'
        }

    response_data = login_response.get_json()
    if not response_data or 'token' not in response_data:
        print("Login response missing token")
        return {
            'Authorization': 'Bearer invalid-token',
            'Content-Type': 'application/json'
        }

    token = response_data['token']

    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }


@pytest.fixture
def sample_login_event():
    """Sample login event data for testing"""
    return {
        'user_id': 'test_user_001',
        'username': 'john.doe',
        'ip_address': '192.168.1.100',
        'device_info': {
            'browser': 'Chrome',
            'os': 'Windows',
            'device_type': 'desktop'
        },
        'location': {
            'latitude': 37.7749,
            'longitude': -122.4194,
            'city': 'San Francisco',
            'country': 'USA'
        },
        'success': True
    }


# Skip tests that require MongoDB if it's not available
def pytest_collection_modifyitems(config, items):
    """Modify test collection to skip tests if MongoDB is not available"""
    import socket

    def is_mongodb_available():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', 27017))
            sock.close()
            return result == 0
        except:
            return False

    if not is_mongodb_available():
        skip_mongodb = pytest.mark.skip(reason="MongoDB not available")
        for item in items:
            if "mongodb" in item.keywords or "database" in item.keywords:
                item.add_marker(skip_mongodb)


@pytest.fixture(autouse=True)
def setup_environment():
    """Setup test environment variables"""
    original_env = os.environ.copy()

    # Set test environment variables
    test_env = {
        'FLASK_ENV': 'testing',
        'SECRET_KEY': 'test-secret-key',
        'JWT_SECRET_KEY': 'test-jwt-secret-key',
        'MONGO_URI': 'mongodb://localhost:27017/security_detection_test',
        'MODEL_PATH': './ml_models',
        'ANOMALY_THRESHOLD': '0.7',
        'LOW_RISK_THRESHOLD': '0.3',
        'MEDIUM_RISK_THRESHOLD': '0.6',
        'HIGH_RISK_THRESHOLD': '0.8',
    }

    for key, value in test_env.items():
        os.environ[key] = value

    yield

    # Restore original environment
    os.environ.clear()
    os.environ.update(original_env)