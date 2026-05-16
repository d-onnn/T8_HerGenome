import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const SPECIALTIES = [
  "General Practice",
  "Obstetrics & Gynaecology",
  "Reproductive Endocrinology",
  "Internal Medicine",
  "Endocrinology",
  "Radiology",
  "Other",
];

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // role can arrive via query param OR be chosen in-page
  const [role, setRole] = useState(params.get("role") || null); // null = not yet chosen
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [visible, setVisible] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    // doctor-only signup fields
    fullName: "",
    medicalLicenseNo: "",
    specialty: "",
    institution: "",
    yearsOfExperience: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const set = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await authAPI.login(formData.username, formData.password, role);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload =
        role === "doctor"
          ? {
              username: formData.username,
              password: formData.password,
              role,
              fullName: formData.fullName,
              medicalLicenseNo: formData.medicalLicenseNo,
              specialty: formData.specialty,
              institution: formData.institution,
              yearsOfExperience: formData.yearsOfExperience,
            }
          : {
              username: formData.username,
              password: formData.password,
              role,
            };
      const response = await authAPI.signup(payload);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      navigate(role === "doctor" ? "/doctor" : "/patient");
    } catch (err) {
      setError(err.response?.data?.error || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0f1e35;
          --navy-mid: #1a3050;
          --cream: #faf7f2;
          --warm-white: #ffffff;
          --accent-rose: #c0392b;
          --accent-violet: #7b3fa0;
          --text-dark: #1a1a2e;
          --text-mid: #4a5568;
          --text-light: #718096;
          --border: #e2ddd6;
          --border-focus: #0f1e35;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
        }

        body { background: var(--cream); font-family: var(--sans); color: var(--text-dark); min-height: 100vh; }

        .auth-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .auth-wrap.visible { opacity: 1; transform: translateY(0); }

        /* Background decoration */
        .auth-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(circle at 15% 50%, rgba(123,63,160,0.06) 0%, transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(26,107,154,0.06) 0%, transparent 40%);
          pointer-events: none;
        }

        .auth-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
          box-shadow: 0 20px 60px rgba(0,0,0,0.06);
        }

        .auth-top {
          background: var(--navy);
          padding: 36px 40px 28px;
          position: relative;
          overflow: hidden;
        }
        .auth-top::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent-violet), var(--accent-rose));
        }
        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 24px;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: rgba(255,255,255,0.8); }
        .auth-eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .auth-title {
          font-family: var(--serif);
          font-size: 1.6rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
        }

        /* ── Role picker ── */
        .role-picker {
          padding: 40px;
        }
        .role-picker-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--text-light);
          margin-bottom: 16px;
        }
        .role-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 32px;
        }
        .role-btn {
          border: 1.5px solid var(--border);
          background: var(--warm-white);
          padding: 24px 16px;
          cursor: pointer;
          text-align: center;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          font-family: var(--sans);
        }
        .role-btn:hover { border-color: var(--navy); transform: translateY(-1px); }
        .role-btn.selected { border-color: var(--navy); background: var(--cream); }
        .role-icon-lg { font-size: 28px; margin-bottom: 8px; }
        .role-btn-name {
          font-family: var(--serif);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          display: block;
          margin-bottom: 4px;
        }
        .role-btn-desc {
          font-size: 11px;
          color: var(--text-light);
          line-height: 1.4;
        }
        .mode-toggle {
          display: flex;
          border: 1px solid var(--border);
          margin-bottom: 28px;
        }
        .mode-tab {
          flex: 1;
          padding: 10px;
          background: none;
          border: none;
          font-family: var(--sans);
          font-size: 12.5px;
          font-weight: 500;
          color: var(--text-light);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          letter-spacing: 0.04em;
        }
        .mode-tab.active {
          background: var(--navy);
          color: #fff;
        }
        .continue-btn {
          width: 100%;
          background: var(--navy);
          color: #fff;
          border: none;
          padding: 14px;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }
        .continue-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .continue-btn:not(:disabled):hover { background: var(--navy-mid); }

        /* ── Form ── */
        .auth-form-wrap { padding: 36px 40px 40px; }

        .form-group { margin-bottom: 18px; }
        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-mid);
          margin-bottom: 7px;
        }
        .form-input, .form-select {
          width: 100%;
          border: 1px solid var(--border);
          background: var(--cream);
          padding: 11px 14px;
          font-family: var(--sans);
          font-size: 14px;
          color: var(--text-dark);
          outline: none;
          transition: border-color 0.2s;
          appearance: none;
        }
        .form-input:focus, .form-select:focus { border-color: var(--border-focus); background: #fff; }
        .form-input::placeholder { color: var(--text-light); }

        .section-divider {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-light);
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
          margin: 24px 0 18px;
        }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .submit-btn {
          width: 100%;
          background: var(--navy);
          color: #fff;
          border: none;
          padding: 14px;
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 24px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .submit-btn:not(:disabled):hover { background: var(--navy-mid); }

        .error-box {
          background: #fff5f5;
          border: 1px solid #fed7d7;
          color: var(--accent-rose);
          font-size: 13px;
          padding: 12px 14px;
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .form-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: var(--text-light);
        }
        .form-footer button {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--sans);
          font-size: 12px;
          color: var(--navy);
          text-decoration: underline;
          padding: 0;
        }
        .change-role-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--sans);
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          transition: color 0.2s;
        }
        .change-role-btn:hover { color: rgba(255,255,255,0.7); }
      `}</style>

      <div className={`auth-wrap${visible ? " visible" : ""}`}>
        <div className="auth-card">

          {/* ── TOP BAR ── */}
          <div className="auth-top">
            <button className="back-btn" onClick={() => navigate("/")}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M9 6H3M5 4L3 6l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </button>
            <p className="auth-eyebrow">PCOS Health Portal</p>
            <h1 className="auth-title">
              {!role
                ? "Welcome back"
                : mode === "login"
                ? `${role === "doctor" ? "Doctor" : "Patient"} login`
                : `Create ${role === "doctor" ? "doctor" : "patient"} account`}
            </h1>
          </div>

          {/* ── ROLE PICKER (shown when role not yet set) ── */}
          {!role && (
            <div className="role-picker">
              <p className="role-picker-label">I am a…</p>
              <div className="role-buttons">
                <button
                  className={`role-btn${role === "patient" ? " selected" : ""}`}
                  onClick={() => setRole("patient")}
                >
                  <div className="role-icon-lg">🩺</div>
                  <span className="role-btn-name">Patient</span>
                  <span className="role-btn-desc">Take a health screening or view my results</span>
                </button>
                <button
                  className={`role-btn${role === "doctor" ? " selected" : ""}`}
                  onClick={() => setRole("doctor")}
                >
                  <div className="role-icon-lg">👩‍⚕️</div>
                  <span className="role-btn-name">Doctor</span>
                  <span className="role-btn-desc">Access the clinical dashboard</span>
                </button>
              </div>

              <div className="mode-toggle">
                <button
                  className={`mode-tab${mode === "login" ? " active" : ""}`}
                  onClick={() => setMode("login")}
                >Log in</button>
                <button
                  className={`mode-tab${mode === "signup" ? " active" : ""}`}
                  onClick={() => setMode("signup")}
                >Sign up</button>
              </div>

              <button
                className="continue-btn"
                disabled={!role}
                onClick={() => {/* role already set by clicking card */}}
              >
                Continue
              </button>
            </div>
          )}

          {/* ── FORM (shown once role is chosen) ── */}
          {role && (
            <div className="auth-form-wrap">
              {/* Change role link */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div className="mode-toggle" style={{ flex: 1, marginBottom: 0, marginRight: 12 }}>
                  <button className={`mode-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Log in</button>
                  <button className={`mode-tab${mode === "signup" ? " active" : ""}`} onClick={() => { setMode("signup"); setError(""); }}>Sign up</button>
                </div>
                <button style={{ background: "none", border: "1px solid var(--border)", padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: "var(--sans)", color: "var(--text-light)", whiteSpace: "nowrap" }} onClick={() => { setRole(null); setError(""); }}>
                  Change role
                </button>
              </div>

              {error && <div className="error-box">{error}</div>}

              <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
                {/* ── DOCTOR SIGNUP EXTRAS ── */}
                {mode === "signup" && role === "doctor" && (
                  <>
                    <p className="section-divider">Professional details</p>
                    <div className="form-group">
                      <label className="form-label">Full name</label>
                      <input className="form-input" type="text" placeholder="Dr. Jane Smith" value={formData.fullName} onChange={set("fullName")} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Medical licence no.</label>
                        <input className="form-input" type="text" placeholder="MMC-12345" value={formData.medicalLicenseNo} onChange={set("medicalLicenseNo")} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Years of experience</label>
                        <input className="form-input" type="number" min="0" max="60" placeholder="e.g. 8" value={formData.yearsOfExperience} onChange={set("yearsOfExperience")} required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialty</label>
                      <select className="form-select" value={formData.specialty} onChange={set("specialty")} required>
                        <option value="">Select specialty…</option>
                        {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Institution / Hospital</label>
                      <input className="form-input" type="text" placeholder="e.g. KK Women's & Children's Hospital" value={formData.institution} onChange={set("institution")} required />
                    </div>
                    <p className="section-divider">Account credentials</p>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" placeholder="Enter your username" value={formData.username} onChange={set("username")} required autoComplete="username" />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Enter your password" value={formData.password} onChange={set("password")} required autoComplete={mode === "login" ? "current-password" : "new-password"} />
                </div>

                {mode === "signup" && (
                  <div className="form-group">
                    <label className="form-label">Confirm password</label>
                    <input className="form-input" type="password" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={set("confirmPassword")} required autoComplete="new-password" />
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
                </button>
              </form>

              <div className="form-footer">
                {mode === "login" ? (
                  <span>No account? <button onClick={() => { setMode("signup"); setError(""); }}>Sign up</button></span>
                ) : (
                  <span>Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Log in</button></span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}