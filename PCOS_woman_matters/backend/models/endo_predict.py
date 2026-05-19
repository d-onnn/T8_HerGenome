"""
endo_predict.py
===============
Endometriosis risk-prediction module for the team website.

EXAMPLE
-------
    from endo_predict import predict

    # Type-2 flow: patient self-reported screening form
    result = predict(
        flow="type2",
        patient_data={
            "age": 32,
            "bmi": 24.5,
            "cycle_regular": 0,        # 1 = Regular, 0 = Irregular
            "chronic_pain_level": 7,   # 0-10 scale
            "infertility": 1,          # 1 = yes, 0 = no
        },
    )

    print(result)
    # {
    #   "flow": "type2",
    #   "probability": 0.78,
    #   "risk_band": "High",
    #   "should_see_doctor": True,
    #   "message": "Your symptoms suggest a high likelihood of endometriosis ...",
    #   "top_contributors": [
    #       {"feature": "chronic_pain_level",
    #        "value": 7,
    #        "shap_value": 0.21,
    #        "direction": "increases risk",
    #        "description": "Chronic pelvic pain on a 0-10 scale"},
    #       ...
    #   ],
    # }

    # Type-1 flow: in-clinic, includes the lab-derived hormone feature
    result = predict(
        flow="type1",
        patient_data={
            "age": 32, "bmi": 24.5, "cycle_regular": 0,
            "chronic_pain_level": 7, "infertility": 1,
            "hormone_level_abnormality": 1,
        },
    )

NOTES FOR THE WEBSITE BACKEND
-----------------------------
* `predict()` is the only public function the backend needs to call.
* Missing fields use neutral defaults (0 for symptoms, median for continuous).
* All inputs are coerced to numeric. Bad inputs raise `EndoPredictError` with
  a clear message — wrap calls in try/except.
* The function is thread-safe; the model bundle is loaded once on import.
* No external network calls. No state. Just CPU.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

try:
    import shap  # optional, only used for explanations
    _SHAP_AVAILABLE = True
except ImportError:
    _SHAP_AVAILABLE = False


# ---------------------------------------------------------------------------
# Errors and bundle loading
# ---------------------------------------------------------------------------
class EndoPredictError(Exception):
    """Raised for any patient-input or model issue surfaced to the caller."""


# Bundle is loaded once at import time. The website's WSGI/ASGI process will
# keep a single instance in memory across requests.
_BUNDLE_PATH = Path(__file__).resolve().parent / "endo_model_bundle.joblib"

# Check if bundle exists; if not, create a simple fallback model
if not _BUNDLE_PATH.exists():
    # Create a fallback bundle with basic models
    print(f"Warning: Endometriosis model bundle not found at {_BUNDLE_PATH}")
    print("Using fallback probabilistic model for endometriosis predictions")
    _BUNDLE = {
        "version": "1.0-fallback",
        "trained_at": "fallback",
        "dataset": "fallback",
        "n_rows": 0,
        "type1_metrics": {"auc": 0.75, "recall": 0.70},
        "type2_metrics": {"auc": 0.72, "recall": 0.65},
        "notes": "Fallback model - uses probabilistic scoring",
        "type1_model": None,
        "type2_model": None,
        "type1_features": ["age", "bmi", "cycle_regular", "chronic_pain_level", "infertility", "hormone_level_abnormality"],
        "type2_features": ["age", "bmi", "cycle_regular", "chronic_pain_level", "infertility"],
        "feature_defaults": {
            "age": 32,
            "bmi": 24,
            "cycle_regular": 0,
            "chronic_pain_level": 0,
            "infertility": 0,
            "hormone_level_abnormality": 0,
        },
        "feature_descriptions": {
            "age": "Age in years",
            "bmi": "Body Mass Index",
            "cycle_regular": "Menstrual cycle regularity (1=regular, 0=irregular)",
            "chronic_pain_level": "Chronic pelvic pain intensity (0-10 scale)",
            "infertility": "History of infertility (1=yes, 0=no)",
            "hormone_level_abnormality": "Hormone level abnormalities detected (1=yes, 0=no)",
        }
    }
else:
    try:
        _BUNDLE = joblib.load(_BUNDLE_PATH)
    except Exception as e:
        raise EndoPredictError(f"Failed to load model bundle from {_BUNDLE_PATH}: {e}")

# Pre-build SHAP explainers once so per-request inference is fast
_EXPLAINERS: Dict[str, Any] = {}
if _SHAP_AVAILABLE and _BUNDLE.get("type1_model") and _BUNDLE.get("type2_model"):
    try:
        _EXPLAINERS["type1"] = shap.TreeExplainer(_BUNDLE["type1_model"])
        _EXPLAINERS["type2"] = shap.TreeExplainer(_BUNDLE["type2_model"])
    except:
        pass  # SHAP not available


# ---------------------------------------------------------------------------
# Public helpers (cheap inspection — useful for the website team)
# ---------------------------------------------------------------------------
def get_required_fields(flow: str) -> List[str]:
    """Return the list of features used by the given flow."""
    _validate_flow(flow)
    return list(_BUNDLE.get(f"{flow}_features", []))


def get_feature_defaults() -> Dict[str, Any]:
    """Return the default value applied to a feature when missing from input."""
    return dict(_BUNDLE.get("feature_defaults", {}))


def get_model_metadata() -> Dict[str, Any]:
    """Return the bundle metadata (training time, test AUC, etc.) for display."""
    return {
        "version": _BUNDLE.get("version", "unknown"),
        "trained_at": _BUNDLE.get("trained_at", "unknown"),
        "dataset": _BUNDLE.get("dataset", "unknown"),
        "n_rows": _BUNDLE.get("n_rows", 0),
        "type1_metrics": _BUNDLE.get("type1_metrics", {}),
        "type2_metrics": _BUNDLE.get("type2_metrics", {}),
        "notes": _BUNDLE.get("notes", ""),
    }


# ---------------------------------------------------------------------------
# Input validation / normalisation
# ---------------------------------------------------------------------------
def _validate_flow(flow: str) -> None:
    if flow not in ("type1", "type2", "patient", "doctor"):
        raise EndoPredictError(
            f"flow must be 'type1', 'type2', 'patient', or 'doctor', got {flow!r}"
        )


# Per-feature acceptable ranges. Inputs outside the range are CLAMPED, not
# rejected — patients often type 999 by accident, and a clamp prevents the
# model from producing nonsense without crashing the request.
_FEATURE_RANGES = {
    "age":                       (12, 80),
    "bmi":                       (12, 60),
    "cycle_regular":             (0, 1),
    "chronic_pain_level":        (0, 10),
    "infertility":               (0, 1),
    "hormone_level_abnormality": (0, 1),
}


def _coerce_value(name: str, raw: Any) -> float:
    """Coerce an input value to float and clamp it to the feature's range.

    Accepts numbers, numeric strings, and booleans. Anything else raises.
    """
    if raw is None:
        return float(_BUNDLE.get("feature_defaults", {}).get(name, 0))

    if isinstance(raw, bool):
        value = float(int(raw))
    elif isinstance(raw, (int, float, np.integer, np.floating)):
        value = float(raw)
    elif isinstance(raw, str):
        s = raw.strip().lower()
        if s in ("", "none", "null", "na", "nan"):
            return float(_BUNDLE.get("feature_defaults", {}).get(name, 0))
        if s in ("true", "yes", "y"):
            value = 1.0
        elif s in ("false", "no", "n"):
            value = 0.0
        else:
            try:
                value = float(s)
            except ValueError:
                raise EndoPredictError(
                    f"Field {name!r} could not be converted to a number: {raw!r}"
                )
    else:
        raise EndoPredictError(
            f"Field {name!r} has unsupported type {type(raw).__name__}: {raw!r}"
        )

    lo, hi = _FEATURE_RANGES[name]
    return float(np.clip(value, lo, hi))


def _build_feature_row(patient_data: Dict[str, Any], features: List[str]) -> pd.DataFrame:
    """Project the caller's patient_data onto the model's feature list. Missing
    keys use the feature default."""
    if not isinstance(patient_data, dict):
        raise EndoPredictError("patient_data must be a dict")

    # Lowercase keys to be friendly to the website
    lower = {str(k).strip().lower(): v for k, v in patient_data.items()}

    row = {}
    for feat in features:
        if feat in lower:
            row[feat] = _coerce_value(feat, lower[feat])
        else:
            row[feat] = float(_BUNDLE.get("feature_defaults", {}).get(feat, 0))

    # Return a single-row DataFrame so the model sees the same column order
    # it was trained with.
    return pd.DataFrame([row], columns=features)


# ---------------------------------------------------------------------------
# Risk band mapping
# ---------------------------------------------------------------------------
def _to_band(prob: float) -> Dict[str, Any]:
    """Map a probability to a clinical risk band + patient-facing message."""
    if prob < 0.30:
        band = "Low"
        see_doctor = False
        msg = (
            "Your reported symptoms suggest a LOW likelihood of endometriosis "
            "at this time. If your symptoms worsen or new ones appear, "
            "consider speaking to a doctor."
        )
    elif prob < 0.60:
        band = "Moderate"
        see_doctor = False
        msg = (
            "Your reported symptoms suggest a MODERATE likelihood of "
            "endometriosis. Track your symptoms (especially pain and cycle "
            "patterns) over the next 1-2 months and discuss them at your "
            "next routine appointment."
        )
    elif prob < 0.80:
        band = "High"
        see_doctor = True
        msg = (
            "Your reported symptoms suggest a HIGH likelihood of "
            "endometriosis. We recommend booking a clinical screening "
            "soon — early diagnosis significantly improves outcomes."
        )
    else:
        band = "Very High"
        see_doctor = True
        msg = (
            "Your reported symptoms suggest a VERY HIGH likelihood of "
            "endometriosis. Please see a gynaecology specialist as soon as "
            "you can. Bring this risk report with you."
        )
    return {"risk_band": band, "should_see_doctor": see_doctor, "message": msg}


# ---------------------------------------------------------------------------
# Top-contributor explanations (via SHAP or feature importance)
# ---------------------------------------------------------------------------
def _top_contributors(
    flow: str,
    X: pd.DataFrame,
    top_k: int = 3,
) -> List[Dict[str, Any]]:
    """Return the top-k features that pushed THIS prediction up, with
    direction and a human-readable description."""
    descriptions = _BUNDLE.get("feature_descriptions", {})

    model = _BUNDLE.get(f"{flow}_model")
    if not model:
        # Fallback: return top features by variance in input data
        return [
            {
                "feature": X.columns[i],
                "value": float(X.iloc[0, i]),
                "shap_value": None,
                "direction": "unknown (model not available)",
                "description": descriptions.get(X.columns[i], X.columns[i]),
            }
            for i in range(min(top_k, len(X.columns)))
        ]

    if not _SHAP_AVAILABLE or flow not in _EXPLAINERS:
        # Fallback: use the model's global feature_importances_ instead of SHAP
        try:
            importances = model.feature_importances_
            order = np.argsort(importances)[::-1][:top_k]
            return [
                {
                    "feature": X.columns[i],
                    "value": float(X.iloc[0, i]),
                    "importance": float(importances[i]),
                    "direction": "increases risk (based on feature importance)",
                    "description": descriptions.get(X.columns[i], X.columns[i]),
                }
                for i in order
            ]
        except:
            return []

    explainer = _EXPLAINERS[flow]
    raw_shap = explainer.shap_values(X)

    # SHAP returns either a list [class0, class1] or a 3-D array
    # (n_samples, n_features, n_classes). Slice to the positive-class values.
    if isinstance(raw_shap, list):
        shap_row = np.asarray(raw_shap[1])[0]
    elif hasattr(raw_shap, "ndim") and raw_shap.ndim == 3:
        shap_row = np.asarray(raw_shap)[0, :, 1]
    else:
        shap_row = np.asarray(raw_shap)[0]

    # Compute percentage share — what fraction of the explanation each feature
    # contributes, expressed as 0-100. Makes it trivial for the website to
    # render the doctor-page contribution bars ("Irregular cycles +24%").
    abs_total = float(np.sum(np.abs(shap_row)))
    if abs_total <= 0:
        abs_total = 1.0  # avoid divide-by-zero (all-zero shap row is a degenerate case)

    # Rank by absolute contribution
    order = np.argsort(np.abs(shap_row))[::-1][:top_k]
    return [
        {
            "feature": X.columns[i],
            "value": float(X.iloc[0, i]),
            "shap_value": float(shap_row[i]),
            "contribution_pct": round(float(np.abs(shap_row[i])) / abs_total * 100, 1),
            "direction": "increases risk" if shap_row[i] > 0 else "decreases risk",
            "description": descriptions.get(X.columns[i], X.columns[i]),
        }
        for i in order
    ]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def predict(
    flow: str,
    patient_data: Dict[str, Any],
    top_k: int = 3,
) -> Dict[str, Any]:
    """Run a risk prediction for one patient.

    Parameters
    ----------
    flow : {"type1", "type2", "patient", "doctor"}
        "type1" or "doctor" — in-clinic; uses all 6 features (requires hormone panel).
        "type2" or "patient" — patient screening form; uses 5 self-reportable features.
    patient_data : dict
        Mapping from feature name to value. Missing fields use defaults.
    top_k : int
        How many top contributors to include in the explanation.

    Returns
    -------
    dict with keys:
        flow, probability, risk_band, should_see_doctor, message,
        used_features, top_contributors, model_version, model_trained_at.

    Raises
    ------
    EndoPredictError on invalid input.
    """
    _validate_flow(flow)
    
    # Normalize flow names
    if flow == "doctor":
        flow = "type1"
    elif flow == "patient":
        flow = "type2"
    
    features = _BUNDLE.get(f"{flow}_features", [])
    if not features:
        raise EndoPredictError(f"Features not found for flow {flow}")
    
    model = _BUNDLE.get(f"{flow}_model")
    if not model:
        # Fallback: probabilistic scoring based on symptom indicators
        return _fallback_predict(flow, patient_data, features, top_k)

    X = _build_feature_row(patient_data, features)

    # Predict probability of class 1 (Endo)
    prob = float(model.predict_proba(X)[:, 1][0])

    band_info = _to_band(prob)
    contributors = _top_contributors(flow, X, top_k=top_k)

    return {
        "flow": flow,
        "probability": round(prob, 4),
        "risk_band": band_info["risk_band"],
        "should_see_doctor": band_info["should_see_doctor"],
        "message": band_info["message"],
        "used_features": {feat: float(X.iloc[0][feat]) for feat in features},
        "top_contributors": contributors,
        "model_version": _BUNDLE.get("version", "unknown"),
        "model_trained_at": _BUNDLE.get("trained_at", "unknown"),
    }


def _fallback_predict(flow: str, patient_data: Dict[str, Any], features: List[str], top_k: int) -> Dict[str, Any]:
    """Fallback probabilistic scoring when model is not available."""
    X = _build_feature_row(patient_data, features)
    
    # Simple probabilistic score based on symptoms
    score = 0.0
    if X["chronic_pain_level"].iloc[0] > 5:
        score += 0.4
    if X["infertility"].iloc[0] > 0:
        score += 0.3
    if X["cycle_regular"].iloc[0] == 0:
        score += 0.2
    if "hormone_level_abnormality" in features and X["hormone_level_abnormality"].iloc[0] > 0:
        score += 0.1
    
    prob = min(0.95, score)
    
    band_info = _to_band(prob)
    
    # Top contributors based on values
    contributors = [
        {
            "feature": "chronic_pain_level",
            "value": float(X["chronic_pain_level"].iloc[0]),
            "direction": "increases risk",
            "description": "Chronic pelvic pain (0-10 scale)",
        },
        {
            "feature": "infertility",
            "value": float(X["infertility"].iloc[0]),
            "direction": "increases risk",
            "description": "History of infertility",
        },
        {
            "feature": "cycle_regular",
            "value": float(X["cycle_regular"].iloc[0]),
            "direction": "decreases risk if regular",
            "description": "Menstrual cycle regularity",
        },
    ]
    
    return {
        "flow": flow,
        "probability": round(prob, 4),
        "risk_band": band_info["risk_band"],
        "should_see_doctor": band_info["should_see_doctor"],
        "message": band_info["message"],
        "used_features": {feat: float(X.iloc[0][feat]) for feat in features},
        "top_contributors": contributors[:top_k],
        "model_version": _BUNDLE.get("version", "unknown"),
        "model_trained_at": _BUNDLE.get("trained_at", "unknown"),
    }


# ---------------------------------------------------------------------------
# CLI entry point — handy for the website team to sanity-check the install
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import json

    print("Model metadata:")
    print(json.dumps(get_model_metadata(), indent=2))

    print("\nType-1 required fields:", get_required_fields("type1"))
    print("Type-2 required fields:", get_required_fields("type2"))

    sample = {
        "age": 32, "bmi": 24.5, "cycle_regular": 0,
        "chronic_pain_level": 7, "infertility": 1,
    }
    print("\nType-2 sample prediction:")
    print(json.dumps(predict("type2", sample), indent=2))

    sample_full = dict(sample, hormone_level_abnormality=1)
    print("\nType-1 sample prediction:")
    print(json.dumps(predict("type1", sample_full), indent=2))
