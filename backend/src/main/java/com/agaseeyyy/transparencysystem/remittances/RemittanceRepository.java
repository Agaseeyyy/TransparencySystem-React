package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.agaseeyyy.transparencysystem.payments.Payments;

public interface RemittanceRepository extends JpaRepository<Remittances, String> {

  // @Query("SELECT SUM() FROM Remittances r WHERE r.payment.fee.section = :section")
  // List <Payments> findAmountRemittedBySectionId(String section);
}
