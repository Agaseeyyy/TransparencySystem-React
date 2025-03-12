package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDate;

import com.agaseeyyy.transparencysystem.students.Students;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;

public class Payments {
  @Id
  @Column(name = "payment_id")
  private Long paymentId;

  @Column(name = "status", nullable = false)
  private Status status;

  @Column(name = "payment_date", nullable = false)
  private LocalDate paymentDate = LocalDate.now();

  @ManyToMany
  @JoinColumn(name = "student_id", nullable = false)
  private Students student;

  @JsonProperty("studentId")
  public Long getStudentId() {
    return student != null ? student.getStudentId() : null;
  }


  public Payments() {
  }

  public Payments(Long paymentId, Status status, LocalDate paymentDate, Students student) {
    this.paymentId = paymentId;
    this.status = status;
    this.paymentDate = paymentDate;
    this.student = student;
  }

  public Long getPaymentId() {
    return this.paymentId;
  }

  public void setPaymentId(Long paymentId) {
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

  public Students getStudent() {
    return this.student;
  }

  public void setStudent(Students student) {
    this.student = student;
  }

  public enum Status{
    Completed,  Pending, Overdue;
  } 
}
