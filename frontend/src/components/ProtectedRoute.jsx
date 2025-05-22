import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  // For debugging
  console.log('ProtectedRoute - Auth state:', { isAuthenticated, userRole: user?.role, requiredRoles });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check role requirements
  if (requiredRoles.length === 0 || requiredRoles.includes(user.role)) {
    console.log('ProtectedRoute - Access granted for role:', user.role);
    return <Outlet />;
  }

  console.log('ProtectedRoute - Access denied for role:', user.role, 'Required:', requiredRoles);
  return <Navigate to="/unauthorized" replace />
} 

export default ProtectedRoute