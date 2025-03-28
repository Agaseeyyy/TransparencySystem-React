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


const App =() => {

  const route = createBrowserRouter([
    { path: '/', 
      element: <Layout />,
      children:[
        { path: '/', element: <TransparencyBoard /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/unauthorized', element: <Unauthorized /> },
        {
          element: <ProtectedRoute /> ,
          children: [
            { path: '/dashboard', element: <TransparencyBoard /> },
            { path: '/payments', element: <Payments /> },
            { path: '/settings', element: <></> },
          ]
        },
        {
          element: <ProtectedRoute requiredRoles={['Admin']} /> ,
          children: [
            { path: '/accounts', element: <Account /> },
            { path: '/programs', element: <Program /> },
            { path: '/departments', element: <Department /> },
          ]
        },
        {
          element: <ProtectedRoute requiredRoles={['Admin', 'Org\u00A0Treasurer']} /> ,
          children: [
            { path: '/fees', element: <Fees/> },
            { path: '/remittances', element: <Remittance /> },
            { path: '/students', element: <Student /> },
            { path: '/email-management', element: <EmailManagement /> },
            { path: '/announcements/payment', element: <PaymentAnnouncement /> },
          ]
        },
        { path: '/*', element: <NoPage />},
      ]
    },
    
  ])

  return (
    <AuthProvider>
     <RouterProvider router={route} />
    </AuthProvider>
  )
}

export default App
