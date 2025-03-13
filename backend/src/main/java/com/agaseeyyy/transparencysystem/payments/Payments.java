package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDate;

import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.Students;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
@Entity
@Table(name = "payments")
public class Payments {
  @Id
  @Column(name = "payment_id", columnDefinition = "VARCHAR(40)")
  private String paymentId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @Column(name = "payment_date", nullable = false)
  private LocalDate paymentDate = LocalDate.now();

  @ManyToOne
  @JoinColumn(name = "fee_id", nullable = false)
  private Fees fee;
  // @JsonProperty("feeId")
  // public 

  @ManyToOne
  @JoinColumn(name = "student_id", nullable = false)
  private Students student;
  @JsonProperty("studentId")
  public Long getStudentId() {
    return student != null ? student.getStudentId() : null;
  }

  // Constructors
  public Payments() {
  }

  
  // Getters and Setters
  public String getPaymentId() {
    return this.paymentId;
  }

  public void setPaymentId(String paymentId) {
    this.paymentId = paymentId;
  }

  public Status getStatus() {
    return this.status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public LocalDate getPaymentDate() {
    return this.paymentDate;
  }

  public void setPaymentDate(LocalDate paymentDate) {
    this.paymentDate = paymentDate;
  }

  public Fees getFee() {
    return this.fee;
  }

  public void setFee(Fees fee) {
    this.fee = fee;
  }

  public Students getStudent() {
    return this.student;
  }

  public void setStudent(Students student) {
    this.student = student;
  }

  
  // Enumerations
  public enum Status{
    Completed,  Pending, Overdue;
  } 
}
