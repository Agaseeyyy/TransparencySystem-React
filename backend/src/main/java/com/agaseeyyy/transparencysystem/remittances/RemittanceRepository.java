package com.agaseeyyy.transparencysystem.remittances;

import java.time.Year;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.agaseeyyy.transparencysystem.dto.RemittanceSummary;
import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;

public interface RemittanceRepository extends JpaRepository<Remittances, String>, JpaSpecificationExecutor<Remittances> {

    @Query("SELECT NEW com.agaseeyyy.transparencysystem.dto.RemittanceSummary(" +
           "r.account.student.lastName, r.account.student.firstName, r.account.student.middleInitial, " +
           "r.account.student.yearLevel, r.account.student.section, r.fee.feeType, r.status, " +
           "SUM(r.amountRemitted)) " +
           "FROM Remittances r " +
           "GROUP BY r.account.accountId, r.fee.feeId")
    List<RemittanceSummary> getAmountRemittedGroupByAccountIdAndFeeId();

        
    // Method to find remittances by fee ID
    List<Remittances> findByFee_FeeId(Integer feeId);
    
    // Method to find top recent remittances
    List<Remittances> findTopByOrderByRemittanceIdDesc();

    boolean existsByAccountAccountIdAndFeeFeeId(Integer accountId, Integer feeId);

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
            
    /**
     * Find remittances with filtering and sorting capabilities for admin dashboard
     * 
     * @param feeIdFilter Filter by fee ID (or null for all fees)
     * @param statusFilter Filter by status (or null for all statuses)
     * @param accountIdFilter Filter by account ID (or null for all accounts)
     * @param programFilter Filter by program (or 'all' for all programs)
     * @param yearLevelFilter Filter by year level (or null for all year levels)
     * @param sectionFilter Filter by section (or null for all sections)
     * @param pageable Pagination and sorting parameters
     * @return Page of Remittances matching the criteria
     */
    @Query("SELECT r FROM Remittances r " +
           "JOIN r.account a " +
           "JOIN a.student s " +
           "JOIN s.program p " +
           "WHERE (:feeIdFilter IS NULL OR r.fee.feeId = :feeIdFilter) " +
           "AND (:statusFilter IS NULL OR CAST(r.status AS string) = :statusFilter) " +
           "AND (:accountIdFilter IS NULL OR a.accountId = :accountIdFilter) " +
           "AND (:programFilter = 'all' OR p.programId = :programFilter) " +
           "AND (:yearLevelFilter IS NULL OR s.yearLevel = :yearLevelFilter) " +
           "AND (:sectionFilter IS NULL OR s.section = :sectionFilter)")
    Page<Remittances> findRemittancesWithDetailedFilters(
            @Param("feeIdFilter") Integer feeIdFilter,
            @Param("statusFilter") String statusFilter,
            @Param("accountIdFilter") String accountIdFilter,
            @Param("programFilter") String programFilter,
            @Param("yearLevelFilter") Year yearLevelFilter,
            @Param("sectionFilter") Character sectionFilter,
            Pageable pageable);
            
    /**
     * Count remittances by fee ID, account ID, and status
     */
    long countByFee_FeeIdAndAccount_AccountIdAndStatus(Integer feeId, Integer accountId, RemittanceStatus status);
    
    /**
     * Find remittances by fee ID, class details, and status
     */
    @Query("SELECT r FROM Remittances r " +
           "JOIN r.account a " +
           "JOIN a.student s " +
           "WHERE r.fee.feeId = :feeId " +
           "AND s.program.programId = :programId " +
           "AND s.yearLevel = :yearLevel " +
           "AND s.section = :section " +
           "AND r.status = :status")
    List<Remittances> findByFeeAndClassAndStatus(
            @Param("feeId") Integer feeId,
            @Param("programId") String programId,
            @Param("yearLevel") Year yearLevel,
            @Param("section") Character section,
            @Param("status") RemittanceStatus status);

    List<Remittances> findByAccountAccountIdOrderByRemittanceDateDesc(Integer accountId, Pageable pageable);
    long countByAccountAccountId(Integer accountId);
    List<Remittances> findByAccountAccountId(Integer accountId);
}
