package com.agaseeyyy.transparencysystem.fees;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "fees")
public class Fees {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer feeId;

  @Column(name = "name", nullable = false)
  private String name;

  @Column(name = "amount", nullable = false)
  private Double amount;

  @Column(name = "due_date", nullable = false)
  private LocalDate dueDate;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt = LocalDate.now();

  // Constructors
  public Fees() {
  }

  public Fees(Integer feeId, String name, Double amount, LocalDate dueDate, LocalDate createdAt) {
    this.feeId = feeId;
    this.name = name;
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

  public String getName() {
    return this.name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Double getAmount() {
    return this.amount;
  }

  public void setAmount(Double amount) {
    this.amount = amount;
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
