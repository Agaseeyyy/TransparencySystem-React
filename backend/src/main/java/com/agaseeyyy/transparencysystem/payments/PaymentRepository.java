package com.agaseeyyy.transparencysystem.payments;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Long, Payments> {
  
}
