package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;

public class FeeUtilizationDTO {
    private Integer feeId;
    private String feeType;
    private BigDecimal totalCollected;
    private BigDecimal totalRemitted;
    private BigDecimal totalExpenses;
    private BigDecimal netBalance;

    // Constructors
    public FeeUtilizationDTO() {
    }

    public FeeUtilizationDTO(Integer feeId, String feeType, BigDecimal totalCollected, BigDecimal totalRemitted, BigDecimal totalExpenses, BigDecimal netBalance) {
        this.feeId = feeId;
        this.feeType = feeType;
        this.totalCollected = totalCollected;
        this.totalRemitted = totalRemitted;
        this.totalExpenses = totalExpenses;
        this.netBalance = netBalance;
    }

    // Getters and Setters
    public Integer getFeeId() {
        return feeId;
    }

    public void setFeeId(Integer feeId) {
        this.feeId = feeId;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public BigDecimal getTotalCollected() {
        return totalCollected;
    }

    public void setTotalCollected(BigDecimal totalCollected) {
        this.totalCollected = totalCollected;
    }

    public BigDecimal getTotalRemitted() {
        return totalRemitted;
    }

    public void setTotalRemitted(BigDecimal totalRemitted) {
        this.totalRemitted = totalRemitted;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetBalance() {
        return netBalance;
    }

    public void setNetBalance(BigDecimal netBalance) {
        this.netBalance = netBalance;
    }
} 