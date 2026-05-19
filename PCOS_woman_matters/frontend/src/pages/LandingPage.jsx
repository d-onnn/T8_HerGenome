import { useState, useEffect } from "react";

const stats = [
  {
    icon: "⏳",
    title: "Delayed Diagnosis",
    desc: "Endometriosis diagnosis can take up to 10 years due to overlapping symptoms and delayed clinical recognition.",
    source: "https://www.endometriosis.org",
    sourceLabel: "endometriosis.org",
  },
  {
    icon: "🔬",
    title: "Underdiagnosed Condition",
    desc: "PCOS affects 1 in 10 women of reproductive age worldwide and remains one of the most frequently underdiagnosed conditions.",
    source: "https://www.womenshealth.gov/a-z-topics/polycystic-ovary-syndrome",
    sourceLabel: "womenshealth.gov",
  },
  {
    icon: "📋",
    title: "Earlier Intervention",
    desc: "Early risk stratification may significantly improve referral timing and the quality of clinical intervention outcomes.",
    source: "https://www.nichd.nih.gov/health/topics/pcos",
    sourceLabel: "nichd.nih.gov",
  },
];

const resources = [
  { label: "PCOS Awareness Association", url: "https://www.pcosaa.org" },
  { label: "Endometriosis Foundation", url: "https://www.endofound.org" },
  { label: "Women's Health (HHS)", url: "https://www.womenshealth.gov" },
  { label: "NICHD – PCOS Research", url: "https://www.nichd.nih.gov/health/topics/pcos" },
  { label: "Jean Hailes for Women", url: "https://jeanhailes.org.au/health-a-z/pcos" },
  { label: "PCOS Challenge Network", url: "https://pcoschallenge.org" },
  { label: "The Endometriosis Org", url: "https://www.endometriosis.org" },
  { label: "ACOG Women's Health", url: "https://www.acog.org/womens-health" },
];

