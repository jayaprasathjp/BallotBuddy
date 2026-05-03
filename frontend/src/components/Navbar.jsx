// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

const NAV_LINKS = [
  { key: "nav.chat", path: "/chat", icon: "🤖" },
  { key: "nav.journey", path: "/journey", icon: "🗺️" },
  { key: "nav.timeline", path: "/timeline", icon: "📅" },
  { key: "nav.candidates", path: "/candidates", icon: "👥" },
  { key: "nav.vote", path: "/vote", icon: "🗳️" },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("ballotbuddy_lang", lang);
  };

  return (
    <header className="navbar" role="banner">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" aria-label="BallotBuddy AI - Home">
          <span className="navbar-logo-icon" aria-hidden="true">
            🗳️
          </span>
          <span className="navbar-logo-text">
            Ballot<span className="gradient-text">Buddy</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {NAV_LINKS.map(({ key, path, icon }) => (
            <Link
              key={path}
              to={path}
              className={`navbar-link ${location.pathname === path ? "active" : ""}`}
              aria-current={location.pathname === path ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span>
              {t(key)}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="navbar-actions">
          {/* Language Switcher */}
          <div
            className="lang-switcher"
            role="group"
            aria-label="Language selection"
          >
            {["en", "hi", "ta"].map((lang) => (
              <button
                key={lang}
                className={`lang-btn ${i18n.language === lang ? "active" : ""}`}
                onClick={() => changeLanguage(lang)}
                aria-pressed={i18n.language === lang}
                aria-label={`Switch to ${lang === "en" ? "English" : lang === "hi" ? "Hindi" : "Tamil"}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Removed Auth Controls for simplified access */}

          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
            <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-label="Mobile navigation menu"
      >
        <nav>
          {NAV_LINKS.map(({ key, path, icon }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-nav-link ${location.pathname === path ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
              aria-current={location.pathname === path ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span> {t(key)}
            </Link>
          ))}
          <div className="mobile-lang-switcher">
            {["en", "hi", "ta"].map((lang) => (
              <button
                key={lang}
                className={`lang-btn ${i18n.language === lang ? "active" : ""}`}
                onClick={() => {
                  changeLanguage(lang);
                  setMenuOpen(false);
                }}
              >
                {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "தமிழ்"}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
