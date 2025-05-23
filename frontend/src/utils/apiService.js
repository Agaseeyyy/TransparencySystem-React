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
  
  
  // Add new payment
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
    // The backend currently returns a list of payments (JSON)
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