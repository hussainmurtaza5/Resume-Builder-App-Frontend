import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './Context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Homepage from './pages/Homepage';

// A wrapper to protect pages that require login
function ProtectedRoute({ children }) {
  const { status, retryAuthCheck } = useAuth();
  if (status === 'checking') return <AuthStatus message="Checking your session..." />;
  if (status === 'unavailable') {
    return <AuthStatus message="We could not verify your session. Check your connection and try again." onRetry={retryAuthCheck} />;
  }
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return children;
}

// A wrapper so logged-in users can't see the login page
function PublicRoute({ children }) {
  const { status, retryAuthCheck } = useAuth();
  if (status === 'checking') return <AuthStatus message="Checking your session..." />;
  if (status === 'unavailable') {
    return <AuthStatus message="We could not verify your session. Check your connection and try again." onRetry={retryAuthCheck} />;
  }
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return children;
}

function AuthStatus({ message, onRetry }) {
  return (
    <main className="grid min-h-screen place-content-center gap-4 bg-slate-50 p-6 text-center text-slate-700">
      <p role={onRetry ? 'alert' : 'status'}>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mx-auto rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-900"
        >
          Try again
        </button>
      )}
    </main>
  );
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