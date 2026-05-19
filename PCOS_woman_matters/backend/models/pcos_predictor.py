"""
PCOS Risk Prediction Module

Loads pre-trained XGBoost models (patient and doctor variants) and provides
a simple predict() interface for the web backend.

Usage:
    from pcos_predictor import predict

    result = predict(
        patient_data={
            "age_yrs": 32,
            "bmi": 24.5,
            "cycle_r_i": 0,  # 0=irregular, 1=regular
            "weight_gain_y_n": 1,
            ...
        },
        model_type="patient"
    )
    
    print(result)
    # {
    #   "probability": 0.75,
    #   "risk_band": "High",
    #   "message": "High estimated PCOS risk...",
    #   "top_contributors": [
    #     {"feature": "weight_gain_y_n", "value": 1, "importance": 0.15, ...},
    #     ...
    #   ]
    # }
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

try:
    import shap
    _SHAP_AVAILABLE = True
except ImportError:
    _SHAP_AVAILABLE = False


# Bundle paths
_MODELS_DIR = Path(__file__).resolve().parent
_PATIENT_BUNDLE_PATH = _MODELS_DIR / "pcos_patient_model.joblib"
_DOCTOR_BUNDLE_PATH = _MODELS_DIR / "pcos_doctor_model.joblib"

# Load models at import time
_MODELS = {}
_EXPLAINERS = {}

def _load_models():
    """Load model bundles on first import."""
    global _MODELS, _EXPLAINERS
    
    for bundle_path, model_type in [
        (_PATIENT_BUNDLE_PATH, "patient"),
        (_DOCTOR_BUNDLE_PATH, "doctor"),
    ]:
        if bundle_path.exists():
            try:
                bundle = joblib.load(bundle_path)
                _MODELS[model_type] = bundle
                
                # Pre-build SHAP explainers if available
                if _SHAP_AVAILABLE and "model" in bundle:
                    try:
                        _EXPLAINERS[model_type] = shap.TreeExplainer(bundle["model"])
                    except:
                        pass  # SHAP not available, fall back to feature importance
            except Exception as e:
                print(f"Warning: Could not load {model_type} model from {bundle_path}: {e}")
        else:
            print(f"Warning: {model_type} model not found at {bundle_path}")

_load_models()


class PCOSPredictError(Exception):
    """Raised for any patient-input or model issue."""
    pass


# Feature ranges and defaults
_FEATURE_RANGES = {
    "age_yrs": (12, 80),
    "weight_kg": (30, 200),
    "height_cm": (100, 220),
    "bmi": (12, 60),
    "blood_group": (0, 20),
    "cycle_r_i": (0, 1),
    "cycle_length_days": (0, 90),
    "marraige_status_yrs": (0, 60),
    "pregnant_y_n": (0, 1),
    "no_of_abortions": (0, 10),
    "hip_inch": (20, 60),
    "waist_inch": (15, 60),
    "weight_gain_y_n": (0, 1),
    "hair_growth_y_n": (0, 1),
    "skin_darkening_y_n": (0, 1),
    "hair_loss_y_n": (0, 1),
    "pimples_y_n": (0, 1),
    "fast_food_y_n": (0, 1),
    "reg_exercise_y_n": (0, 1),
    # Doctor-only features
    "i_beta_hcg_miu_ml": (0, 10000),
    "ii_beta_hcg_miu_ml": (0, 10000),
    "fsh_miu_ml": (0, 50),
    "lh_miu_ml": (0, 100),
    "fsh_lh": (0, 50),
    "tsh_miu_l": (0, 50),
    "amh_ng_ml": (0, 20),
    "prl_ng_ml": (0, 200),
    "vit_d3_ng_ml": (0, 200),
    "prg_ng_ml": (0, 200),
    "rbs_mg_dl": (40, 500),
    "hb_g_dl": (5, 20),
    "pulse_rate_bpm": (40, 150),
    "rr_breaths_min": (10, 40),
    "bp_systolic_mmhg": (50, 200),
    "bp_diastolic_mmhg": (30, 150),
    "follicle_no_l": (0, 50),
    "follicle_no_r": (0, 50),
    "avg_f_size_l_mm": (0, 40),
    "avg_f_size_r_mm": (0, 40),
    "endometrium_mm": (0, 20),
}

# Feature defaults (medians from training set)
_FEATURE_DEFAULTS = {
    "age_yrs": 32,
    "weight_kg": 60,
    "height_cm": 159,
    "bmi": 23.5,
    "blood_group": 11,
    "cycle_r_i": 0,
    "cycle_length_days": 5,
    "marraige_status_yrs": 7,
    "pregnant_y_n": 0,
    "no_of_abortions": 0,
    "hip_inch": 40,
    "waist_inch": 35,
    "weight_gain_y_n": 0,
    "hair_growth_y_n": 0,
    "skin_darkening_y_n": 0,
    "hair_loss_y_n": 0,
    "pimples_y_n": 0,
    "fast_food_y_n": 0,
    "reg_exercise_y_n": 0,
    "i_beta_hcg_miu_ml": 1.99,
    "ii_beta_hcg_miu_ml": 1.99,
    "fsh_miu_ml": 5.0,
    "lh_miu_ml": 2.0,
    "fsh_lh": 2.5,
    "tsh_miu_l": 2.5,
    "amh_ng_ml": 2.5,
    "prl_ng_ml": 20.0,
    "vit_d3_ng_ml": 30.0,
    "prg_ng_ml": 0.5,
    "rbs_mg_dl": 95,
    "hb_g_dl": 11.0,
    "pulse_rate_bpm": 72,
    "rr_breaths_min": 18,
    "bp_systolic_mmhg": 120,
    "bp_diastolic_mmhg": 80,
    "follicle_no_l": 5,
    "follicle_no_r": 5,
    "avg_f_size_l_mm": 15,
    "avg_f_size_r_mm": 15,
    "endometrium_mm": 8,
}


def _coerce_value(name: str, raw: Any) -> float:
    """Coerce input to float and clamp to valid range."""
    if raw is None or (isinstance(raw, str) and raw.strip().lower() in ("", "none", "null", "na", "nan")):
        return float(_FEATURE_DEFAULTS.get(name, 0))
    
    if isinstance(raw, bool):
        value = float(int(raw))
    elif isinstance(raw, (int, float, np.integer, np.floating)):
        value = float(raw)
    elif isinstance(raw, str):
        s = raw.strip().lower()
        if s in ("true", "yes", "y"):
            value = 1.0
        elif s in ("false", "no", "n"):
            value = 0.0
        else:
            try:
                value = float(s)
            except ValueError:
                raise PCOSPredictError(f"Field {name!r} could not be converted to number: {raw!r}")
    else:
        raise PCOSPredictError(f"Field {name!r} has unsupported type {type(raw).__name__}: {raw!r}")
    
    lo, hi = _FEATURE_RANGES.get(name, (0, 1000))
    return float(np.clip(value, lo, hi))


def _build_feature_row(patient_data: Dict[str, Any], features: List[str]) -> pd.DataFrame:
    """Project patient_data onto model's feature list."""
    if not isinstance(patient_data, dict):
        raise PCOSPredictError("patient_data must be a dict")
    
    # Lowercase keys for flexibility
    lower = {str(k).strip().lower(): v for k, v in patient_data.items()}
    
    row = {}
    for feat in features:
        if feat in lower:
            row[feat] = _coerce_value(feat, lower[feat])
        else:
            row[feat] = float(_FEATURE_DEFAULTS.get(feat, 0))
    
    return pd.DataFrame([row], columns=features)


