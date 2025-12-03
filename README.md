# Security Anomaly Detection System - Backend

A machine learning-powered security system for detecting suspicious login attempts and anomalous user behavior.

## Features

- **Login Anomaly Detection**: ML-based detection using Isolation Forest
- **Real-time Analysis**: Analyze login attempts in real-time
- **Risk Scoring**: Calculate risk scores for each login attempt
- **Alert Management**: Generate and manage security alerts
- **User Behavioral Profiling**: Build profiles based on historical behavior
- **RESTful API**: Complete API for integration with frontend

## Tech Stack

- **Framework**: Flask
- **Database**: MongoDB
- **ML**: scikit-learn, pandas, numpy
- **Authentication**: JWT
- **Containerization**: Docker

## Setup Instructions

### Prerequisites

- Python 3.11+
- MongoDB 7.0+
- Docker & Docker Compose (optional)

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd security-anomaly-detection/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Start MongoDB**
```bash
# If using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Or start your local MongoDB instance
```

6. **Generate training data and train model**
```bash
python -m app.ml.model_trainer
```

7. **Run the application**
```bash
python run.py
```

The API will be available at `http://localhost:5000`

### Docker Deployment

1. **Build and start services**
```bash
docker-compose up -d
```

2. **Train the model (inside container)**
```bash
docker exec -it security-backend python -m app.ml.model_trainer
```

3. **View logs**
```bash
docker-compose logs -f backend
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/verify` - Verify token validity

### Login Analysis
- `POST /api/login/analyze` - Analyze login attempt
- `GET /api/login/events` - Get login events
- `GET /api/login/events/<id>` - Get specific login event

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/alerts` - Get security alerts
- `PUT /api/dashboard/alerts/<id>` - Update alert status
- `GET /api/dashboard/timeline` - Get login activity timeline
- `GET /api/dashboard/top-risks` - Get top risk users

## Testing

Run the test suite:
```bash
pytest tests/ -v --cov=app
```

Run specific test file:
```bash
pytest tests/test_anomaly_detector.py -v
```

## Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── models/          # Data models
│   ├── ml/              # Machine learning modules
│   ├── api/             # API endpoints
│   ├── middleware/      # Authentication middleware
│   └── utils/           # Utility functions
├── tests/               # Test suite
├── ml_models/           # Trained ML models
├── data/                # Training data
├── requirements.txt
├── run.py
├── Dockerfile
└── README.md
```

## Development Workflow

1. **Generate synthetic data**
   - Modify `SyntheticLoginDataGenerator` parameters as needed
   - Run `python -m app.ml.model_trainer` to generate new data

2. **Train model**
   - Adjust hyperparameters in `LoginAnomalyDetector`
   - Run training pipeline
   - Evaluate metrics

3. **Test API**
   - Use tools like Postman or curl
   - Check authentication with JWT tokens
   - Verify anomaly detection results

4. **Add tests**
   - Write unit tests for new features
   - Maintain >80% code coverage
   - Run tests before committing

## Next Steps

- Implement Phase 2: Phishing email detection
- Add WebSocket support for real-time alerts
- Implement model retraining pipeline
- Add explainable AI features (SHAP values)
- Create admin panel for model management

## License

MIT License

## Author

Mon - Cal Poly Pomona CS Student