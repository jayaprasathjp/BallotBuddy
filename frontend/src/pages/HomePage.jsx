// src/pages/HomePage.jsx
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./HomePage.css";

const FEATURES = [
  {
    icon: "🤖",
    titleKey: "home.feature_ai_title",
    descKey: "home.feature_ai_desc",
    path: "/chat",
    color: "#1a73e8",
  },
  {
    icon: "🗺️",
    titleKey: "home.feature_journey_title",
    descKey: "home.feature_journey_desc",
    path: "/journey",
    color: "#7c3aed",
  },
  {
    icon: "📅",
    titleKey: "home.feature_timeline_title",
    descKey: "home.feature_timeline_desc",
    path: "/timeline",
    color: "#0891b2",
  },
];

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <div className="homepage">
      {FEATURES.map(feature => (
        <Link
          to={feature.path}
          key={feature.titleKey}
          style={{ color: feature.color }}
        >
          <div className="feature">
            <span className="icon">{feature.icon}</span>
            <h3>{t(feature.titleKey)}</h3>
            <p>{t(feature.descKey)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default HomePage;
  {
    icon: "👥",
    titleKey: "home.feature_candidates_title",
    descKey: "home.feature_candidates_desc",
    path: "/candidates",
    color: "#059669",
  },
  {
    icon: "🗳️",
    titleKey: "home.feature_vote_title",
    descKey: "home.feature_vote_desc",
    path: "/vote",
    color: "#d97706",
  },
  {
    icon: "🌐",
    titleKey: "home.feature_multilingual_title",
    descKey: "home.feature_multilingual_desc",
    path: "/chat",
    color: "#dc2626",
  },
];

const STATS = [
  { value: "95Cr+", label: "Registered Voters", icon: "👥" },
  { value: "543", label: "Lok Sabha Seats", icon: "🏛️" },
  { value: "28+", label: "States & UTs", icon: "🗺️" },
  { value: "1947", label: "Democratic Since", icon: "🇮🇳" },
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <div className="hero-bg-orbs" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fade-in">
            <span>🇮🇳</span> Powered by Google Gemini AI
          </div>
          <h1 id="hero-heading" className="hero-title animate-fade-in-up">
            {t("home.hero_title")}
          </h1>
          <p className="hero-subtitle animate-fade-in-up">
            {t("home.hero_subtitle")}
          </p>
          <div className="hero-actions animate-fade-in-up">
            <Link
              to="/chat"
              className="btn btn-primary btn-lg"
              aria-label="Open AI Election Assistant"
            >
              🤖 {t("home.cta_chat")}
            </Link>
            <Link
              to="/journey"
              className="btn btn-secondary btn-lg"
              aria-label="Explore election journey steps"
            >
              🗺️ {t("home.cta_journey")}
            </Link>
          </div>

          {/* Stats */}
          <div
            className="stats-grid"
            role="list"
            aria-label="Indian election statistics"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-card glass" role="listitem">
                <span className="stat-icon" aria-hidden="true">
                  {stat.icon}
                </span>
                <span className="stat-value gradient-text">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        className="features-section section"
        aria-labelledby="features-heading"
      >
        <div className="container">
          <div className="section-header">
            <h2 id="features-heading" className="section-title">
              Everything You Need to Vote
            </h2>
            <p className="section-subtitle">
              Comprehensive tools to understand and participate in Indian
              democracy
            </p>
          </div>
          <div className="features-grid" role="list">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.titleKey}
                to={feature.path}
                className="feature-card card"
                role="listitem"
                aria-label={`${t(feature.titleKey)}: ${t(feature.descKey)}`}
                style={{
                  "--feature-color": feature.color,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="feature-icon"
                  aria-hidden="true"
                  style={{
                    background: `${feature.color}20`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{t(feature.titleKey)}</h3>
                <p className="feature-desc">{t(feature.descKey)}</p>
                <span className="feature-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section section" aria-labelledby="how-heading">
        <div className="container">
          <h2
            id="how-heading"
            className="section-title"
            style={{ textAlign: "center" }}
          >
            How BallotBuddy Works
          </h2>
          <div className="steps-flow">
            {[
              {
                step: 1,
                icon: "💬",
                title: "Ask a Question",
                desc: "Type or speak your election question in your language",
              },
              {
                step: 2,
                icon: "🤖",
                title: "AI Analyzes",
                desc: "Google Gemini AI processes your query with ECI guidelines",
              },
              {
                step: 3,
                icon: "📋",
                title: "Get Guidance",
                desc: "Receive step-by-step instructions, checklists, and timelines",
              },
              {
                step: 4,
                icon: "🗳️",
                title: "Vote Confidently",
                desc: "Practice with our simulator and vote on election day",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flow-item"
                aria-label={`Step ${item.step}: ${item.title}`}
              >
                <div className="flow-step-number" aria-hidden="true">
                  {item.step}
                </div>
                <div className="flow-icon" aria-hidden="true">
                  {item.icon}
                </div>
                <h3 className="flow-title">{item.title}</h3>
                <p className="flow-desc">{item.desc}</p>
                {i < 3 && (
                  <div className="flow-connector" aria-hidden="true">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2>Ready to Make Your Voice Heard?</h2>
          <p>
            Join millions of informed voters. Ask BallotBuddy AI your first
            question today.
          </p>
          <Link to="/chat" className="btn btn-primary btn-lg">
            🚀 Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  );
}
