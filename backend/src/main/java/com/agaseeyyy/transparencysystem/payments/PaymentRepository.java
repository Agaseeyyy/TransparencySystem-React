package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
    List<Payments> findPaymentsByUserAndFee(
        @Param("program") String program,
        @Param("yearLevel") Year yearLevel,
        @Param("section") Character section,
        @Param("feeId") Integer feeId
    );

  List<Payments> findByFee_FeeId(Integer feeId);

  List<Payments> findByFee_FeeIdAndStatus(Integer feeId, Payments.Status status);
}
