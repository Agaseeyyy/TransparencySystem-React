package com.agaseeyyy.transparencysystem.expenses;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Component;

import com.agaseeyyy.transparencysystem.departments.DepartmentRepository;
import com.agaseeyyy.transparencysystem.dto.ExpenseDTO;
import com.agaseeyyy.transparencysystem.dto.ExpenseInputDTO;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;

/**
 * Helper class to convert between Expenses entity and ExpenseDTO
 */
@Component
public class ExpenseMapper {
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private FeeRepository feeRepository;
    
    /**
     * Converts an Expenses entity to ExpenseDTO
     */
    public ExpenseDTO toDTO(Expenses expense) {
        if (expense == null) {
            return null;
        }
        
        ExpenseDTO dto = new ExpenseDTO();
        dto.setExpenseId(expense.getExpenseId());
        dto.setExpenseReference(expense.getExpenseReference());
        dto.setExpenseTitle(expense.getExpenseTitle());
        dto.setExpenseCategory(expense.getExpenseCategory());
        dto.setAmount(expense.getAmount());
        dto.setExpenseDescription(expense.getExpenseDescription());
        dto.setVendorSupplier(expense.getVendorSupplier());
        dto.setReceiptInvoiceNumber(expense.getReceiptInvoiceNumber());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setPaymentDate(expense.getPaymentDate());
        dto.setPaymentMethod(expense.getPaymentMethod());
        dto.setExpenseStatus(expense.getExpenseStatus());
        dto.setApprovalStatus(expense.getApprovalStatus());
        dto.setApprovalRemarks(expense.getApprovalRemarks());
        dto.setApprovalDate(expense.getApprovalDate());
        dto.setBudgetAllocation(expense.getBudgetAllocation());
        dto.setIsRecurring(expense.getIsRecurring());
        dto.setAcademicYear(expense.getAcademicYear());
        dto.setSemester(expense.getSemester());
        dto.setTaxAmount(expense.getTaxAmount());
        dto.setIsTaxInclusive(expense.getIsTaxInclusive());
        dto.setCreatedAt(expense.getCreatedAt());
        dto.setUpdatedAt(expense.getUpdatedAt());
        dto.setRemarks(expense.getRemarks());
        
        // Safe handling of related entities - extract only what we need
        if (expense.getCreatedByAccount() != null) {
            dto.setCreatedByAccountId(expense.getCreatedByAccount().getAccountId());
            dto.setCreatedByName(expense.getCreatedByAccount().getFirstName() + " " + 
                                expense.getCreatedByAccount().getLastName());
        }
        
        if (expense.getApprovedByAccount() != null) {
            dto.setApprovedByAccountId(expense.getApprovedByAccount().getAccountId());
            dto.setApprovedByName(expense.getApprovedByAccount().getFirstName() + " " + 
                                 expense.getApprovedByAccount().getLastName());
        }
        
        if (expense.getDepartment() != null) {
            dto.setDepartmentId(expense.getDepartment().getDepartmentId());
            dto.setDepartmentName(expense.getDepartment().getDepartmentName());
        }
        
        if (expense.getRelatedFee() != null) {
            dto.setRelatedFeeId(expense.getRelatedFee().getFeeId());
            dto.setRelatedFeeType(expense.getRelatedFee().getFeeType());
        }
        
        // Calculate derived fields
        if (expense.getAmount() != null) {
            if (expense.getTaxAmount() != null) {
                if (expense.getIsTaxInclusive()) {
                    dto.setTotalAmount(expense.getAmount());
                    dto.setNetAmount(expense.getAmount().subtract(expense.getTaxAmount()));
                } else {
                    dto.setNetAmount(expense.getAmount());
                    dto.setTotalAmount(expense.getAmount().add(expense.getTaxAmount()));
                }
            } else {
                dto.setTotalAmount(expense.getAmount());
                dto.setNetAmount(expense.getAmount());
            }
        }
        
        return dto;
    }
    
    /**
     * Converts a list of Expenses entities to a list of ExpenseDTOs
     */
    public List<ExpenseDTO> toDTOList(List<Expenses> expenses) {
        if (expenses == null) {
            return List.of();
        }
        return expenses.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Converts a Page of Expenses entities to a Page of ExpenseDTOs
     */
    public Page<ExpenseDTO> toPageDTO(Page<Expenses> page) {
        if (page == null) {
            return Page.empty();
        }
        List<ExpenseDTO> dtos = page.getContent().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
        
        return new PageImpl<>(dtos, page.getPageable(), page.getTotalElements());
    }
    
    /**
     * Maps InputDTO to Expenses entity for creating or updating
     */
    public Expenses toEntity(ExpenseInputDTO inputDTO, Expenses existingExpense) {
        Expenses expense = existingExpense == null ? new Expenses() : existingExpense;
        
        if (inputDTO.getExpenseReference() != null) {
            expense.setExpenseReference(inputDTO.getExpenseReference());
        }
        if (inputDTO.getExpenseTitle() != null) {
            expense.setExpenseTitle(inputDTO.getExpenseTitle());
        }
        if (inputDTO.getExpenseCategory() != null) {
            expense.setExpenseCategory(inputDTO.getExpenseCategory());
        }
        if (inputDTO.getAmount() != null) {
            expense.setAmount(inputDTO.getAmount());
        }
        if (inputDTO.getExpenseDescription() != null) {
            expense.setExpenseDescription(inputDTO.getExpenseDescription());
        }
        if (inputDTO.getVendorSupplier() != null) {
            expense.setVendorSupplier(inputDTO.getVendorSupplier());
        }
        if (inputDTO.getReceiptInvoiceNumber() != null) {
            expense.setReceiptInvoiceNumber(inputDTO.getReceiptInvoiceNumber());
        }
        if (inputDTO.getExpenseDate() != null) {
            expense.setExpenseDate(inputDTO.getExpenseDate());
        }
        if (inputDTO.getPaymentDate() != null) {
            expense.setPaymentDate(inputDTO.getPaymentDate());
        }
        if (inputDTO.getPaymentMethod() != null) {
            expense.setPaymentMethod(inputDTO.getPaymentMethod());
        }
        if (inputDTO.getBudgetAllocation() != null) {
            expense.setBudgetAllocation(inputDTO.getBudgetAllocation());
        }
        if (inputDTO.getIsRecurring() != null) {
            expense.setIsRecurring(inputDTO.getIsRecurring());
        }
        if (inputDTO.getRecurringFrequency() != null) {
            expense.setRecurringFrequency(inputDTO.getRecurringFrequency());
        }
        if (inputDTO.getAcademicYear() != null) {
            expense.setAcademicYear(inputDTO.getAcademicYear());
        }
        if (inputDTO.getSemester() != null) {
            expense.setSemester(inputDTO.getSemester());
        }
        if (inputDTO.getTaxAmount() != null) {
            expense.setTaxAmount(inputDTO.getTaxAmount());
        }
        if (inputDTO.getIsTaxInclusive() != null) {
            expense.setIsTaxInclusive(inputDTO.getIsTaxInclusive());
        }
        if (inputDTO.getRemarks() != null) {
            expense.setRemarks(inputDTO.getRemarks());
        }
        
        // Handle related entities
        if (inputDTO.getDepartmentId() != null && !inputDTO.getDepartmentId().isEmpty()) {
            departmentRepository.findById(inputDTO.getDepartmentId())
                .ifPresent(expense::setDepartment);
        }
        
        if (inputDTO.getRelatedFeeId() != null) {
            feeRepository.findById(inputDTO.getRelatedFeeId())
                .ifPresent(expense::setRelatedFee);
        }
        
        return expense;
    }
}
