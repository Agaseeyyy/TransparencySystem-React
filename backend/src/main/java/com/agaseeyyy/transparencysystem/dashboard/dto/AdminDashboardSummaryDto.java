package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.util.List;
import java.math.BigDecimal;

public class AdminDashboardSummaryDto {
    // Overall Financials
    private BigDecimal totalCollections;
    private BigDecimal totalExpenses;
    private BigDecimal totalRemitted; // This refers to total amount from Remittances table
    private BigDecimal netBalance; // Collections - Expenses

    // Payment Summaries
    private long totalPaymentsCount;
    private BigDecimal totalPaymentsAmount;
    private SummaryCountAmountDto paymentsBySystemStatus; // e.g., PAID, PENDING (from Payments table)
    private SummaryCountAmountDto paymentsByRemittanceStatus; // New: Based on linked remittance status

    // Expense Summaries
    private long totalExpensesCount;
    private BigDecimal totalExpensesAmount;
    private SummaryCountAmountDto expensesByStatus; // e.g., PAID, PENDING (from Expenses table)

    // Remittance Summaries (Enhanced)
    private long totalRemittancesCount;
    private SummaryCountAmountDto remittancesByStatus; // Existing, for overall remittance statuses
    private List<RecentTransactionDto> recentRemittances; // New: List of recent remittance transactions

    // Fee Transparency Breakdown (from Public View)
    private List<FeeTransparencyDto> feeBreakdownAndUtilization; // New: Detailed breakdown per fee

    // Recent Generic Transactions
    private List<RecentTransactionDto> recentTransactions;

    // Other Key Metrics (Optional)
    private Object otherMetrics; // Placeholder for any other specific metrics needed

    // User/Account Summaries
    private long totalUsers;
    private SummaryCountDto usersByRole;

    // Fee Specific Summaries (Optional, could be a separate endpoint if too complex)
    // private List<FeeSummaryDto> feeBreakdown;

    public AdminDashboardSummaryDto() {
        // Initialize with default values if necessary, especially for counts/amounts
        this.totalCollections = BigDecimal.ZERO;
        this.totalExpenses = BigDecimal.ZERO;
        this.totalRemitted = BigDecimal.ZERO;
        this.netBalance = BigDecimal.ZERO;
        this.totalPaymentsAmount = BigDecimal.ZERO;
        this.totalExpensesAmount = BigDecimal.ZERO;
    }

    // Getters and Setters
    public BigDecimal getTotalCollections() {
        return totalCollections;
    }

    public void setTotalCollections(BigDecimal totalCollections) {
        this.totalCollections = totalCollections;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getTotalRemitted() {
        return totalRemitted;
    }

    public void setTotalRemitted(BigDecimal totalRemitted) {
        this.totalRemitted = totalRemitted;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }

    public long getTotalPaymentsCount() {
        return totalPaymentsCount;
    }

    public void setTotalPaymentsCount(long totalPaymentsCount) {
        this.totalPaymentsCount = totalPaymentsCount;
    }

    public BigDecimal getTotalPaymentsAmount() {
        return totalPaymentsAmount;
    }

    public void setTotalPaymentsAmount(BigDecimal totalPaymentsAmount) {
        this.totalPaymentsAmount = totalPaymentsAmount;
    }

    public SummaryCountAmountDto getPaymentsBySystemStatus() {
        return paymentsBySystemStatus;
    }

    public void setPaymentsBySystemStatus(SummaryCountAmountDto paymentsBySystemStatus) {
        this.paymentsBySystemStatus = paymentsBySystemStatus;
    }

    public SummaryCountAmountDto getPaymentsByRemittanceStatus() {
        return paymentsByRemittanceStatus;
    }

    public void setPaymentsByRemittanceStatus(SummaryCountAmountDto paymentsByRemittanceStatus) {
        this.paymentsByRemittanceStatus = paymentsByRemittanceStatus;
    }

    public long getTotalExpensesCount() {
        return totalExpensesCount;
    }

    public void setTotalExpensesCount(long totalExpensesCount) {
        this.totalExpensesCount = totalExpensesCount;
    }

    public BigDecimal getTotalExpensesAmount() {
        return totalExpensesAmount;
    }

    public void setTotalExpensesAmount(BigDecimal totalExpensesAmount) {
        this.totalExpensesAmount = totalExpensesAmount;
    }

    public SummaryCountAmountDto getExpensesByStatus() {
        return expensesByStatus;
    }

    public void setExpensesByStatus(SummaryCountAmountDto expensesByStatus) {
        this.expensesByStatus = expensesByStatus;
    }

    public long getTotalRemittancesCount() {
        return totalRemittancesCount;
    }

    public void setTotalRemittancesCount(long totalRemittancesCount) {
        this.totalRemittancesCount = totalRemittancesCount;
    }

    public SummaryCountAmountDto getRemittancesByStatus() {
        return remittancesByStatus;
    }

    public void setRemittancesByStatus(SummaryCountAmountDto remittancesByStatus) {
        this.remittancesByStatus = remittancesByStatus;
    }

    public List<RecentTransactionDto> getRecentRemittances() {
        return recentRemittances;
    }

    public void setRecentRemittances(List<RecentTransactionDto> recentRemittances) {
        this.recentRemittances = recentRemittances;
    }

    public List<FeeTransparencyDto> getFeeBreakdownAndUtilization() {
        return feeBreakdownAndUtilization;
    }

    public void setFeeBreakdownAndUtilization(List<FeeTransparencyDto> feeBreakdownAndUtilization) {
        this.feeBreakdownAndUtilization = feeBreakdownAndUtilization;
    }

    public List<RecentTransactionDto> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<RecentTransactionDto> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }

    public Object getOtherMetrics() {
        return otherMetrics;
    }

    public void setOtherMetrics(Object otherMetrics) {
        this.otherMetrics = otherMetrics;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public SummaryCountDto getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(SummaryCountDto usersByRole) {
        this.usersByRole = usersByRole;
    }
} 