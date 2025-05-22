package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.agaseeyyy.transparencysystem.enums.Status;

@Repository
public interface PaymentRepository extends JpaRepository<Payments, String>, JpaSpecificationExecutor<Payments> {

    List<Payments> findByFee_FeeId(Integer feeId);

    List<Payments> findByFee_FeeIdAndStatus(Integer feeId, Status status);
  
    boolean existsByStudentStudentIdAndFeeFeeId(Long studentId, Integer feeId);

    /**
     * Count distinct students who have paid (status is Paid or Remitted) a specific fee in a specific class
     */
    @Query("SELECT COUNT(DISTINCT p.student.studentId) FROM Payments p " +
           "WHERE p.fee.feeId = :feeId " +
           "AND p.student.program.programId = :programId " +
           "AND p.student.yearLevel = :yearLevel " +
           "AND p.student.section = :section " +
           "AND (p.status = com.agaseeyyy.transparencysystem.enums.Status.Paid OR p.status = com.agaseeyyy.transparencysystem.enums.Status.Remitted)")
    long countPaidStudentsByFeeAndClass(
        @Param("feeId") Integer feeId,
        @Param("programId") String programId,
        @Param("yearLevel") Year yearLevel,
        @Param("section") Character section
    );

    @Query(value = 
        "SELECT s.student_id as studentId, " +
        "s.first_name as firstName, " +
        "s.last_name as lastName, " +
        "s.middle_initial as middleInitial, " +
        "s.year_level as yearLevel, " +
        "s.section as section, " +
        "p.program_id as programId, " +
        "p.program_name as programName, " +
        "f.fee_id as feeId, " +
        "f.fee_type as feeType, " +
        "f.amount as amount, " +
        "pm.payment_id as paymentId, " +
        "pm.status as status, " +
        "pm.payment_date as paymentDate, " +
        "pm.remarks as remarks " +
        "FROM students s " +
        "JOIN programs p ON s.program_id = p.program_id " +
        "CROSS JOIN fees f " +
        "LEFT JOIN payments pm ON pm.student_id = s.student_id AND pm.fee_id = f.fee_id " +
        "WHERE f.fee_id = :feeId " +
        "AND (:program = 'all' OR p.program_id = :program) " +
        "AND (:yearLevel = 'all' OR CAST(s.year_level AS char) = :yearLevel) " +
        "AND (:section = 'all' OR UPPER(s.section) = UPPER(:section)) " +
        "AND (:status = 'all' OR pm.status = :status OR (pm.status IS NULL AND :status = 'Pending'))",
        countQuery = 
        "SELECT COUNT(*) " +
        "FROM students s " +
        "JOIN programs p ON s.program_id = p.program_id " +
        "CROSS JOIN fees f " +
        "LEFT JOIN payments pm ON pm.student_id = s.student_id AND pm.fee_id = f.fee_id " +
        "WHERE f.fee_id = :feeId " +
        "AND (:program = 'all' OR p.program_id = :program) " +
        "AND (:yearLevel = 'all' OR CAST(s.year_level AS char) = :yearLevel) " +
        "AND (:section = 'all' OR UPPER(s.section) = UPPER(:section)) " +
        "AND (:status = 'all' OR pm.status = :status OR (pm.status IS NULL AND :status = 'Pending'))",
        nativeQuery = true)
    Page<Object[]> findStudentsPaymentStatusForFeePaged(
        @Param("feeId") Integer feeId,
        @Param("program") String program,
        @Param("yearLevel") String yearLevel,
        @Param("section") String section,
        @Param("status") String status,
        Pageable pageable
    );





    //old queries   

    @Query("SELECT p FROM Payments p WHERE p.student.program.programId = :programId AND p.student.yearLevel = :yearLevel AND p.student.section = :section")
    List<Payments> findPaymentsByStudentDetails(
        @Param("programId") String programId, 
        @Param("yearLevel") Year yearLevel, 
        @Param("section") Character section
    );


    /**
     * Find all payments for a specific fee with filter options
     * 
     * @param feeId The fee ID
     * @param program Optional program filter
     * @param yearLevel Optional year level filter
     * @param section Optional section filter
     * @return List of payments for the specified fee
     */
    @Query("SELECT p FROM Payments p " +
           "WHERE p.fee.feeId = :feeId " +
           "AND (:program = 'all' OR p.student.program.programId = :program) " +
           "AND (:yearLevel = 'all' OR CAST(p.student.yearLevel AS string) = :yearLevel) " +
           "AND (:section = 'all' OR UPPER(p.student.section) = UPPER(:section))")
    List<Payments> findPaymentsByFeeWithFilters(
        @Param("feeId") Integer feeId,
        @Param("program") String program,
        @Param("yearLevel") String yearLevel,
        @Param("section") String section
    );
    
    boolean existsByStudentStudentId(Long studentId);

    List<Payments> findByStudentStudentIdAndFeeFeeId(Long studentId, Integer feeId);

    boolean existsByFeeFeeId(Integer feeId);

    // Aggregate total amount paid by a student
}
