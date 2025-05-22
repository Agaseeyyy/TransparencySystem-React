package com.agaseeyyy.transparencysystem.payments;

import java.time.LocalDate;
import java.time.Year;

import com.agaseeyyy.transparencysystem.enums.Status;

/**
 * Data Transfer Object for payment status results
 */
public class PaymentDTO {
    private String paymentId;
    private Long studentId;
    private String firstName;
    private String lastName;
    private Character middleInitial;
    private String program;
    private Year yearLevel;
    private Character section;
    private Integer feeId;
    private String feeType;
    private Double amount;
    private Status status;
    private LocalDate paymentDate;
    private String remarks;

    // No-argument constructor (ensure this one is present and unique)
    public PaymentDTO() {
    }

    // Single All-arguments constructor (ensure this one is present and unique after fixes)
    public PaymentDTO(Long studentId, String firstName, String lastName, Character middleInitial,
                      Year yearLevel, Character section, String program, String programName, // programName is illustrative
                      Integer feeId, String feeType, Double amount,
                      String paymentId, Status status, LocalDate paymentDate, String remarks) {
        this.studentId = studentId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleInitial = middleInitial;
        this.yearLevel = yearLevel;
        this.section = section;
        this.program = program;
        // If programName is part of this DTO, set it: this.programName = programName;
        this.feeId = feeId;
        this.feeType = feeType;
        this.amount = amount;
        this.paymentId = paymentId;
        this.status = status;
        this.paymentDate = paymentDate;
        this.remarks = remarks;
    }

    // Getters and Setters
    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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

    public String getProgram() {
        return program;
    }

    public void setProgramId(String programId) {
        this.program = programId;
    }

    public Year getYearLevel() {
        return yearLevel;
    }

    public void setYearLevel(Year yearLevel) {
        this.yearLevel = yearLevel;
    }

    public Character getSection() {
        return section;
    }

    public void setSection(Character section) {
        this.section = section;
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

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
} 