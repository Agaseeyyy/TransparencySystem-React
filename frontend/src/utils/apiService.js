import api from './api';

// Auth related API calls
export const authService = {
  // Login 
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  // Verify token
  verifyToken: async () => {
    const response = await api.get('/api/auth/verify');
    return response.status === 200;
  },
  
  // Register
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  }
};

// Account related API calls
export const accountService = {
  // Get all accounts
  getAccounts: async (page = 0, size = 10, sortField = 'email', sortDirection = 'asc', role = '') => {
    const response = await api.get('/api/v1/accounts', {
      params: { pageNumber: page, pageSize: size, sortField, sortDirection, role }
    });
    return response.data;
  },
  
  // Get accounts by role
  getAccountsByRole: async (role) => {
    const response = await api.get(`/api/v1/accounts/role/${role}`);
    return response.data;
  },
  
  // Add new account
  addAccount: async (studentId, accountData) => {
    const response = await api.post(`/api/v1/accounts/${studentId}`, accountData);
    return response.data;
  },
  
  // Update account
  updateAccount: async (accountId, accountData) => {
    const response = await api.put(`/api/v1/accounts/${accountId}`, accountData);
    return response.data;
  },
  
  // Delete account
  deleteAccount: async (accountId) => {
    const response = await api.delete(`/api/v1/accounts/${accountId}`);
    return response.data;
  },
  
  // Get account by ID
  getAccountById: async (accountId) => {
    try {
      const response = await api.get(`/api/v1/accounts/${accountId}`);
      console.log('Account details response for ID', accountId, ':', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching account by ID:', error);
      throw error;
    }
  },

  // Get remittance status for class treasurers by fee
  getRemittanceStatusByFee: async (feeId, pageNumber = 0, pageSize = 10, sortField = 'account.student.lastName', sortDirection = 'asc', program = 'all', yearLevel = 'all', section = 'all') => {
    try {
      const response = await api.get(`/api/v1/accounts/fees/${feeId}/remittance-status`, {
        params: {
          pageNumber,
          pageSize,
          sortField,
          sortDirection,
          program,
          yearLevel,
          section
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error retrieving remittance status:', error);
      throw error;
    }
  }
};

// Student related API calls
export const studentService = {
  // Get all students with filtering
  getStudents: async (params = {}) => {
    const response = await api.get('/api/v1/students', { params });
    return response.data;
  },

  // Get all students without filtering
  getAllStudents: async () => {
    const response = await api.get('/api/v1/students/all');
    return response.data;
  },
  
  // Get students by class (program, year, section)
  getStudentsByClass: async (program, yearLevel, section) => {
    const response = await api.get(`/api/v1/students/programs/${program}/${yearLevel}/${section}`);
    return response.data;
  },
  
  // Get students without accounts
  getStudentsWithoutAccounts: async () => {
    const response = await api.get('/api/v1/students/without-accounts');
    return response.data;
  },
  
  // Add new student
  addStudent: async (programId, studentData) => {
    const response = await api.post(`/api/v1/students/programs/${programId}`, studentData);
    return response.data;
  },
  
  // Update student
  updateStudent: async (studentId, programId, studentData) => {
    const response = await api.put(`/api/v1/students/${studentId}/programs/${programId}`, studentData);
    return response.data;
  },
  
  // Delete student
  deleteStudent: async (studentId) => {
    const response = await api.delete(`/api/v1/students/${studentId}`);
    return response.data;
  },

  // Generate student report
  generateStudentReport: async (params = {}) => {
    // Remove 'reportFormat' and 'fields' from params if they exist, as they are for frontend use
    const { reportFormat, fields, ...apiParams } = params;
    
    // For Class Treasurers, automatically apply class restrictions
    try {
      const userString = localStorage.getItem('auth_user');
      const user = userString ? JSON.parse(userString) : null;
      
      if (user && (user.role === 'Class Treasurer' || user.role === 'Class\u00A0Treasurer' || user.role === 'Class_Treasurer')) {
        console.log('Applying class restrictions for Class Treasurer student report generation');
        
        // Try to get class info from user object first
        let program = user.programCode || user.program;
        let yearLevel = user.yearLevel;
        let section = user.section;
        
        // If not available in user object, fetch from API
        if (!program || !yearLevel || !section) {
          try {
            const accountDetails = await accountService.getAccountById(user.accountId);
            
            // Try nested structure first
            if (accountDetails.student && accountDetails.student.program) {
              const student = accountDetails.student;
              const programInfo = student.program;
              
              program = programInfo.programId;
              yearLevel = student.yearLevel;
              section = student.section;
            }
            // Try direct fields as fallback
            else if (accountDetails.programCode) {
              program = accountDetails.programCode;
              yearLevel = accountDetails.yearLevel;
              section = accountDetails.section;
            }
          } catch (error) {
            console.error('Error fetching class info for student report generation:', error);
            throw new Error('Failed to load class information for report generation');
          }
        }
        
        // Override any existing class filters with the treasurer's actual class
        if (program) apiParams.program = program;
        if (yearLevel) apiParams.yearLevel = String(yearLevel);
        if (section) apiParams.section = section;
        
        console.log('Class restrictions applied to student report:', { program, yearLevel, section });
      }
    } catch (error) {
      console.error('Error applying class restrictions for student report:', error);
      // Continue with original params if class restriction fails
    }
    
    const response = await api.get('/api/v1/students/report', { params: apiParams });
    // Map additional fields for report generation
    return response.data.map(student => ({
      ...student,
      fullName: `${student.lastName || ''}, ${student.firstName || ''}${student.middleInitial ? ` ${student.middleInitial}.` : ''}`.trim(),
      yearSec: student.yearLevel && student.section ? `${student.yearLevel} - ${student.section}` : '-'
    })); 
  }
}; 

// Program related API calls
export const programService = {
  // Get all programs
  getPrograms: async (page = 0, size = 10, sortField = 'programId', sortDirection = 'asc', departmentId = null) => {
    const params = { pageNumber: page, pageSize: size, sortField, sortDirection };
    if (departmentId) params.departmentId = departmentId;
    
    const response = await api.get('/api/v1/programs', { params });
    return response.data;
  },
  
  // Add new program
  addProgram: async (departmentId, programData) => {
    const response = await api.post(`/api/v1/programs/departments/${departmentId}`, programData);
    return response.data;
  },
  
  // Update program
  updateProgram: async (programId, departmentId, programData) => {
    const response = await api.put(`/api/v1/programs/${programId}/departments/${departmentId}`, programData);
    return response.data;
  },
  
  // Delete program
  deleteProgram: async (programId) => {
    const response = await api.delete(`/api/v1/programs/${programId}`);
    return response.data;
  }
};

// Department related API calls
export const departmentService = {
  // Get all departments
  getDepartments: async (page = 0, size = 10, sortField = 'departmentId', sortDirection = 'asc') => {
    const response = await api.get('/api/v1/departments', {
      params: { pageNumber: page, pageSize: size, sortField, sortDirection }
    });
    return response.data;
  },
  
  // Add new department
  addDepartment: async (departmentData) => {
    const response = await api.post('/api/v1/departments', departmentData);
    return response.data;
  },
  
  // Update department
  updateDepartment: async (oldDepartmentId, departmentData) => {
    const response = await api.put(`/api/v1/departments/${oldDepartmentId}`, departmentData);
    return response.data;
  },
  
  // Delete department
  deleteDepartment: async (departmentId) => {
    const response = await api.delete(`/api/v1/departments/${departmentId}`);
    return response.data;
  }
};

// Fee related API calls
export const feeService = {
  // Get all fees
  getFees: async (page = 0, size = 10, sortField = 'feeId', sortDirection = 'asc') => {
    const response = await api.get('/api/v1/fees', {
      params: { pageNumber: page, pageSize: size, sortField, sortDirection }
    });
    return response.data;
  },
  
  // Add new fee
  addFee: async (feeData) => {
    const response = await api.post('/api/v1/fees', feeData);
    return response.data;
  },
  
  // Update fee
  updateFee: async (feeId, feeData) => {
    const response = await api.put(`/api/v1/fees/${feeId}`, feeData);
    return response.data;
  },
  
  // Delete fee
  deleteFee: async (feeId) => {
    const response = await api.delete(`/api/v1/fees/${feeId}`);
    return response.data;
  }
};

// Payment related API calls
export const paymentService = {
  // Get all payments with filtering
  getPayments: async (params = {}) => {
    const response = await api.get('/api/v1/payments', { params });
    return response.data;
  },
  
  // Get payments for a specific class
  getClassPayments: async (program, yearLevel, section) => {
    const response = await api.get(`/api/v1/payments/students/${program}/${yearLevel}/${section}`);
    return response.data;
  },
  
  // Get payments for a specific class and fee
  getTotalAmountByClassAndFee: async (program, yearLevel, section, feeId) => {
    const response = await api.get(
      `/api/v1/payments/students/${program}/${yearLevel}/${section}/fees/${feeId}`
    );
    return response.data;
  },
  
  
  // Add new payment: feeId, studentId, paymentData
  addPayment: async (feeId, studentId, paymentData) => {
    const response = await api.post(
      `/api/v1/payments/fees/${feeId}/students/${studentId}`, 
      paymentData
    );
    return response.data;
  },
  
  // Update payment
  updatePayment: async (paymentId, feeId, studentId, paymentData) => {
    const response = await api.put(
      `/api/v1/payments/${paymentId}/fees/${feeId}/students/${studentId}`, 
      paymentData
    );
    return response.data;
  },
  
  // Delete payment
  deletePayment: async (paymentId) => {
    const response = await api.delete(`/api/v1/payments/${paymentId}`);
    return response.data;
  },
  
  // Get payment status for all students by fee type
  getPaymentStatusByFee: async (feeId, program = 'all', yearLevel = 'all', section = 'all', status = 'all', sortField = 'paymentDate', sortDirection = 'desc', page = 0, size = 10) => {
    const params = {
      pageNumber: page,
      pageSize: size,
      sortField: sortField,
      sortDirection: sortDirection
    };
    
    // Note: For Class Treasurers, the backend will automatically apply class restrictions
    // regardless of what filter values are passed from the frontend
    if (program !== 'all') params.program = program;
    if (yearLevel !== 'all') params.yearLevel = yearLevel;
    if (section !== 'all') params.section = section;
    if (status !== 'all') params.status = status;
    
    const response = await api.get(`/api/v1/payments/fee/${feeId}/status`, { params });
    
    // Return both the content and pagination info
    return {
      content: response.data.content.map(item => ({
        paymentId: item.paymentId,
        studentId: item.studentId,
        firstName: item.firstName,
        lastName: item.lastName,
        middleInitial: item.middleInitial,
        yearLevel: item.yearLevel,
        section: item.section,
        programId: item.programId,
        feeId: item.feeId,
        feeType: item.feeType,
        amount: item.amount,
        status: item.status,
        paymentDate: item.paymentDate,
        remarks: item.remarks
      })),
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      number: response.data.number,
      size: response.data.size
    };
  },

  // Generate payment report
  generatePaymentReport: async (params = {}) => {
    // Remove 'reportFormat' and 'fields' from params if they exist, as they are for frontend use
    const { reportFormat, fields, ...apiParams } = params;
    
    // Ensure feeId is prioritized if feeType is present (as per DataTable's reportFilters)
    if (apiParams.feeType && apiParams.feeType !== 'all') {
      apiParams.feeId = apiParams.feeType;
      delete apiParams.feeType; // Remove original feeType to avoid conflict if backend expects only feeId
    }
    
    // For Class Treasurers, automatically apply class restrictions by fetching their class info
    try {
      const userString = localStorage.getItem('auth_user');
      const user = userString ? JSON.parse(userString) : null;
      
      if (user && (user.role === 'Class Treasurer' || user.role === 'Class\u00A0Treasurer' || user.role === 'Class_Treasurer')) {
        console.log('Applying class restrictions for Class Treasurer report generation');
        
        // Try to get class info from user object first
        let program = user.programCode || user.program;
        let yearLevel = user.yearLevel;
        let section = user.section;
        
        // If not available in user object, fetch from API
        if (!program || !yearLevel || !section) {
          try {
            const accountDetails = await accountService.getAccountById(user.accountId);
            
            // Try nested structure first
            if (accountDetails.student && accountDetails.student.program) {
              const student = accountDetails.student;
              const programInfo = student.program;
              
              program = programInfo.programId;
              yearLevel = student.yearLevel;
              section = student.section;
            }
            // Try direct fields as fallback
            else if (accountDetails.programCode) {
              program = accountDetails.programCode;
              yearLevel = accountDetails.yearLevel;
              section = accountDetails.section;
            }
          } catch (error) {
            console.error('Error fetching class info for report generation:', error);
            throw new Error('Failed to load class information for report generation');
          }
        }
        
        // Override any existing class filters with the treasurer's actual class
        if (program) apiParams.program = program;
        if (yearLevel) apiParams.yearLevel = String(yearLevel);
        if (section) apiParams.section = section;
        
        console.log('Class restrictions applied to payment report:', { program, yearLevel, section });
      }
    } catch (error) {
      console.error('Error applying class restrictions for report:', error);
      // Continue with original params if class restriction fails
    }
    
    // Note: The backend will also apply class restrictions server-side for Class Treasurers
    const response = await api.get('/api/v1/payments/report', { params: apiParams });
    
    // Map programId to program attribute
    return response.data.map(payment => ({
      ...payment,
      program: payment.programId
    }));
  }
};

// Remittance related API calls
export const remittanceService = {
  // Get all remittances
  getRemittances: async (params = {}) => {
    const response = await api.get('/api/v1/remittances', { params });
    return response.data;
  },
  
  // Get both remitted and unremitted treasurers for a specific fee
  getRemittancesByAccountAndFee: async (feeId, page = 0, size = 100, sortField = 'student.lastName', sortDirection = 'asc', program = 'all', yearLevel = 'all', section = 'all') => {
    const response = await api.get(`/api/v1/accounts/fees/${feeId}/remittance-status`, {
      params: { 
        pageNumber: page, 
        pageSize: size, 
        sortField, 
        sortDirection,
        program,
        yearLevel,
        section 
      }
    });
    return response.data;
  },
  
  // Add new remittance
  addRemittance: async (feeId, userId, remittanceData) => {
    const response = await api.post(
      `/api/v1/remittances/fees/${feeId}/users/${userId}`, 
      remittanceData
    );
    return response.data;
  },
  
  // Update remittance
  updateRemittance: async (remittanceId, feeId, userId, remittanceData) => {
    const response = await api.put(
      `/api/v1/remittances/${remittanceId}/fees/${feeId}/users/${userId}`, 
      remittanceData
    );
    return response.data;
  },
  
  // Delete remittance
  deleteRemittance: async (remittanceId) => {
    const response = await api.delete(`/api/v1/remittances/${remittanceId}`);
    return response.data;
  },

  // Generate remittance report
  generateRemittanceReport: async (params = {}) => {
    const { reportFormat, fields, ...apiParams } = params;
    // Ensure 'remittedBy' is passed as 'accountId' if it exists in apiParams
    if (apiParams.remittedBy && apiParams.remittedBy !== 'all') {
      apiParams.accountId = apiParams.remittedBy;
      delete apiParams.remittedBy;
    }
    // Ensure feeId is prioritized if feeType is present
    if (apiParams.feeType && apiParams.feeType !== 'all') {
      apiParams.feeId = apiParams.feeType;
      delete apiParams.feeType;
    }
    
    // For Class Treasurers, automatically apply class restrictions
    try {
      const userString = localStorage.getItem('auth_user');
      const user = userString ? JSON.parse(userString) : null;
      
      if (user && (user.role === 'Class Treasurer' || user.role === 'Class\u00A0Treasurer' || user.role === 'Class_Treasurer')) {
        console.log('Applying class restrictions for Class Treasurer remittance report generation');
        
        // Try to get class info from user object first
        let program = user.programCode || user.program;
        let yearLevel = user.yearLevel;
        let section = user.section;
        
        // If not available in user object, fetch from API
        if (!program || !yearLevel || !section) {
          try {
            const accountDetails = await accountService.getAccountById(user.accountId);
            
            // Try nested structure first
            if (accountDetails.student && accountDetails.student.program) {
              const student = accountDetails.student;
              const programInfo = student.program;
              
              program = programInfo.programId;
              yearLevel = student.yearLevel;
              section = student.section;
            }
            // Try direct fields as fallback
            else if (accountDetails.programCode) {
              program = accountDetails.programCode;
              yearLevel = accountDetails.yearLevel;
              section = accountDetails.section;
            }
          } catch (error) {
            console.error('Error fetching class info for remittance report generation:', error);
            throw new Error('Failed to load class information for report generation');
          }
        }
        
        // Override any existing class filters with the treasurer's actual class
        if (program) apiParams.program = program;
        if (yearLevel) apiParams.yearLevel = String(yearLevel);
        if (section) apiParams.section = section;
        
        console.log('Class restrictions applied to remittance report:', { program, yearLevel, section });
      }
    } catch (error) {
      console.error('Error applying class restrictions for remittance report:', error);
      // Continue with original params if class restriction fails
    }
    
    const response = await api.get('/api/v1/remittances/report', { params: apiParams });
    return response.data;
  }
};

// Email related API calls
export const emailService = {
  // Send payment announcement
  sendAnnouncement: async (data) => {
    const response = await api.post('/api/v1/emails/announcement', data);
    return response.data;
  },

  // Trigger manual email actions (reminders, overdue)
  triggerEmailAction: async (action) => {
    const response = await api.get(`/api/v1/emails/trigger-${action}`);
    return response.data;
  }
};

// Expense related API calls
export const expenseService = {
  // Get all expenses with optional filters and pagination
  getExpenses: async (params = {}) => {
    const response = await api.get('/api/expenses', { params });
    return response.data;
  },

  // Get a single expense by ID
  getExpenseById: async (expenseId) => {
    const response = await api.get(`/api/expenses/${expenseId}`);
    return response.data;
  },

  // Create a new expense
  createExpense: async (expenseData) => {
    // Get the current user's accountId from localStorage
    const userString = localStorage.getItem('auth_user');
    const user = userString ? JSON.parse(userString) : null;
    const accountId = user?.accountId;
    
    if (!accountId) {
      throw new Error('User account ID is required to create an expense');
    }
    
    const response = await api.post('/api/expenses', expenseData, {
      params: { createdByAccountId: accountId }
    });
    return response.data;
  },

  // Create a new expense with file upload
  createExpenseWithFile: async (expenseData, documentationFile) => {
    // Get the current user's accountId from localStorage
    const userString = localStorage.getItem('auth_user');
    const user = userString ? JSON.parse(userString) : null;
    const accountId = user?.accountId;
    
    if (!accountId) {
      throw new Error('User account ID is required to create an expense');
    }

    const formData = new FormData();
    formData.append('expenseData', JSON.stringify(expenseData));
    formData.append('createdByAccountId', accountId);
    
    if (documentationFile) {
      formData.append('documentation', documentationFile);
    }

    const response = await api.post('/api/expenses/with-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing expense
  updateExpense: async (expenseId, expenseData) => {
    const response = await api.put(`/api/expenses/${expenseId}`, expenseData);
    return response.data;
  },

  // Update an existing expense with file upload
  updateExpenseWithFile: async (expenseId, expenseData, documentationFile) => {
    const formData = new FormData();
    formData.append('expenseData', JSON.stringify(expenseData));
    
    if (documentationFile) {
      formData.append('documentation', documentationFile);
    }

    const response = await api.put(`/api/expenses/${expenseId}/with-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete an expense
  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/api/expenses/${expenseId}`);
    return response.data;
  },

  // Approve an expense
  approveExpense: async (expenseId, approvalRemarks = '') => {
    // Get the current user's accountId from localStorage
    const userString = localStorage.getItem('auth_user');
    const user = userString ? JSON.parse(userString) : null;
    const accountId = user?.accountId;
    
    if (!accountId) {
      throw new Error('User account ID is required to approve an expense');
    }
    
    const response = await api.post(`/api/expenses/${expenseId}/approve`, 
      { approvalRemarks },
      { params: { approvedByAccountId: accountId } }
    );
    return response.data;
  },

  // Reject an expense
  rejectExpense: async (expenseId, approvalRemarks = '') => {
    // Get the current user's accountId from localStorage
    const userString = localStorage.getItem('auth_user');
    const user = userString ? JSON.parse(userString) : null;
    const accountId = user?.accountId;
    
    if (!accountId) {
      throw new Error('User account ID is required to reject an expense');
    }
    
    const response = await api.post(`/api/expenses/${expenseId}/reject`, 
      { approvalRemarks },
      { params: { rejectedByAccountId: accountId } }
    );
    return response.data;
  },

  // Mark an expense as paid
  markAsPaid: async (expenseId, paymentDate = null) => {
    // Get the current user's accountId from localStorage
    const userString = localStorage.getItem('auth_user');
    const user = userString ? JSON.parse(userString) : null;
    const accountId = user?.accountId;
    
    if (!accountId) {
      throw new Error('User account ID is required to mark an expense as paid');
    }
    
    const requestBody = {};
    if (paymentDate) {
      requestBody.paymentDate = paymentDate;
    }
    
    const response = await api.post(`/api/expenses/${expenseId}/pay`, 
      requestBody,
      { params: { paidByAccountId: accountId } }
    );
    return response.data;
  },

  // Get expense categories for filtering
  getExpenseCategories: async () => {
    const response = await api.get('/api/expenses/categories');
    return response.data;
  },

  // Get expense statuses for filtering
  getExpenseStatuses: async () => {
    const response = await api.get('/api/expenses/statuses');
    return response.data;
  },

  // Get expenses analytics
  getExpenseAnalytics: async () => {
    const response = await api.get('/api/expenses/analytics/summary');
    return response.data;
  },

  // Generate expense transparency report
  generateTransparencyReport: async (params = {}) => {
    const response = await api.get('/api/expenses/transparency/report', { params });
    return response.data;
  },
};

// Dashboard related API calls
export const dashboardService = {
  getAdminDashboardSummary: async () => {
    const response = await api.get('/api/v1/dashboard/admin-summary');
    return response.data;
  },
  getClassTreasurerDashboardSummary: async () => {
    const response = await api.get('/api/v1/dashboard/class-treasurer-summary');
    return response.data;
  },
  getPublicDashboardSummary: async () => {
    const response = await api.get('/api/v1/public/dashboard-summary');
    return response.data;
  },
  // New function to get fee utilization breakdown
  getFeeUtilizationBreakdown: async () => {
    const response = await api.get('/api/v1/dashboard/admin/fee-utilization');
    return response.data;
  }
};

// File utility functions
export const fileUtils = {
  // Generate file view URL
  getFileViewUrl: (path) => {
    if (!path) return null;
    return `http://localhost:8080/api/files/serve?path=${encodeURIComponent(path)}`;
  },
  
  // Generate file download URL
  getFileDownloadUrl: (path) => {
    if (!path) return null;
    return `http://localhost:8080/api/files/serve?path=${encodeURIComponent(path)}&download=true`;
  },
  
  // Extract filename from path
  getFileName: (path) => {
    if (!path) return null;
    return path.split('/').pop();
  },
  
  // Check if file exists based on path
  hasFile: (path) => {
    return path && path.length > 0;
  },
  
  // Delete file
  deleteFile: async (path) => {
    if (!path) return false;
    try {
      const response = await api.delete('/api/files/delete', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};