import { useState } from 'react'
import './App.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import NoPage from './pages/NoPage';
import Layout from './pages/Layout';
import LoginPage from './pages/Login';


function App() {

  const route = createBrowserRouter([
    { path: '/', 
      element: <Layout />,
      children:[
        { path: '/', element: <Home /> },
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/payments', element: <Users /> },
        { path: '/remittance', element: <Dashboard /> },
        { path: '/events', element: <Users /> },
        { path: '/users', element: <Users /> },
        { path: '/settings', element: <Users /> },
        { path: '/login', element: <LoginPage /> },
        { path: '/*', element: <NoPage />}
      ]
    },
    
  ])

  return (
    
     <RouterProvider router={route} />
  )
}

export default App
