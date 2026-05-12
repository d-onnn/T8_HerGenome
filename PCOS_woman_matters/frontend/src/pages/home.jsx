import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <h1>PCOS Health Portal</h1>
          <p className="subtitle">Early Detection & Clinical Support</p>
        </header>

        <div className="home-description">
          <p>
            Welcome to an AI-powered healthcare platform designed to help with early detection of
            Polycystic Ovary Syndrome (PCOS) and reduce the risk of misdiagnosis with Endometriosis.
          </p>
        </div>

        <div className="role-selection">
          <div className="role-card patient-card">
            <div className="role-icon">Patient</div>
            <h2>Patient Portal</h2>
            <p>Complete a health screening to assess your risk of PCOS or Endometriosis</p>
            <ul className="feature-list">
              <li>Symptom-based assessment</li>
              <li>Personalized risk score</li>
              <li>Health information</li>
              <li>Medical recommendations</li>
            </ul>
            <button
              onClick={() => navigate("/login?role=patient")}
              className="btn btn-primary btn-large"
            >
              Patient Login
            </button>
          </div>

          <div className="role-card doctor-card">
            <div className="role-icon">Doctor</div>
            <h2>Doctor Dashboard</h2>
            <p>Access patient assessments and clinical decision support tools</p>
            <ul className="feature-list">
              <li>Patient overview</li>
              <li>Risk analysis</li>
              <li>PCOS vs Endometriosis comparison</li>
              <li>Clinical guidelines</li>
            </ul>
            <button
              onClick={() => navigate("/login?role=doctor")}
              className="btn btn-primary btn-large"
            >
              Doctor Login
            </button>
          </div>
        </div>

        <footer className="home-footer">
          <p>
            <small>
              This platform is for educational purposes and not a substitute for professional
              medical advice. Always consult with a healthcare provider.
            </small>
          </p>
        </footer>
      </div>
    </div>
  );
}