import { useMemo } from "react";
import profile from "../assets/profile.webp"
import jpcs from '../assets/jpcs.png';
import { useAuth } from "../context/AuthProvider"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  CreditCard, 
  GraduationCap, 
  CircleDollarSign, 
  Calendar, 
  Users, 
  School, 
  Settings, 
  LogOut,
  X,
  Send
} from "lucide-react"
import path from "path";

const Sidebar = ({ collapsed, mobileOpen, closeMobile }) => {
  const { user, isAuthenticated, logout, can } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    isAuthenticated && logout()
  }

  // menu items
  const menuItems = [
    { path: "/dashboard", title: "Dashboard", icon: LayoutDashboard, access: "all" },
    { path: "/payments", title: "Payments", icon: CreditCard, access: "all" },
    { path: "/students", title: "Students", icon: GraduationCap, access: "orgTreasurer" },
    { path: "/remittances", title: "Remittance", icon: CircleDollarSign, access: "orgTreasurer" },
    { path: "/expenses", title: "Expenses", icon: CircleDollarSign, access: "orgTreasurer" },
    { path: "/fees", title: "Fees", icon: Calendar, access: "orgTreasurer" },
    { path: "/departments", title: "Departments", icon: Users, access: "admin" },
    { path: "/programs", title: "Programs", icon: School, access: "admin" },
    { path: "/accounts", title: "Accounts", icon: Users, access: "admin" },
    { path: "/email-management", title: "Email Management", icon: Send, access: "orgTreasurer" },
    { path: "/settings", title: "Settings", icon: Settings, access: "all" }
  ];
  
  // filter menu based on access levels
  const visibleMenu = useMemo(() => {
    return menuItems.filter(item => {
      if (item.access === "admin") return can.manageSystem();
      if (item.access === "orgTreasurer") return can.manageTransaction();
      return true; // "all" items
    });
  }, [can]);

  return (
    <aside
      id="logo-sidebar"
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 border border-red-200 ease-in-out bg-rose-100 dark:bg-gray-800 ${
        collapsed ? "w-20" : "w-64"
      } ${
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
      aria-label="Sidebar"
    >
      {/* Mobile close button */}
      {mobileOpen && (
        <button 
          onClick={closeMobile}
          className="absolute p-1 text-gray-600 rounded-lg top-4 right-4 lg:hidden hover:bg-red-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="flex flex-col h-full py-4 overflow-y-auto border-jpcsred">
        {/* Logo Section */}
        <a
          href="https://www.facebook.com/jpcscspc"
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} mb-6`}
        >
          <div className={`flex items-center ${collapsed ? "" : ""}`}>
            <div className={`${collapsed ? "w-8 h-8" : "mr-3 w-10 h-10"}`}>
            <img
              src={jpcs}
              className="rounded-full mr-3 sm:h-7`"
              alt="Org Logo"
            />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800 dark:text-white">JPCS CSPC Chapter</span>
            )}
          </div>
        </a>

        {/* Profile Section */}
        {isAuthenticated && (
          <div className="px-6 pb-6 mb-6 border-b border-red-200">
            <div className={`flex items-center ${collapsed ? "content-center" : ""}`}>
              <img src={profile || "/placeholder.svg"} alt="profile" className={`mr-3 rounded-full ${collapsed ? "w-8 h-8" : "w-10 h-10"}`} />
              {!collapsed && (
                <div>
                  <div className="font-medium text-gray-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-red-600">{user?.role}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu List */}
        {isAuthenticated && (
          <div className="flex-1 px-3">
            <ul className="space-y-1">
              {visibleMenu.map(item => (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    onClick={window.innerWidth < 1024 ? closeMobile : undefined}
                    className={`flex items-center ${collapsed ? "justify-center" : "px-3"} py-2.5 rounded-lg text-sm ${
                      location.pathname === item.path ? "bg-red-100 text-red-600" : "text-gray-600 hover:bg-gray-100"
                    }`}
                    title={collapsed ? item.title : ""}
                  >
                    <span className={location.pathname === item.path ? "text-red-600" : "text-gray-500"}>
                      <item.icon className="w-5 h-5" />
                    </span>
                    {!collapsed && <span className="ml-3">{item.title}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Logout Button */}
        <div className={`px-3 mt-6 ${collapsed ? "flex justify-center" : ""}`}>
          <button onClick={handleLogout} className={`w-full ${collapsed ? "flex justify-center" : ""}`}>
            <Link
              to="/login"
              onClick={window.innerWidth < 1024 ? closeMobile : undefined}
              className={`flex items-center ${collapsed ? "justify-center px-2" : "px-3"} py-2.5 text-sm text-gray-600 rounded-lg hover:bg-gray-100`}
              title={collapsed ? (isAuthenticated ? "Sign Out" : "Sign In") : ""}
            >
              <LogOut className="w-5 h-5 text-gray-500" />
              {!collapsed && <span className="ml-3">{isAuthenticated ? "Sign Out" : "Sign In"}</span>}
            </Link>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar