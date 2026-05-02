// src/context/AccessibilityContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  // Apply CSS custom properties when settings change
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    // Persist
    localStorage.setItem('bb_accessibility', JSON.stringify({ highContrast, fontScale, screenReaderMode }));
  }, [highContrast, fontScale, screenReaderMode]);

  // Load persisted settings
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bb_accessibility') || '{}');
      if (saved.highContrast) setHighContrast(saved.highContrast);
      if (saved.fontScale) setFontScale(saved.fontScale);
      if (saved.screenReaderMode) setScreenReaderMode(saved.screenReaderMode);
    } catch {}
  }, []);

  const increaseFontSize = () => setFontScale((s) => Math.min(s + 0.1, 1.5));
  const decreaseFontSize = () => setFontScale((s) => Math.max(s - 0.1, 0.8));
  const resetFontSize = () => setFontScale(1);

  return (
    <AccessibilityContext.Provider value={{
      highContrast, setHighContrast,
      fontScale, increaseFontSize, decreaseFontSize, resetFontSize,
      screenReaderMode, setScreenReaderMode,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};

export default AccessibilityContext;
