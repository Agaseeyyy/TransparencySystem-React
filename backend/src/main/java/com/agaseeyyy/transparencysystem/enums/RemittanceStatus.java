package com.agaseeyyy.transparencysystem.enums;

/**
 * Represents the status of a remittance record based on payment completion status.
 */
public enum RemittanceStatus {
    COMPLETED("All students in the class have paid"),
    PARTIAL("Some students in the class have paid"),
    NOT_REMITTED("No remittance record exists");
    
    private final String description;
    
    RemittanceStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
} 
 
 