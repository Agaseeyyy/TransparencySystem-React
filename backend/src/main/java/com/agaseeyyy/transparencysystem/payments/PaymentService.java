package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.time.LocalDate;
import java.util.Random;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.beans.factory.annotation.Autowired;
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
import com.agaseeyyy.transparencysystem.enums.Status;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.programs.Programs;

@Service
public class PaymentService {
    // Repositories
    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;
    @PersistenceContext
    private EntityManager entityManager;

    // Dependencies Injection
    @Autowired
    public PaymentService(PaymentRepository paymentRepository, FeeRepository feeRepository, StudentRepository studentRepository) {
        this.paymentRepository = paymentRepository;
        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
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
            Integer feeId, 
            String program, 
            String yearLevel, 
            String section,
            String status,
            String sortField,
            String sortDirection,
            int pageNumber,
            int pageSize) {
        
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

    public List <Payments> getPaymentByStudentDeets(String programCode, Year yearLevel, Character section) {
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
     public Double calculateTotalPaymentsPerClass(String program, Year yearLevel, Character section, Integer feeId) {
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

 
    // Maps frontend sort fields to database column names
    private String mapSortField(String frontendSortField) {
        switch (frontendSortField) {
            case "student.lastName":
                return "student.lastName"; // Adjusted for direct use in PageRequest
            case "fee.feeType":
                return "fee.feeType";
            case "student.program.programName":
                return "student.program.programName";
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
        int i = 0;
        Long studentId = result[i] != null ? ((Number) result[i]).longValue() : null; i++;
        String firstName = (String) result[i++];
        String lastName = (String) result[i++];
        Character middleInitial = result[i] != null ? result[i].toString().charAt(0) : null; i++; // Handle char conversion
        Year yearLevel = result[i] != null ? Year.of(((Number) result[i]).intValue()) : null; i++;
        Character section = result[i] != null ? result[i].toString().charAt(0) : null; i++; // Handle char conversion
        String programId = (String) result[i++];
        String programName = (String) result[i++];
        Integer feeId = result[i] != null ? ((Number) result[i]).intValue() : null; i++;
        String feeType = (String) result[i++];
        Double amount = result[i] != null ? ((Number) result[i]).doubleValue() : null; i++;
        String paymentId = (String) result[i++];
        String statusStr = (String) result[i++];
        Status status = statusStr != null ? Status.valueOf(statusStr) : Status.Pending; 
        
        java.sql.Date sqlDate = (java.sql.Date) result[i++];
        LocalDate paymentDate = sqlDate != null ? sqlDate.toLocalDate() : null;
        
        String remarks = (String) result[i];
        
        PaymentDTO dto = new PaymentDTO(
            studentId, firstName, lastName, middleInitial,
            yearLevel, section, programId, programName,
            feeId, feeType, amount,
            paymentId, status, paymentDate, remarks
        );
        dto.setProgramId(programName); // Ensure program name is set in DTO
        return dto;
    }

    public Page<PaymentDTO> getPaymentsWithFilters(
            Long feeId,
            Long studentId,
            String status,
            String program,
            String yearLevel,
            String section,
            Pageable pageable
    ) {
        Specification<Payments> spec = PaymentSpecification.filterBy(feeId, studentId, status, program, yearLevel, section);
        Page<Payments> paymentsPage = paymentRepository.findAll(spec, pageable);
        return paymentsPage.map(this::convertToDTO);
    }

    public List<PaymentDTO> generatePaymentReport(
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
            case "student.lastName": case "lastName": return "s.last_name";
            case "student.firstName": case "firstName": return "s.first_name";
            case "fee.feeType": case "feeType": return "f.fee_type";
            case "student.program.programName": case "program": return "prog.program_name";
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
        if (payment.getStudent() != null) {
            dto.setStudentId(payment.getStudent().getStudentId());
            dto.setFirstName(payment.getStudent().getFirstName());
            dto.setLastName(payment.getStudent().getLastName());
            dto.setMiddleInitial(payment.getStudent().getMiddleInitial());
            dto.setYearLevel(payment.getStudent().getYearLevel());
            dto.setSection(payment.getStudent().getSection());
            if (payment.getStudent().getProgram() != null) {
                dto.setProgramId(payment.getStudent().getProgram().getProgramId());
                dto.setProgramId(payment.getStudent().getProgram().getProgramName());
            }
        }
        if (payment.getFee() != null) {
            dto.setFeeId(payment.getFee().getFeeId());
            dto.setFeeType(payment.getFee().getFeeType());
            dto.setAmount(payment.getFee().getAmount());
        }
        dto.setPaymentId(payment.getPaymentId());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setStatus(payment.getStatus());
        dto.setRemarks(payment.getRemarks());
        return dto;
    }
}
