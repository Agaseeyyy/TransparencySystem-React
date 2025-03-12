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

  public enum Status{
    Completed,  Pending, Overdue
  } 
}
