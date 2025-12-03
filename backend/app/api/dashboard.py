from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app import mongo
from app.middleware.auth_middleware import token_required
from bson import ObjectId

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    """Get overall statistics for dashboard"""
    try:
        # Time range (last 24 hours by default)
        hours = int(request.args.get('hours', 24))
        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Total logins
        total_logins = mongo.db.login_events.count_documents({
            'timestamp': {'$gte': time_threshold}
        })

        # Anomalous logins
        anomalous_logins = mongo.db.login_events.count_documents({
            'timestamp': {'$gte': time_threshold},
            'is_anomaly': True
        })

        # Active alerts (unresolved)
        active_alerts = mongo.db.alerts.count_documents({
            'resolved': False
        })

        # High-risk logins (risk_score > 0.7)
        high_risk_logins = mongo.db.login_events.count_documents({
            'timestamp': {'$gte': time_threshold},
            'risk_score': {'$gte': 0.7}
        })

        # Average risk score
        pipeline = [
            {'$match': {'timestamp': {'$gte': time_threshold}}},
            {'$group': {'_id': None, 'avg_risk': {'$avg': '$risk_score'}}}
        ]
        avg_result = list(mongo.db.login_events.aggregate(pipeline))
        avg_risk_score = avg_result[0]['avg_risk'] if avg_result else 0

        return jsonify({
            'time_range_hours': hours,
            'total_logins': total_logins,
            'anomalous_logins': anomalous_logins,
            'anomaly_rate': round(anomalous_logins / total_logins, 3) if total_logins > 0 else 0,
            'active_alerts': active_alerts,
            'high_risk_logins': high_risk_logins,
            'avg_risk_score': round(avg_risk_score, 3)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    """Get recent alerts"""
    try:
        # Query parameters
        severity = request.args.get('severity')
        resolved = request.args.get('resolved')
        limit = int(request.args.get('limit', 20))
        skip = int(request.args.get('skip', 0))

        # Build query
        query = {}
        if severity:
            query['severity'] = severity
        if resolved is not None:
            query['resolved'] = resolved.lower() == 'true'

        # Get alerts
        alerts = list(mongo.db.alerts.find(query)
                      .sort('timestamp', -1)
                      .skip(skip)
                      .limit(limit))

        # Convert ObjectId to string
        for alert in alerts:
            alert['_id'] = str(alert['_id'])

        return jsonify({
            'alerts': alerts,
            'count': len(alerts),
            'total': mongo.db.alerts.count_documents(query)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/alerts/<alert_id>', methods=['PUT'])
@token_required
def update_alert(current_user, alert_id):
    """Update an alert (e.g., mark as resolved)"""
    try:
        data = request.get_json()

        update_fields = {}
        if 'resolved' in data:
            update_fields['resolved'] = data['resolved']

        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400

        result = mongo.db.alerts.update_one(
            {'_id': ObjectId(alert_id)},
            {'$set': update_fields}
        )

        if result.matched_count == 0:
            return jsonify({'error': 'Alert not found'}), 404

        return jsonify({'message': 'Alert updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/timeline', methods=['GET'])
@token_required
def get_timeline(current_user):
    """Get login activity timeline"""
    try:
        hours = int(request.args.get('hours', 24))
        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Aggregate logins by hour
        pipeline = [
            {'$match': {'timestamp': {'$gte': time_threshold}}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$timestamp'},
                    'month': {'$month': '$timestamp'},
                    'day': {'$dayOfMonth': '$timestamp'},
                    'hour': {'$hour': '$timestamp'}
                },
                'total': {'$sum': 1},
                'anomalies': {'$sum': {'$cond': ['$is_anomaly', 1, 0]}}
            }},
            {'$sort': {'_id': 1}}
        ]

        results = list(mongo.db.login_events.aggregate(pipeline))

        timeline = []
        for result in results:
            timestamp = datetime(
                result['_id']['year'],
                result['_id']['month'],
                result['_id']['day'],
                result['_id']['hour']
            )
            timeline.append({
                'timestamp': timestamp.isoformat(),
                'total_logins': result['total'],
                'anomalous_logins': result['anomalies']
            })

        return jsonify({'timeline': timeline}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/top-risks', methods=['GET'])
@token_required
def get_top_risks(current_user):
    """Get users with highest risk scores"""
    try:
        hours = int(request.args.get('hours', 24))
        limit = int(request.args.get('limit', 10))
        time_threshold = datetime.utcnow() - timedelta(hours=hours)

        # Aggregate by user
        pipeline = [
            {'$match': {'timestamp': {'$gte': time_threshold}}},
            {'$group': {
                '_id': '$user_id',
                'username': {'$first': '$username'},
                'max_risk': {'$max': '$risk_score'},
                'avg_risk': {'$avg': '$risk_score'},
                'anomaly_count': {'$sum': {'$cond': ['$is_anomaly', 1, 0]}},
                'total_logins': {'$sum': 1}
            }},
            {'$sort': {'max_risk': -1}},
            {'$limit': limit}
        ]

        results = list(mongo.db.login_events.aggregate(pipeline))

        top_risks = []
        for result in results:
            top_risks.append({
                'user_id': result['_id'],
                'username': result['username'],
                'max_risk_score': round(result['max_risk'], 3),
                'avg_risk_score': round(result['avg_risk'], 3),
                'anomaly_count': result['anomaly_count'],
                'total_logins': result['total_logins']
            })

        return jsonify({'top_risks': top_risks}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500