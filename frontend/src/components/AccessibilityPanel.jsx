// src/components/AccessibilityPanel.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccessibility } from "../context/AccessibilityContext";
import "./AccessibilityPanel.css";

const AccessibilityPanel = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const {
    highContrast,
    setHighContrast,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    screenReaderMode,
    setScreenReaderMode,
  } = useAccessibility();

  return (
    <div className="a11y-panel-wrapper">
      <button
        className="a11y-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label={t("accessibility.toggle")}
        title={t("accessibility.toggle")}
      >
        ♿
      </button>

      {open && (
        <div
          id="a11y-panel"
          className="a11y-panel"
          role="dialog"
          aria-label="Accessibility options panel"
        >
          <h2 className="a11y-panel-title" id="a11y-panel-title">
            ♿ {t("accessibility.toggle")}
          </h2>

          {/* High Contrast */}
          <div className="a11y-option">
            <label htmlFor="high-contrast-toggle" className="a11y-option-label">
              🌗 {t("accessibility.high_contrast")}
            </label>
            <button
              id="high-contrast-toggle"
              role="switch"
              aria-checked={highContrast}
              className={`a11y-toggle ${highContrast ? "on" : ""}`}
              onClick={() => setHighContrast((v) => !v)}
            >
              <span className="a11y-toggle-thumb" />
            </button>
          </div>

          {/* Font Size */}
          <div className="a11y-option">
            <span className="a11y-option-label" id="font-size-label">
              🔤 {t("accessibility.font_size")}: {Math.round(fontScale * 100)}%
            </span>
            <div
              className="a11y-font-controls"
              role="group"
              aria-labelledby="font-size-label"
            >
              <button
                className="a11y-font-btn"
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                disabled={fontScale <= 0.8}
              >
                A-
              </button>
              <button
                className="a11y-font-btn"
                onClick={resetFontSize}
                aria-label="Reset font size"
              >
                A
              </button>
              <button
                className="a11y-font-btn"
                onClick={increaseFontSize}
                aria-label="Increase font size"
                disabled={fontScale >= 1.5}
              >
                A+
              </button>
            </div>
          </div>

          {/* Screen Reader Mode */}
          <div className="a11y-option">
            <label htmlFor="sr-mode-toggle" className="a11y-option-label">
              📢 {t("accessibility.screen_reader")}
            </label>
            <button
              id="sr-mode-toggle"
              role="switch"
              aria-checked={screenReaderMode}
              className={`a11y-toggle ${screenReaderMode ? "on" : ""}`}
              onClick={() => setScreenReaderMode((v) => !v)}
            >
              <span className="a11y-toggle-thumb" />
            </button>
          </div>

          <button
            className="a11y-close"
            onClick={() => setOpen(false)}
            aria-label="Close accessibility panel"
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
