import pytest
import pandas as pd
import numpy as np
from app.ml.anomaly_detector import LoginAnomalyDetector
from app.ml.feature_engineering import LoginFeatureEngineer
from app.ml.data_generator import SyntheticLoginDataGenerator


def test_anomaly_detector_training():
    """Test that the anomaly detector can be trained"""
    # Generate small dataset
    generator = SyntheticLoginDataGenerator(num_users=10, days=7)
    df = generator.generate_dataset(anomaly_percentage=0.1)

    # Engineer features
    engineer = LoginFeatureEngineer()
    engineer.build_all_profiles(df)
    features_df = engineer.engineer_features_batch(df)

    # Train detector
    detector = LoginAnomalyDetector(contamination=0.1)
    detector.train(features_df)

    assert detector.model is not None
    assert detector.scaler is not None
    assert detector.feature_columns is not None


def test_anomaly_detector_prediction():
    """Test that the detector can make predictions"""
    # Generate and train
    generator = SyntheticLoginDataGenerator(num_users=10, days=7)
    df = generator.generate_dataset(anomaly_percentage=0.1)

    engineer = LoginFeatureEngineer()
    engineer.build_all_profiles(df)
    features_df = engineer.engineer_features_batch(df)

    detector = LoginAnomalyDetector(contamination=0.1)
    detector.train(features_df)

    # Make prediction on single sample
    sample_features = features_df.iloc[0].to_dict()
    is_anomaly, risk_score, reasons = detector.predict(sample_features)

    assert isinstance(is_anomaly, (bool, np.bool_))
    assert isinstance(risk_score, float)
    assert 0 <= risk_score <= 1
    assert isinstance(reasons, list)


def test_anomaly_detector_evaluation():
    """Test model evaluation"""
    generator = SyntheticLoginDataGenerator(num_users=20, days=7)
    df = generator.generate_dataset(anomaly_percentage=0.1)

    engineer = LoginFeatureEngineer()
    engineer.build_all_profiles(df)
    features_df = engineer.engineer_features_batch(df)

    detector = LoginAnomalyDetector(contamination=0.1)
    detector.train(features_df)

    metrics = detector.evaluate(features_df, df['is_anomaly'])

    assert 'precision' in metrics
    assert 'recall' in metrics
    assert 'f1_score' in metrics
    assert 0 <= metrics['precision'] <= 1
    assert 0 <= metrics['recall'] <= 1