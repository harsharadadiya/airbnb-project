// Blocks pages for visitors who are not logged in (or do not have the right role).
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLoader from './PageLoader';
import BecomeHostPrompt from './BecomeHostPrompt';

export default function ProtectedRoute({ role }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <PageLoader />;

  // Not logged in -> go to login, and come back here afterwards
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  // Logged in but not a host -> offer to become one
  if (role && user.role !== role) return <BecomeHostPrompt />;

  return <Outlet />;
}
