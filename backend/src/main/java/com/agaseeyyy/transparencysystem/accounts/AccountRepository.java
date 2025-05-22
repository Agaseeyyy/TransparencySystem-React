package com.agaseeyyy.transparencysystem.accounts;

import java.time.Year;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO;
import com.agaseeyyy.transparencysystem.students.Students;

@Repository
public interface AccountRepository extends JpaRepository<Accounts, Integer>, JpaSpecificationExecutor<Accounts> {
    Accounts findByEmail(String email);
    boolean existsByEmail(String email);
    Accounts findByStudent(Students student);
    boolean existsByStudentStudentId(Long studentId);
    boolean existsByEmailAndAccountIdNot(String email, Integer accountId);
    
    /**
     * Find all class treasurers with their remittance information for a specific fee
     * Implements filtering capabilities for program, year level, and section
     * 
     * @param feeId The fee ID to check remittance status for
     * @param program Program filter (or 'all' to include all programs)
     * @param yearLevel Year level filter (or null to include all year levels)
     * @param section Section filter (or null to include all sections)
     * @param pageable Pagination and sorting parameters
     * @return Page of AccountWithRemittanceInfoDTO containing remittance info
     */
    @Query(value = "SELECT new com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO(" +
           "a, COALESCE(SUM(r.amountRemitted), 0.0), " +
           "CASE WHEN COUNT(r.remittanceId) > 0 THEN 'Remitted' ELSE 'Not Remitted' END, " +
           "f.feeId, f.feeType) " +
           "FROM Accounts a " +
           "JOIN a.student s " +
           "LEFT JOIN com.agaseeyyy.transparencysystem.remittances.Remittances r ON r.account.accountId = a.accountId AND r.fee.feeId = :feeId " +
           "JOIN com.agaseeyyy.transparencysystem.fees.Fees f ON f.feeId = :feeId " +
           "WHERE a.role = com.agaseeyyy.transparencysystem.accounts.Accounts.Role.Class_Treasurer " +
           "AND (:program = 'all' OR s.program.programId = :program) " +
           "AND (:yearLevel IS NULL OR s.yearLevel = :yearLevel) " +
           "AND (:section IS NULL OR s.section = :section) " +
           "GROUP BY a.accountId, s.studentId, f.feeId, f.feeType",
           countQuery = "SELECT COUNT(DISTINCT a.accountId) " +
           "FROM Accounts a " +
           "JOIN a.student s " +
           "WHERE a.role = com.agaseeyyy.transparencysystem.accounts.Accounts.Role.Class_Treasurer " +
           "AND (:program = 'all' OR s.program.programId = :program) " +
           "AND (:yearLevel IS NULL OR s.yearLevel = :yearLevel) " +
           "AND (:section IS NULL OR s.section = :section)")
    Page<AccountWithRemittanceInfoDTO> findClassTreasurersWithRemittanceInfoByFee(
            @Param("feeId") Integer feeId,
            @Param("program") String program,
            @Param("yearLevel") Year yearLevel,
            @Param("section") Character section,
            Pageable pageable);
}