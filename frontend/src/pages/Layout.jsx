import { Outlet } from "react-router-dom"
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
import Footer from '../components/Footer'

const Layout = () =>{
  const [collapsed, setCollapsed] = useState(false)

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      <Navbar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      <Sidebar collapsed={collapsed} />
      <div className={`transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <main className="min-h-screen p-5 bg-gray-100">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout
