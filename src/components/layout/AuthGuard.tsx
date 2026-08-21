import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to={redirectTo} replace />;
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'elder') return <Navigate to="/viewer" replace />;
    if (user.role === 'creator') return <Navigate to="/creator" replace />;
    if (user.role === 'sponsor') return <Navigate to="/sponsor" replace />;
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}
