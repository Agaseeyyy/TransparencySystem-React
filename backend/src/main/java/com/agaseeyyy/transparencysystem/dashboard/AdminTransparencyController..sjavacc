package com.agaseeyyy.transparencysystem.dashboard;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/transparency")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminTransparencyController {
    
    private static final Logger log = LoggerFactory.getLogger(AdminTransparencyController.class);
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
            log.error("Error retrieving admin fee summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving detailed fee summary: " + e.getMessage());
        }
    }
    
    /**
     * Export financial report in Excel or CSV format
     * @param format The desired format ("excel" for XLSX, defaults to CSV)
     * @return Excel or CSV file with financial data
     */
    @GetMapping("/export/report")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> exportFinancialReport(@RequestParam(required = false) String format) {
        try {
            // Validate and determine the export format
            boolean isExcel = "excel".equalsIgnoreCase(format);
            String formatName = isExcel ? "Excel" : "CSV";
            
            log.info("Generating {} financial report", formatName);
            
            // Generate timestamp for filename
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "financial_report_" + timestamp + (isExcel ? ".xlsx" : ".csv");
            
            // Get report data from service
            byte[] reportData = transparencyService.generateFinancialReport(isExcel);
            
            if (reportData == null || reportData.length == 0) {
                log.warn("Generated report is empty");
                return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("No data available to generate the report");
            }
            
            // Set up appropriate headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(isExcel ? 
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") : 
                MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reportData.length);
            
            log.info("Successfully generated {} report '{}' with {} bytes", 
                formatName, filename, reportData.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (Exception e) {
            log.error("Error generating financial report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.TEXT_PLAIN)
                .body("Failed to generate financial report: " + e.getMessage());
        }
    }
    
    /**
     * Get information about available report formats
     */
    @GetMapping("/export/info")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> getExportInfo() {
        try {
            Map<String, Object> info = Map.of(
                "availableFormats", new String[]{"csv", "excel"},
                "endpoint", "/api/v1/admin/transparency/export/report",
                "usage", "Append '?format=excel' for Excel format, defaults to CSV"
            );
            
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Error retrieving export info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving export information: " + e.getMessage());
        }
    }
}