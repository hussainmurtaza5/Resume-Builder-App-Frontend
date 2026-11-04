import { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, loginUser } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    status: localStorage.getItem('token') ? 'checking' : 'unauthenticated',
    token: null,
  }));
  const [checkAttempt, setCheckAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const storedToken = localStorage.getItem('token');

    if (!storedToken) return undefined;
    getCurrentUser(storedToken)
      .then(() => {
        if (active) setAuth({ status: 'authenticated', token: storedToken });
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem('token');
          setAuth({ status: 'unauthenticated', token: null });
          return;
        }
        setAuth({ status: 'unavailable', token: null });
      });

    return () => {
      active = false;
    };
  }, [checkAttempt]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('token', data.access_token);
    setAuth({ status: 'authenticated', token: data.access_token });
    return data;
  };
  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ status: 'unauthenticated', token: null });
  };
  const retryAuthCheck = () => {
    if (!localStorage.getItem('token')) {
      setAuth({ status: 'unauthenticated', token: null });
      return;
    }
    setAuth({ status: 'checking', token: null });
    setCheckAttempt((attempt) => attempt + 1);
  };

  return (
    <AuthContext.Provider
      value={{ ...auth, retryAuthCheck, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so we can just call useAuth() in our components
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
