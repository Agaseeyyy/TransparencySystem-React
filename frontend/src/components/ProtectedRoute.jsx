import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  !isAuthenticated && (<Navigate to="/login" replace/>);
  
  if (requiredRoles.length === 0 || requiredRoles.includes(user.role)) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />
} 

export default ProtectedRoute