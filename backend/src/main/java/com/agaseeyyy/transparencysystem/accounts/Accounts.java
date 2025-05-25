package com.agaseeyyy.transparencysystem.accounts;

import java.time.LocalDate;
import java.time.Year;

import com.agaseeyyy.transparencysystem.students.Students;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
@JsonIgnoreProperties({"student", "hibernateLazyInitializer", "handler"})
public class Accounts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer accountId;

 
    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    @JsonIgnore
    private String password;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt = LocalDate.now();

    @OneToOne
    @JoinColumn(name = "student_id")
    private Students student;

    // Constructors
    public Accounts() {
    }
    
    public Accounts(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Enumerated Role
    public enum Role {
        Admin, Org_Treasurer, Class_Treasurer;
    }

    public Accounts(Integer accountId, Role role, String email, String password, LocalDate createdAt) {
        this.accountId = accountId;
        this.role = role;
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
    }
  

    // Getters and Setters
    public Integer getAccountId() {
        return this.accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
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

    @JsonProperty("programCode")
    public String getProgram() {
        return student != null ? student.getProgram().getProgramId() : null;
    }

    @JsonProperty("yearLevel")
    public Year getYearLevel() {
        return student != null ? student.getYearLevel() : null;
    }

    @JsonProperty("section")
    public Character getSection() {
        return student != null ? student.getSection() : null;
    }
}

