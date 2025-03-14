package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDate;
import java.time.Year;

import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.Students;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
@Entity
@Table(name = "payments")
@JsonIgnoreProperties({"fee", "student", "program"})
public class Payments {
  @Id
  @Column(name = "payment_id", columnDefinition = "VARCHAR(40)")
  private String paymentId;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @Column(name = "payment_date", nullable = false)
  private LocalDate paymentDate = LocalDate.now();

  @Column(name = "remarks", columnDefinition = "TEXT", nullable = true)
  private String remarks;

  @ManyToOne
  @JoinColumn(name = "fee_id", nullable = false)
  private Fees fee;
  @JsonProperty("feeId")
  public Integer getFeeId() {
    return fee != null ? fee.getFeeId() : null;
  } 

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

  // Enumerations
  public enum Status{
    Paid,  Pending, Overdue;
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

  public String getRemarks() {
    return this.remarks;
  }

  public void setRemarks(String remarks) {
    this.remarks = remarks;
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

  @JsonProperty("firstName")
  public String getFirstName() {
      return student != null ? student.getFirstName() : null;
  }

  @JsonProperty("lastName")
  public String getLastName() {
      return student != null ? student.getLastName() : null;
  }

  @JsonProperty("middleInitial")
  public Character getMiddleInitial() {
      return student != null ? student.getMiddleInitial() : null;
  }

  @JsonProperty("yearLevel")
  public Year getYearLevel() {
      return student != null ? student.getYearLevel() : null;
  }

  @JsonProperty("section")
  public Character getSection() {
      return student != null ? student.getSection() : null;
  }

  @JsonProperty("program")
  public String getProgram() {
      if (student != null && student.getProgram() != null) {
          return student.getProgram().getProgramName(); // or getProgramCode() depending on what you need
      }
      return null;
  }

  @JsonProperty("programId")
  public String getProgramId() {
      if (student != null && student.getProgram() != null) {
          return student.getProgram().getProgramId();
      }
      return null;
  }

  @JsonProperty("amount")
  public Double getAmount() {
      return fee != null ? fee.getAmount() : null;
  }

  @JsonProperty("feeType")
  public String getFeeType() {
      return fee != null ? fee.getFeeType() : null;
  }

}
