package com.agaseeyyy.transparencysystem.email;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.students.StudentService;
import com.agaseeyyy.transparencysystem.students.Students;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/emails")
@CrossOrigin(origins = "http://localhost:5173")
public class EmailController {

    @Autowired
    private SendEmailService emailService;
    
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FeeService feeService;
    
    @Autowired
    private StudentService studentService;

    @GetMapping("/test-unpaid/{feeId}")
    public ResponseEntity<?> testUnpaidStudents(@PathVariable Integer feeId) {
        try {
            List<Students> unpaidStudents = paymentService.findStudentsWhoHaventPaid(feeId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("count", unpaidStudents.size());
            response.put("students", unpaidStudents.stream()
                .map(s -> Map.of(
                    "id", s.getStudentId(),
                    "name", s.getFirstName() + " " + s.getLastName(),
                    "email", s.getEmail()
                ))
                .collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/trigger-reminders")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> triggerReminders() {
        try {
            emailService.sendWeeklyReminders();
            return ResponseEntity.ok(Map.of(
                "message", "Payment reminders sent successfully",
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send reminders: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping("/trigger-overdue")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> triggerOverdueNotifications() {
        try {
            emailService.checkAndNotifyOverduePayments();
            return ResponseEntity.ok(Map.of(
                "message", "Overdue notifications sent successfully",
                "success", true
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send notifications: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @PostMapping("/announcement")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> announcePaymentCollection(@RequestBody Map<String, Object> request) {
        try {
            // Extract request parameters - Fix the type conversion issue
            Integer feeId;
            try {
                // Handle both String and Integer cases
                Object feeIdObj = request.get("feeId");
                if (feeIdObj instanceof Integer) {
                    feeId = (Integer) feeIdObj;
                } else if (feeIdObj instanceof String) {
                    feeId = Integer.parseInt((String) feeIdObj);
                } else {
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid fee ID format",
                        "success", false
                    ));
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid fee ID format",
                    "success", false
                ));
            }
            
            String location = (String) request.get("location");
            LocalDate startDate = LocalDate.parse((String) request.get("startDate"));
            LocalDate endDate = LocalDate.parse((String) request.get("endDate"));
            
            // Get the fee
            Fees fee = feeService.getFeeById(feeId);
            if (fee == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Fee not found with ID: " + feeId,
                    "success", false
                ));
            }
            
            // Get target students based on filters - Handle "all" value
            String program = (String) request.get("program");
            String yearLevel = (String) request.get("yearLevel");
            String section = (String) request.get("section");
            
            // Convert "all" to null for the service method
            program = "all".equals(program) ? null : program;
            yearLevel = "all".equals(yearLevel) ? null : yearLevel;
            section = "all".equals(section) ? null : section;
            
            List<Students> targetStudents = studentService.getStudentsByFilters(program, yearLevel, section);
            
            if (targetStudents.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "No students found matching the given criteria",
                    "success", false
                ));
            }
            
            // Send the announcement
            emailService.sendPaymentAnnouncement(targetStudents, fee, location, startDate, endDate);
            
            return ResponseEntity.ok(Map.of(
                "message", "Payment announcement sent to " + targetStudents.size() + " students",
                "success", true,
                "recipients", targetStudents.size()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to send announcement: " + e.getMessage(),
                "success", false
            ));
        }
    }
}