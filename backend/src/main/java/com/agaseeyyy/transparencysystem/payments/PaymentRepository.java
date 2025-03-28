package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;
import java.util.Date;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.agaseeyyy.transparencysystem.payments.Payments.Status;

@Repository
public interface PaymentRepository extends JpaRepository<Payments, String> {
  @Query("SELECT p FROM Payments p WHERE p.student.program.programId = :programId AND p.student.yearLevel = :yearLevel AND p.student.section = :section")
    List<Payments> findPaymentsByStudentDetails(
        @Param("programId") String programId, 
        @Param("yearLevel") Year yearLevel, 
        @Param("section") Character section
    );

  @Query("SELECT p FROM Payments p " +
         "WHERE p.student.program.programId = :program " +
         "AND p.student.yearLevel = :yearLevel " +
         "AND p.student.section = :section " +
         "AND p.fee.feeId = :feeId")
    List<Payments> findPaymentsByAccountAndFee(
        @Param("program") String program,
        @Param("yearLevel") Year yearLevel,
        @Param("section") Character section,
        @Param("feeId") Integer feeId
    );

  List<Payments> findByFee_FeeId(Integer feeId);

  List<Payments> findByFee_FeeIdAndStatus(Integer feeId, Payments.Status status);
  
  /**
   * Find payments with optional filtering and sorting
   * With proper aliases for sorting on fee properties
   */
  @Query("SELECT p FROM Payments p " +
         "JOIN p.fee f " +
         "JOIN p.student s " +
         "JOIN s.program sp " +
         "WHERE (:feeType IS NULL OR f.feeId = :feeType) " +
         "AND (:status IS NULL OR CAST(p.status AS string) = :status)")
  List<Payments> findPaymentsWithFilters(
          @Param("feeType") Integer feeType,
          @Param("status") String status,
          Sort sort);
          
  /**
   * Find payments with date filtering
   * With proper aliases for sorting on fee properties
   */
  @Query("SELECT p FROM Payments p " +
         "JOIN p.fee f " +
         "JOIN p.student s " +
         "JOIN s.program sp " +
         "WHERE (:feeType IS NULL OR f.feeId = :feeType) " +
         "AND (:status IS NULL OR CAST(p.status AS string) = :status) " +
         "AND FUNCTION('DATE', p.paymentDate) = FUNCTION('DATE', :date)")
  List<Payments> findPaymentsWithDateFilter(
          @Param("feeType") Integer feeType,
          @Param("status") String status,
          @Param("date") Date date,
          Sort sort);
}
