import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccessLevel = 'demo' | 'full' | null;

interface AccessContextType {
  accessLevel: AccessLevel;
  setAccessLevel: (level: AccessLevel) => void;
  hasFullAccess: boolean;
  hasDemoAccess: boolean;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (context === undefined) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
};

interface AccessProviderProps {
  children: ReactNode;
}

export const AccessProvider = ({ children }: AccessProviderProps) => {
  const [accessLevel, setAccessLevelState] = useState<AccessLevel>(null);

  const setAccessLevel = (level: AccessLevel) => {
    setAccessLevelState(level);
    if (level) {
      localStorage.setItem('cediwise_access_level', level);
    } else {
      localStorage.removeItem('cediwise_access_level');
    }
  };

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('cediwise_access_level') as AccessLevel;
    if (stored) {
      setAccessLevelState(stored);
    }

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const accessParam = params.get('access') as AccessLevel;
    if (accessParam === 'demo' || accessParam === 'full') {
      setAccessLevel(accessParam);
    }
  }, []);

  const hasFullAccess = accessLevel === 'full';
  const hasDemoAccess = accessLevel === 'demo' || accessLevel === 'full';

  return (
    <AccessContext.Provider
      value={{
        accessLevel,
        setAccessLevel,
        hasFullAccess,
        hasDemoAccess,
      }}
    >
      {children}
    </AccessContext.Provider>
  );
};