package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecentTransactionDto {
    private String id; // Could be paymentId, expenseId, remittanceId
    private String type; // "Payment", "Expense", "Remittance"
    private String description; // e.g., Fee Type, Expense Title, Remittance Details
    private BigDecimal amount;
    private LocalDateTime date;
    private String status;
    private String userInvolved; // e.g., Student Name, Remitted By, Approved By

    public RecentTransactionDto(String id, String type, String description, BigDecimal amount, LocalDateTime date, String status, String userInvolved) {
        this.id = id;
        this.type = type;
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.status = status;
        this.userInvolved = userInvolved;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUserInvolved() {
        return userInvolved;
    }

    public void setUserInvolved(String userInvolved) {
        this.userInvolved = userInvolved;
    }
} 