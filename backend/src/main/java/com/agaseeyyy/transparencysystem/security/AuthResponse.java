package com.agaseeyyy.transparencysystem.security;

public class AuthResponse {
    
    private String token;
    private String email;
    private String role;
    private Integer accountId;
    
    // Default constructor
    public AuthResponse() {
    }
    
    // Constructor with parameters
    public AuthResponse(String token, String email, String role, Integer accountId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.accountId = accountId;
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Integer getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }
} 