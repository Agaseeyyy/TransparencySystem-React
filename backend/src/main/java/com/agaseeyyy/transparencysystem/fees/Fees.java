package com.agaseeyyy.transparencysystem.fees;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "fees")
public class Fees {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer feeId;

    @Column(name = "fee_type", nullable = false)
    private String feeType;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    // Constructors
    public Fees() {
    }

    public Fees(Integer feeId, String feeType, BigDecimal amount, LocalDate dueDate, LocalDate createdAt) {
        this.feeId = feeId;
        this.feeType = feeType;
        this.amount = amount;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }
    

    // Getters and Setters
    public Integer getFeeId() {
        return this.feeId;
    }

    public void setFeeId(Integer feeId) {
        this.feeId = feeId;
    }

    public String getFeeType() {
        return this.feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return this.dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
    
}