def _to_risk_band(prob: float) -> Dict[str, Any]:
    """Map probability to risk band and message."""
    if prob < 0.20:
        band = "Low"
        msg = "Low estimated PCOS risk. Continue routine monitoring and discuss symptoms with a clinician if needed. Note: This is a risk estimate, not a diagnosis."
    elif prob < 0.50:
        band = "Moderate"
        msg = "Moderate estimated PCOS risk. Consider a clinical review if symptoms such as irregular cycles, acne, or weight changes are present. Note: This is a risk estimate, not a diagnosis."
    elif prob < 0.80:
        band = "High"
        msg = "High estimated PCOS risk. A clinical evaluation is recommended. Note: This is a risk estimate, not a diagnosis."
    else:
        band = "Very High"
        msg = "Very high estimated PCOS risk. Please arrange prompt medical follow-up for formal assessment. Note: This is a risk estimate, not a diagnosis."
    
    return {"risk_band": band, "message": msg}


def _top_contributors(model_type: str, X: pd.DataFrame, top_k: int = 3) -> List[Dict[str, Any]]:
    """Return top-k contributing features."""
    if model_type not in _MODELS:
        raise PCOSPredictError(f"Model type {model_type!r} not available")
    
    bundle = _MODELS[model_type]
    model = bundle["model"]
    features = X.columns.tolist()
    
    # Try SHAP first
    if _SHAP_AVAILABLE and model_type in _EXPLAINERS:
        try:
            explainer = _EXPLAINERS[model_type]
            raw_shap = explainer.shap_values(X)
            
            # Handle different SHAP output formats
            if isinstance(raw_shap, list):
                shap_row = np.asarray(raw_shap[1])[0]
            elif hasattr(raw_shap, "ndim") and raw_shap.ndim == 3:
                shap_row = np.asarray(raw_shap)[0, :, 1]
            else:
                shap_row = np.asarray(raw_shap)[0]
            
            abs_total = float(np.sum(np.abs(shap_row)))
            if abs_total <= 0:
                abs_total = 1.0
            
            order = np.argsort(np.abs(shap_row))[::-1][:top_k]
            return [
                {
                    "feature": features[i],
                    "value": float(X.iloc[0, i]),
                    "shap_value": float(shap_row[i]),
                    "contribution_pct": round(float(np.abs(shap_row[i])) / abs_total * 100, 1),
                    "direction": "increases risk" if shap_row[i] > 0 else "decreases risk",
                }
                for i in order
            ]
        except Exception as e:
            pass  # Fall back to feature importance
    
    # Fall back to feature importance
    try:
        importances = model.feature_importances_
        order = np.argsort(importances)[::-1][:top_k]
        return [
            {
                "feature": features[i],
                "value": float(X.iloc[0, i]),
                "importance": float(importances[i]),
                "direction": "increases risk (based on feature importance)",
            }
            for i in order
        ]
    except:
        return []


