package com.agaseeyyy.transparencysystem.expenses;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.dto.ExpenseDTO;
import com.agaseeyyy.transparencysystem.dto.ExpenseInputDTO;
import com.agaseeyyy.transparencysystem.fees.Fees;

/**
 * Helper class to convert between Expenses entity and ExpenseDTO
 */
@Component
public class ExpenseMapper {

    /**
     * Converts an Expenses entity to ExpenseDTO
     */
    public ExpenseDTO toDTO(Expenses expense) {
        if (expense == null) return null;
        
        ExpenseDTO dto = new ExpenseDTO();
        dto.setExpenseId(expense.getExpenseId());
        dto.setExpenseReference(expense.getExpenseReference());
        dto.setExpenseTitle(expense.getExpenseTitle());
        dto.setExpenseCategory(expense.getExpenseCategory() != null ? expense.getExpenseCategory().toString() : null);
        dto.setAmount(expense.getAmount());
        dto.setExpenseDescription(expense.getExpenseDescription());
        dto.setVendorSupplier(expense.getVendorSupplier());
        dto.setReceiptInvoiceNumber(expense.getReceiptInvoiceNumber());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setPaymentDate(expense.getPaymentDate());
        dto.setPaymentMethod(expense.getPaymentMethod() != null ? expense.getPaymentMethod().toString() : null);
        dto.setExpenseStatus(expense.getExpenseStatus() != null ? expense.getExpenseStatus().toString() : null);
        dto.setApprovalStatus(expense.getApprovalStatus() != null ? expense.getApprovalStatus().toString() : null);
        dto.setApprovedByName(expense.getApprovedByName());
        dto.setApprovalDate(expense.getApprovalDate());
        dto.setApprovalRemarks(expense.getApprovalRemarks());
        dto.setCreatedByName(expense.getCreatedByName());
        dto.setDepartmentId(expense.getDepartmentId());
        dto.setDepartmentName(expense.getDepartmentName());
        dto.setRelatedFeeId(expense.getRelatedFee() != null ? expense.getRelatedFee().getFeeId() : null);
        dto.setRelatedFeeType(expense.getRelatedFeeType());
        dto.setBudgetAllocation(expense.getBudgetAllocation());
        dto.setIsRecurring(expense.getIsRecurring());
        dto.setRecurringFrequency(expense.getRecurringFrequency() != null ? expense.getRecurringFrequency().toString() : null);
        dto.setAcademicYear(expense.getAcademicYear());
        dto.setSemester(expense.getSemester());
        dto.setDocumentationPath(expense.getDocumentationPath());
        dto.setTaxAmount(expense.getTaxAmount());
        dto.setIsTaxInclusive(expense.getIsTaxInclusive());
        dto.setCreatedAt(expense.getCreatedAt());
        dto.setUpdatedAt(expense.getUpdatedAt());
        dto.setRemarks(expense.getRemarks());
        
        return dto;
    }

    /**
     * Converts a list of Expenses entities to a list of ExpenseDTOs
     */
    public List<ExpenseDTO> toDTOList(List<Expenses> expenses) {
        return expenses.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Converts a Page of Expenses entities to a Page of ExpenseDTOs
     */
    public Page<ExpenseDTO> toPageDTO(Page<Expenses> expensePage) {
        List<ExpenseDTO> dtos = expensePage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, expensePage.getPageable(), expensePage.getTotalElements());
    }

    /**
     * Maps InputDTO to Expenses entity for creating or updating
     */
    public Expenses toEntity(ExpenseInputDTO dto, Expenses existingExpense) {
        Expenses expense = existingExpense != null ? existingExpense : new Expenses();
        
        if (dto.getExpenseReference() != null) {
            expense.setExpenseReference(dto.getExpenseReference());
        }
        if (dto.getExpenseTitle() != null) {
            expense.setExpenseTitle(dto.getExpenseTitle());
        }
        if (dto.getExpenseCategory() != null) {
            expense.setExpenseCategory(Expenses.ExpenseCategory.valueOf(dto.getExpenseCategory()));
        }
        if (dto.getAmount() != null) {
            expense.setAmount(dto.getAmount());
        }
        expense.setExpenseDescription(dto.getExpenseDescription());
        expense.setVendorSupplier(dto.getVendorSupplier());
        expense.setReceiptInvoiceNumber(dto.getReceiptInvoiceNumber());
        if (dto.getExpenseDate() != null) {
            expense.setExpenseDate(dto.getExpenseDate());
        }
        expense.setPaymentDate(dto.getPaymentDate());
        if (dto.getPaymentMethod() != null) {
            expense.setPaymentMethod(Expenses.PaymentMethod.valueOf(dto.getPaymentMethod()));
        }
        
        // Handle department
        if (dto.getDepartmentId() != null) {
            Departments department = new Departments();
            department.setDepartmentId(dto.getDepartmentId());
            expense.setDepartment(department);
        }
        
        // Handle related fee
        if (dto.getRelatedFeeId() != null) {
            Fees fee = new Fees();
            fee.setFeeId(Integer.valueOf(dto.getRelatedFeeId()));
            expense.setRelatedFee(fee);
        }
        
        expense.setBudgetAllocation(dto.getBudgetAllocation());
        expense.setIsRecurring(dto.getIsRecurring());
        if (dto.getRecurringFrequency() != null) {
            expense.setRecurringFrequency(Expenses.RecurringFrequency.valueOf(dto.getRecurringFrequency()));
        }
        expense.setAcademicYear(dto.getAcademicYear());
        expense.setSemester(dto.getSemester());
        expense.setDocumentationPath(dto.getDocumentationPath());
        expense.setTaxAmount(dto.getTaxAmount());
        expense.setIsTaxInclusive(dto.getIsTaxInclusive());
        expense.setRemarks(dto.getRemarks());
        
        return expense;
    }
}
