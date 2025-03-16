import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const ProtectedRoute = ({children}) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace/>;
} 

export default ProtectedRoute