package com.agaseeyyy.transparencysystem.controllers;

import com.agaseeyyy.transparencysystem.programs.ProgramService;
import com.agaseeyyy.transparencysystem.services.TransparencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@CrossOrigin(origins = "http://localhost:5173")
public class PublicController {
    
    private final TransparencyService transparencyService;
    private final ProgramService programService;
    
    public PublicController(
            TransparencyService transparencyService,
            ProgramService programService) {
        this.transparencyService = transparencyService;
        this.programService = programService;
    }
    
    @GetMapping("/fees/summary")
    public ResponseEntity<?> getFeeSummary() {
        return ResponseEntity.ok(transparencyService.getPublicFeeSummary());
    }
    
    @GetMapping("/programs")
    public ResponseEntity<?> getPrograms() {
        return ResponseEntity.ok(programService.getAllPrograms());
    }
    
    @GetMapping("/remittances/summary")
    public ResponseEntity<?> getRemittancesSummary() {
        return ResponseEntity.ok(transparencyService.getPublicRemittanceSummary());
    }
}