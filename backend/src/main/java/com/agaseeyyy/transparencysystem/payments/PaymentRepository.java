package com.agaseeyyy.transparencysystem.payments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payments, String> {
  
}
