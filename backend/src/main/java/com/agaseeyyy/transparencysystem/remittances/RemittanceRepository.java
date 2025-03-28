package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RemittanceRepository extends JpaRepository<Remittances, String> {
  
   // Method to find remittances by fee ID
   List<Remittances> findByFee_FeeId(Integer feeId);
    
   // Method to find top recent remittances
   List<Remittances> findTopByOrderByRemittanceIdDesc();

   /**
    * Find remittances with optional filters and sorting
    * With support for sorting on account fields
    */
   @Query("SELECT r FROM Remittances r " +
          "JOIN r.fee f " +
          "JOIN r.account u " +
          "WHERE (:feeType IS NULL OR f.feeId = :feeType) AND " +
          "(:status IS NULL OR CAST(r.status AS string) = :status) AND " +
          "(:date IS NULL OR CAST(r.remittanceDate AS string) = :date)")
   List<Remittances> findRemittancesWithFilters(
           @Param("feeType") Integer feeType,
           @Param("status") String status,
           @Param("date") String date,
           Sort sort);
}
