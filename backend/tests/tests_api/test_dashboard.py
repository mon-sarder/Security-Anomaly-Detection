import pytest
from datetime import datetime


def test_get_stats_success(client, auth_headers):
    """Test retrieving dashboard statistics"""
    response = client.get('/api/dashboard/stats', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'time_range_hours' in data
    assert 'total_logins' in data
    assert 'anomalous_logins' in data
    assert 'anomaly_rate' in data
    assert 'active_alerts' in data
    assert 'high_risk_logins' in data
    assert 'avg_risk_score' in data


def test_get_stats_custom_timeframe(client, auth_headers):
    """Test dashboard stats with custom timeframe"""
    response = client.get('/api/dashboard/stats?hours=48', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data['time_range_hours'] == 48


def test_get_stats_without_auth(client):
    """Test dashboard stats without authentication"""
    response = client.get('/api/dashboard/stats')

    assert response.status_code == 401


def test_get_alerts_success(client, auth_headers):
    """Test retrieving alerts"""
    response = client.get('/api/dashboard/alerts', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'alerts' in data
    assert 'count' in data
    assert 'total' in data
    assert isinstance(data['alerts'], list)


def test_get_alerts_with_filters(client, auth_headers):
    """Test retrieving alerts with filters"""
    # Test severity filter
    response = client.get('/api/dashboard/alerts?severity=high', headers=auth_headers)
    assert response.status_code == 200

    # Test resolved filter
    response = client.get('/api/dashboard/alerts?resolved=false', headers=auth_headers)
    assert response.status_code == 200

    # Test limit
    response = client.get('/api/dashboard/alerts?limit=5', headers=auth_headers)
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['alerts']) <= 5


def test_get_alerts_without_auth(client):
    """Test retrieving alerts without authentication"""
    response = client.get('/api/dashboard/alerts')

    assert response.status_code == 401


def test_update_alert_resolve(client, auth_headers):
    """Test updating an alert to resolved"""
    # First create a login event that generates an alert
    login_payload = {
        'user_id': 'test_user_001',
        'username': 'test.user',
        'ip_address': '192.168.1.100',
        'device_info': {
            'browser': 'Chrome',
            'os': 'Windows',
            'device_type': 'desktop'
        }
    }

    # Analyze login to potentially create alert
    login_response = client.post('/api/login/analyze',
                                 json=login_payload,
                                 headers=auth_headers)

    # Get alerts
    alerts_response = client.get('/api/dashboard/alerts', headers=auth_headers)
    alerts_data = alerts_response.get_json()

    if len(alerts_data['alerts']) > 0:
        alert_id = alerts_data['alerts'][0]['_id']

        # Update alert
        update_response = client.put(f'/api/dashboard/alerts/{alert_id}',
                                     json={'resolved': True},
                                     headers=auth_headers)

        assert update_response.status_code == 200
        data = update_response.get_json()
        assert 'message' in data


def test_update_alert_not_found(client, auth_headers):
    """Test updating non-existent alert"""
    fake_id = '507f1f77bcf86cd799439011'

    response = client.put(f'/api/dashboard/alerts/{fake_id}',
                          json={'resolved': True},
                          headers=auth_headers)

    assert response.status_code == 404


def test_update_alert_no_fields(client, auth_headers):
    """Test updating alert with no fields"""
    # Get an alert first
    alerts_response = client.get('/api/dashboard/alerts', headers=auth_headers)
    alerts_data = alerts_response.get_json()

    if len(alerts_data['alerts']) > 0:
        alert_id = alerts_data['alerts'][0]['_id']

        response = client.put(f'/api/dashboard/alerts/{alert_id}',
                              json={},
                              headers=auth_headers)

        assert response.status_code == 400


def test_get_timeline_success(client, auth_headers):
    """Test retrieving activity timeline"""
    response = client.get('/api/dashboard/timeline', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'timeline' in data
    assert isinstance(data['timeline'], list)


def test_get_timeline_custom_hours(client, auth_headers):
    """Test timeline with custom hours"""
    response = client.get('/api/dashboard/timeline?hours=48', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert 'timeline' in data


def test_get_timeline_without_auth(client):
    """Test timeline without authentication"""
    response = client.get('/api/dashboard/timeline')

    assert response.status_code == 401


def test_get_top_risks_success(client, auth_headers):
    """Test retrieving top risk users"""
    response = client.get('/api/dashboard/top-risks', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()

    assert 'top_risks' in data
    assert isinstance(data['top_risks'], list)


def test_get_top_risks_custom_limit(client, auth_headers):
    """Test top risks with custom limit"""
    response = client.get('/api/dashboard/top-risks?limit=5', headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert len(data['top_risks']) <= 5


def test_get_top_risks_structure(client, auth_headers):
    """Test top risks response structure"""
    # First create some login events
    for i in range(3):
        login_payload = {
            'user_id': f'test_user_{i:03d}',
            'username': f'user{i}',
            'ip_address': f'192.168.1.{i}',
            'device_info': {
                'browser': 'Chrome',
                'os': 'Windows',
                'device_type': 'desktop'
            }
        }
        client.post('/api/login/analyze', json=login_payload, headers=auth_headers)

    response = client.get('/api/dashboard/top-risks', headers=auth_headers)
    data = response.get_json()

    if len(data['top_risks']) > 0:
        risk = data['top_risks'][0]
        assert 'user_id' in risk
        assert 'username' in risk
        assert 'max_risk_score' in risk
        assert 'avg_risk_score' in risk
        assert 'anomaly_count' in risk
        assert 'total_logins' in risk


def test_get_top_risks_without_auth(client):
    """Test top risks without authentication"""
    response = client.get('/api/dashboard/top-risks')

    assert response.status_code == 401