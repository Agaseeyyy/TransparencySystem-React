package com.agaseeyyy.transparencysystem.dto;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import java.time.Year;

public class AccountWithRemittanceStatusDTO {
    private Integer accountId;
    private String email;
    private String firstName;
    private String lastName;
    private Character middleInitial;
    private String role;
    private Long studentId;
    private Year studentYearLevel;
    private Character studentSection;
    private String studentProgramId;
    private String studentProgramCode;
    private String studentProgramName;
    private Integer feeId;
    private String feeType;
    private double totalRemittedAmount;
    private double expectedAmount;
    private String remittanceStatus;

    // Constructor, Getters, and Setters

    public AccountWithRemittanceStatusDTO() {
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Character getMiddleInitial() {
        return middleInitial;
    }

    public void setMiddleInitial(Character middleInitial) {
        this.middleInitial = middleInitial;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Year getStudentYearLevel() {
        return studentYearLevel;
    }

    public void setStudentYearLevel(Year studentYearLevel) {
        this.studentYearLevel = studentYearLevel;
    }

    public Character getStudentSection() {
        return studentSection;
    }

    public void setStudentSection(Character studentSection) {
        this.studentSection = studentSection;
    }

    public String getStudentProgramId() {
        return studentProgramId;
    }

    public void setStudentProgramId(String studentProgramId) {
        this.studentProgramId = studentProgramId;
    }

    public String getStudentProgramCode() {
        return studentProgramCode;
    }

    public void setStudentProgramCode(String studentProgramCode) {
        this.studentProgramCode = studentProgramCode;
    }

    public String getStudentProgramName() {
        return studentProgramName;
    }

    public void setStudentProgramName(String studentProgramName) {
        this.studentProgramName = studentProgramName;
    }

    public Integer getFeeId() {
        return feeId;
    }

    public void setFeeId(Integer feeId) {
        this.feeId = feeId;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public double getTotalRemittedAmount() {
        return totalRemittedAmount;
    }

    public void setTotalRemittedAmount(double totalRemittedAmount) {
        this.totalRemittedAmount = totalRemittedAmount;
    }

    public double getExpectedAmount() {
        return expectedAmount;
    }

    public void setExpectedAmount(double expectedAmount) {
        this.expectedAmount = expectedAmount;
    }

    public String getRemittanceStatus() {
        return remittanceStatus;
    }

    public void setRemittanceStatus(String remittanceStatus) {
        this.remittanceStatus = remittanceStatus;
    }
} 