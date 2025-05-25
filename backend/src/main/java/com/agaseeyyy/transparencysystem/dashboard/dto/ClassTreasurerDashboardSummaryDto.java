package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.util.List;
import java.math.BigDecimal;

public class ClassTreasurerDashboardSummaryDto {
    private String treasurerName;
    private String className; // e.g., "BSIT 3-1"

    // Remittance Summary for this Treasurer
    private long totalRemittancesMadeCount;
    private BigDecimal totalAmountRemittedByTreasurer;
    private SummaryCountAmountDto remittancesByStatus; // PENDING, COMPLETED, VERIFIED (for their own remittances)
    private List<RecentTransactionDto> recentRemittancesByTreasurer;

    // Payment Summary for their Class/Managed Fees
    private BigDecimal totalCollectedForManagedFees;
    private long totalPaymentsForManagedFeesCount;
    private List<StudentPaymentStatusDto> studentPaymentStatuses; // List of students and their payment status for relevant fees
    private List<RecentTransactionDto> recentPaymentsInClass;

    // Fees they are responsible for collecting
    private List<String> managedFeeTypes;

    public ClassTreasurerDashboardSummaryDto() {
        this.totalAmountRemittedByTreasurer = BigDecimal.ZERO;
        this.totalCollectedForManagedFees = BigDecimal.ZERO;
    }

    // Getters and Setters
    public String getTreasurerName() {
        return treasurerName;
    }

    public void setTreasurerName(String treasurerName) {
        this.treasurerName = treasurerName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public long getTotalRemittancesMadeCount() {
        return totalRemittancesMadeCount;
    }

    public void setTotalRemittancesMadeCount(long totalRemittancesMadeCount) {
        this.totalRemittancesMadeCount = totalRemittancesMadeCount;
    }

    public BigDecimal getTotalAmountRemittedByTreasurer() {
        return totalAmountRemittedByTreasurer;
    }

    public void setTotalAmountRemittedByTreasurer(BigDecimal totalAmountRemittedByTreasurer) {
        this.totalAmountRemittedByTreasurer = totalAmountRemittedByTreasurer;
    }

    public SummaryCountAmountDto getRemittancesByStatus() {
        return remittancesByStatus;
    }

    public void setRemittancesByStatus(SummaryCountAmountDto remittancesByStatus) {
        this.remittancesByStatus = remittancesByStatus;
    }

    public List<RecentTransactionDto> getRecentRemittancesByTreasurer() {
        return recentRemittancesByTreasurer;
    }

    public void setRecentRemittancesByTreasurer(List<RecentTransactionDto> recentRemittancesByTreasurer) {
        this.recentRemittancesByTreasurer = recentRemittancesByTreasurer;
    }

    public BigDecimal getTotalCollectedForManagedFees() {
        return totalCollectedForManagedFees;
    }

    public void setTotalCollectedForManagedFees(BigDecimal totalCollectedForManagedFees) {
        this.totalCollectedForManagedFees = totalCollectedForManagedFees;
    }

    public long getTotalPaymentsForManagedFeesCount() {
        return totalPaymentsForManagedFeesCount;
    }

    public void setTotalPaymentsForManagedFeesCount(long totalPaymentsForManagedFeesCount) {
        this.totalPaymentsForManagedFeesCount = totalPaymentsForManagedFeesCount;
    }

    public List<StudentPaymentStatusDto> getStudentPaymentStatuses() {
        return studentPaymentStatuses;
    }

    public void setStudentPaymentStatuses(List<StudentPaymentStatusDto> studentPaymentStatuses) {
        this.studentPaymentStatuses = studentPaymentStatuses;
    }

    public List<RecentTransactionDto> getRecentPaymentsInClass() {
        return recentPaymentsInClass;
    }

    public void setRecentPaymentsInClass(List<RecentTransactionDto> recentPaymentsInClass) {
        this.recentPaymentsInClass = recentPaymentsInClass;
    }

    public List<String> getManagedFeeTypes() {
        return managedFeeTypes;
    }

    public void setManagedFeeTypes(List<String> managedFeeTypes) {
        this.managedFeeTypes = managedFeeTypes;
    }
} 