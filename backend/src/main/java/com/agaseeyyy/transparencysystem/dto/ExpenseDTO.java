package com.agaseeyyy.transparencysystem.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ExpenseDTO {
    private Long expenseId;
    private String expenseReference;
    private String expenseTitle;
    private String expenseCategory;
    private BigDecimal amount;
    private String expenseDescription;
    private String vendorSupplier;
    private String receiptInvoiceNumber;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expenseDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate paymentDate;
    
    private String paymentMethod;
    private String expenseStatus;
    private String approvalStatus;
    private String approvedByName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime approvalDate;
    
    private String approvalRemarks;
    private String createdByName;
    private String departmentId;
    private String departmentName;
    private Integer relatedFeeId;
    private String relatedFeeType;
    private String budgetAllocation;
    private Boolean isRecurring;
    private String recurringFrequency;
    private String academicYear;
    private String semester;
    private String documentationPath;
    private BigDecimal taxAmount;
    private Boolean isTaxInclusive;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private String remarks;

    // JSON Properties for transparency reporting
    @JsonProperty("totalAmount")
    public BigDecimal getTotalAmount() {
        if (amount == null) return null;
        if (taxAmount != null && !Boolean.TRUE.equals(isTaxInclusive)) {
            return amount.add(taxAmount);
        }
        return amount;
    }

    @JsonProperty("netAmount")
    public BigDecimal getNetAmount() {
        if (amount == null) return null;
        if (taxAmount != null && Boolean.TRUE.equals(isTaxInclusive)) {
            return amount.subtract(taxAmount);
        }
        return amount;
    }

    // Constructors
    public ExpenseDTO() {}

    // Getters and Setters
    public Long getExpenseId() { return expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }

    public String getExpenseReference() { return expenseReference; }
    public void setExpenseReference(String expenseReference) { this.expenseReference = expenseReference; }

    public String getExpenseTitle() { return expenseTitle; }
    public void setExpenseTitle(String expenseTitle) { this.expenseTitle = expenseTitle; }

    public String getExpenseCategory() { return expenseCategory; }
    public void setExpenseCategory(String expenseCategory) { this.expenseCategory = expenseCategory; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getExpenseDescription() { return expenseDescription; }
    public void setExpenseDescription(String expenseDescription) { this.expenseDescription = expenseDescription; }

    public String getVendorSupplier() { return vendorSupplier; }
    public void setVendorSupplier(String vendorSupplier) { this.vendorSupplier = vendorSupplier; }

    public String getReceiptInvoiceNumber() { return receiptInvoiceNumber; }
    public void setReceiptInvoiceNumber(String receiptInvoiceNumber) { this.receiptInvoiceNumber = receiptInvoiceNumber; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getExpenseStatus() { return expenseStatus; }
    public void setExpenseStatus(String expenseStatus) { this.expenseStatus = expenseStatus; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public String getApprovedByName() { return approvedByName; }
    public void setApprovedByName(String approvedByName) { this.approvedByName = approvedByName; }

    public LocalDateTime getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDateTime approvalDate) { this.approvalDate = approvalDate; }

    public String getApprovalRemarks() { return approvalRemarks; }
    public void setApprovalRemarks(String approvalRemarks) { this.approvalRemarks = approvalRemarks; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Integer getRelatedFeeId() { return relatedFeeId; }
    public void setRelatedFeeId(Integer relatedFeeId) { this.relatedFeeId = relatedFeeId; }

    public String getRelatedFeeType() { return relatedFeeType; }
    public void setRelatedFeeType(String relatedFeeType) { this.relatedFeeType = relatedFeeType; }

    public String getBudgetAllocation() { return budgetAllocation; }
    public void setBudgetAllocation(String budgetAllocation) { this.budgetAllocation = budgetAllocation; }

    public Boolean getIsRecurring() { return isRecurring; }
    public void setIsRecurring(Boolean isRecurring) { this.isRecurring = isRecurring; }

    public String getRecurringFrequency() { return recurringFrequency; }
    public void setRecurringFrequency(String recurringFrequency) { this.recurringFrequency = recurringFrequency; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getDocumentationPath() { return documentationPath; }
    public void setDocumentationPath(String documentationPath) { this.documentationPath = documentationPath; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public Boolean getIsTaxInclusive() { return isTaxInclusive; }
    public void setIsTaxInclusive(Boolean isTaxInclusive) { this.isTaxInclusive = isTaxInclusive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
