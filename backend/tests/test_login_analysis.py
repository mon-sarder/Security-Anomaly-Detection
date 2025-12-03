import pytest
from datetime import datetime


def test_analyze_login_success(client, auth_headers):
    """Test successful login analysis"""
    payload = {
        'user_id': 'test_user_001',
        'username': 'john.doe',
        'ip_address': '192.168.1.100',
        'device_info': {
            'browser': 'Chrome',
            'os': 'Windows',
            'device_type': 'desktop'
        },
        'success': True
    }

    response = client.post('/api/login/analyze',
                           json=payload,
                           headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'login_event_id' in data
    assert 'is_anomaly' in data
    assert 'risk_score' in data
    assert 'severity' in data
    assert isinstance(data['risk_score'], float)
    assert 0 <= data['risk_score'] <= 1


def test_analyze_login_missing_fields(client, auth_headers):
    """Test login analysis with missing required fields"""
    payload = {
        'user_id': 'test_user_001'
        # Missing username, ip_address, device_info
    }

    response = client.post('/api/login/analyze',
                           json=payload,
                           headers=auth_headers)

    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data


def test_analyze_login_without_auth(client):
    """Test login analysis without authentication"""
    payload = {
        'user_id': 'test_user_001',
        'username': 'john.doe',
        'ip_address': '192.168.1.100',
        'device_info': {
            'browser': 'Chrome',
            'os': 'Windows',
            'device_type': 'desktop'
        }
    }

    response = client.post('/api/login/analyze', json=payload)

    assert response.status_code == 401


def test_get_login_events(client, auth_headers):
    """Test retrieving login events"""
    # First create some login events
    for i in range(3):
        payload = {
            'user_id': f'test_user_{i:03d}',
            'username': f'user{i}',
            'ip_address': f'192.168.1.{i}',
            'device_info': {
                'browser': 'Chrome',
                'os': 'Windows',
                'device_type': 'desktop'
            }
        }
        client.post('/api/login/analyze', json=payload, headers=auth_headers)

    # Now retrieve them
    response = client.get('/api/login/events', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'events' in data
    assert 'count' in data
    assert len(data['events']) == 3