import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Renders children only for logged-in users. Pass role="admin" to restrict further.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="container muted">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
