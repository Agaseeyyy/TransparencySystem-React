package com.agaseeyyy.transparencysystem.users;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class Users {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer userId;

  @Column(name = "last_name", nullable = false)
  private String lastName;

  @Column(name = "first_name", nullable = false)
  private String firstName;

  @Column(name = "middle_initial", nullable = true)
  private char middleInitial;
  
  @Enumerated(EnumType.STRING)
  private Role role;

  @Column(name = "email", nullable = false, unique = true)
  private String email;

  @Column(name = "password", nullable = false)
  private String password;

  @Column(name = "created_at", nullable = false)
  private LocalDate createdAt = LocalDate.now();

  // Constructors
  public Users() {
  }

  public Users(Integer userId, String firstName, String lastName, char middleInitial, Role role, String email, String password) {
    this.userId = userId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.middleInitial = middleInitial;
    this.role = role;
    this.email = email;
    this.password = password;
  }
  

  // Getters and Setters
  public Integer getUserId() {
    return this.userId;
  }

  public void setUserId(Integer userId) {
    this.userId = userId;
  }

  public String getFirstName() {
    return this.firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return this.lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public char getMiddleInitial() {
    return this.middleInitial;
  }

  public void setMiddleInitial(char middleInitial) {
    this.middleInitial = middleInitial;
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

  public enum Role {
    Admin, Org_Treasurer, Class_TreasurerRER;
  }

}