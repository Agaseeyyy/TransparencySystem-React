package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;
  private final FeeRepository feeRepository;
  private final StudentRepository studentRepository;

  // Constructors 
  public PaymentService(PaymentRepository paymentRepository, FeeRepository feeRepository, StudentRepository studentRepository) {
    this.paymentRepository = paymentRepository;
    this.feeRepository = feeRepository;
    this.studentRepository = studentRepository;
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
}
