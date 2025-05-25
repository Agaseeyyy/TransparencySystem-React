package com.agaseeyyy.transparencysystem.expenses;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;

@Repository
public interface ExpenseRepository extends JpaRepository<Expenses, Long>, JpaSpecificationExecutor<Expenses> {
    
    // Find by expense reference
    Optional<Expenses> findByExpenseReference(String expenseReference);
    
    // Find by category
    List<Expenses> findByExpenseCategory(ExpenseCategory category);
    
    // Find by status
    List<Expenses> findByExpenseStatus(ExpenseStatus status);
    
    // Find by approval status
    List<Expenses> findByApprovalStatus(ApprovalStatus approvalStatus);
    
    // Find by created by account
    List<Expenses> findByCreatedByAccountAccountId(Integer accountId);
    
    // Find by department
    List<Expenses> findByDepartmentDepartmentId(String departmentId);
    
    // Find by date range
    List<Expenses> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Find by academic year and semester
    List<Expenses> findByAcademicYearAndSemester(String academicYear, String semester);
    
    // Find pending approval expenses
    @Query("SELECT e FROM Expenses e WHERE e.approvalStatus = 'PENDING' ORDER BY e.createdAt ASC")
    List<Expenses> findPendingApprovalExpenses();
    
    // Calculate total expenses by category
    @Query("SELECT SUM(e.amount) FROM Expenses e WHERE e.expenseCategory = :category AND e.expenseStatus = 'PAID'")
    Double getTotalExpensesByCategory(@Param("category") ExpenseCategory category);
    
    // Calculate total expenses by department
    @Query("SELECT SUM(e.amount) FROM Expenses e WHERE e.department.departmentId = :departmentId AND e.expenseStatus = 'PAID'")
    Double getTotalExpensesByDepartment(@Param("departmentId") String departmentId);
    
    // Calculate total expenses by date range
    @Query("SELECT SUM(e.amount) FROM Expenses e WHERE e.expenseDate BETWEEN :startDate AND :endDate AND e.expenseStatus = 'PAID'")
    Double getTotalExpensesByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Calculate total expenses by academic year
    @Query("SELECT SUM(e.amount) FROM Expenses e WHERE e.academicYear = :academicYear AND e.expenseStatus = 'PAID'")
    Double getTotalExpensesByAcademicYear(@Param("academicYear") String academicYear);
    
    // Get expenses summary by category for dashboard
    @Query("SELECT e.expenseCategory, COUNT(e), SUM(e.amount) FROM Expenses e WHERE e.expenseStatus = 'PAID' GROUP BY e.expenseCategory")
    List<Object[]> getExpensesSummaryByCategory();
    
    // Get monthly expenses for charts
    @Query("SELECT YEAR(e.expenseDate), MONTH(e.expenseDate), SUM(e.amount) FROM Expenses e WHERE e.expenseStatus = 'PAID' GROUP BY YEAR(e.expenseDate), MONTH(e.expenseDate) ORDER BY YEAR(e.expenseDate), MONTH(e.expenseDate)")
    List<Object[]> getMonthlyExpensesSummary();
    
    // Find recurring expenses that need renewal
    @Query("SELECT e FROM Expenses e WHERE e.isRecurring = true AND e.expenseStatus = 'PAID' AND e.recurringFrequency IS NOT NULL")
    List<Expenses> findRecurringExpenses();
    
    // Get expenses by budget allocation
    List<Expenses> findByBudgetAllocation(String budgetAllocation);
    
    // Find expenses requiring review (over certain amount or disputed)
    @Query("SELECT e FROM Expenses e WHERE e.amount > :threshold OR e.expenseStatus = 'DISPUTED' OR e.approvalStatus = 'REQUIRES_REVIEW'")
    List<Expenses> findExpensesRequiringReview(@Param("threshold") Double threshold);
    
    // Get paginated expenses with filters
    @Query("SELECT e FROM Expenses e WHERE " +
           "(:category IS NULL OR e.expenseCategory = :category) AND " +
           "(:status IS NULL OR e.expenseStatus = :status) AND " +
           "(:approvalStatus IS NULL OR e.approvalStatus = :approvalStatus) AND " +
           "(:departmentId IS NULL OR e.department.departmentId = :departmentId) AND " +
           "(:academicYear IS NULL OR e.academicYear = :academicYear) AND " +
           "(:semester IS NULL OR e.semester = :semester) AND " +
           "(:startDate IS NULL OR e.expenseDate >= :startDate) AND " +
           "(:endDate IS NULL OR e.expenseDate <= :endDate)")
    Page<Expenses> findExpensesWithFilters(
        @Param("category") ExpenseCategory category,
        @Param("status") ExpenseStatus status,
        @Param("approvalStatus") ApprovalStatus approvalStatus,
        @Param("departmentId") String departmentId,
        @Param("academicYear") String academicYear,
        @Param("semester") String semester,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        Pageable pageable
    );
    
    // Check if expense reference exists
    boolean existsByExpenseReference(String expenseReference);
    
    // Get expenses by approval workflow
    @Query("SELECT e FROM Expenses e WHERE e.createdByAccount.accountId = :createdBy OR e.approvedByAccount.accountId = :approvedBy")
    List<Expenses> findExpensesByApprovalWorkflow(@Param("createdBy") Integer createdBy, @Param("approvedBy") Integer approvedBy);
    
    // Get top expense categories for transparency reporting
    @Query("SELECT e.expenseCategory, SUM(e.amount) as total FROM Expenses e WHERE e.expenseStatus = 'PAID' GROUP BY e.expenseCategory ORDER BY total DESC")
    List<Object[]> getTopExpenseCategories();

    List<Expenses> findByRelatedFeeFeeId(Integer feeId);
}
