package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.UUID;
import java.security.Principal;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.enums.Status;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;

@Service
public class PaymentService {
    // Repositories
    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    private final AccountRepository accountRepository;
    @PersistenceContext
    private EntityManager entityManager;

    // Dependencies Injection
    public PaymentService(PaymentRepository paymentRepository, FeeRepository feeRepository, StudentRepository studentRepository, AccountRepository accountRepository) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
        this.accountRepository = accountRepository;
    }

    // Static Methods
    // Timestamp-based ID generation
    public static String generatePaymentId(Long studentId) {
        long timestamp = System.currentTimeMillis();
        String uniquePart = UUID.randomUUID().toString().substring(0, 8); 
        return "PAY-" + studentId + "-" + timestamp + "-" + uniquePart;
    }
  

    // Named Methods and Business Logics
    public Page<Payments> getPayments(
        int pageNumber, int pageSize, String sortField, String sortDirection, 
        String feeId, String studentId, String statusValue, /* String date, */ String program, String yearLevel, String section) {
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), mapSortField(sortField));
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        Specification<Payments> spec = PaymentSpecification.filterBy(
            feeId != null && !feeId.isEmpty() ? Long.parseLong(feeId) : null,
            studentId != null && !studentId.isEmpty() ? Long.parseLong(studentId) : null,
            statusValue,
            program,
            yearLevel,
            section
        );
        
        return paymentRepository.findAll(spec, pageable);
    }

    public Page<PaymentDTO> getStudentsPaymentStatus(
            Principal principal,
            Integer feeId, 
            String program, 
            String yearLevel, 
            String section,
            String status,
            String sortField,
            String sortDirection,
            int pageNumber,
            int pageSize) {
        
        // Check if the user is a Class Treasurer and apply class-based filtering
        if (principal != null && isClassTreasurer(principal)) {
            ClassTreasurerDetails treasurerDetails = getClassTreasurerDetails(principal.getName());
            if (treasurerDetails != null) {
                // Override the program, year level, and section parameters with the treasurer's class details
                program = treasurerDetails.getProgram();
                yearLevel = treasurerDetails.getYearLevel();
                section = treasurerDetails.getSection();
            }
        }
        
        // Validate fee exists
        feeRepository.findById(feeId)
            .orElseThrow(() -> new RuntimeException("Fee not found with id " + feeId));
        
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), mapSortFieldForNativeQuery(sortField));
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Use the database-centric approach with native query and pagination
        Page<Object[]> resultPage = paymentRepository.findStudentsPaymentStatusForFeePaged(
            feeId,
            program != null ? program : "all",
            yearLevel != null ? yearLevel : "all",
            section != null ? section : "all",
            status != null ? status : "all",
            pageable
        );
        
        // Transform the result to DTOs
        List<PaymentDTO> dtoList = resultPage.getContent().stream()
                                            .map(this::mapToPaymentDTO)
                                            .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, resultPage.getTotalElements());
    }

    public List <Payments> getPaymentByStudentDeets(Principal principal, String programCode, Year yearLevel, Character section) {
        // Check if the user is a Class Treasurer and apply class-based filtering
        if (principal != null && isClassTreasurer(principal)) {
            ClassTreasurerDetails treasurerDetails = getClassTreasurerDetails(principal.getName());
            if (treasurerDetails != null) {
                // Override the program, year level, and section parameters with the treasurer's class details
                programCode = treasurerDetails.getProgram();
                try {
                    yearLevel = Year.of(Integer.parseInt(treasurerDetails.getYearLevel()));
                } catch (NumberFormatException e) {
                    // In case year level is not a valid number, keep the original
                }
                try {
                    section = treasurerDetails.getSection().charAt(0);
                } catch (Exception e) {
                    // In case section is not valid, keep the original
                }
            }
        }
        
        return paymentRepository.findPaymentsByStudentDetails(programCode, yearLevel, section);
    }


    // Add new payment
    public Payments addNewPayment(Integer feeId, Long studentId, Payments newPayment) {
        if (newPayment == null) {
            throw new RuntimeException("Payment data cannot be null!");
        }

        Fees fee = feeRepository.findById(feeId).orElseThrow(
            () -> new RuntimeException("Fee not found with id " + feeId)
        );
        Students student = studentRepository.findById(studentId).orElseThrow(
            () -> new RuntimeException("Student not found with id " + studentId)
        );

        // Check if a payment already exists for this student and fee
        if (paymentRepository.existsByStudentStudentIdAndFeeFeeId(student.getStudentId(), fee.getFeeId())) {
            throw new ResourceAlreadyExistsException("Payment already exists for student " + student.getLastName() + ", " + student.getFirstName() + " (ID: " + student.getStudentId() + ") and fee '" + fee.getFeeType() + "' (ID: " + fee.getFeeId() + ").");
        }

        // Generate a unique paymentId (e.g., timestamp-based)
        String paymentId = generatePaymentId(student.getStudentId()); 
        newPayment.setPaymentId(paymentId);
    
        newPayment.setFee(fee);
        newPayment.setStudent(student);
    
        return paymentRepository.save(newPayment);
    };

    // Edit payment
    public Payments editPayment(String paymentId, Integer feeId, Long studentId, Payments updatedPayment) {
        if (updatedPayment == null) {
            throw new RuntimeException("Payment data cannot be null!");
        }

        Payments existingPayment = paymentRepository.findById(paymentId).orElseThrow(
            () -> new RuntimeException("Payment not found with id " + paymentId)
        );
    
        Fees fee = feeRepository.findById(feeId).orElseThrow(
            () -> new RuntimeException("Fee not found with id " + feeId)
        );
        Students student = studentRepository.findById(studentId).orElseThrow(
            () -> new RuntimeException("Student not found with id " + studentId)
        );

   
        existingPayment.setFee(fee);
        existingPayment.setStudent(student);
        existingPayment.setStatus(updatedPayment.getStatus());
        existingPayment.setRemarks(updatedPayment.getRemarks());
        return paymentRepository.save(existingPayment);
    };

    // Delete payment
    public void deletePayment(String paymentId) {
        if (!paymentRepository.existsById(paymentId)) {
            throw new RuntimeException("Payment not found with id " + paymentId);
        }
    
        paymentRepository.deleteById(paymentId);
    }


     // Calculates the total amount of payments for a given student's class details and fee ID.
     public Double calculateTotalPaymentsPerClass(Principal principal, String program, Year yearLevel, Character section, Integer feeId) {
        // Check if the user is a Class Treasurer and apply class-based filtering
        if (principal != null && isClassTreasurer(principal)) {
            ClassTreasurerDetails treasurerDetails = getClassTreasurerDetails(principal.getName());
            if (treasurerDetails != null) {
                // Override the program, year level, and section parameters with the treasurer's class details
                program = treasurerDetails.getProgram();
                try {
                    yearLevel = Year.of(Integer.parseInt(treasurerDetails.getYearLevel()));
                } catch (NumberFormatException e) {
                    // In case year level is not a valid number, keep the original
                }
                try {
                    section = treasurerDetails.getSection().charAt(0);
                } catch (Exception e) {
                    // In case section is not valid, keep the original
                }
            }
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Double> cq = cb.createQuery(Double.class);
        Root<Payments> root = cq.from(Payments.class);

        // Base specification for student details and fee
        Specification<Payments> baseSpec = PaymentSpecification.filterByStudentDetailsAndFee(program, yearLevel, section, feeId);
        // Specification to filter only PAID payments
        Specification<Payments> statusSpec = PaymentSpecification.hasStatus(Status.Paid.name());

        // Combine specifications
        Specification<Payments> finalSpec = baseSpec.and(statusSpec);

        Predicate predicate = finalSpec.toPredicate(root, cq, cb);
        cq.where(predicate);

        cq.select(cb.sum(root.get("fee").get("amount"))); 

        TypedQuery<Double> query = entityManager.createQuery(cq);

        try {
            Double totalAmount = query.getSingleResult();
            return totalAmount != null ? totalAmount : 0.0;
        } catch (NoResultException e) {
            return 0.0;
        }
    }


    /**
     * Get payments with optional filtering and sorting
     * This method is maintained for backward compatibility
     * 
     * @param feeType Filter by fee type ID (null for all)
     * @param status Filter by status (null for all)
     * @param dateStr Filter by date string in format 'yyyy-MM-dd' (null for all)
     * @param sort Sort specification
     * @return List of filtered and sorted payments
     */
    public List<Payments> getTableData(String feeType, String status, String dateStr, Sort sort) {
        // Create specification using our new PaymentSpecification
        Specification<Payments> spec = Specification.where(PaymentSpecification.hasFee(feeType != null ? Long.parseLong(feeType) : null))
            .and(PaymentSpecification.hasStatus(status))
            .and(PaymentSpecification.hasPaymentDate(dateStr));
            
        return paymentRepository.findAll(spec, sort);
    }

 
    /**
     * Find students who haven't paid for a specific fee
     * This method is used by the email service to send reminders and notifications
     * 
     * @param feeId The ID of the fee to check
     * @return List of students who haven't paid for the specified fee
     */
    public List<Students> findStudentsWhoHaventPaid(Integer feeId) {
        // Validate fee exists
        feeRepository.findById(feeId)
            .orElseThrow(() -> new RuntimeException("Fee not found with id " + feeId));
            
        // Get all students
        List<Students> allStudents = studentRepository.findAll();
        
        // Get students who have already paid for this fee
        List<Students> paidStudents = paymentRepository.findByFee_FeeIdAndStatusIn(
            feeId, 
            List.of(Status.Paid, Status.Remitted)
        )
        .stream()
        .map(Payments::getStudent)
        .collect(Collectors.toList());
        
        // Filter out students who have already paid
        return allStudents.stream()
            .filter(student -> !paidStudents.contains(student))
            .collect(Collectors.toList());
    }
 
    // Maps frontend sort fields to database column names
    private String mapSortField(String frontendSortField) {
        switch (frontendSortField) {
            case "student.lastName":
                return "student.lastName"; // Adjusted for direct use in PageRequest
            case "fee.feeType":
                return "fee.feeType";
            case "student.program.programName":
                return "student.program.programId";
            case "fee.amount":
                return "fee.amount";
            case "paymentId":
            case "status":
            case "paymentDate":
                return frontendSortField; 
            default:
                return "student.lastName"; 
        }
    }
    
     // Maps an Object[] result from native query to a PaymentDTO
    private PaymentDTO mapToPaymentDTO(Object[] result) {
        PaymentDTO dto = new PaymentDTO();
        int i = 0;
        dto.setStudentId((Long) result[i++]);
        dto.setFirstName((String) result[i++]);
        dto.setLastName((String) result[i++]);
        dto.setMiddleInitial((Character) result[i++]);
        dto.setYearLevel(Year.of(Integer.parseInt(result[i++].toString())));
        Object sectionObj = result[i++];
        if (sectionObj instanceof Character) {
            dto.setSection((Character) sectionObj);
        } else if (sectionObj instanceof String) {
            dto.setSection(((String) sectionObj).charAt(0));
        }
        dto.setProgramId((String) result[i++]);
        dto.setProgram((String) result[i++]);
        dto.setFeeId((Integer) result[i++]);
        dto.setFeeType((String) result[i++]);
        
        // Fix: Handle BigDecimal to Double conversion for amount field
        Object amountObj = result[i++];
        if (amountObj instanceof java.math.BigDecimal) {
            dto.setAmount(((java.math.BigDecimal) amountObj).doubleValue());
        } else if (amountObj instanceof Double) {
            dto.setAmount((Double) amountObj);
        } else if (amountObj != null) {
            dto.setAmount(Double.valueOf(amountObj.toString()));
        } else {
            dto.setAmount(null);
        }
        
        dto.setPaymentId((String) result[i++]);
        String statusStr = (String) result[i++];
        dto.setStatus(statusStr != null ? Status.valueOf(statusStr) : Status.Pending);
        java.sql.Date sqlDate = (java.sql.Date) result[i++];
        dto.setPaymentDate(sqlDate != null ? sqlDate.toLocalDate() : null);
        dto.setRemarks((String) result[i]);
        return dto;
    }

    public Page<PaymentDTO> getPaymentsWithFilters(
            Principal principal,
            Long feeId,
            Long studentId,
            String status,
            String program,
            String yearLevel,
            String section,
            Pageable pageable
    ) {
        // Get class restriction details for Class Treasurers
        String restrictToProgram = null;
        String restrictToYearLevel = null; 
        String restrictToSection = null;
        
        if (principal != null && isClassTreasurer(principal)) {
            ClassTreasurerDetails treasurerDetails = getClassTreasurerDetails(principal.getName());
            if (treasurerDetails != null) {
                restrictToProgram = treasurerDetails.getProgram();
                restrictToYearLevel = treasurerDetails.getYearLevel();
                restrictToSection = treasurerDetails.getSection();
            }
        }

        Specification<Payments> spec = PaymentSpecification.filterByWithClassRestriction(
            feeId, studentId, status, program, yearLevel, section,
            restrictToProgram, restrictToYearLevel, restrictToSection
        );
        
        Page<Payments> paymentsPage = paymentRepository.findAll(spec, pageable);
        return paymentsPage.map(this::convertToDTO);
    }

    public List<PaymentDTO> generatePaymentReport(
            Principal principal,
            Integer feeId,
            String program,
            String yearLevel,
            String section,
            String status,
            Sort sort
    ) {
        if (feeId == null) {
            throw new IllegalArgumentException("Fee ID cannot be null for generating this report.");
        }

        // Check if the user is a Class Treasurer and apply class-based filtering
        if (principal != null && isClassTreasurer(principal)) {
            ClassTreasurerDetails treasurerDetails = getClassTreasurerDetails(principal.getName());
            if (treasurerDetails != null) {
                // Override the program, year level, and section parameters with the treasurer's class details
                program = treasurerDetails.getProgram();
                yearLevel = treasurerDetails.getYearLevel();
                section = treasurerDetails.getSection();
            }
        }

        StringBuilder queryString = new StringBuilder(
            "SELECT s.student_id as studentId, " +
            "s.first_name as firstName, " +
            "s.last_name as lastName, " +
            "s.middle_initial as middleInitial, " +
            "s.year_level as yearLevel, " +
            "s.section as section, " +
            "prog.program_id as programId, " +
            "prog.program_name as programName, " +
            "f.fee_id as feeId, " +
            "f.fee_type as feeType, " +
            "f.amount as amount, " +
            "pm.payment_id as paymentId, " +
            "pm.status as statusString, " + // Alias pm.status to avoid conflict if Status enum is used directly
            "pm.payment_date as paymentDate, " +
            "pm.remarks as remarks " +
            "FROM students s " +
            "JOIN programs prog ON s.program_id = prog.program_id " +
            "CROSS JOIN fees f " +
            "LEFT JOIN payments pm ON pm.student_id = s.student_id AND pm.fee_id = f.fee_id " +
            "WHERE f.fee_id = :feeId"
        );

        if (program != null && !"all".equalsIgnoreCase(program)) {
            queryString.append(" AND prog.program_id = :program");
        }
        if (yearLevel != null && !"all".equalsIgnoreCase(yearLevel)) {
            queryString.append(" AND CAST(s.year_level AS char) = :yearLevel");
        }
        if (section != null && !"all".equalsIgnoreCase(section)) {
            queryString.append(" AND UPPER(s.section) = UPPER(:section)");
        }
        if (status != null && !"all".equalsIgnoreCase(status)) {
            queryString.append(" AND (pm.status = :status OR (pm.status IS NULL AND :status = 'Pending'))");
        }

        if (sort != null && sort.isSorted()) {
            queryString.append(" ORDER BY ");
            List<String> orderClauses = new ArrayList<>();
            for (Sort.Order order : sort) {
                String property = mapSortFieldForNativeQuery(order.getProperty()); 
                orderClauses.add(property + " " + order.getDirection().name());
            }
            queryString.append(String.join(", ", orderClauses));
        } else {
             queryString.append(" ORDER BY s.last_name ASC, s.first_name ASC");
        }
        
        Query query = entityManager.createNativeQuery(queryString.toString());

        query.setParameter("feeId", feeId);
        if (program != null && !"all".equalsIgnoreCase(program)) {
            query.setParameter("program", program);
        }
        if (yearLevel != null && !"all".equalsIgnoreCase(yearLevel)) {
            query.setParameter("yearLevel", yearLevel);
        }
        if (section != null && !"all".equalsIgnoreCase(section)) {
            query.setParameter("section", section);
        }
        if (status != null && !"all".equalsIgnoreCase(status)) {
            query.setParameter("status", status);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        return results.stream().map(this::mapToPaymentDTO).collect(Collectors.toList());
    }

    private String mapSortFieldForNativeQuery(String frontendSortField) {
        switch (frontendSortField) {
            case "studentId": return "s.student_id";
            case "student.lastName": case "lastName": return "last_name";
            case "student.firstName": case "firstName": return "s.first_name";
            case "fee.feeType": case "feeType": return "f.fee_type";
            case "student.program.programName": case "program": return "program_id";
            case "fee.amount": case "amount": return "f.amount";
            case "paymentId": return "pm.payment_id";
            case "status": return "pm.status";
            case "paymentDate": return "pm.payment_date";
            case "yearLevel": return "s.year_level";
            case "section": return "s.section";   
            default:
                return "s.last_name"; 
        }
    }
    
    // This convertToDTO is for the Specification-based findAll. 
    // The mapToPaymentDTO is for native queries.
    private PaymentDTO convertToDTO(Payments payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setStudentId(payment.getStudentId());
        dto.setFirstName(payment.getFirstName());
        dto.setLastName(payment.getLastName());
        dto.setMiddleInitial(payment.getMiddleInitial());
        dto.setProgramId(payment.getProgramId());
        dto.setProgram(payment.getProgram()); 
        dto.setYearLevel(payment.getYearLevel());
        dto.setSection(payment.getSection());
        dto.setFeeId(payment.getFeeId());
        dto.setFeeType(payment.getFeeType());
        // Ensure payment.getAmount() is not null before calling .doubleValue()
        if (payment.getAmount() != null) { 
            dto.setAmount(payment.getAmount().doubleValue());
        } else {
            dto.setAmount(null); // Or handle as 0.0 or throw error, depending on logic
        }
        dto.setStatus(payment.getStatus());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setRemarks(payment.getRemarks());
        return dto;
    }

    // Helper class for Class Treasurer details
    private static class ClassTreasurerDetails {
        private final String program;
        private final String yearLevel;
        private final String section;

        public ClassTreasurerDetails(String program, String yearLevel, String section) {
            this.program = program;
            this.yearLevel = yearLevel;
            this.section = section;
        }

        public String getProgram() { return program; }
        public String getYearLevel() { return yearLevel; }
        public String getSection() { return section; }
    }

    // Helper method to check if the current user is a Class Treasurer
    private boolean isClassTreasurer(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return false;
        }
        
        try {
            Accounts account = accountRepository.findByEmail(principal.getName());
            return account != null && "Class_Treasurer".equals(account.getRole());
        } catch (Exception e) {
            return false;
        }
    }

    // Helper method to get Class Treasurer's class details
    private ClassTreasurerDetails getClassTreasurerDetails(String username) {
        try {
            Accounts treasurerAccount = accountRepository.findByEmail(username);
            if (treasurerAccount != null && treasurerAccount.getStudent() != null) {
                Students treasurerStudentInfo = treasurerAccount.getStudent();
                
                String program = treasurerStudentInfo.getProgram() != null ? 
                    treasurerStudentInfo.getProgram().getProgramId() : null;
                String yearLevel = treasurerStudentInfo.getYearLevel() != null ? 
                    String.valueOf(treasurerStudentInfo.getYearLevel()) : null;
                String section = String.valueOf(treasurerStudentInfo.getSection());
                
                return new ClassTreasurerDetails(program, yearLevel, section);
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return null;
    }
}
