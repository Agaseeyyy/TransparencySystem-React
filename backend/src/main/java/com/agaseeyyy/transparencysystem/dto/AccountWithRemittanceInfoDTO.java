package com.agaseeyyy.transparencysystem.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;
// Potentially import an Enum for status if you prefer, e.g., com.agaseeyyy.transparencysystem.enums.RemittanceStatus;

public class AccountWithRemittanceInfoDTO {
    private Accounts account;
    private BigDecimal totalRemittedAmount;
    private String remittanceStatus; // String representation for backward compatibility
    private Integer feeId;
    private String feeType;
    private LocalDate remittanceDate; // Added for date sorting

    public AccountWithRemittanceInfoDTO(
        Accounts account,
        BigDecimal totalRemittedAmount,
        String remittanceStatus, // String version for backward compatibility
        Integer feeId,
        String feeType
    ) {
        this.account = account;
        this.totalRemittedAmount = totalRemittedAmount;
        this.remittanceStatus = remittanceStatus;
        this.feeId = feeId;
        this.feeType = feeType;
        this.remittanceDate = null; // Default to null if not provided
    }
    
    // Alternate constructor using RemittanceStatus enum
    public AccountWithRemittanceInfoDTO(
        Accounts account,
        BigDecimal totalRemittedAmount,
        RemittanceStatus status, // Enum version for type safety
        Integer feeId,
        String feeType
    ) {
        this.account = account;
        this.totalRemittedAmount = totalRemittedAmount;
        this.remittanceStatus = status.name(); // Store as string for compatibility
        this.feeId = feeId;
        this.feeType = feeType;
        this.remittanceDate = null; // Default to null if not provided
    }

    // Getters
    public Accounts getAccount() {
        return account;
    }

    public double getTotalRemittedAmount() {
        return totalRemittedAmount.doubleValue();
    }

    public BigDecimal getTotalRemittedAmountBigDecimal() {
        return totalRemittedAmount;
    }

    public String getRemittanceStatus() {
        return remittanceStatus;
    }
    
    // Get the status as enum for type-safe operations
    public RemittanceStatus getRemittanceStatusEnum() {
        try {
            return RemittanceStatus.valueOf(remittanceStatus);
        } catch (IllegalArgumentException e) {
            // Handle legacy string values
            if ("Remitted".equals(remittanceStatus)) {
                return RemittanceStatus.COMPLETED;
            } else if ("Not Remitted".equals(remittanceStatus)) {
                return RemittanceStatus.NOT_REMITTED;
            } else {
                return RemittanceStatus.PARTIAL; // Default fallback
            }
        }
    }

    public Integer getFeeId() {
        return feeId;
    }

    public String getFeeType() {
        return feeType;
    }
    
    public LocalDate getRemittanceDate() {
        return remittanceDate;
    }
    
    // Setter for remittance status
    public void setRemittanceStatus(String remittanceStatus) {
        this.remittanceStatus = remittanceStatus;
    }
    
    // Setter using enum for type safety
    public void setRemittanceStatus(RemittanceStatus status) {
        this.remittanceStatus = status.name();
    }

    public void setRemittanceDate(LocalDate remittanceDate) {
        this.remittanceDate = remittanceDate;
    }

    // Setters can be added if needed, but typically DTOs used for reading are immutable or semi-immutable.
} 
 
 