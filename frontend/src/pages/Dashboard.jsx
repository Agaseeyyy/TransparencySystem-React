import React from 'react';
import { useAuth } from '../context/AuthProvider';
import AdminDashboardDisplay from '../components/AdminDashboardDisplay';
import ClassTreasurerDashboardDisplay from '../components/ClassTreasurerDashboardDisplay';
import PublicDashboardDisplay from '../components/PublicDashboardDisplay';
import { LayoutDashboard, UserCircle, AlertTriangle } from 'lucide-react';

// Define ROLES consistently with AuthProvider.jsx for comparison
const ROLES = {
  ADMIN: 'Admin',
  ORG_TREASURER: 'Org\u00A0Treasurer', // Non-breaking space
  CLASS_TREASURER: 'Class\u00A0Treasurer' // Non-breaking space
};

const Dashboard = () => {
  const auth = useAuth();
  const { user, isAuthenticated } = auth;
  // Get the role from auth.user.role
  const userRole = isAuthenticated && user ? user.role : null; 
  console.log("Dashboard userRole:", userRole); // For debugging

  let DashboardComponentToRender = PublicDashboardDisplay;
  let welcomeMessage = "Public Financial Overview";

  if (isAuthenticated && userRole) {
    // Role checks based on the ROLES object (matching AuthProvider)
    if (userRole === ROLES.ADMIN || userRole === ROLES.ORG_TREASURER) {
      DashboardComponentToRender = AdminDashboardDisplay;
      welcomeMessage = `Welcome, ${user?.name || 'System Administrator / Org Treasurer'}`;
    } else if (userRole === ROLES.CLASS_TREASURER) {
      DashboardComponentToRender = ClassTreasurerDashboardDisplay;
      welcomeMessage = `Welcome, ${user?.name || 'Class Treasurer'}`;
    } else {
      // This case covers authenticated users whose role is not one of the defined ROLES
      // (e.g. Student, Dean, Staff if they are simply strings not matching ROLES constants)
      DashboardComponentToRender = PublicDashboardDisplay;
      welcomeMessage = `Welcome, ${user?.name || 'User'}. Viewing Public Financial Overview. (Role: ${userRole})`;
    }
  } else if (isAuthenticated && !userRole) {
    DashboardComponentToRender = () => (
        <div className="p-6 text-center">
            <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold text-gray-700">Role Information Missing</h2>
            <p className="text-gray-500">Welcome, ${user?.name || 'User'}. We couldn't determine your role. Displaying public information.</p>
             <div className="mt-8"><PublicDashboardDisplay /></div>
        </div>
    );
    welcomeMessage = `Welcome, ${user?.name || 'User'}`;
  }

  return (
    <div className="min-h-screen p-2 bg-white md:p-4 rounded-xl">
      <header className="mb-4">
        <div className="flex items-center gap-2 pb-2 mb-3 border-b border-gray-300">
          <LayoutDashboard className="w-6 h-6 text-rose-600" />
          <div>
            <h1 className="text-lg font-semibold text-gray-800 md:text-xl">Transparency System Dashboard</h1>
            <p className="text-xs text-gray-500 md:text-sm">{welcomeMessage}</p>
          </div>
        </div>
      </header>
      <main>
        <DashboardComponentToRender />
      </main>
    </div>
  );
};

export default Dashboard;