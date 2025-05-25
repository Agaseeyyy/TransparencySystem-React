import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, accountService } from '../utils/apiService';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

// Role definitions for consistency
const ROLES = {
  ADMIN: 'Admin',
  ORG_TREASURER: 'Org\u00A0Treasurer', // With non-breaking space
  CLASS_TREASURER: 'Class\u00A0Treasurer' // With non-breaking space
};

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
  });
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      
      // Log the saved user data
      console.log('AuthProvider - Restored user from localStorage:', parsedUser);
      
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });

  // Store user and token in localStorage when they change
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      console.log('AuthProvider - User updated and stored:', user);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [token, user]);

  // Login with JWT
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      console.log('Login response data:', data);
      
      // Process role from backend
      let userRole;
      if (data.role === 'Admin') {
        userRole = ROLES.ADMIN;
      } else if (data.role === 'Org_Treasurer') {
        userRole = ROLES.ORG_TREASURER;
      } else if (data.role === 'Class_Treasurer') {
        userRole = ROLES.CLASS_TREASURER;
      } else {
        // If the role format changes, just use what came from the backend
        userRole = data.role;
      }
      
      // Save token first for API authentication
      setToken(data.token);
      
      // For Class Treasurers, fetch complete account data including student information
      let completeUserData = {
        email: data.email,
        role: userRole,
        accountId: data.accountId
      };
      
      if (data.role === 'Class_Treasurer') {
        try {
          const accountDetails = await accountService.getAccountById(data.accountId);
          console.log('Complete account details:', accountDetails);
          
          // Extract class information from nested student object
          if (accountDetails.student && accountDetails.student.program) {
            const student = accountDetails.student;
            const program = student.program;
            
            completeUserData = {
              ...completeUserData,
              // Extract class information from the nested structure
              program: program.programId,
              programCode: program.programId,
              programName: program.programName,
              yearLevel: student.yearLevel,
              section: student.section,
              firstName: student.firstName,
              lastName: student.lastName,
              middleInitial: student.middleInitial,
              studentId: student.studentId,
              // Store complete objects for reference
              studentInfo: student,
              programInfo: program
            };
            
            console.log('Class Treasurer data with extracted class info:', completeUserData);
          } else {
            console.warn('Student or program information not found in account details:', accountDetails);
            // Try alternative structure if it exists
            if (accountDetails.programCode) {
              completeUserData = {
                ...completeUserData,
                program: accountDetails.programCode,
                programCode: accountDetails.programCode,
                yearLevel: accountDetails.yearLevel,
                section: accountDetails.section,
                firstName: accountDetails.firstName,
                lastName: accountDetails.lastName,
                middleInitial: accountDetails.middleInitial,
                studentId: accountDetails.studentId
              };
              console.log('Class Treasurer data from direct account fields:', completeUserData);
            }
          }
        } catch (error) {
          console.error('Failed to fetch complete account details:', error);
          // Continue with basic user data even if fetching details fails
        }
      }
      
      setUser(completeUserData);
      
      console.log('Login successful:', email, 'with role:', userRole, 'Complete data:', completeUserData);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Logout - clear token and user data
  const logout = () => {
    setToken(null);
    setUser(null);
    return true;
  };

  // Permission checks based on role
  const can = {
    view: () => true,
    edit: () => user && [ROLES.ADMIN, ROLES.ORG_TREASURER, ROLES.CLASS_TREASURER].includes(user.role),
    create: () => user && [ROLES.ADMIN, ROLES.ORG_TREASURER, ROLES.CLASS_TREASURER].includes(user.role),
    delete: () => user && user.role === ROLES.ADMIN,
    manageTransaction: () => user && [ROLES.ADMIN, ROLES.ORG_TREASURER].includes(user.role),
    manageSystem: () => user && user.role === ROLES.ADMIN
  };

  const isAuthenticated = Boolean(token) && Boolean(user);

  // For debugging
  useEffect(() => {
    console.log('AuthProvider - Current auth state:', { 
      isAuthenticated, 
      userRole: user?.role,
      token: token ? `${token.substring(0, 10)}...` : null 
    });
  }, [isAuthenticated, user, token]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      login, 
      logout, 
      isAuthenticated,
      can 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);