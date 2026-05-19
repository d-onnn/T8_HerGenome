import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentAPI } from '../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [diagnosisComparison, setDiagnosisComparison] = useState(null);
  const [doctorFeedback, setDoctorFeedback] = useState('Assessment aligns with clinical impression');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('patients');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getAllAssessments();
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      alert('Error loading patient assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAssessment = async (assessment) => {
    setSelectedAssessment(assessment);
    setDoctorFeedback(assessment.doctor_feedback || 'Assessment aligns with clinical impression');
    setDoctorNotes(assessment.doctor_notes || '');
    setFeedbackMessage('');
    setActiveTab('analysis');

    try {
      const response = await assessmentAPI.compareDiagnosis(
        assessment.symptoms,
        assessment.medicalHistory
      );
      setDiagnosisComparison(response.data);
    } catch (error) {
      console.error('Error getting diagnosis comparison:', error);
    }
  };

  const handleSaveDoctorFeedback = async () => {
    if (!selectedAssessment) return;
    try {
      setSavingFeedback(true);
      const updatedPayload = {
        doctor_feedback: doctorFeedback,
        doctor_notes: doctorNotes
      };
      const response = await assessmentAPI.updateAssessment(selectedAssessment.id, updatedPayload);
      const updatedAssessment = response.data.assessment;
      setSelectedAssessment(updatedAssessment);
      setAssessments((prev) => prev.map((item) => item.id === updatedAssessment.id ? updatedAssessment : item));
      setFeedbackMessage('Feedback saved successfully.');
    } catch (error) {
      console.error('Error saving doctor feedback:', error);
      setFeedbackMessage('Unable to save feedback. Please try again.');
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getRiskColor = (score) => {
    if (score > 60) return '#d32f2f';
    if (score > 40) return '#f57c00';
    return '#388e3c';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Doctor Dashboard</h1>
          <p>Welcome, {user.name || 'Doctor'}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button
            className={`nav-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            Patient List
          </button>
          <button
            className={`nav-btn ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
            disabled={!selectedAssessment}
          >
            Clinical Analysis
          </button>
          <button
            className={`nav-btn ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            Clinical Guidelines
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'patients' && (
            <section className="tab-content">
              <h2>Patient Assessments</h2>
              {loading ? (
                <div className="loading">Loading patient data...</div>
              ) : assessments.length === 0 ? (
                <div className="empty-state">
                  <p>No patient assessments available</p>
                </div>
              ) : (
                <div className="assessments-grid">
                  {assessments.map(assessment => (
                    <div key={assessment.id} className="assessment-card">
                      <div className="card-header">
                        <h3>{assessment.patientName}</h3>
                        <span className="age-badge">Age: {assessment.patientAge}</span>
                      </div>
                      <div className="card-body">
                        <div className="score-display">
                          <div className="score-circle" style={{ borderColor: getRiskColor(assessment.overlapScore ?? assessment.riskScore) }}>
                            <span className="score-number" style={{ color: getRiskColor(assessment.overlapScore ?? assessment.riskScore) }}>
                              {(assessment.overlapScore ?? assessment.riskScore)}%
                            </span>
                          </div>
                          <div className="score-info">
                            <p className="score-label">Overlap Score</p>
                            <p className="score-status">
                              {(assessment.overlapScore ?? assessment.riskScore) > 60
                                ? 'HIGH OVERLAP'
                                : (assessment.overlapScore ?? assessment.riskScore) > 40
                                ? 'MODERATE OVERLAP'
                                : 'LOW OVERLAP'}
                            </p>
                          </div>
                        </div>
                        <p className="assessment-date">
                          {new Date(assessment.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="card-footer">
                        <button
                          onClick={() => handleSelectAssessment(assessment)}
                          className="btn btn-secondary"
                        >
                          View Analysis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'analysis' && selectedAssessment && (
            <section className="tab-content">
              <h2>Clinical Analysis - {selectedAssessment.patientName}</h2>
              <div className="analysis-container">
                <div className="patient-info-card">
                  <h3>Patient Information</h3>
                  <p><strong>Name:</strong> {selectedAssessment.patientName}</p>
                  <p><strong>Age:</strong> {selectedAssessment.patientAge}</p>
                  <p><strong>Assessment Date:</strong> {new Date(selectedAssessment.timestamp).toLocaleDateString()}</p>
                  {selectedAssessment.medicalHistory && (
                    <p><strong>Medical History:</strong> {selectedAssessment.medicalHistory}</p>
                  )}
                  {selectedAssessment.doctor_feedback && (
                    <p><strong>Doctor Feedback:</strong> {selectedAssessment.doctor_feedback}</p>
                  )}
                  {selectedAssessment.doctor_notes && (
                    <p><strong>Doctor Notes:</strong> {selectedAssessment.doctor_notes}</p>
                  )}
                </div>

                {diagnosisComparison && (
                  <div className="diagnosis-comparison">
                    <h3>Diagnosis Probability Comparison</h3>
                    <div className="comparison-grid">
                      <div className="condition-card pcos">
                        <h4>PCOS Probability</h4>
                        <div className="probability-bar">
                          <div
                            className="probability-fill"
                            style={{ width: `${diagnosisComparison.pcos.probability * 100}%` }}
                          ></div>
                        </div>
                        <span className="probability-value">
                          {(diagnosisComparison.pcos.probability * 100).toFixed(1)}%
                        </span>
                        {diagnosisComparison.pcos.risk_band && (
                          <div className="risk-band-label" style={{ marginTop: '8px', fontWeight: 'bold' }}>
                            {diagnosisComparison.pcos.risk_band} Risk
                          </div>
                        )}
                        {diagnosisComparison.pcos.message && (
                          <p className="risk-message" style={{ fontSize: '0.9em', marginTop: '8px', fontStyle: 'italic' }}>
                            {diagnosisComparison.pcos.message}
                          </p>
                        )}
                        {diagnosisComparison.pcos.top_contributors && diagnosisComparison.pcos.top_contributors.length > 0 ? (
                          <>
                            <h5 style={{ marginTop: '12px' }}>Top Contributing Factors:</h5>
                            <ul>
                              {diagnosisComparison.pcos.top_contributors.map((factor, idx) => (
                                <li key={idx}>
                                  <strong>{factor.feature.replace(/_/g, ' ')}</strong>
                                  {factor.contribution_pct && ` (+${factor.contribution_pct}%)`}
                                  {factor.direction && ` — ${factor.direction}`}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <>
                            <h5 style={{ marginTop: '12px' }}>Key Characteristics:</h5>
                            <ul>
                              {diagnosisComparison.pcos.characteristics.map((char, idx) => (
                                <li key={idx}>{char}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="condition-card endometriosis">
                        <h4>Endometriosis Probability</h4>
                        <div className="probability-bar">
                          <div
                            className="probability-fill"
                            style={{ width: `${diagnosisComparison.endometriosis.probability * 100}%` }}
                          ></div>
                        </div>
                        <span className="probability-value">
                          {(diagnosisComparison.endometriosis.probability * 100).toFixed(1)}%
                        </span>
                        {diagnosisComparison.endometriosis.risk_band && (
                          <div className="risk-band-label" style={{ marginTop: '8px', fontWeight: 'bold' }}>
                            {diagnosisComparison.endometriosis.risk_band} Risk
                          </div>
                        )}
                        {diagnosisComparison.endometriosis.message && (
                          <p className="risk-message" style={{ fontSize: '0.9em', marginTop: '8px', fontStyle: 'italic' }}>
                            {diagnosisComparison.endometriosis.message}
                          </p>
                        )}
                        {diagnosisComparison.endometriosis.top_contributors && diagnosisComparison.endometriosis.top_contributors.length > 0 ? (
                          <>
                            <h5 style={{ marginTop: '12px' }}>Top Contributing Factors:</h5>
                            <ul>
                              {diagnosisComparison.endometriosis.top_contributors.map((factor, idx) => (
                                <li key={idx}>
                                  <strong>{factor.feature.replace(/_/g, ' ')}</strong>
                                  {factor.contribution_pct && ` (+${factor.contribution_pct}%)`}
                                  {factor.direction && ` — ${factor.direction}`}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <>
                            <h5 style={{ marginTop: '12px' }}>Key Characteristics:</h5>
                            <ul>
                              {diagnosisComparison.endometriosis.characteristics.map((char, idx) => (
                                <li key={idx}>{char}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="recommendation-box">
                      <h4>Clinical Recommendation</h4>
                      <p>{diagnosisComparison.recommendation}</p>
                    </div>

                    <div className="doctor-feedback-card">
                      <h4>Doctor Feedback</h4>
                      <p>If the model output does not match your clinical impression, select the best option and add notes.</p>
                      <div className="feedback-options">
                        {[
                          'Assessment aligns with clinical impression',
                          'Greater likelihood of PCOS',
                          'Greater likelihood of Endometriosis',
                          'Additional evaluation required'
                        ].map((option) => (
                          <label key={option} className="feedback-option">
                            <input
                              type="radio"
                              name="doctorFeedback"
                              value={option}
                              checked={doctorFeedback === option}
                              onChange={(e) => setDoctorFeedback(e.target.value)}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      <div className="form-group">
                        <label htmlFor="doctorNotes">Additional notes (optional)</label>
                        <textarea
                          id="doctorNotes"
                          rows="4"
                          value={doctorNotes}
                          onChange={(e) => setDoctorNotes(e.target.value)}
                          placeholder="Add clinical context or refinement notes for future model training"
                        ></textarea>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveDoctorFeedback}
                        disabled={savingFeedback}
                      >
                        {savingFeedback ? 'Saving...' : 'Save Feedback'}
                      </button>
                      {feedbackMessage && <p className="feedback-status">{feedbackMessage}</p>}
                    </div>
                  </div>
                )}

                <div className="symptoms-summary">
                  <h3>Reported Symptoms</h3>
                  <div className="symptoms-list">
                    {Object.entries(selectedAssessment.symptoms)
                      .filter(([_, value]) => value)
                      .map(([symptom]) => (
                        <span key={symptom} className="symptom-tag">
                          {symptom.replace(/_/g, ' ')}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guidelines' && (
            <section className="tab-content">
              <h2>Clinical Guidelines</h2>
              <div className="guidelines-content">
                <h3>PCOS Management</h3>
                <p>
                  Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age.
                  Key management approaches include:
                </p>
                <ul>
                  <li>Hormonal contraceptives for menstrual regulation</li>
                  <li>Insulin-sensitizing agents (Metformin)</li>
                  <li>Lifestyle modifications (diet and exercise)</li>
                  <li>Regular monitoring of metabolic markers</li>
                </ul>

                <h3>Endometriosis Management</h3>
                <p>
                  Endometriosis is a chronic condition where tissue similar to the uterine lining grows outside the uterus.
                  Treatment options include:
                </p>
                <ul>
                  <li>Pain management (NSAIDs, hormonal therapy)</li>
                  <li>Hormonal contraceptives or GnRH agonists</li>
                  <li>Surgical intervention for severe cases</li>
                  <li>Fertility preservation strategies</li>
                </ul>

                <h3>Risk Factor Assessment</h3>
                <ul>
                  <li>PCOS: Age 20-40, metabolic factors, family history</li>
                  <li>Endometriosis: Age 30-40, nulliparity, family history, early menarche</li>
                </ul>

                <h3>Referral Criteria</h3>
                <p>Consider specialist referral for:</p>
                <ul>
                  <li>Risk score &gt; 60%</li>
                  <li>Infertility concerns</li>
                  <li>Severe symptoms affecting quality of life</li>
                  <li>Need for surgical evaluation</li>
                </ul>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}