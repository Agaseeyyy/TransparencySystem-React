package com.agaseeyyy.transparencysystem.dashboard;

import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.payments.PaymentService;
import com.agaseeyyy.transparencysystem.remittances.RemittanceService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

@Service
public class TransparencyService {
    private static final Logger log = LoggerFactory.getLogger(TransparencyService.class);
    
    private final FeeService feeService;
    private final PaymentService paymentService;
    private final RemittanceService remittanceService;
    private final JdbcTemplate jdbcTemplate;
    
    public TransparencyService(
            FeeService feeService,
            PaymentService paymentService,
            RemittanceService remittanceService,
            JdbcTemplate jdbcTemplate) {
        this.feeService = feeService;
        this.paymentService = paymentService;
        this.remittanceService = remittanceService;
        this.jdbcTemplate = jdbcTemplate;
        
        // Removed view checking at startup to avoid errors if views don't exist yet
    }
    
    // Public methods for both public and authenticated accounts
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
            remittanceData.put("program", remittance.getAccount().getProgram());
            
            result.add(remittanceData);
        });
        
        return result;
    }
    
    // Admin-only methods - directly use the FeeSummaryView
    public List<Map<String, Object>> getAdminFeeSummary() {
        log.info("Using FeeSummaryView for admin fee summary");
        List<Map<String, Object>> viewData = jdbcTemplate.query(
            "SELECT * FROM FeeSummaryView",
            this::mapResultSetToMap
        );
        
        // Transform the view data to match the expected format
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : viewData) {
            Map<String, Object> transformedRow = new HashMap<>();
            transformedRow.put("feeId", row.get("fee_id"));
            transformedRow.put("feeType", row.get("fee_type"));
            transformedRow.put("description", row.get("description"));
            transformedRow.put("totalAmount", row.get("fee_amount"));
            transformedRow.put("amountCollected", row.get("total_collected"));
            transformedRow.put("amountRemitted", row.get("total_remitted"));
            
            // Get total number of students from the database
            int totalStudents = getTotalStudentsCount();
            
            // Get number of students who paid this specific fee
            int feeId = ((Number) row.get("fee_id")).intValue();
            int paidStudentsCount = getStudentsWhoMadePaymentCount(feeId);
            
            // Calculate collection progress based on student count
            double collectionProgress = totalStudents > 0 ? 
                ((double) paidStudentsCount / totalStudents) * 100 : 0;
                
            transformedRow.put("expectedCollection", ((Number) row.get("fee_amount")).doubleValue() * totalStudents);
            transformedRow.put("totalStudents", totalStudents);
            transformedRow.put("paidStudents", paidStudentsCount);
            transformedRow.put("collectionProgress", collectionProgress);
            
            double collected = ((Number) row.get("total_collected")).doubleValue();
            double remitted = ((Number) row.get("total_remitted")).doubleValue();
            transformedRow.put("remittanceProgress", collected > 0 ? (remitted / collected) * 100 : 0);
            transformedRow.put("pendingRemittance", collected - remitted);
            
            result.add(transformedRow);
        }
        
        return result;
    }

    /**
     * Get the total number of students in the system
     */
    private int getTotalStudentsCount() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM students", 
                Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting students: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Get the count of students who made a payment for a specific fee
     */
    private int getStudentsWhoMadePaymentCount(int feeId) {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT student_id) FROM payments WHERE fee_id = ?",
                Integer.class, feeId);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.error("Error counting students who paid fee {}: {}", feeId, e.getMessage());
            return 0;
        }
    }

    /**
     * Generate financial report using SQL views directly
     */
    public byte[] generateFinancialReport(boolean isExcel) throws Exception {
        log.info("Generating financial report in {} format", isExcel ? "Excel" : "CSV");
        
        // Use the database views directly - no fallback logic
        List<Map<String, Object>> feeSummary = jdbcTemplate.query(
            "SELECT * FROM FeeSummaryView", 
            this::mapResultSetToMap
        );
        
        List<Map<String, Object>> programSummary = jdbcTemplate.query(
            "SELECT * FROM ProgramSummaryView", 
            this::mapResultSetToMap
        );
        
        List<Map<String, Object>> recentRemittances = jdbcTemplate.query(
            "SELECT * FROM RecentRemittancesView LIMIT 10", 
            this::mapResultSetToMap
        );
        
        log.info("Successfully retrieved data from database views: feeSummary={}, programSummary={}, recentRemittances={}",
            feeSummary.size(), programSummary.size(), recentRemittances.size());
        
        // Generate the appropriate report format
        return isExcel ? 
            generateExcelReport(feeSummary, programSummary, recentRemittances) : 
            generateCsvReport(feeSummary, programSummary, recentRemittances);
    }

    private Map<String, Object> mapResultSetToMap(ResultSet rs, int rowNum) throws SQLException {
        Map<String, Object> row = new HashMap<>();
        ResultSetMetaData metaData = rs.getMetaData();
        for (int i = 1; i <= metaData.getColumnCount(); i++) {
            row.put(metaData.getColumnLabel(i), rs.getObject(i));
        }
        return row;
    }

    // Excel and CSV report generation methods remain unchanged
    private byte[] generateExcelReport(List<Map<String, Object>> feeSummary, 
                                     List<Map<String, Object>> programSummary,
                                     List<Map<String, Object>> recentRemittances) throws Exception {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Create sheets
            createSheetFromData(workbook, workbook.createSheet("Fee Summary"), feeSummary);
            createSheetFromData(workbook, workbook.createSheet("Program Summary"), programSummary);
            createSheetFromData(workbook, workbook.createSheet("Recent Remittances"), recentRemittances);
            
            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void createSheetFromData(Workbook workbook, Sheet sheet, List<Map<String, Object>> data) {
        if (data == null || data.isEmpty()) return;
        
        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        
        // Create header row
        Row headerRow = sheet.createRow(0);
        int colIdx = 0;
        for (String key : data.get(0).keySet()) {
            Cell cell = headerRow.createCell(colIdx++);
            cell.setCellValue(key.replace('_', ' ').toUpperCase());
            cell.setCellStyle(headerStyle);
        }
        
        // Create data rows
        int rowIdx = 1;
        for (Map<String, Object> rowData : data) {
            Row row = sheet.createRow(rowIdx++);
            colIdx = 0;
            for (Object value : rowData.values()) {
                Cell cell = row.createCell(colIdx++);
                if (value == null) {
                    cell.setCellValue("");
                } else if (value instanceof Number) {
                    cell.setCellValue(((Number) value).doubleValue());
                } else if (value instanceof LocalDate) {
                    cell.setCellValue(((LocalDate) value).toString());
                } else {
                    cell.setCellValue(value.toString());
                }
            }
        }
        
        for (int i = 0; i < data.get(0).size(); i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private byte[] generateCsvReport(List<Map<String, Object>> feeSummary, 
                                   List<Map<String, Object>> programSummary,
                                   List<Map<String, Object>> recentRemittances) throws Exception {
        StringBuilder csvContent = new StringBuilder();
        
        // Add each section
        csvContent.append("FEE SUMMARY\n");
        appendCsvSection(csvContent, feeSummary);
        csvContent.append("\nPROGRAM SUMMARY\n");
        appendCsvSection(csvContent, programSummary);
        csvContent.append("\nRECENT REMITTANCES\n");
        appendCsvSection(csvContent, recentRemittances);
        
        return csvContent.toString().getBytes(StandardCharsets.UTF_8);
    }

    private void appendCsvSection(StringBuilder csvContent, List<Map<String, Object>> data) {
        if (data == null || data.isEmpty()) return;
        
        // Headers
        boolean first = true;
        for (String key : data.get(0).keySet()) {
            if (!first) csvContent.append(",");
            csvContent.append("\"").append(key.replace('_', ' ').toUpperCase()).append("\"");
            first = false;
        }
        csvContent.append("\n");
        
        // Data rows
        for (Map<String, Object> row : data) {
            first = true;
            for (Object value : row.values()) {
                if (!first) csvContent.append(",");
                
                if (value == null) {
                    csvContent.append("\"\"");
                } else {
                    String cellValue = value.toString().replace("\"", "\"\"");
                    csvContent.append("\"").append(cellValue).append("\"");
                }
                first = false;
            }
            csvContent.append("\n");
        }
    }
}