from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import jwt
import bcrypt
from app import mongo
from app.config import Config

auth_bp = Blueprint('Auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user (admin/analyst account)"""
    try:
        data = request.get_json()

        # Validate input
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400

        username = data['username']
        password = data['password']
        email = data.get('email', '')

        # Check if user already exists
        if mongo.db.users.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # Create user
        user = {
            'username': username,
            'password': hashed_password,
            'email': email,
            'role': 'analyst',
            'created_at': datetime.utcnow()
        }

        result = mongo.db.users.insert_one(user)

        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(result.inserted_id),
            'username': username
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login and receive JWT token"""
    try:
        data = request.get_json()

        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400

        username = data['username']
        password = data['password']

        # Find user
        user = mongo.db.users.find_one({'username': username})

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'username': user['username'],
            'role': user.get('role', 'analyst'),
            'exp': datetime.utcnow() + timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRES)
        }, Config.JWT_SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'user_id': str(user['_id']),
                'username': user['username'],
                'role': user.get('role', 'analyst')
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/verify', methods=['GET'])
def verify_token():
    """Verify if token is valid"""
    try:
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'valid': False}), 401

        data = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])

        return jsonify({
            'valid': True,
            'user': {
                'user_id': data['user_id'],
                'username': data['username'],
                'role': data.get('role', 'analyst')
            }
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'valid': False, 'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'valid': False, 'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 500