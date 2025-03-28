package com.agaseeyyy.transparencysystem.payments;

import java.time.Year;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentsController {
  private final PaymentService paymentService;

  // Constructors
  public PaymentsController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  
  // REST APIs
  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public List <Payments> displayAllPayments() {
      return paymentService.getAllPayments();
  }

  @GetMapping("/students/{program}/{yearLevel}/{section}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public List <Payments> getPaymentByStudentDeets(@PathVariable String program, @PathVariable Year yearLevel, @PathVariable Character section) {
      return paymentService.getPaymentByStudentDeets(program, yearLevel, section);
  }

  @GetMapping("/students/{program}/{yearLevel}/{section}/fees/{feeId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public List<Payments> getPaymentsByAccountAndFee(@PathVariable String program,
                                                @PathVariable Year yearLevel,
                                                @PathVariable Character section,
                                                @PathVariable Integer feeId) {
      return paymentService.findPaymentsByAccountAndFee(program, yearLevel, section, feeId);
  }

  @PostMapping("/fees/{feeId}/students/{studentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public Payments addNewPayment(@PathVariable Integer feeId,
                                @PathVariable Long studentId,
                                @RequestBody Payments payment) {
      return paymentService.addNewPayment(feeId, studentId, payment);
  }
  
  @PutMapping("/{paymentId}/fees/{feeId}/students/{studentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public Payments editPayment(@PathVariable String paymentId,
                              @PathVariable Integer feeId,
                              @PathVariable Long studentId,
                              @RequestBody Payments payment) {
    return paymentService.editPayment(paymentId, feeId, studentId, payment);
  }

  @DeleteMapping("/{paymentId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public void deletePayment(@PathVariable String paymentId) {
    paymentService.deletePayment(paymentId);
  }

  @GetMapping("/table")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public ResponseEntity<?> getTableData(
          @RequestParam(required = false) String feeType,
          @RequestParam(required = false) String status,
          @RequestParam(required = false) String date,
          @RequestParam(required = false, defaultValue = "paymentDate") String sortBy,
          @RequestParam(required = false, defaultValue = "desc") String sortDir) {
      
      try {
          // Map frontend field names to entity paths
          String sortField = sortBy;
          switch (sortBy) {
              case "program":
                  sortField = "student.program.programId";
                  break;
              case "feeType":
                  sortField = "fee.feeType";  // Fix typo: feeype -> feeType 
                  break;
              case "amount":
                  sortField = "fee.amount";  // Amount is part of the fee entity, not payments
                  break;
              case "paymentDate":
                  sortField = "paymentDate";
                  break;
              case "status":
                  sortField = "status";
                  break;
              // Add other mappings as needed
          }
          
          // Create sort object
          Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                  Sort.by(sortField).descending() : 
                  Sort.by(sortField).ascending();
          
          // Get data using the service method
          List<Payments> payments = paymentService.getTableData(
                  feeType, status, date, sort);
          
          return ResponseEntity.ok(Map.of(
              "success", true,
              "message", "Payments retrieved successfully",
              "data", payments
          ));
      } catch (Exception e) {
          e.printStackTrace(); // Log the full stack trace
          return ResponseEntity.badRequest().body(Map.of(
              "success", false,
              "message", "Error retrieving payments: " + e.getMessage()
          ));
      }
  }
}