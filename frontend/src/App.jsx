import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './pages/Layout';
import NoPage from './pages/NoPage';
import Home from './pages/Home'
import Users from './pages/Users';
import Department from './pages/Department';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/Login';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Program from './pages/Program';


const App =() => {

  const route = createBrowserRouter([
    { path: '/', 
      element: <Layout />,
      children:[
        { path: '/', element: <Home /> },
        { path: '/login', element: <LoginPage /> },
        {
          element: <ProtectedRoute /> ,
          children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/payments', element: <Users /> },
            { path: '/remittance', element: <Dashboard /> },
            { path: '/events', element: <Users /> },
            { path: '/programs', element: <Program /> },
            { path: '/departments', element: <Department /> },
            { path: '/users', element: <Users /> },
            { path: '/settings', element: <Users /> },
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
