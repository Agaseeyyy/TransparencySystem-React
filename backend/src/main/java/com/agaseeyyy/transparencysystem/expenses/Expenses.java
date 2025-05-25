package com.agaseeyyy.transparencysystem.expenses;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "expenses")
@JsonIgnoreProperties({"account", "department", "relatedFee", "createdByAccount", "approvedByAccount", "hibernateLazyInitializer", "handler"})
public class Expenses {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_id")
    private Long expenseId;

    @NotBlank(message = "Expense reference is required")
    @Size(max = 50, message = "Expense reference cannot exceed 50 characters")
    @Column(name = "expense_reference", unique = true, nullable = false, length = 50)
    private String expenseReference; // Unique reference number for tracking

    @NotBlank(message = "Expense title is required")
    @Size(max = 255, message = "Expense title cannot exceed 255 characters")
    @Column(name = "expense_title", nullable = false, length = 255)
    private String expenseTitle; // Brief title/description of the expense

    @NotNull(message = "Expense category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "expense_category", nullable = false, length = 50)
    private ExpenseCategory expenseCategory; // Categorized expense type

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Amount must be a valid monetary value")
    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount; // Amount spent

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(name = "expense_description", columnDefinition = "TEXT")
    private String expenseDescription; // Detailed description of the expense

    @Size(max = 255, message = "Vendor/Supplier name cannot exceed 255 characters")
    @Column(name = "vendor_supplier", length = 255)
    private String vendorSupplier; // Company/person the expense was paid to

    @Size(max = 100, message = "Receipt/Invoice number cannot exceed 100 characters")
    @Column(name = "receipt_invoice_number", length = 100)
    private String receiptInvoiceNumber; // Official receipt or invoice number

    @NotNull(message = "Expense date is required")
    @PastOrPresent(message = "Expense date cannot be in the future")
    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate; // Date the expense was incurred

    @Column(name = "payment_date")
    private LocalDate paymentDate; // Date the expense was paid

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 50)
    private PaymentMethod paymentMethod; // How the payment was made

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_status", nullable = false, length = 20)
    private ExpenseStatus expenseStatus = ExpenseStatus.PENDING; // Current status

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false, length = 20)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING; // Approval workflow status

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_account_id")
    private Accounts approvedByAccount; // Account that approved this expense

    @Column(name = "approval_date")
    private LocalDateTime approvalDate; // When it was approved

    @Column(name = "approval_remarks", columnDefinition = "TEXT")
    private String approvalRemarks; // Approval comments

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_account_id", nullable = false)
    private Accounts createdByAccount; // Account that created this expense record

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Departments department; // Department this expense belongs to

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_fee_id")
    private Fees relatedFee; // If expense is related to a specific fee collection

    @Column(name = "budget_allocation", length = 100)
    private String budgetAllocation; // Budget line item this expense falls under

    @Column(name = "is_recurring", nullable = false)
    private Boolean isRecurring = false; // Whether this is a recurring expense

    @Enumerated(EnumType.STRING)
    @Column(name = "recurring_frequency")
    @com.fasterxml.jackson.databind.annotation.JsonDeserialize(using = com.agaseeyyy.transparencysystem.util.RecurringFrequencyDeserializer.class)
    private RecurringFrequency recurringFrequency; // How often it recurs

    @Column(name = "academic_year", length = 10)
    private String academicYear; // Academic year this expense belongs to

    @Column(name = "semester", length = 20)
    private String semester; // Semester this expense belongs to

    @Column(name = "documentation_path", length = 500)
    private String documentationPath; // Path to supporting documents/receipts

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount; // Tax amount if applicable

    @Column(name = "is_tax_inclusive", nullable = false)
    private Boolean isTaxInclusive = false; // Whether amount includes tax

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks; // Additional remarks or notes

    // Enumerations
    public enum ExpenseCategory {
        OFFICE_SUPPLIES,
        UTILITIES,
        MAINTENANCE,
        TRANSPORTATION,
        COMMUNICATION,
        EVENTS,
        TRAINING,
        EQUIPMENT,
        SOFTWARE_LICENSES,
        PRINTING,
        CATERING,
        SECURITY,
        CLEANING,
        RENT,
        INSURANCE,
        LEGAL_FEES,
        CONSULTING,
        MARKETING,
        STUDENT_ACTIVITIES,
        EMERGENCY_FUND,
        MISCELLANEOUS
    }

    public enum PaymentMethod {
        CASH,
        CHECK,
        BANK_TRANSFER,
        CREDIT_CARD,
        DEBIT_CARD,
        ONLINE_PAYMENT,
        PETTY_CASH
    }

    public enum ExpenseStatus {
        PENDING,
        PAID,
        CANCELLED,
        REFUNDED,
        DISPUTED
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED,
        REQUIRES_REVIEW
    }

    public enum RecurringFrequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        SEMESTERLY,
        ANNUALLY
    }

    // Constructors
    public Expenses() {}

    public Expenses(String expenseReference, String expenseTitle, ExpenseCategory expenseCategory, 
                   BigDecimal amount, String expenseDescription, LocalDate expenseDate, 
                   Accounts createdByAccount) {
        this.expenseReference = expenseReference;
        this.expenseTitle = expenseTitle;
        this.expenseCategory = expenseCategory;
        this.amount = amount;
        this.expenseDescription = expenseDescription;
        this.expenseDate = expenseDate;
        this.createdByAccount = createdByAccount;
    }

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

    public Accounts getApprovedByAccount() {
        return approvedByAccount;
    }

    public void setApprovedByAccount(Accounts approvedByAccount) {
        this.approvedByAccount = approvedByAccount;
    }

    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }

    public String getApprovalRemarks() {
        return approvalRemarks;
    }

    public void setApprovalRemarks(String approvalRemarks) {
        this.approvalRemarks = approvalRemarks;
    }

    public Accounts getCreatedByAccount() {
        return createdByAccount;
    }

    public void setCreatedByAccount(Accounts createdByAccount) {
        this.createdByAccount = createdByAccount;
    }

    public Departments getDepartment() {
        return department;
    }

    public void setDepartment(Departments department) {
        this.department = department;
    }

    public Fees getRelatedFee() {
        return relatedFee;
    }

    public void setRelatedFee(Fees relatedFee) {
        this.relatedFee = relatedFee;
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

    public RecurringFrequency getRecurringFrequency() {
        return recurringFrequency;
    }

    public void setRecurringFrequency(RecurringFrequency recurringFrequency) {
        this.recurringFrequency = recurringFrequency;
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

    public String getDocumentationPath() {
        return documentationPath;
    }

    public void setDocumentationPath(String documentationPath) {
        this.documentationPath = documentationPath;
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

    // JSON Properties for transparency reporting
    @JsonProperty("createdByName")
    public String getCreatedByName() {
        return createdByAccount != null ? 
            (createdByAccount.getFirstName() + " " + createdByAccount.getLastName()) : null;
    }

    @JsonProperty("approvedByName")
    public String getApprovedByName() {
        return approvedByAccount != null ? 
            (approvedByAccount.getFirstName() + " " + approvedByAccount.getLastName()) : null;
    }

    @JsonProperty("departmentName")
    public String getDepartmentName() {
        return department != null ? department.getDepartmentName() : null;
    }

    @JsonProperty("departmentId")
    public String getDepartmentId() {
        return department != null ? department.getDepartmentId() : null;
    }

    @JsonProperty("relatedFeeType")
    public String getRelatedFeeType() {
        return relatedFee != null ? relatedFee.getFeeType() : null;
    }

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

    // Lifecycle callbacks for audit trail
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
