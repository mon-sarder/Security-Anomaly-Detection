import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def verify_setup():
    """Verify that all required environment variables are set"""

    required_vars = [
        'SECRET_KEY',
        'JWT_SECRET_KEY',
        'MONGO_URI',
        'MODEL_PATH'
    ]

    print("Verifying environment setup...")
    print("=" * 60)

    all_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if 'KEY' in var or 'SECRET' in var:
                display_value = value[:10] + '...' + value[-10:] if len(value) > 20 else '***'
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: NOT SET")
            all_set = False

    print("=" * 60)

    if all_set:
        print("\n✅ All environment variables are set correctly!")
        print("You're ready to start development.\n")
        return True
    else:
        print("\n❌ Some environment variables are missing.")
        print("Please check your .env file.\n")
        return False


if __name__ == '__main__':
    verify_setup()