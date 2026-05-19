# PCOS Model Features Mapping

## Patient Model Features (19 features)

These are self-reportable features that patients can provide during a screening:

| Feature | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| age_yrs | Numeric | 12-80 | 32 | Age in years |
| weight_kg | Numeric | 30-200 | 60 | Body weight in kg |
| height_cm | Numeric | 100-220 | 159 | Height in cm |
| bmi | Numeric | 12-60 | 23.5 | Body Mass Index |
| blood_group | Numeric | 0-20 | 11 | Blood group code |
| cycle_r_i | Boolean | 0-1 | 0 | Cycle regularity (1=regular, 0=irregular) |
| cycle_length_days | Numeric | 0-90 | 5 | Typical cycle length in days |
| marraige_status_yrs | Numeric | 0-60 | 7 | Years of marriage/relationship |
| pregnant_y_n | Boolean | 0-1 | 0 | Ever been pregnant (1=yes, 0=no) |
| no_of_abortions | Numeric | 0-10 | 0 | Number of miscarriages/abortions |
| hip_inch | Numeric | 20-60 | 40 | Hip circumference in inches |
| waist_inch | Numeric | 15-60 | 35 | Waist circumference in inches |
| weight_gain_y_n | Boolean | 0-1 | 0 | Unexplained weight gain (1=yes, 0=no) |
| hair_growth_y_n | Boolean | 0-1 | 0 | Excessive hair growth (1=yes, 0=no) |
| skin_darkening_y_n | Boolean | 0-1 | 0 | Skin darkening/acanthosis nigricans (1=yes, 0=no) |
| hair_loss_y_n | Boolean | 0-1 | 0 | Hair loss (1=yes, 0=no) |
| pimples_y_n | Boolean | 0-1 | 0 | Acne/pimples (1=yes, 0=no) |
| fast_food_y_n | Boolean | 0-1 | 0 | Frequent fast food consumption (1=yes, 0=no) |
| reg_exercise_y_n | Boolean | 0-1 | 0 | Regular exercise (1=yes, 0=no) |

## Doctor Model Features (~43 features)

Includes all 19 patient features plus clinical/lab features:

### Additional Doctor-Only Features

| Feature | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| i_beta_hcg_miu_ml | Numeric | 0-10000 | 1.99 | First beta-hCG test result (mIU/mL) |
| ii_beta_hcg_miu_ml | Numeric | 0-10000 | 1.99 | Second beta-hCG test result (mIU/mL) |
| fsh_miu_ml | Numeric | 0-50 | 5.0 | FSH level (mIU/mL) |
| lh_miu_ml | Numeric | 0-100 | 2.0 | LH level (mIU/mL) |
| fsh_lh | Numeric | 0-50 | 2.5 | FSH/LH ratio |
| tsh_miu_l | Numeric | 0-50 | 2.5 | TSH level (mIU/L) |
| amh_ng_ml | Numeric | 0-20 | 2.5 | AMH level (ng/mL) |
| prl_ng_ml | Numeric | 0-200 | 20.0 | Prolactin level (ng/mL) |
| vit_d3_ng_ml | Numeric | 0-200 | 30.0 | Vitamin D3 level (ng/mL) |
| prg_ng_ml | Numeric | 0-200 | 0.5 | Progesterone level (ng/mL) |
| rbs_mg_dl | Numeric | 40-500 | 95 | Random blood sugar (mg/dL) |
| hb_g_dl | Numeric | 5-20 | 11.0 | Hemoglobin (g/dL) |
| pulse_rate_bpm | Numeric | 40-150 | 72 | Heart rate (bpm) |
| rr_breaths_min | Numeric | 10-40 | 18 | Respiratory rate (breaths/min) |
| bp_systolic_mmhg | Numeric | 50-200 | 120 | Systolic blood pressure (mmHg) |
| bp_diastolic_mmhg | Numeric | 30-150 | 80 | Diastolic blood pressure (mmHg) |
| follicle_no_l | Numeric | 0-50 | 5 | Number of follicles on left ovary (ultrasound) |
| follicle_no_r | Numeric | 0-50 | 5 | Number of follicles on right ovary (ultrasound) |
| avg_f_size_l_mm | Numeric | 0-40 | 15 | Average follicle size left (mm) |
| avg_f_size_r_mm | Numeric | 0-40 | 15 | Average follicle size right (mm) |
| endometrium_mm | Numeric | 0-20 | 8 | Endometrium thickness (mm) |

