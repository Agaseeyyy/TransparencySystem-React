package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RemittanceRepository extends JpaRepository<Remittances, String> {
  
   // Method to find remittances by fee ID
   List<Remittances> findByFee_FeeId(Integer feeId);
    
   // Method to find top recent remittances
   List<Remittances> findTopByOrderByRemittanceIdDesc();
}
