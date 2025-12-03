from app import create_app
import os

# Determine environment
env = os.getenv('FLASK_ENV', 'development')

# Create app
app = create_app(env)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = env == 'development'

    print(f"Starting Security Anomaly Detection API")
    print(f"Environment: {env}")
    print(f"Port: {port}")
    print(f"Debug: {debug}")

    app.run(host='0.0.0.0', port=port, debug=debug)