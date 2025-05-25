package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.util.List;
import java.math.BigDecimal;

public class PublicDashboardSummaryDto {
    private BigDecimal totalCollectedOverall;
    private BigDecimal totalSpentOverall;
    private BigDecimal currentFundsBalance;

    private List<FeeTransparencyDto> feeBreakdown; // Detailed breakdown per fee

    // Optional: High-level expense categories summary
    private List<ExpenseCategorySummaryDto> topExpenseCategories;

    public PublicDashboardSummaryDto() {
        this.totalCollectedOverall = BigDecimal.ZERO;
        this.totalSpentOverall = BigDecimal.ZERO;
        this.currentFundsBalance = BigDecimal.ZERO;
    }

    // Getters and Setters
    public BigDecimal getTotalCollectedOverall() {
        return totalCollectedOverall;
    }

    public void setTotalCollectedOverall(BigDecimal totalCollectedOverall) {
        this.totalCollectedOverall = totalCollectedOverall;
    }

    public BigDecimal getTotalSpentOverall() {
        return totalSpentOverall;
    }

    public void setTotalSpentOverall(BigDecimal totalSpentOverall) {
        this.totalSpentOverall = totalSpentOverall;
    }

    public BigDecimal getCurrentFundsBalance() {
        return currentFundsBalance;
    }

    public void setCurrentFundsBalance(BigDecimal currentFundsBalance) {
        this.currentFundsBalance = currentFundsBalance;
    }

    public List<FeeTransparencyDto> getFeeBreakdown() {
        return feeBreakdown;
    }

    public void setFeeBreakdown(List<FeeTransparencyDto> feeBreakdown) {
        this.feeBreakdown = feeBreakdown;
    }

    public List<ExpenseCategorySummaryDto> getTopExpenseCategories() {
        return topExpenseCategories;
    }

    public void setTopExpenseCategories(List<ExpenseCategorySummaryDto> topExpenseCategories) {
        this.topExpenseCategories = topExpenseCategories;
    }
} 