import { useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Menu, Search, Bell } from 'lucide-react'
import { useAuth } from '../context/AuthProvider';

const Navbar = ({ collapsed, toggleSidebar }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/fees':
        return 'Fees';
      case '/users':
        return 'Users';
      case '/programs':
        return 'Programs';
      case '/students':
        return 'Students';
      case '/departments':
        return 'Departments';
      case '/payments':
        return 'Payments';
      case '/remittances':
        return 'Remittance';
      case '/events':
        return 'Events';
      case '/settings':
        return 'Settings';
    }
  }

  return (
    <nav className="sticky top-0 z-30 w-full py-3 bg-white border-b border-gray-200 shadow-sm">
      <div
        className={`mx-auto flex items-center justify-between px-4 max-w-[1536px] max-2xl:max-w-[1280px] max-xl:max-w-[1024px] ${collapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}
      >
        {/* Desktop Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="hidden p-2 text-gray-500 rounded-lg lg:flex hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">Toggle sidebar</span>
          {collapsed ? (
            <ChevronRight className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
          )}
        </button>

        {/* Mobile Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="inline-flex p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <span className="sr-only">Toggle sidebar</span>
          <Menu className="w-6 h-6" />
        </button>
        
        {isAuthenticated && (
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-800 lg:block">
              {getPageTitle(location.pathname)}
            </h1>
          </div>
        )}

        {/* Right Side Content */}
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                placeholder="Search..."
              />
            </div>

            <button className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar