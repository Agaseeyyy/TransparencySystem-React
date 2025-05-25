package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public class FeeTransparencyDto {
    private String feeName; // e.g., "Org Fee", "Event Fee - Tech Summit"
    private String feeDescription;
    private BigDecimal totalCollectedForFee;
    private BigDecimal totalSpentFromFee; // Sum of expenses linked to this fee
    private BigDecimal feeBalance; // Collected - Spent for this fee
    private List<ExpenseBreakdownDto> expenseBreakdown; // Top/Recent expenses for this fee

    // No-args constructor
    public FeeTransparencyDto() {
    }

    // Constructor with feeName and feeDescription (as in original code)
    public FeeTransparencyDto(String feeName, String feeDescription) {
        this.feeName = feeName;
        this.feeDescription = feeDescription;
        this.totalCollectedForFee = BigDecimal.ZERO;
        this.totalSpentFromFee = BigDecimal.ZERO;
        this.feeBalance = BigDecimal.ZERO;
    }

    // All-args constructor
    public FeeTransparencyDto(String feeName, String feeDescription, BigDecimal totalCollectedForFee, BigDecimal totalSpentFromFee, BigDecimal feeBalance, List<ExpenseBreakdownDto> expenseBreakdown) {
        this.feeName = feeName;
        this.feeDescription = feeDescription;
        this.totalCollectedForFee = totalCollectedForFee;
        this.totalSpentFromFee = totalSpentFromFee;
        this.feeBalance = feeBalance;
        this.expenseBreakdown = expenseBreakdown;
    }

    // Getters and Setters
    public String getFeeName() {
        return feeName;
    }

    public void setFeeName(String feeName) {
        this.feeName = feeName;
    }

    public String getFeeDescription() {
        return feeDescription;
    }

    public void setFeeDescription(String feeDescription) {
        this.feeDescription = feeDescription;
    }

    public BigDecimal getTotalCollectedForFee() {
        return totalCollectedForFee;
    }

    public void setTotalCollectedForFee(BigDecimal totalCollectedForFee) {
        this.totalCollectedForFee = totalCollectedForFee;
    }

    public BigDecimal getTotalSpentFromFee() {
        return totalSpentFromFee;
    }

    public void setTotalSpentFromFee(BigDecimal totalSpentFromFee) {
        this.totalSpentFromFee = totalSpentFromFee;
    }

    public BigDecimal getFeeBalance() {
        return feeBalance;
    }

    public void setFeeBalance(BigDecimal feeBalance) {
        this.feeBalance = feeBalance;
    }

    public List<ExpenseBreakdownDto> getExpenseBreakdown() {
        return expenseBreakdown;
    }

    public void setExpenseBreakdown(List<ExpenseBreakdownDto> expenseBreakdown) {
        this.expenseBreakdown = expenseBreakdown;
    }
} 