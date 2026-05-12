import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('screening');
  const [showScreening, setShowScreening] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    symptoms: {
      irregular_periods: false,
      excessive_hair_growth: false,
      acne: false,
      weight_gain: false,
      infertility: false,
      pelvic_pain: false,
      fatigue: false,
      mood_changes: false
    },
    medicalHistory: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

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

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Patient Dashboard</h1>
          <p>Welcome, {user.name || 'Patient'}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
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
                    <label htmlFor="patientAge">Age *</label>
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
                    <label>Symptoms (Check all that apply)</label>
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
                      onClick={() => setShowScreening(false)}
                    >
                      Cancel
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
                    <div className="risk-score">
                      <span className="score-label">Risk Score:</span>
                      <span className={`score-value ${result.riskScore > 60 ? 'high' : result.riskScore > 40 ? 'moderate' : 'low'}`}>
                        {result.riskScore}%
                      </span>
                    </div>
                    <div className="risk-level">
                      <p className={`level-${result.riskScore > 60 ? 'high' : result.riskScore > 40 ? 'moderate' : 'low'}`}>
                        {result.riskScore > 60
                          ? 'HIGH RISK - Immediate medical consultation recommended'
                          : result.riskScore > 40
                          ? 'MODERATE RISK - Schedule consultation with gynecologist'
                          : 'LOW RISK - Continue health monitoring'}
                      </p>
                    </div>
                    <p className="timestamp">Assessment Date: {new Date(result.timestamp).toLocaleDateString()}</p>
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