def predict(
    patient_data: Dict[str, Any],
    model_type: str = "patient",
    top_k: int = 3,
) -> Dict[str, Any]:
    """
    Run PCOS risk prediction.
    
    Parameters
    ----------
    patient_data : dict
        Patient feature values (missing fields use defaults)
    model_type : {"patient", "doctor"}
        Which model variant to use
    top_k : int
        Number of top contributing features to return
    
    Returns
    -------
    dict with keys:
        probability, risk_band, message, used_features, top_contributors,
        model_type, model_version
    
    Raises
    ------
    PCOSPredictError on invalid input or missing model
    """
    if model_type not in _MODELS:
        raise PCOSPredictError(f"Model type {model_type!r} not loaded. Available: {list(_MODELS.keys())}")
    
    bundle = _MODELS[model_type]
    model = bundle["model"]
    features = bundle["features"]
    
    X = _build_feature_row(patient_data, features)
    
    # Predict
    prob = float(model.predict_proba(X)[:, 1][0])
    band_info = _to_risk_band(prob)
    contributors = _top_contributors(model_type, X, top_k=top_k)
    
    return {
        "probability": round(prob, 4),
        "risk_band": band_info["risk_band"],
        "message": band_info["message"],
        "used_features": {feat: float(X.iloc[0][feat]) for feat in features},
        "top_contributors": contributors,
        "model_type": model_type,
        "model_version": bundle.get("version", "unknown"),
        "trained_date": bundle.get("trained_date", "unknown"),
    }
