from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from app.config import config
import os

mongo = PyMongo()


def create_app(config_name='default'):
    """Application factory pattern"""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(config[config_name])

    # Initialize extensions
    CORS(app)
    mongo.init_app(app)

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.login_analysis import login_analysis_bp
    from app.api.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/api/Auth')
    app.register_blueprint(login_analysis_bp, url_prefix='/api/login')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'service': 'Security Anomaly Detection API'}, 200

    return app