## Model Outputs

### Risk Band Classification

- **Low**: Probability < 0.20
  - Message: "Low estimated PCOS risk. Continue routine monitoring and discuss symptoms with a clinician if needed."
  
- **Moderate**: Probability 0.20-0.50
  - Message: "Moderate estimated PCOS risk. Consider a clinical review if symptoms such as irregular cycles, acne, or weight changes are present."
  
- **High**: Probability 0.50-0.80
  - Message: "High estimated PCOS risk. A clinical evaluation is recommended."
  
- **Very High**: Probability ≥ 0.80
  - Message: "Very high estimated PCOS risk. Please arrange prompt medical follow-up for formal assessment."

### Top Contributors

The prediction includes the top 3 most important features influencing the prediction:
- Feature name
- Value provided
- Importance/SHAP value
- Direction (increases/decreases risk)

## API Response Format

```json
{
  "probability": 0.75,
  "risk_band": "High",
  "message": "...",
  "used_features": {
    "age_yrs": 32,
    "bmi": 24.5,
    ...
  },
  "top_contributors": [
    {
      "feature": "weight_gain_y_n",
      "value": 1,
      "importance": 0.15,
      "direction": "increases risk"
    },
    ...
  ],
  "model_type": "patient",
  "model_version": "1.0",
  "trained_date": "2026-05-19T..."
}
```

## Missing Field Handling

If a patient doesn't provide a value for a feature, the system uses:
1. **For numeric features**: Median value from training dataset
2. **For boolean features**: 0 (false)

This prevents missing values from causing false negatives.

## Feature Mapping: Patient Form → Model Features

### Existing 8-Symptom Form → Patient Model Mapping

| Form Field | Model Features | Notes |
|------------|-----------------|-------|
| Patient Age | age_yrs | Direct mapping |
| Patient Name | (not used) | For record keeping only |
| Irregular periods | cycle_r_i | 1=regular, 0=irregular |
| Excessive hair growth | hair_growth_y_n | 1=yes, 0=no |
| Acne | pimples_y_n | 1=yes, 0=no |
| Weight gain | weight_gain_y_n | 1=yes, 0=no |
| Infertility | (derived) | If no children + age >28: 1, else 0 |
| Pelvic pain | (not directly used) | Used for endometriosis model |
| Fatigue | (not directly used) | No direct model feature |
| Mood changes | (not directly used) | No direct model feature |
| Medical History | (text notes) | Not directly used by model |

### Extended Form Fields (Recommended)

To provide better predictions, extend the form to capture:
1. **Anthropometric**: weight (kg), height (cm), waist (inches), hip (inches)
2. **Cycle Details**: cycle regularity (yes/no), cycle length (days)
3. **Reproductive**: marriage duration (years), pregnancies, miscarriages
4. **Lifestyle**: regular exercise (yes/no), fast food consumption (yes/no)
5. **Symptoms**: hair loss (yes/no), skin darkening (yes/no)
6. **Blood Group**: optional, improves accuracy

### Optional Doctor Fields

For doctor assessments, include (if available):
- Hormone levels: FSH, LH, AMH, TSH, hCG, Prolactin
- Metabolic: Blood glucose, Vitamin D
- Clinical: Blood pressure, Heart rate
- Ultrasound: Follicle count, follicle size, endometrium thickness
