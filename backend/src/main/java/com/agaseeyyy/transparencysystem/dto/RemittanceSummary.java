package com.agaseeyyy.transparencysystem.dto;

import java.time.Year;
import java.math.BigDecimal;

import com.agaseeyyy.transparencysystem.remittances.RemittanceStatus;

public class RemittanceSummary {
    private String lastName;
    private String firstName;
    private char middleInitial;
    private Year yearLevel;
    private char section;
    private String feeType;
    private RemittanceStatus status;
    private BigDecimal totalAmount;

    public RemittanceSummary(String lastName, String firstName, char middleInitial, Year yearLevel, char section, String feeType, RemittanceStatus status, BigDecimal totalAmount) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.yearLevel = yearLevel;
        this.section = section;
        this.feeType = feeType;
        this.totalAmount = totalAmount;
        this.status = status;
    }


    public String getLastName() {
        return this.lastName;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public char getMiddleInitial() {
        return this.middleInitial;
    }

    public Year getYearLevel() {
        return this.yearLevel;
    }

    public char getSection() {
        return this.section;
    }

    public String getFeeType() {
        return this.feeType;
    }

    public BigDecimal getTotalAmount() {
        return this.totalAmount;
    }

    public RemittanceStatus getStatus() {
        return this.status;
    }
    
    
}
