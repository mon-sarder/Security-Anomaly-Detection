import secrets
import string


def generate_secret_key(length=50):
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_jwt_secret(length=64):
    """Generate a secure JWT secret"""
    return secrets.token_urlsafe(length)


def generate_env_file():
    """Generate .env file with secure secrets"""

    secret_key = generate_secret_key()
    jwt_secret = generate_jwt_secret()

    env_content = f"""# Flask Configuration
FLASK_ENV=development
SECRET_KEY={secret_key}
PORT=5000

# JWT Configuration
JWT_SECRET_KEY={jwt_secret}

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/security_detection

# ML Model Configuration
MODEL_PATH=./ml_models
ANOMALY_THRESHOLD=0.7

# Risk Score Thresholds
LOW_RISK_THRESHOLD=0.3
MEDIUM_RISK_THRESHOLD=0.6
HIGH_RISK_THRESHOLD=0.8

# Geolocation API (optional - leave empty for now)
IPSTACK_API_KEY=
"""

    # Write to .env file
    with open('.env', 'w') as f:
        f.write(env_content)

    print("✅ .env file created successfully!")
    print("\n" + "=" * 60)
    print("Your generated secrets:")
    print("=" * 60)
    print(f"\nSECRET_KEY:\n{secret_key}\n")
    print(f"JWT_SECRET_KEY:\n{jwt_secret}\n")
    print("=" * 60)
    print("\n⚠️  IMPORTANT: Never commit the .env file to GitHub!")
    print("Make sure .env is in your .gitignore file.\n")


if __name__ == '__main__':
    generate_env_file()