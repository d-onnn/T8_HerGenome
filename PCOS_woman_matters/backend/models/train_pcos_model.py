#!/usr/bin/env python3
"""
Train and save PCOS risk prediction models (Patient + Doctor variants)

This script trains XGBoost models on the cleaned PCOS dataset and exports them
as joblib files for use by the web backend. Two models are created:
1. Patient model: uses 19 self-reportable features
2. Doctor model: uses ~43 clinical features (requires lab work, imaging)

Usage:
    python train_pcos_model.py <path_to_dataset>

Example:
    python train_pcos_model.py cleaned_pcos_dataset.csv
"""

import sys
import os
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    recall_score,
)
from xgboost import XGBClassifier


def load_dataset(csv_path):
    """Load and prepare the PCOS dataset."""
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    # Remove ID columns
    df = df.drop(columns=["sl_no", "patient_file_no"], errors="ignore")
    
    print(f"Dataset shape: {df.shape}")
    print(f"Class distribution:\n{df['pcos_y_n'].value_counts()}\n")
    return df


def train_doctor_model(df):
    """Train XGBoost model using all clinical features (Doctor variant)."""
    print("=" * 60)
    print("TRAINING DOCTOR MODEL (All Features)")
    print("=" * 60)
    
    X = df.drop(columns=["pcos_y_n"])
    y = df["pcos_y_n"].astype(int)
    
    # Train-test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Compute class imbalance weight
    scale_pos_weight = y_train.value_counts()[0] / y_train.value_counts()[1]
    print(f"Class imbalance weight: {scale_pos_weight:.3f}")
    
    # Train XGBoost model
    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss",
        verbosity=0
    )
    
    model.fit(X_train, y_train)
    print("XGBoost model training complete.")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Evaluation
    print("\nModel Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(f"Recall (Class 1): {recall_score(y_test, y_pred, pos_label=1):.4f}")
    print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    
    return model, list(X.columns)


def train_patient_model(df):
    """Train XGBoost model using only self-reportable features (Patient variant)."""
    print("\n" + "=" * 60)
    print("TRAINING PATIENT MODEL (Self-Reportable Features)")
    print("=" * 60)
    
    patient_features = [
        "age_yrs", "weight_kg", "height_cm", "bmi", "blood_group", 
        "cycle_r_i", "cycle_length_days", "marraige_status_yrs", 
        "pregnant_y_n", "no_of_abortions", "hip_inch", "waist_inch", 
        "weight_gain_y_n", "hair_growth_y_n", "skin_darkening_y_n", 
        "hair_loss_y_n", "pimples_y_n", "fast_food_y_n", "reg_exercise_y_n"
    ]
    
    # Keep only features that exist in dataset
    patient_features = [c for c in patient_features if c in df.columns]
    print(f"Patient features ({len(patient_features)}): {patient_features}")
    
    # Create model dataframe and drop missing rows
    model_df = df[patient_features + ["pcos_y_n"]].copy()
    model_df = model_df.dropna()
    print(f"After dropping NA rows: {model_df.shape}")
    
    X = model_df[patient_features]
    y = model_df["pcos_y_n"].astype(int)
    
    # Train-test split with stratification
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Compute class imbalance weight
    scale_pos_weight = y_train.value_counts()[0] / y_train.value_counts()[1]
    print(f"Class imbalance weight: {scale_pos_weight:.3f}")
    
    # Train XGBoost model
    model = XGBClassifier(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss",
        verbosity=0
    )
    
    model.fit(X_train, y_train)
    print("XGBoost model training complete.")
    
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Evaluation
    print("\nModel Evaluation:")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    print(f"Recall (Class 1): {recall_score(y_test, y_pred, pos_label=1):.4f}")
    print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    
    return model, patient_features


def save_models(doctor_model, doctor_features, patient_model, patient_features, output_dir):
    """Save models and feature lists to joblib files."""
    print("\n" + "=" * 60)
    print("SAVING MODELS")
    print("=" * 60)
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Doctor model
    doctor_bundle = {
        "model": doctor_model,
        "features": doctor_features,
        "model_type": "doctor",
        "version": "1.0",
        "trained_date": pd.Timestamp.now().isoformat(),
    }
    doctor_file = output_path / "pcos_doctor_model.joblib"
    joblib.dump(doctor_bundle, doctor_file)
    print(f"Saved doctor model to {doctor_file}")
    
    # Patient model
    patient_bundle = {
        "model": patient_model,
        "features": patient_features,
        "model_type": "patient",
        "version": "1.0",
        "trained_date": pd.Timestamp.now().isoformat(),
    }
    patient_file = output_path / "pcos_patient_model.joblib"
    joblib.dump(patient_bundle, patient_file)
    print(f"Saved patient model to {patient_file}")
    
    print(f"\nModels saved to {output_path}/")


def main():
    if len(sys.argv) < 2:
        # Try to find dataset in current directory or models directory
        possible_paths = [
            "cleaned_pcos_dataset.csv",
            Path(__file__).parent / "cleaned_pcos_dataset.csv",
            Path(__file__).parent.parent / "cleaned_pcos_dataset.csv",
        ]
        csv_path = None
        for path in possible_paths:
            if Path(path).exists():
                csv_path = str(path)
                break
        if not csv_path:
            print("Usage: python train_pcos_model.py <path_to_dataset>")
            print(f"\nCould not find dataset in:")
            for path in possible_paths:
                print(f"  {path}")
            sys.exit(1)
    else:
        csv_path = sys.argv[1]
    
    # Load dataset
    df = load_dataset(csv_path)
    
    # Train models
    doctor_model, doctor_features = train_doctor_model(df)
    patient_model, patient_features = train_patient_model(df)
    
    # Save models
    output_dir = Path(__file__).parent
    save_models(doctor_model, doctor_features, patient_model, patient_features, output_dir)
    
    print("\n✓ Training complete!")


if __name__ == "__main__":
    main()
