import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './pages/Layout';
import NoPage from './pages/NoPage';
import Home from './pages/Home'
import Account from './pages/Account';
import Student from './pages/Student';
import Department from './pages/Department';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Program from './pages/Program';
import Fees from './pages/Fees';
import Payments from './pages/Payments';
import Remittance from './pages/Remittance';
import Unauthorized from './pages/Unauthorized';
import TransparencyBoard from './pages/TransparencyBoard';
import EmailManagement from './pages/EmailManagement';
import PaymentAnnouncement from './components/PaymentAnnouncement';
import { Toaster } from 'sonner';

// For debugging - set up route role matching
const ROLES = {
  ADMIN: 'Admin', // Role from backend
  ORG_TREASURER: 'Org\u00A0Treasurer', // Org Treasurer with non-breaking space
  CLASS_TREASURER: 'Class\u00A0Treasurer' // Class Treasurer with non-breaking space
};

const App = () => {
  const route = createBrowserRouter([
    { 
      path: '/', 
      element: <Layout />,
      children: [
        { path: '/', element: <TransparencyBoard /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/unauthorized', element: <Unauthorized /> },
        {
          element: <ProtectedRoute />,
          children: [
            { path: '/dashboard', element: <TransparencyBoard /> },
            { path: '/payments', element: <Payments /> },
            { path: '/settings', element: <></> },
          ]
        },
        {
          // Admin only routes
          element: <ProtectedRoute requiredRoles={[ROLES.ADMIN]} />,
          children: [
            { path: '/programs', element: <Program /> },
            { path: '/departments', element: <Department /> },
          ]
        },
        {
          // Admin and Org Treasurer routes
          element: <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.ORG_TREASURER]} />,
          children: [
            { path: '/fees', element: <Fees/> },
            { path: '/remittances', element: <Remittance /> },
            { path: '/students', element: <Student /> },
            { path: '/email-management', element: <EmailManagement /> },
            { path: '/announcements/payment', element: <PaymentAnnouncement /> },
            { path: '/accounts', element: <Account /> },

          ]
        },
        { path: '/*', element: <NoPage />},
      ]
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={route} />
      <Toaster position="top-right" closeButton richColors theme="light" />
    </AuthProvider>
  )
}

export default App
