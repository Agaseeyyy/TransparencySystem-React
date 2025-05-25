package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;
import java.security.Principal;
import java.math.BigDecimal;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentsController {
    private final PaymentService paymentService;

    // Constructors
    public PaymentsController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    
    // REST API Endpoints
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<Page<PaymentDTO>> getPayments(
            Principal principal,
            @RequestParam(required = false) Long feeId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "paymentDate") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.fromString(sortDirection), sortField));
        Page<PaymentDTO> payments = paymentService.getPaymentsWithFilters(principal, feeId, studentId, status, program, yearLevel, section, pageable);
        return ResponseEntity.ok(payments);
    }

     // Get all students' payment status (both paid and unpaid) for a specific fee
     @GetMapping("/fee/{feeId}/status")
     @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
     public Page<PaymentDTO> displayStudentsPaymentStatus(
             Principal principal,
             @PathVariable Integer feeId,
             @RequestParam(required = false) String program,
             @RequestParam(required = false) String yearLevel,
             @RequestParam(required = false) String section,
             @RequestParam(required = false) String status,
             @RequestParam(defaultValue = "paymentDate") String sortField,
             @RequestParam(defaultValue = "desc") String sortDirection,
             @RequestParam(defaultValue = "0") int pageNumber,
             @RequestParam(defaultValue = "10") int pageSize) {
         return paymentService.getStudentsPaymentStatus(principal, feeId, program, yearLevel, section, status, sortField, sortDirection, pageNumber, pageSize);
     }

    @GetMapping("/students/{program}/{yearLevel}/{section}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public List <Payments> getPaymentByStudentDeets(
            Principal principal,
            @PathVariable String program, 
            @PathVariable String yearLevel, 
            @PathVariable Character section) {
        return paymentService.getPaymentByStudentDeets(principal, program, Year.of(Integer.parseInt(yearLevel)), section);
    }

    @GetMapping("/students/{program}/{yearLevel}/{section}/fees/{feeId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public BigDecimal displayTotalPaymentsPerClass(
            Principal principal,
            @PathVariable String program,
            @PathVariable String yearLevel,
            @PathVariable Character section,
            @PathVariable Integer feeId) {
        try {
            return paymentService.calculateTotalPaymentsPerClass(principal, program, Year.of(Integer.parseInt(yearLevel)), section, feeId);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid year level format: " + yearLevel);
        }
    }
    
    // Add new payment
    @PostMapping("/fees/{feeId}/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public Payments addNewPayment(@PathVariable Integer feeId,
                                    @PathVariable Long studentId,
                                    @RequestBody Payments payment) {
        return paymentService.addNewPayment(feeId, studentId, payment);
    }
    
    // Edit payment     
    @PutMapping("/{paymentId}/fees/{feeId}/students/{studentId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public Payments editPayment(@PathVariable String paymentId,
                                @PathVariable Integer feeId,
                                @PathVariable Long studentId,
                                @RequestBody Payments payment) {
        return paymentService.editPayment(paymentId, feeId, studentId, payment);
    }
    
    // Delete payment
    @DeleteMapping("/{paymentId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public void deletePayment(@PathVariable String paymentId) {
        paymentService.deletePayment(paymentId);
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<List<PaymentDTO>> getPaymentsReport(
            Principal principal,
            @RequestParam(required = true) Integer feeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "lastName") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        List<PaymentDTO> payments = paymentService.generatePaymentReport(principal, feeId, program, yearLevel, section, status, sort);
        return ResponseEntity.ok(payments);
    }
}