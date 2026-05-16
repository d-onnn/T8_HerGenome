import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const stats = [
  {
    value: "7–10",
    unit: "years",
    label: "Average time to diagnose Endometriosis",
    detail: "Diagnosis can take years due to overlapping symptoms and delayed clinical recognition.",
    color: "#c0392b",
  },
  {
    value: "1 in 10",
    unit: "women",
    label: "Affected by PCOS worldwide",
    detail: "PCOS affects millions of women globally and remains one of the most underdiagnosed conditions.",
    color: "#7b3fa0",
  },
  {
    value: "Early",
    unit: "intervention",
    label: "Can change outcomes",
    detail: "Early risk stratification may improve referral timing and clinical intervention decisions.",
    color: "#1a6b9a",
  },
];

const resources = [
  { label: "PCOS Awareness Association", url: "https://www.pcosaa.org", desc: "Patient education & advocacy" },
  { label: "Endometriosis Foundation", url: "https://www.endofound.org", desc: "Research, awareness, and support" },
  { label: "ACOG – Women's Health", url: "https://www.acog.org/womens-health", desc: "Clinical guidelines & resources" },
  { label: "WHO – Reproductive Health", url: "https://www.who.int/health-topics/reproductive-health", desc: "Global health data and policies" },
  { label: "Jean Hailes for Women's Health", url: "https://jeanhailes.org.au", desc: "Evidence-based women's health info" },
];

export default function Home() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --navy: #0f1e35;
          --navy-mid: #1a3050;
          --cream: #faf7f2;
          --warm-white: #ffffff;
          --text-dark: #1a1a2e;
          --text-mid: #4a5568;
          --border: #e2ddd6;
          --serif: 'Playfair Display', Georgia, serif;
          --sans: 'DM Sans', system-ui, sans-serif;
        }

        body { background: var(--cream); font-family: var(--sans); color: var(--text-dark); }

        .home-wrap {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 260px;
          grid-template-rows: auto 1fr auto;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .home-wrap.visible { opacity: 1; transform: translateY(0); }

        /* ── HERO ── */
        .hero {
          grid-column: 1 / 2;
          background: var(--navy);
          padding: 80px 72px 68px;
          position: relative;
          overflow: hidden;
          min-height: 480px;
          display: flex;
          align-items: center;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 75% 25%, rgba(123,63,160,0.25) 0%, transparent 55%),
            radial-gradient(circle at 15% 80%, rgba(26,107,154,0.2) 0%, transparent 50%);
        }
        .hero-inner { position: relative; z-index: 1; max-width: 680px; }

        .hero-eyebrow {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          margin-bottom: 28px;
        }
        .hero h1 {
          font-family: var(--serif);
          font-size: clamp(2.8rem, 5vw, 4.2rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 24px;
        }
        .hero h1 em {
          font-style: italic;
          color: rgba(255,255,255,0.75);
        }
        .hero-sub {
          font-size: 18px;
          font-weight: 300;
          color: rgba(255,255,255,0.75);
          line-height: 1.75;
          max-width: 520px;
          margin-bottom: 44px;
        }
        .hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          color: var(--navy);
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 16px 36px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .hero-cta:hover { background: var(--cream); transform: translateY(-2px); }
        .hero-cta svg { transition: transform 0.2s; }
        .hero-cta:hover svg { transform: translateX(4px); }

        /* ── SIDEBAR ── */
        .sidebar {
          grid-column: 2 / 3;
          grid-row: 1 / 3;
          background: var(--navy-mid);
          padding: 48px 24px;
          border-left: 1px solid rgba(255,255,255,0.08);
        }
        .sidebar-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 24px;
        }
        .resource-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
        .resource-list li a {
          display: block;
          padding: 14px 16px;
          border-left: 2px solid transparent;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
          border-radius: 0 4px 4px 0;
        }
        .resource-list li a:hover {
          border-left-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.07);
        }
        .res-name {
          display: block;
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.92);
          margin-bottom: 4px;
          line-height: 1.4;
        }
        .res-desc {
          display: block;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          line-height: 1.4;
        }
        .sidebar-divider {
          margin: 32px 0;
          border: none;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .sidebar-note {
          font-size: 12px;
          color: rgba(255,255,255,0.42);
          line-height: 1.7;
        }

        /* ── STATS ── */
        .stats-section {
          grid-column: 1 / 2;
          padding: 64px 72px;
          background: var(--cream);
        }
        .section-label {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-mid);
          margin-bottom: 36px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stat-card {
          background: var(--warm-white);
          border: 1px solid var(--border);
          padding: 36px 28px;
          position: relative;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.09);
          transform: translateY(-3px);
        }
        .stat-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
        }
        .stat-value {
          font-family: var(--serif);
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 6px;
        }
        .stat-unit {
          font-size: 15px;
          font-weight: 400;
          color: var(--text-mid);
          margin-left: 6px;
        }
        .stat-label {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-dark);
          margin: 14px 0 10px;
          line-height: 1.4;
        }
        .stat-detail {
          font-size: 13.5px;
          color: var(--text-mid);
          line-height: 1.65;
        }

        /* ── FOOTER ── */
        .home-footer {
          grid-column: 1 / 2;
          padding: 28px 72px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--cream);
        }
        .footer-disclaimer {
          font-size: 12px;
          color: var(--text-mid);
          max-width: 560px;
          line-height: 1.6;
        }
        .footer-brand {
          font-family: var(--serif);
          font-size: 14px;
          color: var(--text-mid);
          white-space: nowrap;
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .home-wrap { grid-template-columns: 1fr; }
          .hero { padding: 52px 32px 44px; min-height: auto; }
          .stats-section { padding: 48px 32px; }
          .stats-grid { grid-template-columns: 1fr; }
          .sidebar { grid-column: 1; grid-row: auto; padding: 36px 32px; }
          .home-footer { flex-direction: column; gap: 12px; padding: 24px 32px; text-align: center; }
        }
      `}</style>

      <div className={`home-wrap${visible ? " visible" : ""}`}>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-inner">
            <p className="hero-eyebrow">Women's Health · Early Detection</p>
            <h1>
              Bridging the gap in<br />
              <em>PCOS & Endometriosis</em><br />
              diagnosis
            </h1>
            <p className="hero-sub">
              A predictive clinical platform built to reduce misdiagnosis, surface risk early,
              and connect patients with the care they need — faster.
            </p>
            <button className="hero-cta" onClick={() => navigate("/login")}>
              Get started
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <p className="sidebar-title">Further reading</p>
          <ul className="resource-list">
            {resources.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <span className="res-name">{r.label}</span>
                  <span className="res-desc">{r.desc}</span>
                </a>
              </li>
            ))}
          </ul>
          <hr className="sidebar-divider" />
          <p className="sidebar-note">
            Resources are provided for educational purposes only and do not constitute medical advice.
          </p>
        </aside>

        {/* ── STATS ── */}
        <section className="stats-section">
          <p className="section-label">Why it matters</p>
          <div className="stats-grid">
            {stats.map((s) => (
              <div className="stat-card" key={s.label}>
                <div className="stat-accent" style={{ background: s.color }} />
                <div className="stat-value" style={{ color: s.color }}>
                  {s.value}
                  <span className="stat-unit">{s.unit}</span>
                </div>
                <p className="stat-label">{s.label}</p>
                <p className="stat-detail">{s.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="home-footer">
          <p className="footer-disclaimer">
            This platform is for educational and screening purposes only. It is not a substitute
            for professional medical advice, diagnosis, or treatment.
          </p>
          <span className="footer-brand">PCOS Health Portal</span>
        </footer>

      </div>
    </>
  );
}