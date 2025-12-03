#!/bin/bash

echo "🚀 Starting Security Anomaly Detection System Setup"
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "🔑 Generating secrets and creating .env file..."
    python generate_secrets.py
else
    echo "✅ .env file already exists"
fi

# Verify setup
echo "🔍 Verifying setup..."
python verify_setup.py

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Train the model: python -m app.ml.model_trainer"
echo "3. Run the server: python run.py"
echo "=================================================="