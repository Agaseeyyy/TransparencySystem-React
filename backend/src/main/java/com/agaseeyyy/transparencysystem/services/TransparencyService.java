package com.agaseeyyy.transparencysystem.services;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.remittances.RemittanceService;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.CallableStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TransparencyService {
    private static final Logger log = LoggerFactory.getLogger(TransparencyService.class);
    
    private final FeeService feeService;
    private final PaymentService paymentService;
    private final RemittanceService remittanceService;
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public TransparencyService(
            FeeService feeService,
            PaymentService paymentService,
            RemittanceService remittanceService,
            JdbcTemplate jdbcTemplate) {
        this.feeService = feeService;
        this.paymentService = paymentService;
        this.remittanceService = remittanceService;
        this.jdbcTemplate = jdbcTemplate;
        // Don't initialize stored procedures in constructor - do it in @PostConstruct
    }
    
    @PostConstruct
    public void init() {
        initializeStoredProcedures();
    }
    
    /**
     * Initialize stored procedures if they don't exist
     */
    private void initializeStoredProcedures() {
        try {
            // Check if procedure exists
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.routines " +
                "WHERE routine_type = 'PROCEDURE' AND routine_schema = DATABASE() " +
                "AND routine_name = 'GetFinancialReport'", 
                Integer.class
            );
            
            if (count == null || count == 0) {
                log.info("Creating GetFinancialReport stored procedure");
                
                // Drop procedure if exists
                jdbcTemplate.execute("DROP PROCEDURE IF EXISTS GetFinancialReport");
                
                // Create the procedure
                String createProcedure = 
                    "CREATE PROCEDURE GetFinancialReport() " +
                    "BEGIN " +
                    "    -- Main report data with fee details " +
                    "    SELECT  " +
                    "        f.fee_id, " +
                    "        f.fee_type AS fee_name, " +
                    "        f.fee_description AS description, " +
                    "        f.amount AS fee_amount, " +
                    "        COUNT(DISTINCT p.payment_id) AS total_payments, " +
                    "        IFNULL(SUM(p.amount), 0) AS total_collected, " +
                    "        IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS total_remitted, " +
                    "        IFNULL(SUM(p.amount), 0) - IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS remaining_balance, " +
                    "        CASE  " +
                    "            WHEN COUNT(DISTINCT p.payment_id) > 0 THEN  " +
                    "                CONCAT(ROUND((COUNT(CASE WHEN p.status = 'PAID' THEN 1 ELSE NULL END) / COUNT(DISTINCT p.payment_id)) * 100, 1), '%') " +
                    "            ELSE '0%' " +
                    "        END AS collection_rate " +
                    "    FROM  " +
                    "        fees f " +
                    "    LEFT JOIN  " +
                    "        payments p ON f.fee_id = p.fee_id " +
                    "    GROUP BY  " +
                    "        f.fee_id, f.fee_type, f.fee_description, f.amount; " +
                    "     " +
                    "    -- Program breakdown report " +
                    "    SELECT  " +
                    "        sp.program_id, " +
                    "        sp.program_name, " +
                    "        COUNT(DISTINCT p.payment_id) AS total_payments, " +
                    "        IFNULL(SUM(p.amount), 0) AS total_collected, " +
                    "        IFNULL((SELECT SUM(r.amount_remitted) " +
                    "         FROM remittances r  " +
                    "         JOIN payments p2 ON r.fee_id = p2.fee_id " +
                    "         JOIN students s2 ON p2.student_id = s2.student_id " +
                    "         WHERE s2.program_id = sp.program_id), 0) AS total_remitted " +
                    "    FROM  " +
                    "        student_program sp " +
                    "    LEFT JOIN  " +
                    "        students s ON sp.program_id = s.program_id " +
                    "    LEFT JOIN  " +
                    "        payments p ON s.student_id = p.student_id " +
                    "    GROUP BY  " +
                    "        sp.program_id, sp.program_name; " +
                    "     " +
                    "    -- Recent remittances " +
                    "    SELECT  " +
                    "        r.remittance_id, " +
                    "        r.remittance_date, " +
                    "        CONCAT(u.first_name, ' ', IFNULL(u.last_name, '')) AS remitted_by, " +
                    "        f.fee_type AS fee_type, " +
                    "        r.amount_remitted, " +
                    "        r.status " +
                    "    FROM  " +
                    "        remittances r " +
                    "    JOIN  " +
                    "        fees f ON r.fee_id = f.fee_id " +
                    "    JOIN  " +
                    "        users u ON r.user_id = u.user_id " +
                    "    ORDER BY  " +
                    "        r.remittance_date DESC " +
                    "    LIMIT 10; " +
                    "END";
                
                jdbcTemplate.execute(createProcedure);
                log.info("Created GetFinancialReport stored procedure successfully");
            } else {
                log.info("GetFinancialReport stored procedure already exists");
            }
        } catch (Exception e) {
            log.error("Error initializing stored procedures: {}", e.getMessage(), e);
        }
    }
    
    // Public methods for both public and authenticated users
    public List<Map<String, Object>> getPublicFeeSummary() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get all fees
        feeService.getAllFees().forEach(fee -> {
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("feeId", fee.getFeeId());
            feeData.put("feeType", fee.getFeeType());
            feeData.put("description", fee.getDescription());
            feeData.put("totalAmount", fee.getAmount());
            
            // Calculate totals from payments
            double collected = paymentService.calculateTotalCollectedByFeeType(fee.getFeeId());
            double remitted = remittanceService.calculateTotalRemittedByFeeType(fee.getFeeId());
            
            feeData.put("amountCollected", collected);
            feeData.put("amountRemitted", remitted);
            
            result.add(feeData);
        });
        
        return result;
    }
    
    public List<Map<String, Object>> getPublicRemittanceSummary() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get recent remittances with summarized data
        remittanceService.getRecentRemittances().forEach(remittance -> {
            Map<String, Object> remittanceData = new HashMap<>();
            remittanceData.put("remittanceId", remittance.getRemittanceId());
            remittanceData.put("feeType", remittance.getFee().getFeeType());
            remittanceData.put("amount", remittance.getAmountRemitted());
            remittanceData.put("remittanceDate", remittance.getRemittanceDate());
            remittanceData.put("program", remittance.getUser().getProgram());
            
            result.add(remittanceData);
        });
        
        return result;
    }
    
    // Admin-only methods
    public List<Map<String, Object>> getAdminFeeSummary() {
        List<Map<String, Object>> publicData = getPublicFeeSummary();
        
        // Add administrative data to the public data
        publicData.forEach(feeData -> {
            double totalAmount = (Double) feeData.get("totalAmount");
            double collected = (Double) feeData.get("amountCollected");
            double remitted = (Double) feeData.get("amountRemitted");
            
            feeData.put("expectedCollection", totalAmount * 1.1); // Example calculation
            feeData.put("collectionProgress", collected > 0 ? (collected / totalAmount) * 100 : 0);
            feeData.put("remittanceProgress", collected > 0 ? (remitted / collected) * 100 : 0);
            feeData.put("pendingRemittance", collected - remitted);
        });
        
        return publicData;
    }
    
    /**
     * Generate financial report
     */
    public byte[] generateFinancialReport(boolean isExcel) throws Exception {
        log.info("Generating financial report in {} format", isExcel ? "Excel" : "CSV");
        
        List<Map<String, Object>> feeSummary = new ArrayList<>();
        List<Map<String, Object>> programSummary = new ArrayList<>();
        List<Map<String, Object>> recentRemittances = new ArrayList<>();
        
        try {
            // Use direct JDBC queries instead of complex entity navigation
            
            // 1. Generate fee summary data
            String feeSql = "SELECT f.fee_id, f.fee_type AS fee_name, f.fee_description AS description, " +
                "f.amount AS fee_amount, COUNT(DISTINCT p.payment_id) AS total_payments, " +
                "IFNULL(SUM(p.amount), 0) AS total_collected, " +
                "IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS total_remitted, " +
                "IFNULL(SUM(p.amount), 0) - IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r WHERE r.fee_id = f.fee_id), 0) AS remaining_balance " +
                "FROM fees f LEFT JOIN payments p ON f.fee_id = p.fee_id " +
                "GROUP BY f.fee_id, f.fee_type, f.fee_description, f.amount";
                
            feeSummary = jdbcTemplate.query(feeSql, (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("fee_id", rs.getInt("fee_id"));
                row.put("fee_name", rs.getString("fee_name"));
                row.put("description", rs.getString("description"));
                row.put("fee_amount", rs.getDouble("fee_amount"));
                row.put("total_payments", rs.getInt("total_payments"));
                row.put("total_collected", rs.getDouble("total_collected"));
                row.put("total_remitted", rs.getDouble("total_remitted"));
                row.put("remaining_balance", rs.getDouble("remaining_balance"));
                
                // Calculate collection rate
                double totalAmount = rs.getDouble("fee_amount");
                double collected = rs.getDouble("total_collected");
                double collectionRate = totalAmount > 0 ? (collected / totalAmount) * 100 : 0;
                row.put("collection_rate", String.format("%.1f%%", collectionRate));
                
                // Add normalized field names
                row.put("feeId", row.get("fee_id"));
                row.put("feeType", row.get("fee_name")); 
                row.put("totalAmount", row.get("fee_amount"));
                row.put("amountCollected", row.get("total_collected"));
                row.put("amountRemitted", row.get("total_remitted"));
                
                return row;
            });
            
            // 2. Program summary - direct SQL query
            String programSql = "SELECT p.program_id, p.program_name, " +
                "COUNT(DISTINCT py.payment_id) AS total_payments, " +
                "IFNULL(SUM(py.amount), 0) AS total_collected, " +
                "IFNULL((SELECT SUM(r.amount_remitted) FROM remittances r " +
                "    JOIN payments p2 ON r.fee_id = p2.fee_id " +
                "    JOIN students s2 ON p2.student_id = s2.student_id " +
                "    WHERE s2.program_id = p.program_id), 0) AS total_remitted " +
                "FROM student_program p " +
                "LEFT JOIN students s ON p.program_id = s.program_id " +
                "LEFT JOIN payments py ON s.student_id = py.student_id " +
                "GROUP BY p.program_id, p.program_name";
                
            programSummary = jdbcTemplate.query(programSql, (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("program_id", rs.getString("program_id"));
                row.put("program_name", rs.getString("program_name"));
                row.put("total_payments", rs.getInt("total_payments"));
                row.put("total_collected", rs.getDouble("total_collected"));
                row.put("total_remitted", rs.getDouble("total_remitted"));
                return row;
            });
            
            // 3. Recent remittances - direct SQL query
            String remittanceSql = "SELECT r.remittance_id, r.remittance_date, " +
                "CONCAT(u.first_name, ' ', IFNULL(u.last_name, '')) AS remitted_by, " +
                "f.fee_type, r.amount_remitted, r.status " +
                "FROM remittances r " +
                "JOIN fees f ON r.fee_id = f.fee_id " +
                "JOIN users u ON r.user_id = u.user_id " +
                "ORDER BY r.remittance_date DESC LIMIT 10";
                
            recentRemittances = jdbcTemplate.query(remittanceSql, (rs, rowNum) -> {
                Map<String, Object> row = new HashMap<>();
                row.put("remittance_id", rs.getString("remittance_id"));
                row.put("remittance_date", rs.getTimestamp("remittance_date"));
                row.put("remitted_by", rs.getString("remitted_by"));
                row.put("fee_type", rs.getString("fee_type"));
                row.put("amount_remitted", rs.getDouble("amount_remitted"));
                row.put("status", rs.getString("status"));
                return row;
            });
            
        } catch (Exception e) {
            log.error("Error generating report data: {}", e.getMessage(), e);
            // Create fallback data
            Map<String, Object> fallbackRow = new HashMap<>();
            fallbackRow.put("fee_id", "N/A");
            fallbackRow.put("fee_name", "Error generating report");
            fallbackRow.put("description", "Database error: " + e.getMessage());
            fallbackRow.put("fee_amount", 0.0);
            fallbackRow.put("total_collected", 0.0);
            fallbackRow.put("total_remitted", 0.0);
            fallbackRow.put("remaining_balance", 0.0);
            fallbackRow.put("collection_rate", "0%");
            feeSummary.add(fallbackRow);
        }
        
        // Generate the report format (Excel or CSV)
        if (isExcel) {
            return generateExcelReport(feeSummary, programSummary, recentRemittances);
        } else {
            return generateCsvReport(feeSummary, programSummary, recentRemittances);
        }
    }
    
    /**
     * Generate Excel report from the report data
     */
    private byte[] generateExcelReport(
            List<Map<String, Object>> feeSummary, 
            List<Map<String, Object>> programSummary,
            List<Map<String, Object>> recentRemittances) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create Fee Summary sheet
            Sheet feeSummarySheet = workbook.createSheet("Fee Summary");
            createFeeSummarySheet(feeSummarySheet, feeSummary);
            
            // Create Program Summary sheet
            Sheet programSummarySheet = workbook.createSheet("Program Summary");
            createProgramSummarySheet(programSummarySheet, programSummary);
            
            // Create Recent Remittances sheet
            Sheet remittancesSheet = workbook.createSheet("Recent Remittances");
            createRecentRemittancesSheet(remittancesSheet, recentRemittances);
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    /**
     * Create the Fee Summary sheet in the Excel workbook
     */
    private void createFeeSummarySheet(Sheet sheet, List<Map<String, Object>> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Fee ID", "Fee Name", "Description", "Fee Amount", "Total Payments", 
                          "Total Collected", "Total Remitted", "Remaining Balance", "Collection Rate"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        // Create data rows
        int rowNum = 1;
        for (Map<String, Object> row : data) {
            Row dataRow = sheet.createRow(rowNum++);
            dataRow.createCell(0).setCellValue(safeString(row.get("fee_id")));
            dataRow.createCell(1).setCellValue(safeString(row.get("fee_name")));
            dataRow.createCell(2).setCellValue(safeString(row.get("description")));
            dataRow.createCell(3).setCellValue(safeDouble(row.get("fee_amount")));
            dataRow.createCell(4).setCellValue(safeDouble(row.get("total_payments")));
            dataRow.createCell(5).setCellValue(safeDouble(row.get("total_collected")));
            dataRow.createCell(6).setCellValue(safeDouble(row.get("total_remitted")));
            dataRow.createCell(7).setCellValue(safeDouble(row.get("remaining_balance")));
            dataRow.createCell(8).setCellValue(safeString(row.get("collection_rate")));
        }
        
        // Autosize columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * Create the Program Summary sheet in the Excel workbook
     */
    private void createProgramSummarySheet(Sheet sheet, List<Map<String, Object>> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Program ID", "Program Name", "Total Payments", "Total Collected", "Total Remitted"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        // Create data rows
        int rowNum = 1;
        for (Map<String, Object> row : data) {
            Row dataRow = sheet.createRow(rowNum++);
            dataRow.createCell(0).setCellValue(safeString(row.get("program_id")));
            dataRow.createCell(1).setCellValue(safeString(row.get("program_name")));
            dataRow.createCell(2).setCellValue(safeDouble(row.get("total_payments")));
            dataRow.createCell(3).setCellValue(safeDouble(row.get("total_collected")));
            dataRow.createCell(4).setCellValue(safeDouble(row.get("total_remitted")));
        }
        
        // Autosize columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * Create the Recent Remittances sheet in the Excel workbook
     */
    private void createRecentRemittancesSheet(Sheet sheet, List<Map<String, Object>> data) {
        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Remittance ID", "Date", "Remitted By", "Fee Type", "Amount", "Status"};
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
        }
        
        // Create data rows
        int rowNum = 1;
        for (Map<String, Object> row : data) {
            Row dataRow = sheet.createRow(rowNum++);
            dataRow.createCell(0).setCellValue(safeString(row.get("remittance_id")));
            dataRow.createCell(1).setCellValue(safeString(row.get("remittance_date")));
            dataRow.createCell(2).setCellValue(safeString(row.get("remitted_by")));
            dataRow.createCell(3).setCellValue(safeString(row.get("fee_type")));
            dataRow.createCell(4).setCellValue(safeDouble(row.get("amount_remitted")));
            dataRow.createCell(5).setCellValue(safeString(row.get("status")));
        }
        
        // Autosize columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * Generate CSV report from the report data
     */
    private byte[] generateCsvReport(
            List<Map<String, Object>> feeSummary, 
            List<Map<String, Object>> programSummary,
            List<Map<String, Object>> recentRemittances) {
        
        StringBuilder csv = new StringBuilder();
        
        // Add Fee Summary section
        csv.append("FEE SUMMARY\n");
        csv.append("Fee ID,Fee Name,Description,Fee Amount,Total Payments,Total Collected,Total Remitted,Remaining Balance,Collection Rate\n");
        
        for (Map<String, Object> row : feeSummary) {
            csv.append(safeString(row.get("fee_id"))).append(",");
            csv.append(escapeCsvField(safeString(row.get("fee_name")))).append(",");
            csv.append(escapeCsvField(safeString(row.get("description")))).append(",");
            csv.append(safeString(row.get("fee_amount"))).append(",");
            csv.append(safeString(row.get("total_payments"))).append(",");
            csv.append(safeString(row.get("total_collected"))).append(",");
            csv.append(safeString(row.get("total_remitted"))).append(",");
            csv.append(safeString(row.get("remaining_balance"))).append(",");
            csv.append(safeString(row.get("collection_rate"))).append("\n");
        }
        
        // Add Program Summary section
        csv.append("\nPROGRAM SUMMARY\n");
        csv.append("Program ID,Program Name,Total Payments,Total Collected,Total Remitted\n");
        
        for (Map<String, Object> row : programSummary) {
            csv.append(safeString(row.get("program_id"))).append(",");
            csv.append(escapeCsvField(safeString(row.get("program_name")))).append(",");
            csv.append(safeString(row.get("total_payments"))).append(",");
            csv.append(safeString(row.get("total_collected"))).append(",");
            csv.append(safeString(row.get("total_remitted"))).append("\n");
        }
        
        // Add Recent Remittances section
        csv.append("\nRECENT REMITTANCES\n");
        csv.append("Remittance ID,Date,Remitted By,Fee Type,Amount,Status\n");
        
        for (Map<String, Object> row : recentRemittances) {
            csv.append(safeString(row.get("remittance_id"))).append(",");
            csv.append(safeString(row.get("remittance_date"))).append(",");
            csv.append(escapeCsvField(safeString(row.get("remitted_by")))).append(",");
            csv.append(escapeCsvField(safeString(row.get("fee_type")))).append(",");
            csv.append(safeString(row.get("amount_remitted"))).append(",");
            csv.append(safeString(row.get("status"))).append("\n");
        }
        
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
    
    /**
     * Helper method to safely convert values to string
     */
    private String safeString(Object value) {
        return value == null ? "" : value.toString();
    }
    
    /**
     * Helper method to safely convert values to double
     */
    private double safeDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }
    
    /**
     * Escape special characters in CSV fields
     */
    private String escapeCsvField(String field) {
        if (field == null) return "";
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }
}