import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import Dict, Tuple, List
from datetime import datetime


class LoginAnomalyDetector:
    """Detect anomalous login attempts using Isolation Forest"""

    def __init__(self, model_path='./ml_models', contamination=0.1):
        """
        Initialize the anomaly detector

        Args:
            model_path: Path to save/load models
            contamination: Expected proportion of outliers in the dataset
        """
        self.model_path = model_path
        self.contamination = contamination
        self.model = None
        self.scaler = None
        self.feature_columns = None

        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)

    def train(self, features_df: pd.DataFrame):
        """
        Train the Isolation Forest model

        Args:
            features_df: DataFrame with engineered features
        """
        # Select feature columns (exclude metadata columns)
        exclude_cols = ['user_id', 'timestamp']
        self.feature_columns = [col for col in features_df.columns if col not in exclude_cols]

        X = features_df[self.feature_columns].values

        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # Train Isolation Forest
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=42,
            n_estimators=100,
            max_samples='auto',
            bootstrap=False,
            n_jobs=-1,
            verbose=0
        )

        self.model.fit(X_scaled)

        print(f"Model trained with {len(X)} samples")
        print(f"Features used: {self.feature_columns}")

    def predict(self, features: Dict) -> Tuple[bool, float, List[str]]:
        """
        Predict if a login is anomalous

        Args:
            features: Dictionary of engineered features

        Returns:
            Tuple of (is_anomaly, risk_score, reasons)
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Model not trained or loaded")

        # Prepare features in correct order
        X = np.array([[features[col] for col in self.feature_columns]])

        # Scale features
        X_scaled = self.scaler.transform(X)

        # Predict (-1 for anomaly, 1 for normal)
        prediction = self.model.predict(X_scaled)[0]
        is_anomaly = prediction == -1

        # Get anomaly score (more negative = more anomalous)
        anomaly_score = self.model.score_samples(X_scaled)[0]

        # Convert to risk score (0 to 1, where 1 is highest risk)
        # Isolation Forest scores are typically between -0.5 and 0.5
        # We'll normalize to 0-1 range
        risk_score = self._normalize_score(anomaly_score)

        # Identify reasons for anomaly
        reasons = self._identify_anomaly_reasons(features, risk_score)

        return is_anomaly, risk_score, reasons

    def _normalize_score(self, score: float) -> float:
        """
        Normalize anomaly score to 0-1 range

        More negative scores indicate more anomalous behavior
        Typical range is approximately -0.5 to 0.5
        """
        # Clamp score to reasonable range
        score = np.clip(score, -0.5, 0.5)

        # Normalize to 0-1 (invert so higher = more risky)
        normalized = 1 - ((score + 0.5) / 1.0)

        return float(normalized)

    def _identify_anomaly_reasons(self, features: Dict, risk_score: float) -> List[str]:
        """
        Identify specific reasons why a login might be anomalous

        Args:
            features: Dictionary of engineered features
            risk_score: Calculated risk score

        Returns:
            List of human-readable reasons
        """
        reasons = []

        # Check for off-hours login
        if features.get('is_night', 0) == 1:
            reasons.append("Login attempt during unusual hours (late night/early morning)")

        if features.get('is_work_hours', 0) == 0 and features.get('is_weekend', 0) == 0:
            reasons.append("Login outside typical work hours on weekday")

        # Check for weekend login
        if features.get('is_weekend', 0) == 1:
            reasons.append("Login attempt during weekend")

        # Check for unusual location
        distance = features.get('distance_from_typical', 0)
        if distance > 100:  # More than 100km from typical location
            reasons.append(f"Login from unusual location (>{int(distance)}km from typical)")

        # Check for new/unusual device
        if features.get('is_typical_device', 0) == 0:
            reasons.append("Login from new or unusual device")

        # Check for failed login
        if features.get('success', 1) == 0:
            reasons.append("Failed login attempt")

        # If high risk but no specific reasons identified
        if risk_score > 0.7 and not reasons:
            reasons.append("Unusual pattern detected in login behavior")

        return reasons

    def save_model(self, model_name='login_anomaly_detector'):
        """Save the trained model and scaler"""
        if self.model is None or self.scaler is None:
            raise ValueError("No model to save. Train the model first.")

        model_file = os.path.join(self.model_path, f'{model_name}.pkl')
        scaler_file = os.path.join(self.model_path, f'{model_name}_scaler.pkl')
        features_file = os.path.join(self.model_path, f'{model_name}_features.pkl')

        joblib.dump(self.model, model_file)
        joblib.dump(self.scaler, scaler_file)
        joblib.dump(self.feature_columns, features_file)

        print(f"Model saved to {model_file}")
        print(f"Scaler saved to {scaler_file}")
        print(f"Features saved to {features_file}")

    def load_model(self, model_name='login_anomaly_detector'):
        """Load a trained model and scaler"""
        model_file = os.path.join(self.model_path, f'{model_name}.pkl')
        scaler_file = os.path.join(self.model_path, f'{model_name}_scaler.pkl')
        features_file = os.path.join(self.model_path, f'{model_name}_features.pkl')

        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Model file not found: {model_file}")

        self.model = joblib.load(model_file)
        self.scaler = joblib.load(scaler_file)
        self.feature_columns = joblib.load(features_file)

        print(f"Model loaded from {model_file}")
        print(f"Features: {self.feature_columns}")

    def evaluate(self, features_df: pd.DataFrame, true_labels: pd.Series) -> Dict:
        """
        Evaluate model performance

        Args:
            features_df: DataFrame with engineered features
            true_labels: True anomaly labels (True/False or 1/0)

        Returns:
            Dictionary with evaluation metrics
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded")

        X = features_df[self.feature_columns].values
        X_scaled = self.scaler.transform(X)

        predictions = self.model.predict(X_scaled)
        # Convert -1/1 to True/False
        predictions = (predictions == -1)

        # Calculate metrics
        from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix

        true_labels = true_labels.astype(bool)

        metrics = {
            'precision': precision_score(true_labels, predictions),
            'recall': recall_score(true_labels, predictions),
            'f1_score': f1_score(true_labels, predictions),
            'confusion_matrix': confusion_matrix(true_labels, predictions).tolist()
        }

        return metrics


if __name__ == '__main__':
    # Test the anomaly detector
    from data_generator import SyntheticLoginDataGenerator
    from feature_engineering import LoginFeatureEngineer

    # Generate data
    print("Generating synthetic data...")
    generator = SyntheticLoginDataGenerator(num_users=50, days=30)
    df = generator.generate_dataset(anomaly_percentage=0.10)

    # Split into train and test
    train_size = int(0.8 * len(df))
    train_df = df[:train_size].copy()
    test_df = df[train_size:].copy()

    # Engineer features
    print("\nEngineering features...")
    engineer = LoginFeatureEngineer()
    engineer.build_all_profiles(train_df)

    train_features = engineer.engineer_features_batch(train_df)
    test_features = engineer.engineer_features_batch(test_df)

    # Train model
    print("\nTraining model...")
    detector = LoginAnomalyDetector(contamination=0.10)
    detector.train(train_features)

    # Evaluate
    print("\nEvaluating model...")
    metrics = detector.evaluate(test_features, test_df['is_anomaly'])
    print(f"Precision: {metrics['precision']:.3f}")
    print(f"Recall: {metrics['recall']:.3f}")
    print(f"F1 Score: {metrics['f1_score']:.3f}")
    print(f"Confusion Matrix:\n{np.array(metrics['confusion_matrix'])}")

    # Save model
    print("\nSaving model...")
    detector.save_model()