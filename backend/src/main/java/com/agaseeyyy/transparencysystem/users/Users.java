package com.agaseeyyy.transparencysystem.users;

import java.time.LocalDate;

import com.agaseeyyy.transparencysystem.students.Students;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@JsonIgnoreProperties("student")
public class Users {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer userId;

 
  @Enumerated(EnumType.STRING)
  private Role role;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt = LocalDate.now();

  @OneToOne
  @JoinColumn(name = "student_id")
  private Students student;

  // Constructors
  public Users() {
  }

  // Enumerated Role
  public enum Role {
    Admin, Org_Treasurer, Class_Treasurer;
  }

  public Users(Integer userId, Role role, String email, String password, LocalDate createdAt) {
    this.userId = userId;
    this.role = role;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }
  

  // Getters and Setters
  public Integer getUserId() {
    return this.userId;
  }

  public void setUserId(Integer userId) {
    this.userId = userId;
  }

  public Role getRole() {
    return this.role;
  }

  public void setRole(Role role) {
    this.role = role;
  }

  public String getEmail() {
    return this.email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return this.password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public LocalDate getCreatedAt() {
    return this.createdAt;
  }

  public void setCreatedAt(LocalDate createdAt) {
    this.createdAt = createdAt;
  }

  public Students getStudent() {
    return this.student;
  }

  public void setStudent(Students student) {
    this.student = student;
  }

  // Json Properties
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

  @JsonProperty("studentId")
  public Long getStudentId() {
    return student != null ? student.getStudentId() : null;
  }

  @JsonProperty("section")
  public Character getSection() {
    return student != null ? student.getSection() : null;
  }

 

}