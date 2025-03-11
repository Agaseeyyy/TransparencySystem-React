import profile from "../assets/profile.webp"
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
  LogOut 
} from "lucide-react"

const Sidebar = ({ collapsed }) => {
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    isAuthenticated && logout()
  }

  const menuList = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Payments",
      path: "/payments",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      title: "Students",
      path: "/students",
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      title: "Remittance",
      path: "/remittance",
      icon: <CircleDollarSign className="w-5 h-5" />,
    },
    {
      title: "Events",
      path: "/events",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: "Departments",
      path: "/departments",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Programs",
      path: "/programs",
      icon: <School className="w-5 h-5" />,
    },
    {
      title: "Users",
      path: "/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ]

  return (
    <aside
      id="logo-sidebar"
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 border border-red-200 ease-in-out bg-rose-100 dark:bg-gray-800 ${collapsed ? "w-20" : "w-64"} max-lg:-translate-x-full`}
      aria-label="Sidebar"
    >
      <div className="flex flex-col h-full py-4 overflow-y-auto border-jpcsred">
        {/* Logo Section */}
        <a
          href="https://www.facebook.com/jpcscspc"
          className={`flex items-center ${collapsed ? "justify-center" : "px-6"} mb-6`}
        >
          <div className={`flex items-center ${collapsed ? "" : ""}`}>
            <div className={`${collapsed ? "w-8 h-8" : "mr-3 w-10 h-10"}`}>
            <img
              src="https://scontent.fmnl13-2.fna.fbcdn.net/v/t39.30808-6/352989952_643047974523812_4941044588117788236_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeFJ7pZTJHYbhZctPoH16gc3lIqKag6D6ryUiopqDoPqvBbvJgj1OKVfqIEqsRSr5zhsptB6Ny9ChXusYC-uf4x_&_nc_ohc=V-gG8iZdpycQ7kNvgE3mYsx&_nc_oc=AdgtqZ3NtqjH16vvYDp9RLa2Y4TAbObvvGg6jOX6zQXmAN7DHDrtoS9dozdQiCLCu98&_nc_zt=23&_nc_ht=scontent.fmnl13-2.fna&_nc_gid=Axuu8HmpdcwyEWW5afi6LEO&oh=00_AYDlpm5TfgCqUo28qp_cFiIcr0FGdQm9NiaUx2RXrrlIHg&oe=67C24BAD"
              className="rounded-full mr-3 sm:h-7`"
              alt="Org Logo"
            />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800 dark:text-white">JPCS CSPC Chapter</span>
            )}
          </div>
        </a>

        {/* Profile Section - Only show when not collapsed */}
        {isAuthenticated && (
          <div className="px-6 pb-6 mb-6 border-b border-red-200">
            <div className={`flex items-center ${collapsed ? "content-center" : ""}`}>
              <img src={profile || "/placeholder.svg"} alt="profile" className={`mr-3 rounded-full ${collapsed ? "w-8 h-8" : "w-10 h-10"}`} />
              {!collapsed && (
                <div>
                  <div className="font-medium text-gray-800">
                    {user?.lastName} {user?.firstName} {user?.middleInitial}.
                  </div>
                  <div className="text-sm text-red-600">{user?.role}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu List */}
        <div className="flex-1 px-3">
          <ul className="space-y-1">
            {menuList.map((menu) => (
              <li key={menu.title}>
                <Link
                  to={menu.path}
                  className={`flex items-center ${collapsed ? "justify-center" : "px-3"} py-2.5 rounded-lg text-sm ${
                    location.pathname === menu.path ? "bg-red-100 text-red-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={collapsed ? menu.title : ""}
                >
                  <span className={`${location.pathname === menu.path ? "text-red-600" : "text-gray-500"}`}>
                    {menu.icon}
                  </span>
                  {!collapsed && <span className="ml-3">{menu.title}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className={`px-3 mt-6 ${collapsed ? "flex justify-center" : ""}`}>
          <button onClick={handleLogout} className={`w-full ${collapsed ? "flex justify-center" : ""}`}>
            <Link
              to="/login"
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