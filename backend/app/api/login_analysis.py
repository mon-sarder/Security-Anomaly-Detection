from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from app import mongo
from app.middleware.auth_middleware import token_required
from app.models.login_event import LoginEvent
from app.models.alert import Alert, AlertSeverity
from app.ml.feature_engineering import LoginFeatureEngineer
from app.ml.anomaly_detector import LoginAnomalyDetector
from app.utils.geolocation import geolocation_service
from app.utils.validators import validate_login_event
import joblib
import os

login_analysis_bp = Blueprint('login_analysis', __name__)

# Load ML model and feature engineer (lazy loading)
_detector = None
_engineer = None


def get_detector():
    """Lazy load the ML detector"""
    global _detector
    if _detector is None:
        model_path = current_app.config.get('MODEL_PATH', './ml_models')
        _detector = LoginAnomalyDetector(model_path=model_path)
        try:
            _detector.load_model()
        except FileNotFoundError:
            print("Warning: ML model not found. Please train the model first.")
    return _detector


def get_engineer():
    """Lazy load the feature engineer with user profiles"""
    global _engineer
    if _engineer is None:
        _engineer = LoginFeatureEngineer()
        # Load user profiles
        model_path = current_app.config.get('MODEL_PATH', './ml_models')
        profiles_path = os.path.join(model_path, 'login_anomaly_detector_user_profiles.pkl')
        try:
            _engineer.user_profiles = joblib.load(profiles_path)
        except FileNotFoundError:
            print("Warning: User profiles not found. Using default profiles.")
    return _engineer


@login_analysis_bp.route('/analyze', methods=['POST'])
@token_required
def analyze_login(current_user):
    """
    Analyze a login attempt for anomalies

    Expected payload:
    {
        "user_id": "user_001",
        "username": "john.doe",
        "ip_address": "192.168.1.100",
        "device_info": {
            "browser": "Chrome",
            "os": "Windows",
            "device_type": "desktop"
        },
        "timestamp": "2024-01-15T14:30:00",  # optional
        "location": {  # optional
            "latitude": 37.7749,
            "longitude": -122.4194,
            "city": "San Francisco",
            "country": "USA"
        },
        "success": true
    }
    """
    try:
        data = request.get_json()

        # Validate input
        is_valid, errors = validate_login_event(data)
        if not is_valid:
            return jsonify({'error': 'Invalid input', 'details': errors}), 400

        # Add timestamp if not provided
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow().isoformat()

        # Get location from IP if not provided
        if 'location' not in data:
            location = geolocation_service.get_location_from_ip(data['ip_address'])
            data['location'] = location

        # Set success to True if not provided
        if 'success' not in data:
            data['success'] = True

        # Engineer features
        engineer = get_engineer()
        features = engineer.engineer_features(data)

        # Detect anomaly
        detector = get_detector()
        is_anomaly, risk_score, reasons = detector.predict(features)

        # Determine alert severity based on risk score
        config = current_app.config
        if risk_score >= config.get('HIGH_RISK_THRESHOLD', 0.8):
            severity = AlertSeverity.HIGH
        elif risk_score >= config.get('MEDIUM_RISK_THRESHOLD', 0.6):
            severity = AlertSeverity.MEDIUM
        else:
            severity = AlertSeverity.LOW

        # Create login event
        login_event = LoginEvent(
            user_id=data['user_id'],
            username=data['username'],
            timestamp=datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00')),
            ip_address=data['ip_address'],
            location=data['location'],
            device_info=data['device_info'],
            success=data['success'],
            risk_score=risk_score,
            is_anomaly=is_anomaly,
            anomaly_reasons=reasons
        )

        # Store in MongoDB
        result = mongo.db.login_events.insert_one(login_event.to_dict())
        login_event_id = str(result.inserted_id)

        # Create alert if anomaly detected
        alert_id = None
        if is_anomaly:
            alert = Alert(
                alert_type='suspicious_login',
                severity=severity,
                user_id=data['user_id'],
                username=data['username'],
                description=f"Suspicious login detected with risk score {risk_score:.2f}",
                timestamp=datetime.utcnow(),
                login_event_id=login_event_id,
                details={
                    'risk_score': risk_score,
                    'reasons': reasons,
                    'ip_address': data['ip_address'],
                    'location': data['location']
                }
            )

            alert_result = mongo.db.alerts.insert_one(alert.to_dict())
            alert_id = str(alert_result.inserted_id)

        # Return analysis result
        return jsonify({
            'login_event_id': login_event_id,
            'is_anomaly': is_anomaly,
            'risk_score': round(risk_score, 3),
            'severity': severity.value if is_anomaly else 'normal',
            'reasons': reasons,
            'alert_id': alert_id,
            'message': 'Login analyzed successfully'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@login_analysis_bp.route('/events', methods=['GET'])
@token_required
def get_login_events(current_user):
    """Get recent login events with optional filtering"""
    try:
        # Query parameters
        user_id = request.args.get('user_id')
        is_anomaly = request.args.get('is_anomaly')
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))

        # Build query
        query = {}
        if user_id:
            query['user_id'] = user_id
        if is_anomaly is not None:
            query['is_anomaly'] = is_anomaly.lower() == 'true'

        # Get events
        events = list(mongo.db.login_events.find(query)
                      .sort('timestamp', -1)
                      .skip(skip)
                      .limit(limit))

        # Convert ObjectId to string
        for event in events:
            event['_id'] = str(event['_id'])

        return jsonify({
            'events': events,
            'count': len(events),
            'total': mongo.db.login_events.count_documents(query)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@login_analysis_bp.route('/events/<event_id>', methods=['GET'])
@token_required
def get_login_event(current_user, event_id):
    """Get details of a specific login event"""
    try:
        from bson import ObjectId

        event = mongo.db.login_events.find_one({'_id': ObjectId(event_id)})

        if not event:
            return jsonify({'error': 'Login event not found'}), 404

        event['_id'] = str(event['_id'])

        return jsonify(event), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500