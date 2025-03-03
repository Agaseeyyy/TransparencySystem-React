package com.agaseeyyy.transparencysystem.model;

import java.time.LocalDate;

import jakarta.persistence.*;


@Entity
@Table(name = "users")
public class Users {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer userId;

  private String firstName;
  private String lastName;
  private char middleInitial;
  private String role;
  private String email;
  private String password;
  private LocalDate createdAt = LocalDate.now();


  public Users() {
  }

  public Users(Integer userId, String firstName, String lastName, char middleInitial, String role, String email, String password) {
    this.userId = userId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.middleInitial = middleInitial;
    this.role = role;
    this.email = email;
    this.password = password;
  }

  

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

  public String getRole() {
    return this.role;
  }

  public void setRole(String role) {
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
  
}