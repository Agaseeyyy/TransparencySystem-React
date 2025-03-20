package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentsController {
  private final PaymentService paymentService;

  // Constructors
  public PaymentsController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  
  // REST APIs
  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public List <Payments> displayAllPayments() {
      return paymentService.getAllPayments();
  }

  @GetMapping("/students/{program}/{yearLevel}/{section}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public List <Payments> getPaymentByStudentDeets(@PathVariable String program, @PathVariable Year yearLevel, @PathVariable Character section) {
      return paymentService.getPaymentByStudentDeets(program, yearLevel, section);
  }

  @GetMapping("/students/{program}/{yearLevel}/{section}/fees/{feeId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public List<Payments> getPaymentsByUserAndFee(@PathVariable String program,
                                                @PathVariable Year yearLevel,
                                                @PathVariable Character section,
                                                @PathVariable Integer feeId) {
      return paymentService.findPaymentsByUserAndFee(program, yearLevel, section, feeId);
  }

  @PostMapping("/fees/{feeId}/students/{studentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public Payments addNewPayment(@PathVariable Integer feeId,
                                @PathVariable Long studentId,
                                @RequestBody Payments payment) {
      return paymentService.addNewPayment(feeId, studentId, payment);
  }
  
  @PutMapping("/{paymentId}/fees/{feeId}/students/{studentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public Payments editPayment(@PathVariable String paymentId,
                              @PathVariable Integer feeId,
                              @PathVariable Long studentId,
                              @RequestBody Payments payment) {
    return paymentService.editPayment(paymentId, feeId, studentId, payment);
  }

  @DeleteMapping("/{paymentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public void deletePayment(@PathVariable String paymentId) {
    paymentService.deletePayment(paymentId);
  }
  
}
