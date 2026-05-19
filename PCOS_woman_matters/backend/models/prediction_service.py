#!/usr/bin/env python3
"""
Prediction service - subprocess entry point for web backend

This script is called by the Node.js backend to run model predictions.
It reads JSON from stdin and outputs predictions to stdout.

Usage (called from Node.js backend):
    python prediction_service.py

Example input (stdin):
{
    "model": "pcos",
    "model_type": "patient",
    "data": {
        "age_yrs": 32,
        "bmi": 24.5,
        "cycle_r_i": 0,
        ...
    }
}

Example output (stdout):
{
    "success": true,
    "pcos": {
        "probability": 0.75,
        "risk_band": "High",
        ...
    },
    "endo": {
        "probability": 0.45,
        "risk_band": "Moderate",
        ...
    }
}

Or on error (stdout):
{
    "success": false,
    "error": "error message"
}
"""

import json
import sys
from pathlib import Path

# Import prediction modules
try:
    from pcos_predictor import predict as predict_pcos, PCOSPredictError
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Failed to import pcos_predictor: {e}"}))
    sys.exit(1)

try:
    from endo_predict import predict as predict_endo, EndoPredictError
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Failed to import endo_predict: {e}"}))
    sys.exit(1)


def main():
    """Read request from stdin, run predictions, output results."""
    try:
        # Read input
        input_data = json.load(sys.stdin)
        
        if not isinstance(input_data, dict):
            raise ValueError("Input must be a JSON object")
        
        model_to_run = input_data.get("model", "both")  # "pcos", "endo", or "both"
        pcos_model_type = input_data.get("model_type", "patient")  # for PCOS: "patient" or "doctor"
        patient_data = input_data.get("data", {})
        
        if not isinstance(patient_data, dict):
            raise ValueError("data field must be a dict")
        
        result = {"success": True}
        
        # Run PCOS prediction
        if model_to_run in ("pcos", "both"):
            try:
                pcos_result = predict_pcos(
                    patient_data=patient_data,
                    model_type=pcos_model_type,
                    top_k=3
                )
                result["pcos"] = pcos_result
            except PCOSPredictError as e:
                result["success"] = False
                result["error"] = f"PCOS prediction failed: {str(e)}"
                json.dump(result, sys.stdout)
                sys.exit(1)
        
        # Run endometriosis prediction
        if model_to_run in ("endo", "both"):
            try:
                # Map PCOS features to endometriosis model features
                endo_data = map_to_endo_features(patient_data)
                endo_result = predict_endo(
                    flow=pcos_model_type,  # "patient" or "doctor"
                    patient_data=endo_data,
                    top_k=3
                )
                result["endo"] = endo_result
            except EndoPredictError as e:
                result["success"] = False
                result["error"] = f"Endometriosis prediction failed: {str(e)}"
                json.dump(result, sys.stdout)
                sys.exit(1)
        
        # Output results
        json.dump(result, sys.stdout)
    
    except json.JSONDecodeError as e:
        json.dump({"success": False, "error": f"Invalid JSON input: {str(e)}"}, sys.stdout)
        sys.exit(1)
    except Exception as e:
        json.dump({"success": False, "error": f"Unexpected error: {str(e)}"}, sys.stdout)
        sys.exit(1)


def map_to_endo_features(pcos_data):
    """Map PCOS features to endometriosis model features.
    
    Endo model expects:
    - type1 (doctor): age, bmi, cycle_regular, chronic_pain_level, infertility, hormone_level_abnormality
    - type2 (patient): age, bmi, cycle_regular, chronic_pain_level, infertility
    """
    endo_data = {}
    
    # Direct mappings
    if "age_yrs" in pcos_data:
        endo_data["age"] = pcos_data["age_yrs"]
    
    if "bmi" in pcos_data:
        endo_data["bmi"] = pcos_data["bmi"]
    
    # Cycle regularity: pcos_data["cycle_r_i"] is 1=regular, 0=irregular
    # endo model expects 1=regular, 0=irregular, so direct map
    if "cycle_r_i" in pcos_data:
        endo_data["cycle_regular"] = pcos_data["cycle_r_i"]
    
    # Chronic pain level: if pcos_data has "pelvic_pain" (boolean), map to 0-10 scale
    # If they report pelvic pain, use moderate level (5/10), otherwise 0
    if "pelvic_pain" in pcos_data:
        endo_data["chronic_pain_level"] = 5 if pcos_data["pelvic_pain"] else 0
    else:
        endo_data["chronic_pain_level"] = 0
    
    # Infertility
    if "pregnant_y_n" in pcos_data:
        # If they have been pregnant, less likely infertile; if not pregnant and older, maybe infertile
        endo_data["infertility"] = 0 if pcos_data["pregnant_y_n"] else 1
    else:
        endo_data["infertility"] = 0
    
    # Hormone abnormality (doctor only): use hormone features if available
    if any(k in pcos_data for k in ["fsh_miu_ml", "lh_miu_ml", "amh_ng_ml", "tsh_miu_l"]):
        endo_data["hormone_level_abnormality"] = 1
    else:
        endo_data["hormone_level_abnormality"] = 0
    
    return endo_data


if __name__ == "__main__":
    main()