export default function LandingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={styles.root}>
      {/* Background texture */}
      <div style={styles.bgAccent} />

      <div style={{ ...styles.page, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease" }}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarInner}>
            <p style={styles.sidebarHeading}>Resources</p>
            <div style={styles.divider} />
            {resources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.sidebarLink}
                onMouseEnter={e => (e.currentTarget.style.color = "#c9d9f5")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.72)")}
              >
                <span style={styles.sidebarDot}>›</span> {r.label}
              </a>
            ))}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={styles.main}>
          {/* NAV */}
          <nav style={styles.nav}>
            <div style={styles.logo}>
              <span style={styles.logoMark}>♀</span>
              <span style={styles.logoText}>HerHealth AI</span>
            </div>
            <a href="/home" style={styles.loginBtn}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.color = "#0a1628";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#ffffff";
              }}
            >
              Log In →
            </a>
          </nav>

          {/* HERO */}
          <section style={styles.hero}>
            <div style={styles.heroTag}>Women's Health · AI-Assisted Screening</div>
            <h1 style={styles.heroTitle}>
              Smarter screening<br />
              <span style={styles.heroAccent}>for every woman.</span>
            </h1>
            <p style={styles.heroSub}>
              Millions of women live undiagnosed with PCOS and endometriosis for years.
              This tool helps surface early risk signals — so the right care comes sooner.
            </p>
            <div style={styles.heroCTA}>
              <a href="/home" style={styles.ctaBtn}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "#c9d9f5";
                  e.currentTarget.style.color = "#0a1628";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "#4a7fd4";
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                Get Started
              </a>
              <span style={styles.ctaSub}>No account needed to explore</span>
            </div>
          </section>

          {/* STATS CARDS */}
          <section style={styles.cards}>
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  ...styles.card,
                  animationDelay: `${0.2 + i * 0.15}s`,
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.6s ease ${0.3 + i * 0.15}s, transform 0.6s ease ${0.3 + i * 0.15}s`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#4a7fd4";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(74,127,212,0.18)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.2)";
                }}
              >
                <div style={styles.cardIcon}>{s.icon}</div>
                <h3 style={styles.cardTitle}>{s.title}</h3>
                <p style={styles.cardDesc}>{s.desc}</p>
                <a href={s.source} target="_blank" rel="noopener noreferrer" style={styles.cardSource}>
                  ↗ {s.sourceLabel}
                </a>
              </div>
            ))}
          </section>

          {/* FOOTER */}
          <footer style={styles.footer}>
            <span>© 2026 HerHealth AI · Built for women, by researchers.</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={styles.footerLink}>Privacy</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="#" style={styles.footerLink}>About</a>
          </footer>
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0a1628",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    color: "#ffffff",
    position: "relative",
    overflow: "hidden",
  },
  bgAccent: {
    position: "fixed",
    top: "-30%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(74,127,212,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  page: {
    display: "flex",
    minHeight: "100vh",
    position: "relative",
    zIndex: 1,
  },
  sidebar: {
    width: "220px",
    minWidth: "220px",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    padding: "40px 0",
    background: "rgba(255,255,255,0.02)",
    backdropFilter: "blur(8px)",
  },
  sidebarInner: {
    padding: "0 24px",
    position: "sticky",
    top: "40px",
  },
  sidebarHeading: {
    fontSize: "10px",
    letterSpacing: "3px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "12px",
    fontFamily: "'Georgia', serif",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    marginBottom: "20px",
  },
  sidebarLink: {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    color: "rgba(255,255,255,0.72)",
    textDecoration: "none",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "14px",
    transition: "color 0.2s",
    fontFamily: "'Georgia', serif",
  },
  sidebarDot: {
    color: "#4a7fd4",
    marginTop: "1px",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 48px",
    maxWidth: "960px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "32px 0 40px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    marginBottom: "60px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoMark: {
    fontSize: "22px",
    color: "#4a7fd4",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    fontFamily: "'Georgia', serif",
  },
  loginBtn: {
    padding: "10px 26px",
    border: "1.5px solid rgba(255,255,255,0.6)",
    borderRadius: "40px",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    letterSpacing: "0.3px",
    transition: "background 0.2s, color 0.2s",
    background: "transparent",
    fontFamily: "'Georgia', serif",
  },
  hero: {
    marginBottom: "64px",
  },
  heroTag: {
    display: "inline-block",
    fontSize: "11px",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#4a7fd4",
    background: "rgba(74,127,212,0.12)",
    border: "1px solid rgba(74,127,212,0.3)",
    padding: "6px 14px",
    borderRadius: "20px",
    marginBottom: "28px",
  },
  heroTitle: {
    fontSize: "clamp(36px, 5vw, 58px)",
    fontWeight: "700",
    lineHeight: "1.15",
    margin: "0 0 24px",
    letterSpacing: "-1px",
    fontFamily: "'Georgia', serif",
  },
  heroAccent: {
    color: "#4a7fd4",
  },
  heroSub: {
    fontSize: "17px",
    lineHeight: "1.75",
    color: "rgba(255,255,255,0.7)",
    maxWidth: "560px",
    margin: "0 0 36px",
    fontFamily: "'Georgia', serif",
  },
  heroCTA: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  ctaBtn: {
    padding: "14px 36px",
    background: "#4a7fd4",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "40px",
    fontSize: "15px",
    fontWeight: "600",
    letterSpacing: "0.3px",
    transition: "background 0.2s, color 0.2s",
    fontFamily: "'Georgia', serif",
  },
  ctaSub: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.4)",
    fontStyle: "italic",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginBottom: "64px",
  },
  card: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "28px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
    cursor: "default",
    transition: "border-color 0.25s, box-shadow 0.25s",
  },
  cardIcon: {
    fontSize: "28px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    marginBottom: "10px",
    fontFamily: "'Georgia', serif",
    color: "#ffffff",
  },
  cardDesc: {
    fontSize: "14px",
    lineHeight: "1.7",
    color: "rgba(255,255,255,0.65)",
    marginBottom: "16px",
    fontFamily: "'Georgia', serif",
  },
  cardSource: {
    fontSize: "12px",
    color: "#4a7fd4",
    textDecoration: "none",
    letterSpacing: "0.3px",
  },
  footer: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    padding: "28px 0",
    borderTop: "1px solid rgba(255,255,255,0.07)",
    fontSize: "12px",
    color: "rgba(255,255,255,0.35)",
    marginTop: "auto",
    fontFamily: "'Georgia', serif",
    flexWrap: "wrap",
  },
  footerLink: {
    color: "rgba(255,255,255,0.35)",
    textDecoration: "none",
  },
};