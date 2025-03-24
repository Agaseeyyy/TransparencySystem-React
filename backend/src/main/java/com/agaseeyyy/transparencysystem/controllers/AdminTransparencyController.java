package com.agaseeyyy.transparencysystem.controllers;

import com.agaseeyyy.transparencysystem.services.TransparencyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/transparency")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminTransparencyController {
    
    private final TransparencyService transparencyService;
    
    public AdminTransparencyController(TransparencyService transparencyService) {
        this.transparencyService = transparencyService;
    }
    
    @GetMapping("/fees/detailed")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> getAdminFeeSummary() {
        try {
            return ResponseEntity.ok(transparencyService.getAdminFeeSummary());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving detailed fee summary: " + e.getMessage());
        }
    }
}