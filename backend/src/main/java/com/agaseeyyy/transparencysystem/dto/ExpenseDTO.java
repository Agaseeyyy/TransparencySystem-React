package com.agaseeyyy.transparencysystem.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.PaymentMethod;

public class ExpenseDTO {
    
    private Long expenseId;
    private String expenseReference;
    private String expenseTitle;
    private ExpenseCategory expenseCategory;
    private BigDecimal amount;
    private String expenseDescription;
    private String vendorSupplier;
    private String receiptInvoiceNumber;
    private LocalDate expenseDate;
    private LocalDate paymentDate;
    private PaymentMethod paymentMethod;
    private ExpenseStatus expenseStatus;
    private ApprovalStatus approvalStatus;
    private String approvalRemarks;
    private LocalDateTime approvalDate;
    private String budgetAllocation;
    private Boolean isRecurring;
    private String academicYear;
    private String semester;
    private BigDecimal taxAmount;
    private Boolean isTaxInclusive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String remarks;
    private String documentationPath;
    
    // Related entity information
    private String createdByName;
    private Integer createdByAccountId;
    private String approvedByName;
    private Integer approvedByAccountId;
    private String departmentName;
    private String departmentId;
    private String relatedFeeType;
    private Integer relatedFeeId;
    
    // Calculated fields
    private BigDecimal totalAmount;
    private BigDecimal netAmount;
    
    // Constructors
    public ExpenseDTO() {}
    
    // Getters and Setters
    public Long getExpenseId() {
        return expenseId;
    }
    
    public void setExpenseId(Long expenseId) {
        this.expenseId = expenseId;
    }
    
    public String getExpenseReference() {
        return expenseReference;
    }
    
    public void setExpenseReference(String expenseReference) {
        this.expenseReference = expenseReference;
    }
    
    public String getExpenseTitle() {
        return expenseTitle;
    }
    
    public void setExpenseTitle(String expenseTitle) {
        this.expenseTitle = expenseTitle;
    }
    
    public ExpenseCategory getExpenseCategory() {
        return expenseCategory;
    }
    
    public void setExpenseCategory(ExpenseCategory expenseCategory) {
        this.expenseCategory = expenseCategory;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getExpenseDescription() {
        return expenseDescription;
    }
    
    public void setExpenseDescription(String expenseDescription) {
        this.expenseDescription = expenseDescription;
    }
    
    public String getVendorSupplier() {
        return vendorSupplier;
    }
    
    public void setVendorSupplier(String vendorSupplier) {
        this.vendorSupplier = vendorSupplier;
    }
    
    public String getReceiptInvoiceNumber() {
        return receiptInvoiceNumber;
    }
    
    public void setReceiptInvoiceNumber(String receiptInvoiceNumber) {
        this.receiptInvoiceNumber = receiptInvoiceNumber;
    }
    
    public LocalDate getExpenseDate() {
        return expenseDate;
    }
    
    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }
    
    public LocalDate getPaymentDate() {
        return paymentDate;
    }
    
    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }
    
    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public ExpenseStatus getExpenseStatus() {
        return expenseStatus;
    }
    
    public void setExpenseStatus(ExpenseStatus expenseStatus) {
        this.expenseStatus = expenseStatus;
    }
    
    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }
    
    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }
    
    public String getApprovalRemarks() {
        return approvalRemarks;
    }
    
    public void setApprovalRemarks(String approvalRemarks) {
        this.approvalRemarks = approvalRemarks;
    }
    
    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }
    
    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }
    
    public String getBudgetAllocation() {
        return budgetAllocation;
    }
    
    public void setBudgetAllocation(String budgetAllocation) {
        this.budgetAllocation = budgetAllocation;
    }
    
    public Boolean getIsRecurring() {
        return isRecurring;
    }
    
    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }
    
    public String getAcademicYear() {
        return academicYear;
    }
    
    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }
    
    public String getSemester() {
        return semester;
    }
    
    public void setSemester(String semester) {
        this.semester = semester;
    }
    
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public Boolean getIsTaxInclusive() {
        return isTaxInclusive;
    }
    
    public void setIsTaxInclusive(Boolean isTaxInclusive) {
        this.isTaxInclusive = isTaxInclusive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getRemarks() {
        return remarks;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    
    public String getCreatedByName() {
        return createdByName;
    }
    
    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
    
    public Integer getCreatedByAccountId() {
        return createdByAccountId;
    }
    
    public void setCreatedByAccountId(Integer createdByAccountId) {
        this.createdByAccountId = createdByAccountId;
    }
    
    public String getApprovedByName() {
        return approvedByName;
    }
    
    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }
    
    public Integer getApprovedByAccountId() {
        return approvedByAccountId;
    }
    
    public void setApprovedByAccountId(Integer approvedByAccountId) {
        this.approvedByAccountId = approvedByAccountId;
    }
    
    public String getDepartmentName() {
        return departmentName;
    }
    
    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
    
    public String getDepartmentId() {
        return departmentId;
    }
    
    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }
    
    public String getRelatedFeeType() {
        return relatedFeeType;
    }
    
    public void setRelatedFeeType(String relatedFeeType) {
        this.relatedFeeType = relatedFeeType;
    }
    
    public Integer getRelatedFeeId() {
        return relatedFeeId;
    }
    
    public void setRelatedFeeId(Integer relatedFeeId) {
        this.relatedFeeId = relatedFeeId;
    }
    
    public BigDecimal getTotalAmount() {
        if (amount == null) return null;
        if (taxAmount != null && !isTaxInclusive) {
            return amount.add(taxAmount);
        }
        return amount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public BigDecimal getNetAmount() {
        if (amount == null) return null;
        if (taxAmount != null && isTaxInclusive) {
            return amount.subtract(taxAmount);
        }
        return amount;
    }
    
    public void setNetAmount(BigDecimal netAmount) {
        this.netAmount = netAmount;
    }
    
    public String getDocumentationPath() {
        return documentationPath;
    }
    
    public void setDocumentationPath(String documentationPath) {
        this.documentationPath = documentationPath;
    }
}
