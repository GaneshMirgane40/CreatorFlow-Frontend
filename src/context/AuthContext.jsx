import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_ROLE_KEY = 'auth_role';

function safeGetItem(key) {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  // Initialize synchronously from localStorage to avoid UI flicker
  const [token, setToken] = useState(() => safeGetItem(AUTH_TOKEN_KEY) || null);
  const [role, setRole] = useState(() => safeGetItem(AUTH_ROLE_KEY) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(safeGetItem(AUTH_TOKEN_KEY)));

  // Keep state in sync for other tabs/windows
  useEffect(() => {
    function onStorage(e) {
      if (!e) return;
      if (e.key === AUTH_TOKEN_KEY) {
        setToken(e.newValue || null);
        setIsAuthenticated(Boolean(e.newValue));
      }
      if (e.key === AUTH_ROLE_KEY) {
        setRole(e.newValue || null);
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = (newToken, newRole = null) => {
    if (!newToken) {
      throw new Error('login requires a valid token');
    }

    try {
      localStorage.setItem(AUTH_TOKEN_KEY, String(newToken));
      if (newRole !== null && newRole !== undefined) {
        localStorage.setItem(AUTH_ROLE_KEY, String(newRole));
      } else {
        localStorage.removeItem(AUTH_ROLE_KEY);
      }
    } catch {
      // localStorage may fail in some environments; still update in-memory state
      // Consider reporting the error to monitoring in real apps
    }

    setToken(String(newToken));
    setRole(newRole !== undefined && newRole !== null ? String(newRole) : null);
    setIsAuthenticated(true);
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_ROLE_KEY);
    } catch {
      // ignore
    }

    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    role,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

