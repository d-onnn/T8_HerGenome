import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('screening');
  const [showScreening, setShowScreening] = useState(true);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    weight_kg: '',
    height_cm: '',
    bmi: '',
    blood_group: '',
    cycle_r_i: '',
    cycle_length_days: '',
    marraige_status_yrs: '',
    hip_inch: '',
    waist_inch: '',
    symptoms: {
      irregular_periods: false,
      excessive_hair_growth: false,
      acne: false,
      weight_gain: false,
      infertility: false,
      pelvic_pain: false,
      fatigue: false,
      mood_changes: false,
      hair_loss: false,
      skin_darkening: false
    },
    pregnant_y_n: false,
    no_of_abortions: '',
    fast_food_y_n: false,
    reg_exercise_y_n: false,
    medicalHistory: ''
  });
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    anthropometric: false,
    cycle: false,
    lifestyle: false,
    reproductive: false,
    symptoms: true
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBackHome = () => {
    navigate('/');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateBMI = () => {
    if (formData.weight_kg && formData.height_cm) {
      const heightM = formData.height_cm / 100;
      const bmi = (formData.weight_kg / (heightM * heightM)).toFixed(2);
      setFormData(prev => ({ ...prev, bmi }));
    }
  };

  useEffect(() => {
    calculateBMI();
  }, [formData.weight_kg, formData.height_cm]);

  const handleSymptomChange = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: {
        ...prev.symptoms,
        [symptom]: !prev.symptoms[symptom]
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitScreening = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await assessmentAPI.createAssessment(formData);
      setResult(response.data.assessment);
      setShowScreening(false);
      setActiveTab('results');
    } catch (error) {
      alert('Error submitting assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewScreening = () => {
    setFormData({
      patientName: '',
      patientAge: '',
      weight_kg: '',
      height_cm: '',
      bmi: '',
      blood_group: '',
      cycle_r_i: '',
      cycle_length_days: '',
      marraige_status_yrs: '',
      hip_inch: '',
      waist_inch: '',
      symptoms: {
        irregular_periods: false,
        excessive_hair_growth: false,
        acne: false,
        weight_gain: false,
        infertility: false,
        pelvic_pain: false,
        fatigue: false,
        mood_changes: false,
        hair_loss: false,
        skin_darkening: false
      },
      pregnant_y_n: false,
      no_of_abortions: '',
      fast_food_y_n: false,
      reg_exercise_y_n: false,
      medicalHistory: ''
    });
    setResult(null);
    setShowScreening(true);
    setActiveTab('screening');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>PCOS Health Screening</h1>
          <p>Quick assessment tool for early detection</p>
        </div>
        <button onClick={handleBackHome} className="btn btn-logout">
          Back to Home
        </button>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === 'screening' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('screening');
              setShowScreening(true);
            }}
          >
            Start Screening
          </button>
          <button
            className={`nav-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!result}
          >
            My Results
          </button>
          <button
            className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Health Information
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'screening' && (
            <section className="tab-content">
              <h2>Health Screening Assessment</h2>
              {!showScreening ? (
                <div className="screening-intro">
                  <p>Complete a comprehensive health screening to assess your risk of PCOS or Endometriosis.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowScreening(true)}
                  >
                    Begin Screening
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitScreening} className="screening-form">
                  {/* Basic Information Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('basic')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Basic Information *</h3>
                      <span>{expandedSections.basic ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.basic && (
                      <>
                        <div className="form-group">
                          <label htmlFor="patientName">Full Name *</label>
                          <input
                            id="patientName"
                            type="text"
                            name="patientName"
                            value={formData.patientName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="patientAge">Age (years) *</label>
                          <input
                            id="patientAge"
                            type="number"
                            name="patientAge"
                            value={formData.patientAge}
                            onChange={handleInputChange}
                            min="18"
                            max="100"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="blood_group">Blood Group</label>
                          <select
                            id="blood_group"
                            name="blood_group"
                            value={formData.blood_group}
                            onChange={handleInputChange}
                          >
                            <option value="">Select blood group</option>
                            <option value="1">O+</option>
                            <option value="2">O-</option>
                            <option value="3">A+</option>
                            <option value="4">A-</option>
                            <option value="5">B+</option>
                            <option value="6">B-</option>
                            <option value="7">AB+</option>
                            <option value="8">AB-</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Anthropometric Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('anthropometric')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Body Measurements</h3>
                      <span>{expandedSections.anthropometric ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.anthropometric && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          <div className="form-group">
                            <label htmlFor="weight_kg">Weight (kg)</label>
                            <input
                              id="weight_kg"
                              type="number"
                              name="weight_kg"
                              value={formData.weight_kg}
                              onChange={handleInputChange}
                              step="0.1"
                              min="30"
                              max="200"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="height_cm">Height (cm)</label>
                            <input
                              id="height_cm"
                              type="number"
                              name="height_cm"
                              value={formData.height_cm}
                              onChange={handleInputChange}
                              step="0.1"
                              min="100"
                              max="220"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="bmi">BMI (auto-calculated)</label>
                            <input
                              id="bmi"
                              type="number"
                              name="bmi"
                              value={formData.bmi}
                              readOnly
                              step="0.1"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="waist_inch">Waist (inches)</label>
                            <input
                              id="waist_inch"
                              type="number"
                              name="waist_inch"
                              value={formData.waist_inch}
                              onChange={handleInputChange}
                              step="0.1"
                              min="15"
                              max="60"
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor="hip_inch">Hip (inches)</label>
                            <input
                              id="hip_inch"
                              type="number"
                              name="hip_inch"
                              value={formData.hip_inch}
                              onChange={handleInputChange}
                              step="0.1"
                              min="20"
                              max="60"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Menstrual Cycle Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('cycle')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Menstrual Cycle</h3>
                      <span>{expandedSections.cycle ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.cycle && (
                      <>
                        <div className="form-group">
                          <label>Is your cycle regular? *</label>
                          <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="cycle_r_i"
                                value="1"
                                checked={formData.cycle_r_i === '1'}
                                onChange={handleInputChange}
                                required
                              />
                              Yes, Regular
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="radio"
                                name="cycle_r_i"
                                value="0"
                                checked={formData.cycle_r_i === '0'}
                                onChange={handleInputChange}
                                required
                              />
                              No, Irregular
                            </label>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="cycle_length_days">Average Cycle Length (days)</label>
                          <input
                            id="cycle_length_days"
                            type="number"
                            name="cycle_length_days"
                            value={formData.cycle_length_days}
                            onChange={handleInputChange}
                            min="0"
                            max="90"
                            placeholder="e.g., 28"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Lifestyle Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('lifestyle')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Lifestyle & Habits</h3>
                      <span>{expandedSections.lifestyle ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.lifestyle && (
                      <>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={formData.reg_exercise_y_n}
                              onChange={(e) => setFormData(prev => ({ ...prev, reg_exercise_y_n: e.target.checked }))}
                            />
                            I exercise regularly (3+ times/week)
                          </label>
                        </div>

                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={formData.fast_food_y_n}
                              onChange={(e) => setFormData(prev => ({ ...prev, fast_food_y_n: e.target.checked }))}
                            />
                            I consume fast food frequently
                          </label>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Reproductive History Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('reproductive')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Reproductive History</h3>
                      <span>{expandedSections.reproductive ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.reproductive && (
                      <>
                        <div className="form-group">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="checkbox"
                              checked={formData.pregnant_y_n}
                              onChange={(e) => setFormData(prev => ({ ...prev, pregnant_y_n: e.target.checked }))}
                            />
                            I have been pregnant before
                          </label>
                        </div>

                        <div className="form-group">
                          <label htmlFor="no_of_abortions">Miscarriages/Abortions</label>
                          <input
                            id="no_of_abortions"
                            type="number"
                            name="no_of_abortions"
                            value={formData.no_of_abortions}
                            onChange={handleInputChange}
                            min="0"
                            max="10"
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="marraige_status_yrs">Years in Current Relationship</label>
                          <input
                            id="marraige_status_yrs"
                            type="number"
                            name="marraige_status_yrs"
                            value={formData.marraige_status_yrs}
                            onChange={handleInputChange}
                            min="0"
                            max="60"
                            step="0.5"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Symptoms Section */}
                  <div className="form-section">
                    <div 
                      className="section-header" 
                      onClick={() => toggleSection('symptoms')}
                      style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <h3>Symptoms (Check all that apply) *</h3>
                      <span>{expandedSections.symptoms ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.symptoms && (
                      <div className="symptoms-grid">
                        {Object.keys(formData.symptoms).map(symptom => (
                          <div key={symptom} className="checkbox-item">
                            <input
                              type="checkbox"
                              id={symptom}
                              checked={formData.symptoms[symptom]}
                              onChange={() => handleSymptomChange(symptom)}
                            />
                            <label htmlFor={symptom}>
                              {symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="medicalHistory">Medical History (Optional)</label>
                    <textarea
                      id="medicalHistory"
                      name="medicalHistory"
                      value={formData.medicalHistory}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Any relevant medical conditions, allergies, or previous diagnoses..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleBackHome}
                    >
                      Back to Home
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {activeTab === 'results' && (
            <section className="tab-content">
              <h2>Assessment Results</h2>
              {result ? (
                <div className="results-container">
                  <div className="result-card">
                    <h3>Risk Assessment for {result.patientName}</h3>
                    <p className="timestamp">Assessment Date: {new Date(result.timestamp).toLocaleDateString()}</p>
                    
                    {/* PCOS Risk Card */}
                    <div className="diagnosis-card pcos-card">
                      <h4>PCOS Risk Assessment</h4>
                      {result.pcos_prediction ? (
                        <>
                          <div className="risk-score">
                            <span className="score-label">Risk Probability:</span>
                            <span className={`score-value ${result.pcos_prediction.risk_band === 'High' || result.pcos_prediction.risk_band === 'Very High' ? 'high' : result.pcos_prediction.risk_band === 'Moderate' ? 'moderate' : 'low'}`}>
                              {(result.pcos_prediction.probability * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className={`risk-band band-${result.pcos_prediction.risk_band.toLowerCase()}`}>
                            {result.pcos_prediction.risk_band} Risk
                          </div>
                          <p className="risk-message">{result.pcos_prediction.message}</p>
                          {result.pcos_prediction.top_contributors && result.pcos_prediction.top_contributors.length > 0 && (
                            <div className="contributors">
                              <h5>Top Contributing Factors:</h5>
                              <ul>
                                {result.pcos_prediction.top_contributors.map((factor, idx) => (
                                  <li key={idx}>
                                    <strong>{factor.feature.replace(/_/g, ' ')}</strong>
                                    {factor.contribution_pct && ` (+${factor.contribution_pct}%)`}
                                    {factor.direction && ` - ${factor.direction}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>Risk score: {result.riskScore}%</p>
                      )}
                    </div>

                    {/* Endometriosis Risk Card */}
                    {result.endo_prediction && (
                      <div className="diagnosis-card endo-card">
                        <h4>Endometriosis Risk Assessment</h4>
                        <div className="risk-score">
                          <span className="score-label">Risk Probability:</span>
                          <span className={`score-value ${result.endo_prediction.risk_band === 'High' || result.endo_prediction.risk_band === 'Very High' ? 'high' : result.endo_prediction.risk_band === 'Moderate' ? 'moderate' : 'low'}`}>
                            {(result.endo_prediction.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className={`risk-band band-${result.endo_prediction.risk_band.toLowerCase()}`}>
                          {result.endo_prediction.risk_band} Risk
                        </div>
                        <p className="risk-message">{result.endo_prediction.message}</p>
                        {result.endo_prediction.top_contributors && result.endo_prediction.top_contributors.length > 0 && (
                          <div className="contributors">
                            <h5>Top Contributing Factors:</h5>
                            <ul>
                              {result.endo_prediction.top_contributors.map((factor, idx) => (
                                <li key={idx}>
                                  <strong>{factor.feature.replace(/_/g, ' ')}</strong>
                                  {factor.contribution_pct && ` (+${factor.contribution_pct}%)`}
                                  {factor.direction && ` - ${factor.direction}`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="results-note">
                      <p>
                        <strong>Disclaimer:</strong> These assessments are for educational purposes only and are not a substitute for professional medical advice. 
                        Please consult with a healthcare provider for proper diagnosis and treatment.
                      </p>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={handleNewScreening}
                      style={{ marginTop: '20px' }}
                    >
                      Take Another Assessment
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>No assessment results yet. Complete a screening to get your risk assessment.</p>
                </div>
              )}
            </section>
          )}

          {activeTab === 'info' && (
            <section className="tab-content">
              <h2>Health Information</h2>
              <div className="info-content">
                <h3>PCOS vs Endometriosis</h3>
                <p>
                  Both PCOS and Endometriosis are common gynecological conditions that can affect fertility and quality of life.
                  Early detection and proper diagnosis are crucial for treatment and management.
                </p>
                <h4>PCOS Characteristics:</h4>
                <ul>
                  <li>Irregular menstrual periods</li>
                  <li>Excessive hair growth (hirsutism)</li>
                  <li>Severe acne</li>
                  <li>Difficulty maintaining weight</li>
                  <li>Infertility or miscarriage</li>
                </ul>
                <h4>Endometriosis Characteristics:</h4>
                <ul>
                  <li>Severe menstrual cramps</li>
                  <li>Chronic pelvic pain</li>
                  <li>Heavy or abnormal bleeding</li>
                  <li>Infertility</li>
                  <li>Fatigue and low energy</li>
                </ul>
                <p className="info-note">
                  <strong>Note:</strong> This screening tool is for educational purposes only and not a substitute for professional medical advice.
                  Please consult with a healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}