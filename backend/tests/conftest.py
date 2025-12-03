import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, mongo
from app.config import TestingConfig


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
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    token = response.get_json()['token']

    return {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }