const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Mock database for users
const users = {
  'doctor1': { id: 1, password: 'password123', role: 'doctor', name: 'Dr. Smith' },
  'patient1': { id: 2, password: 'password123', role: 'patient', name: 'Jane Doe' }
};

// Mock patient assessments storage
const assessments = {};
let assessmentCounter = 1;

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
app.post('/api/assessments', (req, res) => {
  const { patientName, patientAge, symptoms, medicalHistory } = req.body;

  if (!patientName || !symptoms) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const assessment = {
    id: assessmentCounter++,
    patientName,
    patientAge,
    symptoms,
    medicalHistory,
    riskScore: calculateRiskScore(symptoms),
    timestamp: new Date().toISOString()
  };

  assessments[assessment.id] = assessment;

  res.json({
    success: true,
    assessment
  });
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
app.post('/api/diagnosis/compare', (req, res) => {
  const { symptoms, medicalHistory } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: 'Symptoms required' });
  }

  const pcosProbability = calculatePCOSRisk(symptoms);
  const endometriesisProbability = calculateEndometriosisRisk(symptoms);

  res.json({
    pcos: {
      probability: pcosProbability,
      characteristics: getPCOSCharacteristics(symptoms)
    },
    endometriosis: {
      probability: endometriesisProbability,
      characteristics: getEndometriosisCharacteristics(symptoms)
    },
    recommendation: getRecommendation(pcosProbability, endometriesisProbability)
  });
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