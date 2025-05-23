package com.agaseeyyy.transparencysystem.email;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.students.StudentService;
import com.agaseeyyy.transparencysystem.students.Students;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
public class EmailController {
    private static final Logger logger = LoggerFactory.getLogger(EmailController.class);

    @Autowired
    private SendEmailService emailService;
    
    @Autowired
    private PaymentService paymentService;

    @Autowired
    private FeeService feeService;
    
    @Autowired
    private StudentService studentService;

    @GetMapping("/trigger-reminders")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> triggerReminders() {
        logger.info("Manual trigger of payment reminders initiated");
        try {
            emailService.sendWeeklyReminders();
            logger.info("Manual payment reminders completed successfully");
            return ResponseEntity.ok(Map.of(
                "message", "Payment reminders sent successfully",
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Failed to send payment reminders: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send reminders: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @GetMapping("/trigger-overdue")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> triggerOverdueNotifications() {
        logger.info("Manual trigger of overdue notifications initiated");
        try {
            emailService.checkAndNotifyOverduePayments();
            logger.info("Manual overdue notifications completed successfully");
            return ResponseEntity.ok(Map.of(
                "message", "Overdue notifications sent successfully",
                "success", true
            ));
        } catch (Exception e) {
            logger.error("Failed to send overdue notifications: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Failed to send notifications: " + e.getMessage(),
                "success", false
            ));
        }
    }

    @PostMapping("/announcement")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> announcePaymentCollection(@RequestBody Map<String, Object> request) {
        logger.info("Payment announcement request received: {}", request);
        try {
            // Extract request parameters with improved type handling
            Integer feeId;
            try {
                Object feeIdObj = request.get("feeId");
                if (feeIdObj instanceof Integer) {
                    feeId = (Integer) feeIdObj;
                } else if (feeIdObj instanceof String) {
                    feeId = Integer.parseInt((String) feeIdObj);
                } else {
                    logger.warn("Invalid fee ID format in request: {}", feeIdObj);
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "Invalid fee ID format",
                        "success", false
                    ));
                }
            } catch (NumberFormatException e) {
                logger.warn("Invalid fee ID format in request", e);
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid fee ID format: " + e.getMessage(),
                    "success", false
                ));
            }
            
            String location = (String) request.get("location");
            if (location == null || location.trim().isEmpty()) {
                logger.warn("No location provided in payment announcement");
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Location is required",
                    "success", false
                ));
            }
            
            LocalDate startDate;
            LocalDate endDate;
            
            try {
                startDate = LocalDate.parse((String) request.get("startDate"));
                endDate = LocalDate.parse((String) request.get("endDate"));
                
                if (endDate.isBefore(startDate)) {
                    logger.warn("End date is before start date: {} -> {}", startDate, endDate);
                    return ResponseEntity.badRequest().body(Map.of(
                        "message", "End date cannot be before start date",
                        "success", false
                    ));
                }
            } catch (Exception e) {
                logger.warn("Invalid date format in request", e);
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Invalid date format: " + e.getMessage(),
                    "success", false
                ));
            }
            
            // Get the fee
            Fees fee = feeService.getFeeById(feeId);
            if (fee == null) {
                logger.warn("Fee not found with ID: {}", feeId);
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Fee not found with ID: " + feeId,
                    "success", false
                ));
            }
            
            // Get target students based on filters
            String program = (String) request.get("program");
            String yearLevel = (String) request.get("yearLevel");
            String section = (String) request.get("section");
            
            // Convert "all" to null for the service method
            program = "all".equals(program) ? null : program;
            yearLevel = "all".equals(yearLevel) ? null : yearLevel;
            section = "all".equals(section) ? null : section;
            
            logger.info("Fetching students with filters - program: {}, yearLevel: {}, section: {}", 
                      program, yearLevel, section);
                      
            List<Students> targetStudents = studentService.getStudentsByFilters(program, yearLevel, section);
            
            if (targetStudents.isEmpty()) {
                logger.warn("No students found matching the given criteria");
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "No students found matching the given criteria",
                    "success", false
                ));
            }
            
            // Send the announcement
            logger.info("Sending payment announcement to {} students", targetStudents.size());
            int successCount = emailService.sendPaymentAnnouncement(targetStudents, fee, location, startDate, endDate);
            
            logger.info("Payment announcement completed: {} of {} emails sent successfully", 
                      successCount, targetStudents.size());
                      
            Map<String, Object> response = new HashMap<>();
            response.put("message", String.format("Payment announcement sent to %d students", successCount));
            response.put("success", true);
            response.put("recipients", successCount);
            response.put("totalAttempted", targetStudents.size());
            
            if (successCount < targetStudents.size()) {
                response.put("warning", String.format("%d emails failed to send", 
                                                    targetStudents.size() - successCount));
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to send payment announcement: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Failed to send announcement: " + e.getMessage(),
                "success", false
            ));
        }
    }
}