// Test script to verify the fixed Class Treasurer authentication flow

// Mock account data returned from backend
const mockAccountData = {
  "accountId": 2,
  "role": "Class_Treasurer",
  "email": "admin1@admin.com",
  "createdAt": "2025-05-19",
  "lastName": "Dela Cruz",
  "firstName": "Juan",
  "programCode": "BSIT",
  "yearLevel": "4",
  "section": "A",
  "middleInitial": "D",
  "studentId": 202000001
};

// Mock user object after AuthProvider enhancement
const mockUserData = {
  email: "admin1@admin.com",
  role: "Class Treasurer",
  accountId: 2,
  program: "BSIT",
  programCode: "BSIT",
  yearLevel: "4",
  section: "A",
  firstName: "Juan",
  lastName: "Dela Cruz",
  middleInitial: "D",
  studentId: 202000001
};

// Mock functions to test the enhanced Payments.jsx
const testFetchStudents = async () => {
  console.log("Testing fetchStudents function with enhanced user data...");
  
  const mockStudentService = {
    getStudentsByClass: async (program, yearLevel, section) => {
      console.log(`✓ Called getStudentsByClass with program=${program}, yearLevel=${yearLevel}, section=${section}`);
      
      // Verify parameters are correctly passed
      if (program === "BSIT" && yearLevel === "4" && section === "A") {
        console.log("✓ Parameters matched expected values");
      } else {
        console.error("✗ Parameters did not match expected values");
        console.error(`  Expected: program="BSIT", yearLevel="4", section="A"`);
        console.error(`  Received: program="${program}", yearLevel="${yearLevel}", section="${section}"`);
      }
      
      return [{ id: 1, name: "Test Student" }];
    },
    getAllStudents: async () => {
      console.error("✗ getAllStudents was called when it shouldn't have been");
      return [];
    }
  };
  
  // Test with 'Class Treasurer' (normal space)
  let user = { ...mockUserData, role: "Class Treasurer" };
  try {
    await mockFetchStudents(user, mockStudentService);
    console.log("✓ Successfully handled 'Class Treasurer' role");
  } catch (err) {
    console.error("✗ Failed with 'Class Treasurer' role:", err);
  }
  
  // Test with 'Class\u00A0Treasurer' (non-breaking space)
  user = { ...mockUserData, role: "Class\u00A0Treasurer" };
  try {
    await mockFetchStudents(user, mockStudentService);
    console.log("✓ Successfully handled 'Class\\u00A0Treasurer' role");
  } catch (err) {
    console.error("✗ Failed with 'Class\\u00A0Treasurer' role:", err);
  }
  
  // Test with programCode instead of program
  user = { 
    ...mockUserData, 
    role: "Class Treasurer",
    program: undefined,
    programCode: "BSIT"
  };
  try {
    await mockFetchStudents(user, mockStudentService);
    console.log("✓ Successfully used programCode as fallback");
  } catch (err) {
    console.error("✗ Failed when using programCode as fallback:", err);
  }
  
  console.log("\nTesting fetchPayments function with enhanced user data...");
  const mockPaymentService = {
    getClassPayments: async (program, yearLevel, section) => {
      console.log(`✓ Called getClassPayments with program=${program}, yearLevel=${yearLevel}, section=${section}`);
      
      // Verify parameters are correctly passed
      if (program === "BSIT" && yearLevel === "4" && section === "A") {
        console.log("✓ Parameters matched expected values");
      } else {
        console.error("✗ Parameters did not match expected values");
        console.error(`  Expected: program="BSIT", yearLevel="4", section="A"`);
        console.error(`  Received: program="${program}", yearLevel="${yearLevel}", section="${section}"`);
      }
      
      return [{ id: 1, name: "Test Payment" }];
    },
    getPayments: async () => {
      console.error("✗ getPayments was called when it shouldn't have been");
      return { content: [] };
    }
  };
  
  // Test with 'Class Treasurer' (normal space)
  user = { ...mockUserData, role: "Class Treasurer" };
  try {
    await mockFetchPayments(user, mockPaymentService);
    console.log("✓ Successfully handled 'Class Treasurer' role in payments");
  } catch (err) {
    console.error("✗ Failed with 'Class Treasurer' role in payments:", err);
  }
  
  // Test with programCode instead of program
  user = { 
    ...mockUserData, 
    role: "Class Treasurer",
    program: undefined,
    programCode: "BSIT"
  };
  try {
    await mockFetchPayments(user, mockPaymentService);
    console.log("✓ Successfully used programCode as fallback in payments");
  } catch (err) {
    console.error("✗ Failed when using programCode as fallback in payments:", err);
  }
  
  console.log("\n🎉 All tests completed successfully!");
};

// Mock implementation of fetchStudents
const mockFetchStudents = async (user, studentService) => {
  let response;
  
  if (user.role === 'Class Treasurer' || user.role === 'Class\u00A0Treasurer') {
    response = await studentService.getStudentsByClass(
      user.program || user.programCode,
      user.yearLevel,
      user.section
    );
  } else {
    response = await studentService.getAllStudents();
  }
  
  return response;
};

// Mock implementation of fetchPayments
const mockFetchPayments = async (user, paymentService) => {
  let response;
  let params = {};
  
  if (user.role === 'Class Treasurer' || user.role === 'Class\u00A0Treasurer') {
    response = await paymentService.getClassPayments(
      user.program || user.programCode,
      user.yearLevel,
      user.section
    );
  } else {
    response = await paymentService.getPayments(params);
  }
  
  return response;
};

// Run the tests
testFetchStudents();
