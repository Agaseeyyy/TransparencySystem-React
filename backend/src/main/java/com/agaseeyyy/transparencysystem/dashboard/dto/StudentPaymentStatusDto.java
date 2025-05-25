package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;

public class StudentPaymentStatusDto {
    private String studentId;
    private String studentName;
    private String feeType;
    private BigDecimal amountPaid;
    private BigDecimal amountDue;
    private String paymentStatus; // e.g., "Paid", "Partially Paid", "Not Paid"

    public StudentPaymentStatusDto() {
    }

    public StudentPaymentStatusDto(String studentId, String studentName, String feeType, BigDecimal amountPaid, BigDecimal amountDue, String paymentStatus) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.feeType = feeType;
        this.amountPaid = amountPaid;
        this.amountDue = amountDue;
        this.paymentStatus = paymentStatus;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getFeeType() {
        return feeType;
    }

    public void setFeeType(String feeType) {
        this.feeType = feeType;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public BigDecimal getAmountDue() {
        return amountDue;
    }

    public void setAmountDue(BigDecimal amountDue) {
        this.amountDue = amountDue;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
} 