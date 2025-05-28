package com.agaseeyyy.transparencysystem.expenses;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.departments.DepartmentRepository;
import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;

@Service
@Transactional
public class ExpenseService {
    
    private final ExpenseRepository expenseRepository;
    private final AccountRepository accountRepository;
    private final DepartmentRepository departmentRepository;
    private final FeeRepository feeRepository;
    
    public ExpenseService(ExpenseRepository expenseRepository, 
                         AccountRepository accountRepository,
                         DepartmentRepository departmentRepository,
                         FeeRepository feeRepository) {
        this.expenseRepository = expenseRepository;
        this.accountRepository = accountRepository;
        this.departmentRepository = departmentRepository;
        this.feeRepository = feeRepository;
    }
    
    // Generate unique expense reference
    public String generateExpenseReference() {
        String prefix = "EXP";
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String reference = prefix + timestamp;
        
        // Ensure uniqueness
        int counter = 1;
        String finalReference = reference;
        while (expenseRepository.existsByExpenseReference(finalReference)) {
            finalReference = reference + String.format("%02d", counter);
            counter++;
        }
        
        return finalReference;
    }
    
    // Create new expense
    public Expenses createExpense(Expenses expense, Integer createdByAccountId) {
        // Validate required fields
        if (expense.getExpenseTitle() == null || expense.getExpenseTitle().trim().isEmpty()) {
            throw new BadRequestException("Expense title is required.");
        }
        if (expense.getAmount() == null) {
            throw new BadRequestException("Amount is required.");
        }
        if (expense.getExpenseCategory() == null) {
            throw new BadRequestException("Expense category is required.");
        }
        if (expense.getExpenseDate() == null) {
            throw new BadRequestException("Expense date is required.");
        }
        // Semester and Related Fee are now required from frontend logic
        if (expense.getSemester() == null || expense.getSemester().trim().isEmpty()) {
            throw new BadRequestException("Semester is required.");
        }
        if (expense.getRelatedFee() == null || expense.getRelatedFee().getFeeId() == null) {
            throw new BadRequestException("Related Fee is required.");
        }

        // Validate created by account
        Accounts createdByAccount = accountRepository.findById(createdByAccountId)
            .orElseThrow(() -> new ResourceNotFoundException("Creator account not found with ID: " + createdByAccountId));
        
        // Validate department if provided
        if (expense.getDepartment() != null && expense.getDepartment().getDepartmentId() != null) {
            Departments department = departmentRepository.findById(expense.getDepartment().getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + expense.getDepartment().getDepartmentId()));
            expense.setDepartment(department);
        } else {
            expense.setDepartment(null); // Ensure it's null if not fully provided
        }
        
        // Validate fee (relatedFeeId is now required)
        Fees fee = feeRepository.findById(expense.getRelatedFee().getFeeId())
            .orElseThrow(() -> new ResourceNotFoundException("Related Fee not found with ID: " + expense.getRelatedFee().getFeeId()));
        expense.setRelatedFee(fee);
        
        // Set defaults
        expense.setExpenseReference(generateExpenseReference());
        expense.setCreatedByAccount(createdByAccount);
        expense.setExpenseStatus(ExpenseStatus.PENDING);
        expense.setApprovalStatus(ApprovalStatus.PENDING);
        
