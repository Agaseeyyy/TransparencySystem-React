import { useState, useRef, useEffect } from 'react'; // Add useRef and useEffect
import { useLocation, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Menu, Search, Bell, X, Send, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';

// Add this CSS to your project for the animations
// You can add this to a separate CSS file or use styled-components
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.search-results-animation {
  animation: fadeIn 0.2s ease-out forwards;
}
`;

const Navbar = ({ collapsed, toggleSidebar }) => {
  // Existing state variables and hooks...
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Add this for click-outside behavior
  const searchFormRef = useRef(null);
  
  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setSearchResults(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchFormRef]);

  // Function to trigger email actions
  const triggerAction = async (action) => {
    setLoading(true);
    
    try {
      await axios.get(
        `http://localhost:8080/api/v1/emails/trigger-${action}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setActionResult({
        success: true,
        message: `${action === 'reminders' ? 'Payment reminders' : 'Overdue notifications'} sent!`
      });

      // Hide success message after 3 seconds
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      setActionResult({
        success: false,
        message: `Failed to send ${action}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Update handleSearch function to properly process the results
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/search/global?q=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.data && response.data.status === 'success') {
        setSearchResults(response.data.results);
        console.log("Search results:", response.data.results);
      } else {
        setSearchResults({
          students: [],
          fees: [],
          payments: [],
          remittances: []
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/fees':
        return 'Fees';
      case '/accounts':
        return 'Accounts';
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
      case '/email-management':
        return 'Email Management';
      case '/settings':
        return 'Settings';
      default:
        return 'Public Dashboard';
    }
  }

  // Update your return statement to include the form with the positioned dropdown:
  return (
    <>
      {/* Include animation styles */}
      <style>{animationStyles}</style>
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
              <h1 className="text-xl font-semibold text-rose-600 lg:block">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
          )}

          {/* Right Side Content */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <form ref={searchFormRef} onSubmit={handleSearch} className="relative z-50">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-t-0 border-l-0 rounded-full animate-spin border-rose-600"></div>
                  ) : (
                    <Search className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <input
                  type="search"
                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-red-500 focus:border-red-500"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Search Results - Fixed width */}
                {searchResults && (
                  <div className="absolute z-50 mt-1 origin-top bg-white border border-gray-200 rounded-lg shadow-lg -left-20 top-full search-results-animation" 
                       style={{ width: '350px', maxWidth: 'calc(100vw - 20px)' }}>
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-gray-50">
                      <h3 className="flex items-center text-sm font-medium text-gray-800">
                        <Search className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                        Results for "{searchTerm}"
                      </h3>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {/* Students */}
                      {searchResults.students && searchResults.students.length > 0 && (
                        <div className="p-2">
                          <h4 className="px-2 py-1 mb-1 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                            Students ({searchResults.students.length})
                          </h4>
                          <div className="space-y-1">
                            {searchResults.students.map((student) => (
                              <div 
                                key={student.id} 
                                className="p-2 transition-colors duration-150 rounded-md cursor-pointer hover:bg-rose-50"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-800">{student.title}</div>
                                  <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                    {student.formatted_id || `ID: ${student.id}`}
                                  </div>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
                                  {student.secondary_info || student.email || ''}
                                  {(student.year || student.section) && (
                                    <span className="ml-2 text-gray-400">
                                      • Year {student.year} {student.section && `Section ${student.section}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Rest of your results sections... */}
                      
                      {/* No results message */}
                      {(!searchResults.students || searchResults.students.length === 0) &&
                      (!searchResults.fees || searchResults.fees.length === 0) &&
                      (!searchResults.payments || searchResults.payments.length === 0) &&
                      (!searchResults.remittances || searchResults.remittances.length === 0) && (
                        <div className="p-6 text-center">
                          <div className="inline-flex items-center justify-center w-10 h-10 mb-3 bg-gray-100 rounded-full">
                            <Search className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">
                            No results found for "{searchTerm}"
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
                      <button 
                        onClick={() => setSearchResults(null)} 
                        className="px-3 py-1 text-xs transition-colors rounded-md text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </form>

              {/* Bell icon with dropdown */}
              <div className="relative">
                <button 
                  className="p-1.5 text-gray-500 rounded-full hover:bg-gray-100 focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 outline-none"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                </button>

                {/* Email Management Dropdown - Improved Design */}
                {showNotifications && (
                  <div className="absolute right-0 z-10 mt-2 overflow-hidden transition-all duration-200 ease-out origin-top-right transform bg-white border border-gray-200 rounded-lg shadow-lg w-80">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-sm font-medium text-white">
                          <Send className="w-4 h-4 mr-2" />
                          Email Management
                        </h3>
                        <button 
                          onClick={() => setShowNotifications(false)} 
                          className="p-1 transition-colors rounded-full text-white/80 hover:text-white hover:bg-white/20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Admin Actions Section */}
                    {user && (user.role === "Admin" || user.role === "Org\u00A0Treasurer") && (
                      <div className="p-4">
                        {/* Result message with animation */}
                        {actionResult && (
                          <div 
                            className={`p-3 mb-3 text-sm rounded-md flex items-center justify-between ${
                              actionResult.success ? 'bg-green-50 text-green-800 border border-green-200' : 
                              'bg-red-50 text-red-800 border border-red-200'
                            } animate-fade-in`}
                          >
                            <span className="flex items-center">
                              {actionResult.success ? (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              )}
                              {actionResult.message}
                            </span>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          {/* Payment Reminders Button */}
                          <button
                            onClick={() => triggerAction('reminders')}
                            disabled={loading}
                            className={`flex items-center w-full px-4 py-3 text-sm text-left rounded-md transition-all 
                              ${loading ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-amber-50 hover:text-amber-700'} 
                              border border-transparent ${loading ? 'border-amber-200' : 'hover:border-amber-200'}`}
                          >
                            {loading ? (
                              <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                                <div className="w-5 h-5 border-b-2 rounded-full animate-spin border-amber-600"></div>
                              </div>
                            ) : (
                              <Clock className="w-5 h-5 mr-3 text-amber-500" />
                            )}
                            <div>
                              <div className="font-medium">Send Payment Reminders</div>
                              <div className="text-xs opacity-75">For upcoming dues next week</div>
                            </div>
                          </button>
                          
                          {/* Overdue Notifications Button */}
                          <button
                            onClick={() => triggerAction('overdue')}
                            disabled={loading}
                            className={`flex items-center w-full px-4 py-3 text-sm text-left rounded-md transition-all
                              ${loading ? 'bg-rose-50 text-rose-700' : 'text-gray-700 hover:bg-rose-50 hover:text-rose-700'} 
                              border border-transparent ${loading ? 'border-rose-200' : 'hover:border-rose-200'}`}
                          >
                            {loading ? (
                              <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                                <div className="w-5 h-5 border-b-2 rounded-full animate-spin border-rose-600"></div>
                              </div>
                            ) : (
                              <AlertTriangle className="w-5 h-5 mr-3 text-rose-500" />
                            )}
                            <div>
                              <div className="font-medium">Send Overdue Notifications</div>
                              <div className="text-xs opacity-75">For past due payments</div>
                            </div>
                          </button>
                        </div>
                        
                        {/* Divider */}
                        <div className="my-3 border-t border-gray-100"></div>
                        
                        {/* Link to Full Console */}
                        <Link 
                          to="/email-management" 
                          className="flex items-center w-full px-4 py-2 text-sm text-left text-blue-600 transition-colors rounded-md hover:bg-blue-50"
                          onClick={() => setShowNotifications(false)}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          <span>Open Email Management Console</span>
                        </Link>
                      </div>
                    )}

                    {/* Non-admin message */}
                    {user && !(user.role === "Admin" || user.role === "Org\u00A0Treasurer") && (
                      <div className="p-6 text-center">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          You don't have permission to access email management features.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;