const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Path to Python prediction service
const PREDICTION_SERVICE_PATH = path.join(__dirname, 'models', 'prediction_service.py');

// Mock database for users
const users = {
  'doctor1': { id: 1, password: 'password123', role: 'doctor', name: 'Dr. Smith' },
  'patient1': { id: 2, password: 'password123', role: 'patient', name: 'Jane Doe' }
};

// Mock patient assessments storage
const assessments = {};
let assessmentCounter = 1;

// ===== PYTHON PREDICTION SERVICE =====
/**
 * Call Python prediction service via subprocess
 * @param {Object} patientData - Patient data object with feature values
 * @param {String} modelType - 'patient' or 'doctor'
 * @returns {Promise<Object>} - Prediction results or fallback
 */
async function runPredictions(patientData, modelType = 'patient') {
  return new Promise((resolve) => {
    const requestData = {
      model: 'both',  // Run both PCOS and endometriosis predictions
      model_type: modelType,  // 'patient' or 'doctor'
      data: patientData
    };

    // Spawn Python process
    const python = spawn('python', [PREDICTION_SERVICE_PATH], {
      cwd: path.join(__dirname, 'models'),
      timeout: 15000  // 15 second timeout
    });

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      try {
        if (code === 0 && output) {
          const result = JSON.parse(output);
          if (result.success) {
            resolve(result);
          } else {
            console.warn('Prediction service error:', result.error);
            resolve(null);
          }
        } else {
          console.warn('Python process exited with code', code);
          if (errorOutput) console.warn('Python stderr:', errorOutput);
          resolve(null);
        }
      } catch (err) {
        console.warn('Failed to parse prediction output:', err.message);
        resolve(null);
      }
    });

    python.on('error', (err) => {
      console.warn('Failed to start Python process:', err.message);
      resolve(null);
    });

    // Send request to Python process
    python.stdin.write(JSON.stringify(requestData));
    python.stdin.end();
  });
}

// ===== ASSESSMENT CREATION HELPER =====
/**
 * Build patient data object for model prediction
 * Maps form data to model feature names
 */
function buildPatientDataForModel(formData) {
  const patientData = {};

  // Direct mappings
  const mappings = {
    patientAge: 'age_yrs',
    weight_kg: 'weight_kg',
    height_cm: 'height_cm',
    bmi: 'bmi',
    blood_group: 'blood_group',
    cycle_r_i: 'cycle_r_i',
    cycle_length_days: 'cycle_length_days',
    marraige_status_yrs: 'marraige_status_yrs',
    hip_inch: 'hip_inch',
    waist_inch: 'waist_inch',
    pregnant_y_n: 'pregnant_y_n',
    no_of_abortions: 'no_of_abortions',
    fast_food_y_n: 'fast_food_y_n',
    reg_exercise_y_n: 'reg_exercise_y_n'
  };

  Object.entries(mappings).forEach(([formKey, modelKey]) => {
    if (formData[formKey] !== undefined && formData[formKey] !== '') {
      patientData[modelKey] = formData[formKey];
    }
  });

  // Handle symptoms - map to binary features
  if (formData.symptoms) {
    Object.entries(formData.symptoms).forEach(([symptom, value]) => {
      if (symptom === 'excessive_hair_growth') {
        patientData.hair_growth_y_n = value ? 1 : 0;
      } else if (symptom === 'acne') {
        patientData.pimples_y_n = value ? 1 : 0;
      } else if (symptom === 'weight_gain') {
        patientData.weight_gain_y_n = value ? 1 : 0;
      } else if (symptom === 'skin_darkening') {
        patientData.skin_darkening_y_n = value ? 1 : 0;
      } else if (symptom === 'hair_loss') {
        patientData.hair_loss_y_n = value ? 1 : 0;
      }
    });
  }

  return patientData;
}

// ===== AUTHENTICATION ROUTES =====
app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const user = users[username];

  if (!user || user.password !== password || user.role !== role) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In production, use JWT tokens
  res.json({
    success: true,
    user: {
      id: user.id,
      username,
      role: user.role,
      name: user.name
    },
    token: `${username}-token-${Date.now()}`
  });
});

// ===== ASSESSMENT ROUTES =====

// Get all assessments (for doctor dashboard)
app.get('/api/assessments', (req, res) => {
  const allAssessments = Object.values(assessments);
  res.json(allAssessments);
});

// Get single assessment by ID
app.get('/api/assessments/:id', (req, res) => {
  const assessment = assessments[req.params.id];
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  res.json(assessment);
});

