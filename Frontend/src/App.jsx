import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';

// A wrapper to protect pages that require login
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  // If no token, redirect to login
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// A wrapper so logged-in users can't see the login page
function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes (Login/Register) */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          {/* Protected Routes (Dashboard) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/homepage" element={<Homepage />} />
          {/* Redirect any unknown routes to homepage */}
          <Route path="/" element={<Navigate to="/homepage" replace />} />
          <Route path="*" element={<Navigate to="/homepage" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}