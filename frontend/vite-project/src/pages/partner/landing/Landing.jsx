import React from "react";
import { useNavigate } from "react-router-dom";


/**
 * TaxPartner Portal — landing page
 * Direct clone of the reference: soft lavender-white background,
 * navy headings/buttons, light-blue accent chips, clean sans-serif type.
 */

function HandshakeIllustration() {
  return (
    <svg viewBox="0 0 420 300" className="illo-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Two professionals shaking hands">
      <rect x="0" y="0" width="420" height="300" fill="#FFFFFF" />

      {/* faint background icons */}
      <g stroke="#C7D3EA" strokeWidth="2" fill="none" opacity="0.9">
        <circle cx="60" cy="60" r="14" />
        <path d="M53 60 h14 M60 53 v14" />
        <rect x="330" y="45" width="26" height="20" rx="2" />
        <path d="M330 65 h26" />
        <path d="M300 90 l14 -18 l10 8 l16 -22" />
        <circle cx="356" cy="110" r="12" />
        <path d="M348 110 h16 M356 102 v16" />
      </g>

      {/* skyline */}
      <g fill="#E4EAF7">
        <rect x="20" y="190" width="16" height="80" />
        <rect x="40" y="160" width="16" height="110" />
        <rect x="60" y="205" width="16" height="65" />
        <rect x="360" y="175" width="16" height="95" />
        <rect x="382" y="150" width="16" height="120" />
      </g>

      {/* rising line chart */}
      <polyline points="30,230 90,205 130,220 170,175 210,190 250,150 300,165 350,120"
        fill="none" stroke="#9DB4E8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* tablet base with "TAX" doc */}
      <g>
        <rect x="115" y="235" width="190" height="55" rx="10" fill="#14243F" />
        <rect x="128" y="205" width="60" height="72" rx="4" fill="#FFFFFF" stroke="#D6E3FF" strokeWidth="2" />
        <text x="158" y="230" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="14" fill="#1A365D">TAX</text>
        <line x1="136" y1="240" x2="180" y2="240" stroke="#D6E3FF" strokeWidth="3" />
        <line x1="136" y1="250" x2="172" y2="250" stroke="#D6E3FF" strokeWidth="3" />
        <line x1="136" y1="260" x2="176" y2="260" stroke="#D6E3FF" strokeWidth="3" />
      </g>

      {/* left figure */}
      <g>
        <circle cx="165" cy="130" r="18" fill="#14243F" />
        <path d="M133 235 C133 185 148 160 165 160 C182 160 197 185 197 235 Z" fill="#14243F" />
        <rect x="176" y="182" width="34" height="10" rx="5" fill="#14243F" transform="rotate(18 176 182)" />
      </g>

      {/* right figure */}
      <g>
        <circle cx="252" cy="130" r="18" fill="#3B5FA6" />
        <path d="M220 235 C220 185 235 160 252 160 C269 160 284 185 284 235 Z" fill="#3B5FA6" />
        <rect x="212" y="182" width="34" height="10" rx="5" fill="#3B5FA6" transform="rotate(-18 246 182)" />
      </g>

      {/* clasped hands */}
      <circle cx="209" cy="188" r="7" fill="#FFFFFF" stroke="#14243F" strokeWidth="2" />
    </svg>
  );
}

