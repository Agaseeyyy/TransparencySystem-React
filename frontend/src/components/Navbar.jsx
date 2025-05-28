import { useState, useRef, useEffect } from 'react'; // Add useRef and useEffect
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Menu, Search, Bell, X, Send, Clock, AlertTriangle, User, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthProvider';
import { studentService, accountService, emailService } from '../utils/apiService'; // Import emailService

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
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ students: [], treasurers: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchFormRef = useRef(null);
  
  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setSearchResults({ students: [], treasurers: [] }); // Clear results
        setSearchTerm(''); // Clear search term
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
    setActionResult(null);
    try {
      await emailService.triggerEmailAction(action); // Use emailService
      
      setActionResult({
        success: true,
        message: `${action === 'reminders' ? 'Payment reminders' : 'Overdue notifications'} sent!`
      });
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      console.error(`Error sending ${action}:`, error);
      setActionResult({
        success: false,
        message: `Failed to send ${action}. Check console for details.`
      });
      setTimeout(() => setActionResult(null), 5000); // Keep error message longer
    } finally {
      setLoading(false);
    }
  };

  // New search logic
  const handleSearch = async (e) => {
    if (e) e.preventDefault(); // Prevent form submission if event is passed
    if (searchTerm.trim().length < 2) {
      setSearchResults({ students: [], treasurers: [] });
      return;
    }
    
    setIsSearching(true);
    try {
      const [studentsResponse, treasurersResponse] = await Promise.all([
        studentService.getAllStudents(), // Fetches all students
        accountService.getAccountsByRole('Class_Treasurer') // Fetches Class Treasurers
      ]);

      const filteredStudents = studentsResponse
        .filter(student => 
          `${student.firstName || ''} ${student.lastName || ''} ${student.studentId || ''}`
          .toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(s => ({ ...s, type: 'student' }));

      const filteredTreasurers = treasurersResponse
        .filter(acc => 
          `${acc.firstName || ''} ${acc.lastName || ''} ${acc.email || ''}`
          .toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(t => ({ ...t, type: 'treasurer' }));

      setSearchResults({ students: filteredStudents, treasurers: filteredTreasurers });
      
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ students: [], treasurers: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Effect to trigger search when searchTerm changes (debounced)
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSearchResults({ students: [], treasurers: [] });
      setIsSearching(false);
      return;
    }
    if (searchTerm.trim().length >= 2) {
      const debounceSearch = setTimeout(() => {
        handleSearch(); // Call without event
      }, 300); // 300ms debounce
      return () => clearTimeout(debounceSearch);
    }
  }, [searchTerm]);

  const handleResultClick = (item) => {
    setSearchTerm(''); // Clear search term
    setSearchResults({ students: [], treasurers: [] }); // Clear results
    if (item.type === 'student') {
      navigate(`/payments?studentId=${item.studentId}&studentName=${encodeURIComponent(`${item.lastName}, ${item.firstName}`)}`);
    } else if (item.type === 'treasurer') {
      // Use top-level firstName and lastName from the account object if available, else email
      const treasurerName = (item.firstName && item.lastName) ? `${item.lastName}, ${item.firstName}` : item.email;
      navigate(`/remittances?accountId=${item.accountId}&treasurerName=${encodeURIComponent(treasurerName)}`);
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
      case '/expenses':
        return 'Expenses';
      case '/email-management':
        return 'Email Control Panel';
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
              <form ref={searchFormRef} onSubmit={handleSearch} className="relative"> {/* Removed z-50, let dropdown handle it */}
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-t-0 border-l-0 rounded-full animate-spin border-rose-600"></div>
                  ) : (
                    <Search className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <input
                  type="search"
                  className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="Search student or treasurer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Search Results Dropdown */}
                {(searchResults.students.length > 0 || searchResults.treasurers.length > 0) && (
                  <div 
                    className="absolute z-50 mt-1 origin-top bg-white border border-gray-200 rounded-lg shadow-lg -left-20 top-full search-results-animation" 
                    style={{ width: '350px', maxWidth: 'calc(100vw - 20px)' }}
                  >
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-gray-50">
                      <h3 className="flex items-center text-sm font-medium text-gray-800">
                        <Search className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
                        Results for "{searchTerm}"
                      </h3>
                    </div>
                    
                    <div className="overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {/* Students Results */}
                      {searchResults.students.length > 0 && (
                        <div className="p-2">
                          <h4 className="px-2 py-1 mb-1 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                            <User className="inline w-3 h-3 mr-1" /> Students ({searchResults.students.length})
                          </h4>
                          <div className="space-y-1">
                            {searchResults.students.map((student) => (
                              <div 
                                key={`student-${student.studentId}`} 
                                className="p-2 transition-colors duration-150 rounded-md cursor-pointer hover:bg-rose-50"
                                onClick={() => handleResultClick(student)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-800">{student.lastName}, {student.firstName} {student.middleInitial || ''}</div>
                                  <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                    ID: {student.studentId}
                                  </div>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span>
                                  {student.program || 'N/A Program'} - Year {student.yearLevel || 'N/A'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Treasurers Results */}
                      {searchResults.treasurers.length > 0 && (
                        <div className="p-2">
                          <h4 className="px-2 py-1 mb-1 text-xs font-medium text-gray-500 uppercase border-b border-gray-100">
                            <Briefcase className="inline w-3 h-3 mr-1" /> Class Treasurers ({searchResults.treasurers.length})
                          </h4>
                          <div className="space-y-1">
                            {searchResults.treasurers.map((treasurer) => (
                              <div 
                                key={`treasurer-${treasurer.accountId}`} 
                                className="p-2 transition-colors duration-150 rounded-md cursor-pointer hover:bg-rose-50"
                                onClick={() => handleResultClick(treasurer)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="font-medium text-gray-800">
                                    {/* Use top-level firstName and lastName for display */}
                                    {(treasurer.firstName && treasurer.lastName) ? `${treasurer.lastName}, ${treasurer.firstName}` : treasurer.email}
                                  </div>
                                  <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                    Account ID: {treasurer.accountId}
                                  </div>
                                </div>
                                <div className="flex items-center mt-1 text-xs text-gray-500">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
                                  {/* Display program and year level if available from student object (if it's populated), otherwise role */}
                                  {(treasurer.programCode && treasurer.yearLevel) ? `${treasurer.programCode} - Year ${treasurer.yearLevel}` : treasurer.role}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* No results message if search term is present but no results */}
                      {searchTerm && searchResults.students.length === 0 && searchResults.treasurers.length === 0 && !isSearching && (
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
                        onClick={() => { setSearchResults({ students: [], treasurers: [] }); setSearchTerm(''); }} 
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

                {/* Mail Management Dropdown - Improved Design */}
                {showNotifications && (
                  <div className="absolute right-0 z-10 mt-2 overflow-hidden transition-all duration-200 ease-out origin-top-right transform bg-white border border-gray-200 rounded-lg shadow-lg w-80">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-rose-500 to-rose-600">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-sm font-medium text-white">
                          <Send className="w-4 h-4 mr-2" />
                          Quick Mail Center
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
                          <span>Open Mail Control Panel</span>
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