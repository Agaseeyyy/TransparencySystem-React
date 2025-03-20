import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthProvider';

const Layout = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle sidebar function that works differently for mobile vs desktop
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      // On desktop, toggle between collapsed and expanded
      setCollapsed(!collapsed);
    } else {
      // On mobile, toggle between open and closed
      setMobileOpen(!mobileOpen);
    }
  };

  // Close mobile sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when location changes (user clicks a link)
  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <Navbar
        collapsed={collapsed}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
      />
      
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar component */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        closeMobile={closeMobileSidebar}
      />

      {/* Main content */}
      <div className={`flex flex-col bg-slate-50 min-h-screen ${collapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}>
        <main className="flex-grow px-4 py-6 mx-auto w-full max-w-[1536px] max-2xl:max-w-[1280px] max-xl:max-w-[1024px]">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
