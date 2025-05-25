package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;

public class ExpenseCategorySummaryDto {
    private String categoryName;
    private BigDecimal totalAmountSpent;
    private long numberOfExpenses;

    public ExpenseCategorySummaryDto() {
    }

    public ExpenseCategorySummaryDto(String categoryName, BigDecimal totalAmountSpent, long numberOfExpenses) {
        this.categoryName = categoryName;
        this.totalAmountSpent = totalAmountSpent;
        this.numberOfExpenses = numberOfExpenses;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalAmountSpent() {
        return totalAmountSpent;
    }

    public void setTotalAmountSpent(BigDecimal totalAmountSpent) {
        this.totalAmountSpent = totalAmountSpent;
    }

    public long getNumberOfExpenses() {
        return numberOfExpenses;
    }

    public void setNumberOfExpenses(long numberOfExpenses) {
        this.numberOfExpenses = numberOfExpenses;
    }
} 