// Create new assessment
app.post('/api/assessments', async (req, res) => {
  const { patientName, patientAge, symptoms, medicalHistory, weight_kg, height_cm, bmi, blood_group, cycle_r_i, cycle_length_days, marraige_status_yrs, hip_inch, waist_inch, pregnant_y_n, no_of_abortions, fast_food_y_n, reg_exercise_y_n } = req.body;

  if (!patientName || !symptoms) {
    return res.status(400).json({ error: 'Missing required fields: patientName and symptoms' });
  }

  try {
    // Build patient data for model prediction
    const patientData = buildPatientDataForModel({
      patientAge,
      weight_kg,
      height_cm,
      bmi,
      blood_group,
      cycle_r_i,
      cycle_length_days,
      marraige_status_yrs,
      hip_inch,
      waist_inch,
      pregnant_y_n,
      no_of_abortions,
      fast_food_y_n,
      reg_exercise_y_n,
      symptoms
    });

    // Run ML predictions
    const predictions = await runPredictions(patientData, 'patient');

    // Create assessment object
    const assessment = {
      id: assessmentCounter++,
      patientName,
      patientAge,
      symptoms,
      medicalHistory,
      weight_kg,
      height_cm,
      bmi,
      blood_group,
      cycle_r_i,
      cycle_length_days,
      marraige_status_yrs,
      hip_inch,
      waist_inch,
      pregnant_y_n,
      no_of_abortions,
      fast_food_y_n,
      reg_exercise_y_n,
      doctor_feedback: null,
      doctor_notes: null,
      // Keep legacy riskScore for backward compatibility
      riskScore: predictions?.pcos?.probability 
        ? Math.round(predictions.pcos.probability * 100) 
        : calculateRiskScore(symptoms),
      // Add model predictions
      pcos_prediction: predictions?.pcos || null,
      endo_prediction: predictions?.endo || null,
      overlapScore: computeOverlapScore(
        predictions?.pcos?.probability ?? null,
        predictions?.endo?.probability ?? null,
        symptoms
      ),
      timestamp: new Date().toISOString()
    };

    assessments[assessment.id] = assessment;

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error processing assessment:', error);
    // Fallback to basic scoring if prediction fails
    const pcosProbability = calculatePCOSRisk(symptoms) / 100;
    const endometriosisProbability = calculateEndometriosisRisk(symptoms) / 100;
    const assessment = {
      id: assessmentCounter++,
      patientName,
      patientAge,
      symptoms,
      medicalHistory,
      doctor_feedback: null,
      doctor_notes: null,
      riskScore: calculateRiskScore(symptoms),
      pcos_prediction: {
        probability: pcosProbability,
        risk_band: 'Unknown'
      },
      endo_prediction: {
        probability: endometriosisProbability,
        risk_band: 'Unknown'
      },
      overlapScore: computeOverlapScore(pcosProbability, endometriosisProbability, symptoms),
      timestamp: new Date().toISOString()
    };

    assessments[assessment.id] = assessment;

    res.json({
      success: true,
      assessment,
      warning: 'Used fallback scoring - advanced models unavailable'
    });
  }
});

// Update assessment
app.put('/api/assessments/:id', (req, res) => {
  if (!assessments[req.params.id]) {
    return res.status(404).json({ error: 'Assessment not found' });
  }

  const updated = { ...assessments[req.params.id], ...req.body };
  updated.riskScore = calculateRiskScore(updated.symptoms);
  assessments[req.params.id] = updated;

  res.json({
    success: true,
    assessment: updated
  });
});

// ===== RISK SCORE CALCULATION =====
function calculateRiskScore(symptoms) {
  if (!symptoms) return 0;

  const symptomWeights = {
    irregular_periods: 0.25,
    excessive_hair_growth: 0.20,
    acne: 0.15,
    weight_gain: 0.20,
    infertility: 0.30,
    pelvic_pain: 0.15,
    fatigue: 0.10,
    mood_changes: 0.12
  };

  let totalScore = 0;
  let presentSymptoms = 0;

  Object.keys(symptoms).forEach(symptom => {
    if (symptoms[symptom]) {
      const weight = symptomWeights[symptom] || 0.1;
      totalScore += weight * 100;
      presentSymptoms++;
    }
  });

  // Normalize score to 0-100
  const riskScore = Math.min(totalScore / 2, 100);

  return Math.round(riskScore * 10) / 10;
}

