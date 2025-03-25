package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.Date;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Sort;

import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.students.StudentService;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final FeeRepository feeRepository;
  private final StudentRepository studentRepository;
  private final StudentService studentService;

  // Constructors 
  public PaymentService(PaymentRepository paymentRepository, FeeRepository feeRepository, StudentRepository studentRepository, StudentService studentService) {
    this.paymentRepository = paymentRepository;
    this.feeRepository = feeRepository;
    this.studentRepository = studentRepository;
    this.studentService = studentService;
  }
  

  // Named Methods and Business Logics
  public List <Payments> getAllPayments() {
    return paymentRepository.findAll();
  }

  public List <Payments> getPaymentByStudentDeets(String programCode, Year yearLevel, Character section) {
    return paymentRepository.findPaymentsByStudentDetails(programCode, yearLevel, section);
  }

  public List<Payments> findPaymentsByUserAndFee(String program, Year yearLevel, Character section, Integer feeId) {
    return paymentRepository.findPaymentsByUserAndFee(program, yearLevel, section, feeId);
  }


  public Payments addNewPayment(Integer feeId, Long studentId, Payments newPayment) {
    if (newPayment == null) {
      throw new RuntimeException("Failed to add new Fee!");
    }

    Fees fee = feeRepository.findById(feeId).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeId)
    );
    Students student = studentRepository.findById(studentId).orElseThrow(
      () -> new RuntimeException("Student not found with id " + studentId)
    );

    String paymentId = generatePaymentId(studentId);
    newPayment.setPaymentId(paymentId);
    
    newPayment.setFee(fee);
    newPayment.setStudent(student);
    
    return paymentRepository.save(newPayment);
  };


  public Payments editPayment(String paymentId, Integer feeId, Long studentId, Payments updatedPayment) {
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
    return paymentRepository.save(existingPayment);
  };


  public void deletePayment(String paymentId) {
    if (!paymentRepository.existsById(paymentId)) {
      throw new RuntimeException("Payment not found with id " + paymentId);
    }
    
    paymentRepository.deleteById(paymentId);
  }


  public static String generatePaymentId(Long studentId) {
    LocalDateTime now = LocalDateTime.now();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    String timestamp = now.format(formatter);
    return "PMT-" + timestamp + "-" + studentId;
  }

  /**
   * Calculate the total amount collected for a specific fee type
   * 
   * @param feeId The ID of the fee to calculate collections for
   * @return The total amount collected
   */
  public double calculateTotalCollectedByFeeType(Integer feeId) {
    List<Payments> payments = paymentRepository.findByFee_FeeId(feeId);
    
    return payments.stream()
        .mapToDouble(Payments::getAmount)
        .sum();
  }

  /**
   * Find payments by fee ID and status
   */
  public List<Payments> findByFeeIdAndStatus(Integer feeId, Payments.Status status) {
    return paymentRepository.findByFee_FeeIdAndStatus(feeId, status);
  }

  /**
   * Find students who haven't paid for a specific fee
   * 
   * @param feeId The ID of the fee to check
   * @return List of students who haven't paid for this fee
   */
  public List<Students> findStudentsWhoHaventPaid(Integer feeId) {
    // Get all students
    List<Students> allStudents = studentService.getAllStudents();
    
    // Get IDs of students who have already paid for this fee
    List<Long> paidStudentIds = paymentRepository.findByFee_FeeId(feeId)
        .stream()
        .map(payment -> payment.getStudent().getStudentId())
        .collect(Collectors.toList());
    
    // Return students who aren't in the paid list
    return allStudents.stream()
        .filter(student -> !paidStudentIds.contains(student.getStudentId()))
        .collect(Collectors.toList());
  }

  /**
   * Get payments with optional filtering and sorting
   * 
   * @param feeType Filter by fee type ID (null for all)
   * @param status Filter by status (null for all)
   * @param dateStr Filter by date string in format 'yyyy-MM-dd' (null for all)
   * @param sort Sort specification
   * @return List of filtered and sorted payments
   */
  public List<Payments> getTableData(String feeType, String status, String dateStr, Sort sort) {
    // If no filters are provided, just return sorted data
    if ((feeType == null || feeType.equals("all")) && 
        (status == null || status.equals("all")) && 
        (dateStr == null || dateStr.equals("all"))) {
        return paymentRepository.findAll(sort);
    }
    
    // Set null for "all" values and parse feeType to Integer
    Integer feeTypeFilter = null;
    if (feeType != null && !feeType.equals("all")) {
        try {
            feeTypeFilter = Integer.parseInt(feeType);
        } catch (NumberFormatException e) {
            // If invalid fee type, treat as null (all)
            feeTypeFilter = null;
        }
    }
    
    String statusFilter = "all".equals(status) ? null : status;
    
    // If date filter is provided, use the date filter method
    if (dateStr != null && !dateStr.equals("all")) {
        try {
            // Parse the date string to a Date object
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date date = dateFormat.parse(dateStr);
            return paymentRepository.findPaymentsWithDateFilter(feeTypeFilter, statusFilter, date, sort);
        } catch (ParseException e) {
            throw new RuntimeException("Invalid date format. Use yyyy-MM-dd", e);
        }
    }
    
    // Otherwise use the regular filter method (without date)
    return paymentRepository.findPaymentsWithFilters(feeTypeFilter, statusFilter, sort);
  }

  /**
   * Get all payments for a specific fee
   * 
   * @param feeId The fee ID to filter by
   * @return List of payments for the given fee
   */
  public List<Payments> getPaymentsByFeeId(Integer feeId) {
    // Use the corrected method name that matches your entity relationship
    return paymentRepository.findByFee_FeeId(feeId);
  }
}
