import pandas as pd
import os
from app.ml.data_generator import SyntheticLoginDataGenerator
from app.ml.feature_engineering import LoginFeatureEngineer
from app.ml.anomaly_detector import LoginAnomalyDetector


class ModelTrainingPipeline:
    """Complete pipeline for training the anomaly detection model"""

    def __init__(self, data_path='./data', model_path='./ml_models'):
        self.data_path = data_path
        self.model_path = model_path
        self.generator = None
        self.engineer = None
        self.detector = None

    def generate_training_data(self, num_users=50, days=30, anomaly_percentage=0.10):
        """Generate synthetic training data"""
        print("=" * 60)
        print("STEP 1: Generating Training Data")
        print("=" * 60)

        self.generator = SyntheticLoginDataGenerator(num_users=num_users, days=days)

        # Create data directory if it doesn't exist
        os.makedirs(os.path.join(self.data_path, 'training'), exist_ok=True)

        filepath = os.path.join(self.data_path, 'training', 'login_events.csv')
        df = self.generator.save_dataset(filepath, anomaly_percentage=anomaly_percentage)

        return df

    def engineer_features(self, df):
        """Engineer features from raw login data"""
        print("\n" + "=" * 60)
        print("STEP 2: Engineering Features")
        print("=" * 60)

        self.engineer = LoginFeatureEngineer()

        # Build user profiles from historical data
        self.engineer.build_all_profiles(df)

        # Engineer features
        features_df = self.engineer.engineer_features_batch(df)

        print(f"\nEngineered {len(features_df.columns)} features")
        print(f"Feature columns: {features_df.columns.tolist()}")

        # Save features
        features_path = os.path.join(self.data_path, 'training', 'login_features.csv')
        features_df.to_csv(features_path, index=False)
        print(f"Features saved to {features_path}")

        return features_df

    def train_model(self, features_df, contamination=0.10):
        """Train the anomaly detection model"""
        print("\n" + "=" * 60)
        print("STEP 3: Training Model")
        print("=" * 60)

        self.detector = LoginAnomalyDetector(
            model_path=self.model_path,
            contamination=contamination
        )

        self.detector.train(features_df)

        return self.detector

    def evaluate_model(self, df, features_df):
        """Evaluate model performance"""
        print("\n" + "=" * 60)
        print("STEP 4: Evaluating Model")
        print("=" * 60)

        metrics = self.detector.evaluate(features_df, df['is_anomaly'])

        print(f"\nModel Performance Metrics:")
        print(f"  Precision: {metrics['precision']:.3f}")
        print(f"  Recall: {metrics['recall']:.3f}")
        print(f"  F1 Score: {metrics['f1_score']:.3f}")
        print(f"\nConfusion Matrix:")
        print(f"  {metrics['confusion_matrix']}")

        return metrics

    def save_model(self, model_name='login_anomaly_detector'):
        """Save the trained model"""
        print("\n" + "=" * 60)
        print("STEP 5: Saving Model")
        print("=" * 60)

        self.detector.save_model(model_name)

        # Also save the feature engineer profiles
        import joblib
        profiles_path = os.path.join(self.model_path, f'{model_name}_user_profiles.pkl')
        joblib.dump(self.engineer.user_profiles, profiles_path)
        print(f"User profiles saved to {profiles_path}")

    def run_full_pipeline(self, num_users=50, days=30, anomaly_percentage=0.10, contamination=0.10):
        """Run the complete training pipeline"""
        print("\n" + "=" * 60)
        print("STARTING MODEL TRAINING PIPELINE")
        print("=" * 60)

        # Generate data
        df = self.generate_training_data(num_users, days, anomaly_percentage)

        # Engineer features
        features_df = self.engineer_features(df)

        # Train model
        self.train_model(features_df, contamination)

        # Evaluate model
        metrics = self.evaluate_model(df, features_df)

        # Save model
        self.save_model()

        print("\n" + "=" * 60)
        print("PIPELINE COMPLETED SUCCESSFULLY")
        print("=" * 60)

        return metrics


if __name__ == '__main__':
    # Run the training pipeline
    pipeline = ModelTrainingPipeline(
        data_path='./data',
        model_path='./ml_models'
    )

    metrics = pipeline.run_full_pipeline(
        num_users=100,
        days=30,
        anomaly_percentage=0.10,
        contamination=0.10
    )