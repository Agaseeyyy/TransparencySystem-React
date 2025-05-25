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
            if (category == null) return cb.conjunction();
            return cb.equal(root.get("expenseCategory"), category);
        };
    }
    
    public static Specification<Expenses> hasStatus(ExpenseStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("expenseStatus"), status);
        };
    }
    
    public static Specification<Expenses> hasApprovalStatus(ApprovalStatus approvalStatus) {
        return (root, query, cb) -> {
            if (approvalStatus == null) return cb.conjunction();
            return cb.equal(root.get("approvalStatus"), approvalStatus);
        };
    }
    
    public static Specification<Expenses> hasDepartment(String departmentId) {
        return (root, query, cb) -> {
            if (departmentId == null || departmentId.trim().isEmpty()) return cb.conjunction();
            Join<Expenses, Departments> departmentJoin = root.join("department", JoinType.LEFT);
            return cb.equal(departmentJoin.get("departmentId"), departmentId);
        };
    }
    
    public static Specification<Expenses> hasCreatedBy(Integer accountId) {
        return (root, query, cb) -> {
            if (accountId == null) return cb.conjunction();
            Join<Expenses, Accounts> createdByJoin = root.join("createdByAccount", JoinType.LEFT);
            return cb.equal(createdByJoin.get("accountId"), accountId);
        };
    }
    
    public static Specification<Expenses> hasApprovedBy(Integer accountId) {
        return (root, query, cb) -> {
            if (accountId == null) return cb.conjunction();
            Join<Expenses, Accounts> approvedByJoin = root.join("approvedByAccount", JoinType.LEFT);
            return cb.equal(approvedByJoin.get("accountId"), accountId);
        };
    }
    
    public static Specification<Expenses> hasAcademicYear(String academicYear) {
        return (root, query, cb) -> {
            if (academicYear == null || academicYear.trim().isEmpty()) return cb.conjunction();
            return cb.equal(root.get("academicYear"), academicYear);
        };
    }
    
    public static Specification<Expenses> hasSemester(String semester) {
        return (root, query, cb) -> {
            if (semester == null || semester.trim().isEmpty()) return cb.conjunction();
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
            
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
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
            
            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    public static Specification<Expenses> hasVendorSupplier(String vendorSupplier) {
        return (root, query, cb) -> {
            if (vendorSupplier == null || vendorSupplier.trim().isEmpty()) return cb.conjunction();
            return cb.like(cb.lower(root.get("vendorSupplier")), 
                          "%" + vendorSupplier.toLowerCase() + "%");
        };
    }
    
    public static Specification<Expenses> hasBudgetAllocation(String budgetAllocation) {
        return (root, query, cb) -> {
            if (budgetAllocation == null || budgetAllocation.trim().isEmpty()) return cb.conjunction();
            return cb.equal(root.get("budgetAllocation"), budgetAllocation);
        };
    }
    
    public static Specification<Expenses> isRecurring(Boolean isRecurring) {
        return (root, query, cb) -> {
            if (isRecurring == null) return cb.conjunction();
            return cb.equal(root.get("isRecurring"), isRecurring);
        };
    }
    
    public static Specification<Expenses> hasSearchTerm(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.trim().isEmpty()) return cb.conjunction();
            
            String pattern = "%" + searchTerm.toLowerCase() + "%";
            
            return cb.or(
                cb.like(cb.lower(root.get("expenseReference")), pattern),
                cb.like(cb.lower(root.get("expenseTitle")), pattern),
                cb.like(cb.lower(root.get("expenseDescription")), pattern),
                cb.like(cb.lower(root.get("vendorSupplier")), pattern),
                cb.like(cb.lower(root.get("receiptInvoiceNumber")), pattern),
                cb.like(cb.lower(root.get("remarks")), pattern)
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
}
