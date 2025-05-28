package com.agaseeyyy.transparencysystem.expenses;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ExpenseSpecification {
    
    public static Specification<Expenses> hasCategory(ExpenseCategory category) {
        return (root, query, cb) -> {
            if (category == null) return null;
            return cb.equal(root.get("expenseCategory"), category);
        };
    }
    
    // Add method to handle the column key from frontend for category
    public static Specification<Expenses> hasExpenseCategory(ExpenseCategory expenseCategory) {
        return (root, query, cb) -> {
            if (expenseCategory == null) return null;
            return cb.equal(root.get("expenseCategory"), expenseCategory);
        };
    }
    
    public static Specification<Expenses> hasStatus(ExpenseStatus status) {
        return (root, query, cb) -> {
            if (status == null) return null;
            return cb.equal(root.get("expenseStatus"), status);
        };
    }
    
    // Add method to handle the column key from frontend
    public static Specification<Expenses> hasExpenseStatus(ExpenseStatus expenseStatus) {
        return (root, query, cb) -> {
            if (expenseStatus == null) return null;
            return cb.equal(root.get("expenseStatus"), expenseStatus);
        };
    }
    
    public static Specification<Expenses> hasApprovalStatus(ApprovalStatus approvalStatus) {
        return (root, query, cb) -> {
            if (approvalStatus == null) return null;
            return cb.equal(root.get("approvalStatus"), approvalStatus);
        };
    }
    
    public static Specification<Expenses> hasDepartment(String departmentId) {
        return (root, query, cb) -> {
            if (departmentId == null || departmentId.trim().isEmpty()) return null;
            
            try {
                // Try to parse as integer first
                Integer deptId = Integer.parseInt(departmentId);
                Join<Expenses, Departments> departmentJoin = root.join("department", JoinType.LEFT);
                return cb.equal(departmentJoin.get("departmentId"), deptId);
            } catch (NumberFormatException e) {
                // If not a number, treat as string and match department name or ID
                Join<Expenses, Departments> departmentJoin = root.join("department", JoinType.LEFT);
                return cb.or(
                    cb.equal(departmentJoin.get("departmentId"), departmentId),
                    cb.equal(departmentJoin.get("departmentName"), departmentId)
                );
            }
        };
    }
    
    public static Specification<Expenses> hasCreatedBy(Integer accountId) {
        return (root, query, cb) -> {
            if (accountId == null) return null;
            Join<Expenses, Accounts> createdByJoin = root.join("createdByAccount", JoinType.LEFT);
            return cb.equal(createdByJoin.get("accountId"), accountId);
        };
    }
    
    public static Specification<Expenses> hasApprovedBy(Integer accountId) {
        return (root, query, cb) -> {
            if (accountId == null) return null;
            Join<Expenses, Accounts> approvedByJoin = root.join("approvedByAccount", JoinType.LEFT);
            return cb.equal(approvedByJoin.get("accountId"), accountId);
        };
    }
    
    public static Specification<Expenses> hasAcademicYear(String academicYear) {
        return (root, query, cb) -> {
            if (academicYear == null || academicYear.trim().isEmpty()) return null;
            return cb.equal(root.get("academicYear"), academicYear);
        };
    }
    
    public static Specification<Expenses> hasSemester(String semester) {
        return (root, query, cb) -> {
            if (semester == null || semester.trim().isEmpty()) return null;
            return cb.equal(root.get("semester"), semester);
        };
    }
    
    public static Specification<Expenses> hasExpenseDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("expenseDate"), startDate));
            }
            
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("expenseDate"), endDate));
            }
            
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    public static Specification<Expenses> hasAmountBetween(Double minAmount, Double maxAmount) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (minAmount != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            }
            
            if (maxAmount != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            }
            
            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    public static Specification<Expenses> hasVendorSupplier(String vendorSupplier) {
        return (root, query, cb) -> {
            if (vendorSupplier == null || vendorSupplier.trim().isEmpty()) return null;
            return cb.like(cb.lower(root.get("vendorSupplier")), 
                          "%" + vendorSupplier.toLowerCase() + "%");
        };
    }
    
    public static Specification<Expenses> hasBudgetAllocation(String budgetAllocation) {
        return (root, query, cb) -> {
            if (budgetAllocation == null || budgetAllocation.trim().isEmpty()) return null;
            return cb.equal(root.get("budgetAllocation"), budgetAllocation);
        };
    }
    
    public static Specification<Expenses> isRecurring(Boolean isRecurring) {
        return (root, query, cb) -> {
            if (isRecurring == null) return null;
            return cb.equal(root.get("isRecurring"), isRecurring);
        };
    }
    
    public static Specification<Expenses> hasSearchTerm(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return null;
            
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            
            return cb.or(
                cb.like(cb.lower(root.get("expenseReference")), pattern),
                cb.like(cb.lower(root.get("expenseTitle")), pattern),
                cb.like(cb.lower(root.get("expenseDescription")), pattern),
                cb.like(cb.lower(root.get("vendorSupplier")), pattern),
                cb.like(cb.lower(root.get("receiptInvoiceNumber")), pattern),
                cb.like(cb.lower(root.get("remarks")), pattern),
                cb.like(cb.lower(root.get("approvalRemarks")), pattern),
                cb.like(cb.lower(root.get("budgetAllocation")), pattern),
                cb.like(cb.lower(root.get("academicYear")), pattern),
                cb.like(cb.lower(root.get("semester")), pattern),
                cb.like(cb.toString(root.get("amount")), pattern)
            );
        };
    }
    
    public static Specification<Expenses> requiresApproval() {
        return (root, query, cb) -> {
            return cb.equal(root.get("approvalStatus"), ApprovalStatus.PENDING);
        };
    }
    
    public static Specification<Expenses> isPaid() {
        return (root, query, cb) -> {
            return cb.equal(root.get("expenseStatus"), ExpenseStatus.PAID);
        };
    }
    
    public static Specification<Expenses> isPending() {
        return (root, query, cb) -> {
            return cb.equal(root.get("expenseStatus"), ExpenseStatus.PENDING);
        };
    }
    
    public static Specification<Expenses> isApproved() {
        return (root, query, cb) -> {
            return cb.equal(root.get("approvalStatus"), ApprovalStatus.APPROVED);
        };
    }
    
    public static Specification<Expenses> isRejected() {
        return (root, query, cb) -> {
            return cb.equal(root.get("approvalStatus"), ApprovalStatus.REJECTED);
        };
    }
    
    public static Specification<Expenses> requiresReview() {
        return (root, query, cb) -> {
            return cb.equal(root.get("approvalStatus"), ApprovalStatus.REQUIRES_REVIEW);
        };
    }
    
    // Complex specification for dashboard filtering
    public static Specification<Expenses> buildFilterSpecification(
            ExpenseCategory category,
            ExpenseStatus status,
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
        return Specification.where(hasCategory(category))
                .and(hasStatus(status))
                .and(hasApprovalStatus(approvalStatus))
                .and(hasDepartment(departmentId))
                .and(hasCreatedBy(createdBy))
                .and(hasApprovedBy(approvedBy))
                .and(hasAcademicYear(academicYear))
                .and(hasSemester(semester))
                .and(hasExpenseDateBetween(startDate, endDate))
                .and(hasAmountBetween(minAmount, maxAmount))
                .and(hasVendorSupplier(vendorSupplier))
                .and(hasBudgetAllocation(budgetAllocation))
                .and(isRecurring(isRecurring))
                .and(hasSearchTerm(searchTerm));
    }
    
    // Add overloaded method that accepts both expenseCategory and expenseStatus parameters
    public static Specification<Expenses> buildFilterSpecificationWithFrontendParams(
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
        return Specification.where(hasExpenseCategory(expenseCategory))
                .and(hasExpenseStatus(expenseStatus))
                .and(hasApprovalStatus(approvalStatus))
                .and(hasDepartment(departmentId))
                .and(hasCreatedBy(createdBy))
                .and(hasApprovedBy(approvedBy))
                .and(hasAcademicYear(academicYear))
                .and(hasSemester(semester))
                .and(hasExpenseDateBetween(startDate, endDate))
                .and(hasAmountBetween(minAmount, maxAmount))
                .and(hasVendorSupplier(vendorSupplier))
                .and(hasBudgetAllocation(budgetAllocation))
                .and(isRecurring(isRecurring))
                .and(hasSearchTerm(searchTerm));
    }
}