function FeatureIcon({ name }) {
  const common = { stroke: "#14243F", strokeWidth: "1.8", fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  if (name === "eye") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18" />
        <circle cx="16.5" cy="14.5" r="1.4" fill="#14243F" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M12 3l7 3.5v5c0 4.6-3 8.3-7 9.5-4-1.2-7-4.9-7-9.5v-5L12 3z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <FeatureIcon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

export default function Landing() {
  const features = [
    { icon: "eye", title: "Real-time Transparency", desc: "Track every lead and conversion in your personal dashboard." },
    { icon: "wallet", title: "Premium Commissions", desc: "Earn industry-leading payouts for every successful referral." },
    { icon: "shield", title: "Expert Support", desc: "Our team of certified CAs and tax experts handle the rest." },
  ];
  const navigate = useNavigate();

  return (
    <div className="tp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .tp-root {
          --bg: #F9F9FF;
          --bg-alt: #F0F3FF;
          --navy: #14243F;
          --navy-deep: #1A365D;
          --blue-accent: #3B6EA5;
          --blue-border: #89ACD1;
          --chip-bg: #D6E3FF;
          --text-muted: #6B7280;
          --line: #E4E7F5;
          --white: #FFFFFF;

          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--navy);
          width: 100%;
          -webkit-font-smoothing: antialiased;
        }
        .tp-root * { box-sizing: border-box; }

        .tp-shell {
          background: var(--bg);
          overflow: hidden;
        }

        /* ---------- header ---------- */
        .tp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 40px;
          background: var(--bg);
          border-bottom: 1px solid var(--line);
        }
        .tp-logo {
          font-weight: 700;
          font-size: 1.02rem;
          color: var(--navy);
          letter-spacing: -0.01em;
        }
        .tp-login {
          background: var(--navy-deep);
          color: var(--white);
          border: none;
          padding: 9px 20px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.82rem;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .tp-login:hover { background: #234a80; transform: translateY(-1px); }

        /* ---------- hero ---------- */
        .tp-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          padding: 64px 48px 56px;
          background: var(--bg);
        }
        .tp-hero h1 {
          font-weight: 800;
          font-size: clamp(1.9rem, 3vw, 2.5rem);
          line-height: 1.18;
          letter-spacing: -0.015em;
          margin: 0 0 18px;
          color: var(--navy);
        }
        .tp-hero p.lead {
          font-size: 0.98rem;
          line-height: 1.65;
          color: var(--text-muted);
          max-width: 440px;
          margin: 0 0 30px;
        }
        .cta-row { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary, .btn-secondary {
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 11px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .btn-primary {
          background: var(--navy-deep);
          color: var(--white);
          border: 1px solid var(--navy-deep);
        }
        .btn-primary:hover {
          background: #234a80;
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(26,54,93,0.25);
        }
        .btn-secondary {
          background: var(--white);
          color: var(--blue-accent);
          border: 1px solid var(--blue-border);
        }
        .btn-secondary:hover {
          background: #F3F7FF;
          transform: translateY(-1px);
        }
        .btn-secondary .play {
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 1.5px solid var(--blue-accent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }

        .tp-illo-wrap {
          background: var(--white);
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 20px 40px rgba(20,36,63,0.08);
        }
        .illo-svg { width: 100%; height: auto; display: block; border-radius: 6px; }

        /* ---------- why partner ---------- */
        .tp-why {
          background: var(--bg-alt);
          padding: 64px 48px 72px;
          text-align: center;
        }
        .tp-why h2 {
          font-weight: 700;
          font-size: clamp(1.35rem, 2vw, 1.7rem);
          margin: 0 0 8px;
          color: var(--navy);
        }
        .tp-why .sub {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin: 0 0 44px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 960px;
          margin: 0 auto;
        }
        .feature-card {
          background: var(--white);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 26px 22px;
          text-align: left;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .feature-card:hover {
          box-shadow: 0 12px 24px rgba(20,36,63,0.08);
          transform: translateY(-2px);
        }
        .feature-icon {
          width: 38px; height: 38px;
          border-radius: 8px;
          background: var(--chip-bg);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .feature-icon svg { width: 18px; height: 18px; }
        .feature-card h3 {
          font-weight: 700;
          font-size: 0.98rem;
          margin: 0 0 8px;
          color: var(--navy);
        }
        .feature-card p {
          font-size: 0.84rem;
          line-height: 1.55;
          color: var(--text-muted);
          margin: 0;
        }

        /* ---------- footer ---------- */
        .tp-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 26px 48px;
          background: var(--bg-alt);
          flex-wrap: wrap;
          gap: 12px;
          border-top: 1px solid var(--line);
        }
        .tp-footer .brand {
          font-weight: 700;
          font-size: 0.78rem;
          color: var(--navy);
          letter-spacing: 0.02em;
        }
        .tp-footer .tag {
          font-size: 0.72rem;
          color: var(--blue-accent);
          margin-top: 3px;
        }
        .tp-footer .links { display: flex; gap: 20px; }
        .tp-footer .links a {
          font-size: 0.76rem;
          color: var(--navy);
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }
        .tp-footer .links a:hover { opacity: 1; color: var(--blue-accent); }

        @media (max-width: 820px) {
          .tp-hero { grid-template-columns: 1fr; padding: 40px 22px; }
          .tp-illo-wrap { order: -1; }
          .tp-header { padding: 14px 20px; }
          .tp-why { padding: 48px 20px; }
          .feature-grid { grid-template-columns: 1fr; }
          .tp-footer { flex-direction: column; align-items: flex-start; padding: 22px 20px; }
        }
      `}</style>

      <div className="tp-shell">
        <header className="tp-header">
          <div className="tp-logo">TaxPartner Portal</div>
          <button className="tp-login" onClick={() => navigate("/partner-login")}>
            Login
          </button>
        </header>

        <section className="tp-hero">
          <div>
            <h1>Empower Your Network. Grow Your Earnings.</h1>
            <p className="lead">
              Join the most trusted referral ecosystem for Tax, Audit, and
              Compliance services. Turn your professional network into a
              revenue stream with real-time tracking and automated payouts.
            </p>
            <div className="cta-row">
              <button className="btn-primary">Become a Partner</button>
              <button className="btn-secondary">
                <span className="play">▶</span> Watch How It Works
              </button>
            </div>
          </div>
          <div className="tp-illo-wrap">
            <HandshakeIllustration />
          </div>
        </section>

        <section className="tp-why">
          <h2>Why Partner with Us?</h2>
          <p className="sub">A platform designed for professionals, by professionals.</p>
          <div className="feature-grid">
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </section>

        <footer className="tp-footer">
          <div>
            <div className="brand">TAXPARTNER PORTAL</div>
            <div className="tag">© 2024 TaxPartner Portal. All rights reserved. Precise. Reliable. Secure.</div>
          </div>
          <div className="links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#support">Support</a>
            <a href="#compliance">Compliance</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