        return expenseRepository.save(expense);
    }
    
    // Update expense
    public Expenses updateExpense(Long expenseId, Expenses updatedExpense) {
        Expenses existingExpense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));
        
        // Only allow updates if not yet approved or paid
        // Allow updates if PENDING or (APPROVED but NOT PAID)
        if (existingExpense.getApprovalStatus() == ApprovalStatus.APPROVED && 
            existingExpense.getExpenseStatus() == ExpenseStatus.PAID) {
            throw new BadRequestException("Cannot update an expense that is already Approved and Paid.");
        }
        if (existingExpense.getApprovalStatus() == ApprovalStatus.REJECTED) {
             throw new BadRequestException("Cannot update a rejected expense. Please create a new one.");
        }

        // Validate required fields for update
        if (updatedExpense.getExpenseTitle() == null || updatedExpense.getExpenseTitle().trim().isEmpty()) {
            throw new BadRequestException("Expense title is required.");
        }
        if (updatedExpense.getAmount() == null) {
            throw new BadRequestException("Amount is required.");
        }
        if (updatedExpense.getExpenseCategory() == null) {
            throw new BadRequestException("Expense category is required.");
        }
        if (updatedExpense.getExpenseDate() == null) {
            throw new BadRequestException("Expense date is required.");
        }
        if (updatedExpense.getSemester() == null || updatedExpense.getSemester().trim().isEmpty()) {
            throw new BadRequestException("Semester is required.");
        }
        if (updatedExpense.getRelatedFee() == null || updatedExpense.getRelatedFee().getFeeId() == null) {
            throw new BadRequestException("Related Fee is required.");
        }

        // Validate and set department if provided in update
        if (updatedExpense.getDepartment() != null && updatedExpense.getDepartment().getDepartmentId() != null) {
            Departments department = departmentRepository.findById(updatedExpense.getDepartment().getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + updatedExpense.getDepartment().getDepartmentId()));
            existingExpense.setDepartment(department);
        } else {
            existingExpense.setDepartment(null); // Allow clearing department
        }

        // Validate and set related fee (required)
        Fees fee = feeRepository.findById(updatedExpense.getRelatedFee().getFeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Related Fee not found with ID: " + updatedExpense.getRelatedFee().getFeeId()));
        existingExpense.setRelatedFee(fee);
        
        // Update fields
        existingExpense.setExpenseTitle(updatedExpense.getExpenseTitle());
        existingExpense.setExpenseCategory(updatedExpense.getExpenseCategory());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setExpenseDescription(updatedExpense.getExpenseDescription());
        existingExpense.setVendorSupplier(updatedExpense.getVendorSupplier());
        existingExpense.setReceiptInvoiceNumber(updatedExpense.getReceiptInvoiceNumber());
        existingExpense.setExpenseDate(updatedExpense.getExpenseDate());
        existingExpense.setPaymentDate(updatedExpense.getPaymentDate());
        existingExpense.setPaymentMethod(updatedExpense.getPaymentMethod());
        existingExpense.setBudgetAllocation(updatedExpense.getBudgetAllocation());
        existingExpense.setIsRecurring(updatedExpense.getIsRecurring());
        existingExpense.setRecurringFrequency(updatedExpense.getRecurringFrequency());
        existingExpense.setAcademicYear(updatedExpense.getAcademicYear());
        existingExpense.setSemester(updatedExpense.getSemester());
        existingExpense.setDocumentationPath(updatedExpense.getDocumentationPath());
        existingExpense.setTaxAmount(updatedExpense.getTaxAmount());
        existingExpense.setIsTaxInclusive(updatedExpense.getIsTaxInclusive());
        existingExpense.setRemarks(updatedExpense.getRemarks());
        
        return expenseRepository.save(existingExpense);
    }
    
    // Approve expense
    public Expenses approveExpense(Long expenseId, Integer approvedByAccountId, String approvalRemarks) {
        Expenses expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));
        
        if (expense.getApprovalStatus() == ApprovalStatus.APPROVED) {
            throw new BadRequestException("Expense is already approved.");
        }
        if (expense.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new BadRequestException("Cannot approve a rejected expense. Please ask for a new submission.");
        }

        Accounts approvedByAccount = accountRepository.findById(approvedByAccountId)
            .orElseThrow(() -> new ResourceNotFoundException("Approver account not found with ID: " + approvedByAccountId));
        
        // Validate approval authority
        if (approvedByAccount.getRole() != Accounts.Role.Admin && 
            approvedByAccount.getRole() != Accounts.Role.Org_Treasurer) {
            throw new BadRequestException("User does not have authority to approve expenses");
        }
        
        expense.setApprovalStatus(ApprovalStatus.APPROVED);
        expense.setApprovedByAccount(approvedByAccount);
        expense.setApprovalDate(LocalDateTime.now());
        expense.setApprovalRemarks(approvalRemarks);
        
        return expenseRepository.save(expense);
    }
    
    // Reject expense
    public Expenses rejectExpense(Long expenseId, Integer rejectedByAccountId, String rejectionRemarks) {
        Expenses expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));
        
        if (expense.getApprovalStatus() == ApprovalStatus.REJECTED) {
            throw new BadRequestException("Expense is already rejected.");
        }
         if (expense.getApprovalStatus() == ApprovalStatus.APPROVED && expense.getExpenseStatus() == ExpenseStatus.PAID) {
            throw new BadRequestException("Cannot reject an expense that is already Approved and Paid.");
        }
        // Allow rejecting an "APPROVED" but not yet "PAID" expense.

        Accounts rejectedByAccount = accountRepository.findById(rejectedByAccountId)
            .orElseThrow(() -> new ResourceNotFoundException("Rejecter account not found with ID: " + rejectedByAccountId));
        
        // Validate rejection authority
        if (rejectedByAccount.getRole() != Accounts.Role.Admin && 
            rejectedByAccount.getRole() != Accounts.Role.Org_Treasurer) {
            throw new BadRequestException("User does not have authority to reject expenses");
        }
        
        expense.setApprovalStatus(ApprovalStatus.REJECTED);
        expense.setApprovedByAccount(rejectedByAccount);
        expense.setApprovalDate(LocalDateTime.now());
        expense.setApprovalRemarks(rejectionRemarks);
        
        return expenseRepository.save(expense);
    }
    
    // Mark expense as paid
    public Expenses markAsPaid(Long expenseId, LocalDate paymentDate) {
        Expenses expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));
        
        if (expense.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new BadRequestException("Expense must be approved before marking as paid");
        }
        
        expense.setExpenseStatus(ExpenseStatus.PAID);
        expense.setPaymentDate(paymentDate != null ? paymentDate : LocalDate.now());
        
        return expenseRepository.save(expense);
    }
    
    // Get all expenses with pagination and filtering
    public Page<Expenses> getAllExpenses(
            ExpenseCategory expenseCategory,
            ExpenseStatus expenseStatus,
            ApprovalStatus approvalStatus,
            String departmentId,
            Integer createdBy,
            Integer approvedBy,
            String academicYear,
            String semester,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            String vendorSupplier,
            String budgetAllocation,
            Boolean isRecurring,
            String searchTerm,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Specification<Expenses> spec = ExpenseSpecification.buildFilterSpecificationWithFrontendParams(
            expenseCategory, expenseStatus, approvalStatus, departmentId, createdBy, approvedBy,
            academicYear, semester, startDate, endDate, minAmount, maxAmount,
            vendorSupplier, budgetAllocation, isRecurring, searchTerm
        );
        
        return expenseRepository.findAll(spec, pageable);
    }
    
    // Get expense by ID
    public Optional<Expenses> getExpenseById(Long expenseId) {
        return expenseRepository.findById(expenseId);
    }
    
    // Get expense by reference
    public Optional<Expenses> getExpenseByReference(String expenseReference) {
        return expenseRepository.findByExpenseReference(expenseReference);
    }
    
    // Get pending approval expenses
    public List<Expenses> getPendingApprovalExpenses() {
        return expenseRepository.findPendingApprovalExpenses();
    }
    
    // Delete expense
    public void deleteExpense(Long expenseId) {
        Expenses expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with ID: " + expenseId));
        
        // Allow deletion if PENDING or REJECTED.
        // Allow deletion if APPROVED but NOT PAID.
        // Disallow deletion if APPROVED AND PAID.
        if (expense.getApprovalStatus() == ApprovalStatus.APPROVED && 
            expense.getExpenseStatus() == ExpenseStatus.PAID) {
            throw new BadRequestException("Cannot delete an expense that is already Approved and Paid.");
        }
        
        expenseRepository.delete(expense);
    }
    
    // Dashboard Analytics Methods
    
    // Get total expenses by category - fix method call
    public Map<ExpenseCategory, Double> getTotalExpensesByCategory() {
        Map<ExpenseCategory, Double> categoryTotals = new HashMap<>();
        
        // Get all categories and calculate totals for each
        for (ExpenseCategory category : ExpenseCategory.values()) {
            Double total = expenseRepository.getTotalExpensesByCategory(category);
            if (total != null && total > 0) {
                categoryTotals.put(category, total);
            }
        }
        
        return categoryTotals;
    }
    
    // Get monthly expenses summary - updated to handle Object[] conversion
    public List<Map<String, Object>> getMonthlyExpensesSummary() {
        List<Object[]> results = expenseRepository.getMonthlyExpensesSummary();
        return results.stream()
            .map(result -> {
                Map<String, Object> monthData = new HashMap<>();
                monthData.put("month", result[0]);
                monthData.put("year", result[1]);
                monthData.put("totalAmount", ((Number) result[2]).doubleValue());
                monthData.put("expenseCount", ((Number) result[3]).longValue());
                return monthData;
            })
            .collect(Collectors.toList());
    }
    
    // Export Methods
    
    // Get all expenses for export with filters
    public List<Expenses> getExpensesForExport(
            ExpenseCategory expenseCategory,
            ExpenseStatus expenseStatus,
            ApprovalStatus approvalStatus,
            String departmentId,
            Integer createdBy,
            Integer approvedBy,
            String academicYear,
            String semester,
            LocalDate startDate,
            LocalDate endDate,
            Double minAmount,
            Double maxAmount,
            String vendorSupplier,
            String budgetAllocation,
            Boolean isRecurring,
            String searchTerm
    ) {
        Specification<Expenses> spec = ExpenseSpecification.buildFilterSpecificationWithFrontendParams(
            expenseCategory, expenseStatus, approvalStatus, departmentId, createdBy, approvedBy,
            academicYear, semester, startDate, endDate, minAmount, maxAmount,
            vendorSupplier, budgetAllocation, isRecurring, searchTerm
        );
        
        // Get all matching expenses without pagination for export
        return expenseRepository.findAll(spec);
    }
    
    // Get total for academic year
    public Double getTotalExpensesForAcademicYear(String academicYear) {
        return expenseRepository.getTotalExpensesByAcademicYear(academicYear);
    }
    
    // Get total by department
    public Double getTotalExpensesByDepartment(String departmentId) {
        return expenseRepository.getTotalExpensesByDepartment(departmentId);
    }
    
    // Get total by date range
    public Double getTotalExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.getTotalExpensesByDateRange(startDate, endDate);
    }
    
    // Get top expense categories - updated to handle Object[] conversion
    public List<Map<String, Object>> getTopExpenseCategories() {
        List<Object[]> results = expenseRepository.getTopExpenseCategories();
        return results.stream()
            .map(result -> {
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("category", result[0]);
                categoryData.put("totalAmount", ((Number) result[1]).doubleValue());
                categoryData.put("expenseCount", ((Number) result[2]).longValue());
                return categoryData;
            })
            .collect(Collectors.toList());
    }
    
    // Get expenses by created user - fix method name
    public List<Expenses> getExpensesByCreatedUser(Integer accountId) {
        return expenseRepository.findByCreatedByAccountAccountId(accountId);
    }
    
    // Get expenses by department - fix method name
    public List<Expenses> getExpensesByDepartment(String departmentId) {
        return expenseRepository.findByDepartmentDepartmentId(departmentId);
    }
    
    // Get recurring expenses - fix method name
    public List<Expenses> getRecurringExpenses() {
        return expenseRepository.findByIsRecurringTrue();
    }
    
    // Get expenses requiring review - provide a default implementation
    public List<Expenses> getExpensesRequiringReview(Double threshold) {
        // If the repository method doesn't exist, use a specification-based approach
        Specification<Expenses> spec = (root, query, criteriaBuilder) -> {
            return criteriaBuilder.greaterThanOrEqualTo(root.get("amount"), threshold);
        };
        return expenseRepository.findAll(spec);
    }
    
    // Generate transparency report
    public Map<String, Object> generateTransparencyReport(String academicYear, String semester) {
        // Implementation for transparency report
        Map<String, Object> report = new HashMap<>();
        
        // Get expenses for the specified period
        List<Expenses> expenses = expenseRepository.findByAcademicYearAndSemester(academicYear, semester);
        
        // Calculate totals
        Double totalAmount = expenses.stream()
            .filter(e -> e.getExpenseStatus() == ExpenseStatus.PAID)
            .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
            .sum();
        
        // Group by category
        Map<ExpenseCategory, Double> categoryTotals = expenses.stream()
            .filter(e -> e.getExpenseStatus() == ExpenseStatus.PAID)
            .collect(Collectors.groupingBy(
                Expenses::getExpenseCategory,
                Collectors.summingDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
            ));
        
        report.put("academicYear", academicYear);
        report.put("semester", semester);
        report.put("totalExpenses", expenses.size());
        report.put("totalAmount", totalAmount);
        report.put("categoryBreakdown", categoryTotals);
        report.put("expenses", expenses);
        
        return report;
    }
}
