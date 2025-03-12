package com.agaseeyyy.transparencysystem.payments;

import java.util.List;

public class PaymentService {
  private final PaymentRepository paymentRepository;

  public PaymentService(PaymentRepository paymentRepository) {
    this.paymentRepository = paymentRepository;
  }
  
  private List <Payments> getAllPayments() {
    return paymentRepository.findAll();
  }
  

}
