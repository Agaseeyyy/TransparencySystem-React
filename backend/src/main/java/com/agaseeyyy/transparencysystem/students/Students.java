package com.agaseeyyy.transparencysystem.students;

import java.time.Year;
import java.util.List;

import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.agaseeyyy.transparencysystem.programs.Programs;
import com.agaseeyyy.transparencysystem.users.Users;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
@JsonIgnoreProperties({"payments", "user"})
public class Students {
  @Id
  @Column(name = "student_id")
  private Long studentId;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "middle_initial")
  private char middleInitial;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "year_level", nullable = false)
  private Year yearLevel;

  @Column(name = "section", nullable = false)
  private char section;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false)
  private Status status;

  @ManyToOne
  @JoinColumn(name = "program_id")
  private Programs program;

  @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
  private List <Payments> payments;

  @OneToOne(mappedBy = "student", fetch = FetchType.LAZY)
  private Users user;

  // Constructors
  public Students() {
  }

  public Students(Long studentId, String lastName, String firstName, char middleInitial, String email, Year yearLevel, char section, Status status, Departments department, Programs program) {
    this.studentId = studentId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.middleInitial = middleInitial;
    this.email = email;
    this.yearLevel = yearLevel;
    this.section = section;
    this.status = status;
    this.program = program;
  }

   // Enumerations
   public enum Status {
    Active, Inactive, Graduated
  }


  // Getters and Setters
  public Long getStudentId() {
    return this.studentId;
  }

  public void setStudentId(Long studentId) {
    this.studentId = studentId;
  }

  public String getLastName() {
    return this.lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getFirstName() {
    return this.firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public char getMiddleInitial() {
    return this.middleInitial;
  }

  public void setMiddleInitial(char middleInitial) {
    this.middleInitial = middleInitial;
  }

  public String getEmail() {
    return this.email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Year getYearLevel() {
    return this.yearLevel;
  }

  public void setYearLevel(Year yearLevel) {
    this.yearLevel = yearLevel;
  }

  public char getSection() {
    return this.section;
  }

  public void setSection(char section) {
    this.section = section;
  }

  public Status getStatus() {
    return this.status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public Programs getProgram() {
    return this.program;
  }

  public void setProgram(Programs program) {
    this.program = program;
  }

  public List<Payments> getPayments() {
    return this.payments;
  }

  public void setPayments(List<Payments> payments) {
    this.payments = payments;
  }

  public Users getUser() {
    return this.user;
  }

  public void setUser(Users user) {
    this.user = user;
  }

  // Json Properties
  @JsonProperty("program")
  public String getProgramId() {
    return program != null ? program.getProgramId() : null;
  }

  @JsonProperty("department")
  public String getDepartmentId() {
    return program != null ? program.getDepartmentId() : null;
  }
 
}


