package com.agaseeyyy.transparencysystem.payments;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;


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
  public List <Payments> displayAllPayments() {
      return paymentService.getAllPayments();
  }

  @PostMapping("/fees/{feeId}/students/{studentId}")
  public Payments addNewPayment(@PathVariable Integer feeId,
                                @PathVariable Long studentId,
                                @RequestBody Payments payment) {
      return paymentService.addNewPayment(feeId, studentId, payment);
  }
  
  @PutMapping("/{paymentId}/fees/{feeId}/students/{studentId}")
  public Payments editPayment(@PathVariable String paymentId,
                              @PathVariable Integer feeId,
                              @PathVariable Long studentId,
                              @RequestBody Payments payment) {
    return paymentService.editPayment(paymentId, feeId, studentId, payment);
  }

  @DeleteMapping("/{paymentId}")
  public void deletePayment(@PathVariable String paymentId) {
    paymentService.deletePayment(paymentId);
  }
  
}
