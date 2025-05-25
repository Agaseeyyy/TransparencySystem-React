package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseBreakdownDto {
    private String expenseTitle;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private String vendor;
    private String category;

    public ExpenseBreakdownDto() {
    }

    public ExpenseBreakdownDto(String expenseTitle, BigDecimal amount, LocalDate expenseDate, String vendor, String category) {
        this.expenseTitle = expenseTitle;
        this.amount = amount;
        this.expenseDate = expenseDate;
        this.vendor = vendor;
        this.category = category;
    }

    public String getExpenseTitle() {
        return expenseTitle;
    }

    public void setExpenseTitle(String expenseTitle) {
        this.expenseTitle = expenseTitle;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getVendor() {
        return vendor;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
} 