import pytest
import json


def test_register_success(client):
    """Test successful user registration"""
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    assert response.status_code == 201
    data = response.get_json()
    assert 'message' in data
    assert 'user_id' in data
    assert 'username' in data
    assert data['username'] == 'testuser'


def test_register_missing_fields(client):
    """Test registration with missing fields"""
    response = client.post('/api/auth/register', json={
        'username': 'testuser'
        # Missing password
    })

    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_register_duplicate_username(client):
    """Test registration with duplicate username"""
    # Register first user
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    # Try to register with same username
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'anotherpass',
        'email': 'another@example.com'
    })

    assert response.status_code == 409
    data = response.get_json()
    assert 'error' in data


def test_login_success(client):
    """Test successful login"""
    # Register user first
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    # Login
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    assert response.status_code == 200
    data = response.get_json()
    assert 'message' in data
    assert 'token' in data
    assert 'user' in data
    assert data['user']['username'] == 'testuser'


def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    # Register user
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    # Try login with wrong password
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'wrongpassword'
    })

    assert response.status_code == 401
    data = response.get_json()
    assert 'error' in data


def test_login_nonexistent_user(client):
    """Test login with non-existent user"""
    response = client.post('/api/auth/login', json={
        'username': 'nonexistent',
        'password': 'password'
    })

    assert response.status_code == 401
    data = response.get_json()
    assert 'error' in data


def test_login_missing_fields(client):
    """Test login with missing fields"""
    response = client.post('/api/auth/login', json={
        'username': 'testuser'
        # Missing password
    })

    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_verify_token_valid(client):
    """Test token verification with valid token"""
    # Register and login
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'password': 'testpass123',
        'email': 'test@example.com'
    })

    login_response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass123'
    })

    token = login_response.get_json()['token']

    # Verify token
    response = client.get('/api/auth/verify', headers={
        'Authorization': f'Bearer {token}'
    })

    assert response.status_code == 200
    data = response.get_json()
    assert data['valid'] is True
    assert 'user' in data


def test_verify_token_missing(client):
    """Test token verification without token"""
    response = client.get('/api/auth/verify')

    assert response.status_code == 401
    data = response.get_json()
    assert data['valid'] is False


def test_verify_token_invalid(client):
    """Test token verification with invalid token"""
    response = client.get('/api/auth/verify', headers={
        'Authorization': 'Bearer invalid_token_here'
    })

    assert response.status_code == 401
    data = response.get_json()
    assert data['valid'] is False