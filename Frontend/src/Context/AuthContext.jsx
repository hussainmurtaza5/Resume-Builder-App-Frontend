import { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Try to load token from localStorage on first load
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // When token changes, save it to localStorage so it survives a refresh
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setToken(data.access_token);
    return data;
  };
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so we can just call useAuth() in our components
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