// ===== DIAGNOSIS COMPARISON =====
app.post('/api/diagnosis/compare', async (req, res) => {
  const { symptoms, medicalHistory, patientAge, weight_kg, height_cm, bmi, blood_group, cycle_r_i, cycle_length_days, marraige_status_yrs, hip_inch, waist_inch, pregnant_y_n, no_of_abortions, fast_food_y_n, reg_exercise_y_n } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms required' });
  }

  try {
    // Build patient data for model prediction
    const patientData = buildPatientDataForModel({
      patientAge,
      weight_kg,
      height_cm,
      bmi,
      blood_group,
      cycle_r_i,
      cycle_length_days,
      marraige_status_yrs,
      hip_inch,
      waist_inch,
      pregnant_y_n,
      no_of_abortions,
      fast_food_y_n,
      reg_exercise_y_n,
      symptoms
    });

    // Run ML predictions
    const predictions = await runPredictions(patientData, 'patient');

    if (predictions && predictions.success) {
      const pcosProb = predictions.pcos?.probability || calculatePCOSRisk(symptoms) / 100;
      const endoProb = predictions.endo?.probability || calculateEndometriosisRisk(symptoms) / 100;

      res.json({
        pcos: {
          probability: pcosProb,
          risk_band: predictions.pcos?.risk_band || 'Unknown',
          message: predictions.pcos?.message || '',
          top_contributors: predictions.pcos?.top_contributors || [],
          characteristics: getPCOSCharacteristics(symptoms)
        },
        endometriosis: {
          probability: endoProb,
          risk_band: predictions.endo?.risk_band || 'Unknown',
          message: predictions.endo?.message || '',
          top_contributors: predictions.endo?.top_contributors || [],
          characteristics: getEndometriosisCharacteristics(symptoms)
        },
        overlap_score: computeOverlapScore(pcosProb, endoProb, symptoms),
        recommendation: getRecommendation(pcosProb * 100, endoProb * 100)
      });
    } else {
      // Fallback to legacy calculation
      const pcosProbability = calculatePCOSRisk(symptoms);
      const endometriesisProbability = calculateEndometriosisRisk(symptoms);

      res.json({
        pcos: {
          probability: pcosProbability / 100,
          risk_band: 'Unknown',
          characteristics: getPCOSCharacteristics(symptoms)
        },
        endometriosis: {
          probability: endometriesisProbability / 100,
          risk_band: 'Unknown',
          characteristics: getEndometriosisCharacteristics(symptoms)
        },
        overlap_score: computeOverlapScore(pcosProbability / 100, endometriesisProbability / 100, symptoms),
        recommendation: getRecommendation(pcosProbability, endometriesisProbability),
        warning: 'Using fallback scoring - advanced models unavailable'
      });
    }
  } catch (error) {
    console.error('Error in diagnosis comparison:', error);
    // Fallback to legacy calculation
    const pcosProbability = calculatePCOSRisk(symptoms);
    const endometriesisProbability = calculateEndometriosisRisk(symptoms);

    res.json({
      pcos: {
        probability: pcosProbability / 100,
        risk_band: 'Unknown',
        characteristics: getPCOSCharacteristics(symptoms)
      },
      endometriosis: {
        probability: endometriesisProbability / 100,
        risk_band: 'Unknown',
        characteristics: getEndometriosisCharacteristics(symptoms)
      },
      overlap_score: computeOverlapScore(pcosProbability / 100, endometriesisProbability / 100, symptoms),
      recommendation: getRecommendation(pcosProbability, endometriesisProbability),
      error: 'Fallback mode - advanced models unavailable'
    });
  }
});

function calculatePCOSRisk(symptoms) {
  const pcosSymptoms = [
    'irregular_periods',
    'excessive_hair_growth',
    'acne',
    'weight_gain',
    'infertility'
  ];

  const matchingSymptoms = pcosSymptoms.filter(s => symptoms[s]).length;
  return (matchingSymptoms / pcosSymptoms.length) * 100;
}

function calculateEndometriosisRisk(symptoms) {
  const endoSymptoms = [
    'pelvic_pain',
    'irregular_periods',
    'infertility',
    'fatigue'
  ];

  const matchingSymptoms = endoSymptoms.filter(s => symptoms[s]).length;
  return (matchingSymptoms / endoSymptoms.length) * 100;
}

function computeOverlapScore(pcosProbability, endoProbability, symptoms) {
  if (pcosProbability == null || endoProbability == null) {
    if (!symptoms) return null;
    pcosProbability = calculatePCOSRisk(symptoms) / 100;
    endoProbability = calculateEndometriosisRisk(symptoms) / 100;
  }

  const overlap = ((pcosProbability || 0) + (endoProbability || 0)) / 2;
  return Math.round(Math.min(Math.max(overlap, 0), 1) * 100);
}

function getPCOSCharacteristics(symptoms) {
  const characteristics = [];
  if (symptoms.irregular_periods) characteristics.push('Irregular menstrual cycles');
  if (symptoms.excessive_hair_growth) characteristics.push('Hirsutism (excessive hair growth)');
  if (symptoms.acne) characteristics.push('Severe acne');
  if (symptoms.weight_gain) characteristics.push('Weight gain difficulty');
  if (symptoms.infertility) characteristics.push('Infertility issues');
  return characteristics;
}

function getEndometriosisCharacteristics(symptoms) {
  const characteristics = [];
  if (symptoms.pelvic_pain) characteristics.push('Chronic pelvic pain');
  if (symptoms.irregular_periods) characteristics.push('Abnormal bleeding');
  if (symptoms.infertility) characteristics.push('Infertility');
  if (symptoms.fatigue) characteristics.push('Chronic fatigue');
  return characteristics;
}

function getRecommendation(pcos, endo) {
  if (pcos > 60 || endo > 60) {
    return 'High-risk. Immediate medical consultation recommended.';
  } else if (pcos > 40 || endo > 40) {
    return 'Moderate-risk. Schedule consultation with gynecologist.';
  } else {
    return 'Low-risk. Continue health monitoring and annual check-ups.';
  }
}

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});