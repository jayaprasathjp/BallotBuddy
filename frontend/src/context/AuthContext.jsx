// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    let guestId = localStorage.getItem('ballotbuddy_guest_id');

    if (!guestId) {
      guestId = `guest_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
      localStorage.setItem('ballotbuddy_guest_id', guestId);
    }

    setUser({ userId: guestId, isGuest: true });
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated: false // Always false since there is no login
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
