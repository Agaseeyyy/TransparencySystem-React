package com.agaseeyyy.transparencysystem.dashboard;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.dashboard.dto.*;
import com.agaseeyyy.transparencysystem.expenses.Expenses;
import com.agaseeyyy.transparencysystem.enums.Status;
import com.agaseeyyy.transparencysystem.remittances.RemittanceStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.expenses.ExpenseRepository;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.FeeService;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.agaseeyyy.transparencysystem.remittances.RemittanceRepository;
import com.agaseeyyy.transparencysystem.remittances.RemittanceService;
import com.agaseeyyy.transparencysystem.remittances.Remittances;
import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.function.Function;
import com.agaseeyyy.transparencysystem.dashboard.dto.FeeUtilizationDTO;

@Service
public class TransparencyService {
    private static final Logger log = LoggerFactory.getLogger(TransparencyService.class);
    
    private final FeeService feeService;
    private final RemittanceService remittanceService;
    private final JdbcTemplate jdbcTemplate;
    
    private final AccountRepository accountRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final RemittanceRepository remittanceRepository;
    private final FeeRepository feeRepository;
    
    public TransparencyService(
            FeeService feeService,
            RemittanceService remittanceService,
            JdbcTemplate jdbcTemplate,
            AccountRepository accountRepository,
            StudentRepository studentRepository,
            PaymentRepository paymentRepository,
            ExpenseRepository expenseRepository,
            RemittanceRepository remittanceRepository,
            FeeRepository feeRepository) {
        this.feeService = feeService;
        this.remittanceService = remittanceService;
        this.jdbcTemplate = jdbcTemplate;
        this.accountRepository = accountRepository;
        this.studentRepository = studentRepository;
        this.paymentRepository = paymentRepository;
        this.expenseRepository = expenseRepository;
        this.remittanceRepository = remittanceRepository;
        this.feeRepository = feeRepository;
        
        // Removed view checking at startup to avoid errors if views don't exist yet
    }
    
    // Public methods for both public and authenticated accounts
    public List<Map<String, Object>> getPublicFeeSummary() {
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Get all fees using the corrected service method
        feeService.getFees().forEach(fee -> { 
            Map<String, Object> feeData = new HashMap<>();
            feeData.put("feeId", fee.getFeeId());
            feeData.put("feeType", fee.getFeeType());
            feeData.put("description", fee.getDescription());
            feeData.put("totalAmount", fee.getAmount()); 
            
            // Calculate totals from payments using paymentRepository
            BigDecimal collected = paymentRepository.findByFee_FeeId(fee.getFeeId()).stream()
                .filter(p -> p.getStatus() == Status.Paid && p.getFee() != null && p.getFee().getAmount() != null)
                .map(p -> p.getFee().getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Assuming calculateTotalRemittedByFeeType returns BigDecimal or is adapted
            BigDecimal remitted = remittanceService.calculateTotalRemittedByFeeType(fee.getFeeId());
            
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
            remittanceData.put("feeType", remittance.getFee() != null ? remittance.getFee().getFeeType() : "N/A");
            remittanceData.put("amount", remittance.getAmountRemitted());
            remittanceData.put("remittanceDate", remittance.getRemittanceDate());
            
            String programName = "N/A";
            if (remittance.getAccount() != null && remittance.getAccount().getStudent() != null && 
                remittance.getAccount().getStudent().getProgram() != null) {
                programName = remittance.getAccount().getStudent().getProgram().getProgramName();
            }
            remittanceData.put("program", programName);
            
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
            Object feeIdObj = row.get("fee_id");
            int feeId = 0;
            if (feeIdObj instanceof Number) {
                feeId = ((Number) feeIdObj).intValue();
            } else if (feeIdObj != null) {
                try {
                    feeId = Integer.parseInt(feeIdObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Could not parse fee_id: {} for admin fee summary", feeIdObj);
                }
            }
            
            int paidStudentsCount = 0;
            if (feeId != 0) { // Only query if feeId is valid
                 paidStudentsCount = getStudentsWhoMadePaymentCount(feeId);
            }
            
            // Calculate collection progress based on student count
            double collectionProgress = totalStudents > 0 ? 
                ((double) paidStudentsCount / totalStudents) * 100 : 0;
            
            Object feeAmountObj = row.get("fee_amount");
            BigDecimal feeAmount = BigDecimal.ZERO;
            if(feeAmountObj instanceof BigDecimal) {
                feeAmount = (BigDecimal) feeAmountObj;
            } else if (feeAmountObj instanceof Number) {
                feeAmount = BigDecimal.valueOf(((Number) feeAmountObj).doubleValue());
            } else if (feeAmountObj != null) {
                try {
                    feeAmount = new BigDecimal(feeAmountObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Could not parse fee_amount: {} to BigDecimal for admin fee summary", feeAmountObj);
                }
            }

            transformedRow.put("expectedCollection", feeAmount.multiply(BigDecimal.valueOf(totalStudents)));
            transformedRow.put("totalStudents", totalStudents);
            transformedRow.put("paidStudents", paidStudentsCount);
            transformedRow.put("collectionProgress", collectionProgress);
            
            Object totalCollectedObj = row.get("total_collected");
            BigDecimal collected = BigDecimal.ZERO;
             if(totalCollectedObj instanceof BigDecimal) {
                collected = (BigDecimal) totalCollectedObj;
            } else if (totalCollectedObj instanceof Number) {
                 collected = BigDecimal.valueOf(((Number) totalCollectedObj).doubleValue());
            } else if (totalCollectedObj != null) {
                try {
                     collected = new BigDecimal(totalCollectedObj.toString());
                } catch (NumberFormatException e) {
                     log.warn("Could not parse total_collected: {} to BigDecimal for admin fee summary", totalCollectedObj);
                }
            }

            Object totalRemittedObj = row.get("total_remitted");
            BigDecimal remitted = BigDecimal.ZERO;
            if(totalRemittedObj instanceof BigDecimal) {
                remitted = (BigDecimal) totalRemittedObj;
            } else if(totalRemittedObj instanceof Number) {
                remitted = BigDecimal.valueOf(((Number) totalRemittedObj).doubleValue());
            } else if (totalRemittedObj != null) {
                try {
                    remitted = new BigDecimal(totalRemittedObj.toString());
                } catch (NumberFormatException e) {
                    log.warn("Could not parse total_remitted: {} to BigDecimal for admin fee summary", totalRemittedObj);
                }
            }
            transformedRow.put("remittanceProgress", collected.compareTo(BigDecimal.ZERO) > 0 ? 
                (remitted.divide(collected, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))) : BigDecimal.ZERO);
            transformedRow.put("pendingRemittance", collected.subtract(remitted));
            
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
            // Retrieve as BigDecimal if the type is NUMERIC or DECIMAL
            int columnType = metaData.getColumnType(i);
            if (columnType == java.sql.Types.NUMERIC || columnType == java.sql.Types.DECIMAL) {
                row.put(metaData.getColumnLabel(i), rs.getBigDecimal(i));
            } else {
                row.put(metaData.getColumnLabel(i), rs.getObject(i));
            }
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
                } else if (value instanceof BigDecimal) {
                    cell.setCellValue(((BigDecimal) value).doubleValue());
                } else if (value instanceof Number) {
                    cell.setCellValue(((Number) value).doubleValue());
                } else if (value instanceof LocalDate) {
                    cell.setCellValue(((LocalDate) value).toString());
                }  else if (value instanceof LocalDateTime) {
                    cell.setCellValue(((LocalDateTime) value).toString());
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

    public AdminDashboardSummaryDto getAdminDashboardSummary() {
        AdminDashboardSummaryDto summary = new AdminDashboardSummaryDto();

        List<Payments> allPayments = paymentRepository.findAll();
        List<Expenses> allExpenses = expenseRepository.findAll();
        List<Remittances> allRemittances = remittanceRepository.findAll();
        List<Accounts> allAccounts = accountRepository.findAll();

        // Helper to handle nulls to ZERO for BigDecimal
        Function<BigDecimal, BigDecimal> safeBigDecimal = val -> val == null ? BigDecimal.ZERO : val;

        // 1. Overall Financials
        BigDecimal totalCollections = allPayments.stream()
            .filter(p -> (p.getStatus() == Status.Paid || p.getStatus() == Status.Remitted) && p.getAmount() != null)
            .map(Payments::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalCollections(totalCollections);

        BigDecimal totalExpenses = allExpenses.stream()
            .filter(e -> e.getAmount() != null && 
                         (e.getExpenseStatus() == ExpenseStatus.PAID || e.getApprovalStatus() == ApprovalStatus.APPROVED))
            .map(Expenses::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalExpenses(totalExpenses);

        BigDecimal totalRemitted = allRemittances.stream()
            .filter(r -> r.getAmountRemitted() != null && 
                         (r.getStatus() == RemittanceStatus.COMPLETED || r.getStatus() == RemittanceStatus.PARTIAL))
            .map(Remittances::getAmountRemitted)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalRemitted(totalRemitted);

        BigDecimal netBalance = safeBigDecimal.apply(totalCollections).subtract(safeBigDecimal.apply(totalExpenses));
        summary.setNetBalance(netBalance);

        // 2. Payment Summaries
        summary.setTotalPaymentsCount(allPayments.size());
        summary.setTotalPaymentsAmount(allPayments.stream()
            .map(Payments::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));
        
        Map<String, Long> paymentsBySystemStatusCounts = allPayments.stream()
            .filter(p -> p.getStatus() != null)
            .collect(Collectors.groupingBy(p -> p.getStatus().name(), Collectors.counting()));
        Map<String, BigDecimal> paymentsBySystemStatusAmounts = allPayments.stream()
            .filter(p -> p.getStatus() != null && p.getAmount() != null)
            .collect(Collectors.groupingBy(p -> p.getStatus().name(), 
                                          Collectors.reducing(BigDecimal.ZERO, Payments::getAmount, BigDecimal::add)));
        summary.setPaymentsBySystemStatus(new SummaryCountAmountDto(paymentsBySystemStatusCounts, paymentsBySystemStatusAmounts));

        Map<String, Long> paymentsByRemitStatusCounts = new HashMap<>();
        Map<String, BigDecimal> paymentsByRemitStatusAmounts = new HashMap<>();
        for (Payments payment : allPayments) {
            if (payment.getFee() == null || payment.getAmount() == null) continue;
            Fees paymentFee = payment.getFee();
            List<Remittances> feeRemittances = allRemittances.stream()
                .filter(r -> r.getFee() != null && r.getFee().getFeeId().equals(paymentFee.getFeeId()))
                .collect(Collectors.toList());
            String effectiveRemitStatus = RemittanceStatus.NOT_REMITTED.name();
            if (!feeRemittances.isEmpty()) {
                if (feeRemittances.stream().anyMatch(r -> r.getStatus() == RemittanceStatus.COMPLETED)) {
                    effectiveRemitStatus = RemittanceStatus.COMPLETED.name();
                } else if (feeRemittances.stream().anyMatch(r -> r.getStatus() == RemittanceStatus.PARTIAL)) {
                    effectiveRemitStatus = RemittanceStatus.PARTIAL.name();
                } else if (feeRemittances.stream().anyMatch(r -> r.getStatus() == RemittanceStatus.VERIFIED)) {
                    effectiveRemitStatus = RemittanceStatus.VERIFIED.name();
                } else if (feeRemittances.stream().anyMatch(r -> r.getStatus() == RemittanceStatus.PENDING_VERIFICATION)) {
                    effectiveRemitStatus = RemittanceStatus.PENDING_VERIFICATION.name();
                } else if (feeRemittances.stream().anyMatch(r -> r.getStatus() == RemittanceStatus.REJECTED)) {
                    effectiveRemitStatus = RemittanceStatus.REJECTED.name();
                }
            }
            paymentsByRemitStatusCounts.merge(effectiveRemitStatus, 1L, Long::sum);
            paymentsByRemitStatusAmounts.merge(effectiveRemitStatus, safeBigDecimal.apply(payment.getAmount()), BigDecimal::add);
        }
        summary.setPaymentsByRemittanceStatus(new SummaryCountAmountDto(paymentsByRemitStatusCounts, paymentsByRemitStatusAmounts));

        // 3. Expense Summaries
        summary.setTotalExpensesCount(allExpenses.size());
        summary.setTotalExpensesAmount(allExpenses.stream()
            .map(Expenses::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add));

        Map<String, Long> expensesByStatusCounts = allExpenses.stream()
            .filter(e -> e.getExpenseStatus() != null)
            .collect(Collectors.groupingBy(e -> e.getExpenseStatus().name(), Collectors.counting()));
        Map<String, BigDecimal> expensesByStatusAmounts = allExpenses.stream()
            .filter(e -> e.getExpenseStatus() != null && e.getAmount() != null)
            .collect(Collectors.groupingBy(e -> e.getExpenseStatus().name(), 
                                          Collectors.reducing(BigDecimal.ZERO, Expenses::getAmount, BigDecimal::add)));
        summary.setExpensesByStatus(new SummaryCountAmountDto(expensesByStatusCounts, expensesByStatusAmounts));

        // 4. Remittance Summaries
        summary.setTotalRemittancesCount(allRemittances.size());
        Map<String, Long> remittancesByStatusCounts = allRemittances.stream()
            .filter(r -> r.getStatus() != null)
            .collect(Collectors.groupingBy(r -> r.getStatus().name(), Collectors.counting()));
        Map<String, BigDecimal> remittancesByStatusAmounts = allRemittances.stream()
            .filter(r -> r.getStatus() != null && r.getAmountRemitted() != null)
            .collect(Collectors.groupingBy(r -> r.getStatus().name(),
                                          Collectors.reducing(BigDecimal.ZERO, Remittances::getAmountRemitted, BigDecimal::add)));
        summary.setRemittancesByStatus(new SummaryCountAmountDto(remittancesByStatusCounts, remittancesByStatusAmounts));

        Pageable topTenRecentRemittances = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "remittanceDate"));
        List<Remittances> recentDbRemittances = remittanceRepository.findAll(topTenRecentRemittances).getContent();
        summary.setRecentRemittances(recentDbRemittances.stream()
            .map(this::remittanceToRecentTransactionDto)
            .collect(Collectors.toList()));

        // 5. Fee Breakdown and Utilization
        try {
            PublicDashboardSummaryDto publicSummary = getPublicDashboardSummary(); 
            if (publicSummary != null && publicSummary.getFeeBreakdown() != null) {
                summary.setFeeBreakdownAndUtilization(publicSummary.getFeeBreakdown());
            } else {
                summary.setFeeBreakdownAndUtilization(Collections.emptyList());
            }
        } catch (Exception e) {
            log.error("Error fetching public summary for admin dashboard fee breakdown: {}", e.getMessage(), e);
            summary.setFeeBreakdownAndUtilization(Collections.emptyList());
        }
        
        // 6. Recent Transactions
        List<RecentTransactionDto> recentGenericTransactions = new ArrayList<>();
        allPayments.stream()
            .sorted(Comparator.comparing(Payments::getPaymentDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(4)
            .forEach(p -> {
                LocalDateTime transactionDate = p.getPaymentDate() != null ? p.getPaymentDate().atStartOfDay() : null;
                recentGenericTransactions.add(new RecentTransactionDto(
                String.valueOf(p.getPaymentId()),
                "Payment", p.getFee() != null ? p.getFee().getFeeType() : "General Payment", 
                safeBigDecimal.apply(p.getAmount()), transactionDate, 
                p.getStatus() != null ? p.getStatus().name() : "N/A", 
                p.getStudent() != null ? p.getStudent().getFirstName() + " " + p.getStudent().getLastName() : "N/A"));
            });
        allExpenses.stream()
            .sorted(Comparator.comparing(Expenses::getExpenseDate, Comparator.nullsLast(Comparator.reverseOrder()))
                              .thenComparing(Expenses::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(3)
            .forEach(e -> {
                 LocalDateTime transactionDate = e.getExpenseDate() != null ? e.getExpenseDate().atStartOfDay() : (e.getCreatedAt() != null ? e.getCreatedAt() : null);
                 recentGenericTransactions.add(new RecentTransactionDto(
                    String.valueOf(e.getExpenseId()),
                    "Expense", e.getExpenseTitle(), 
                    safeBigDecimal.apply(e.getAmount()), transactionDate, 
                    e.getExpenseStatus() != null ? e.getExpenseStatus().name() : (e.getApprovalStatus() != null ? e.getApprovalStatus().name() : "N/A"),
                    e.getVendorSupplier() != null ? e.getVendorSupplier() : (e.getCreatedByAccount() != null ? e.getCreatedByAccount().getEmail() : "N/A")));
            });
        recentDbRemittances.stream().limit(3).forEach(r -> recentGenericTransactions.add(remittanceToRecentTransactionDto(r)));
        
        recentGenericTransactions.sort(Comparator.comparing(RecentTransactionDto::getDate, Comparator.nullsLast(Comparator.reverseOrder())));
        summary.setRecentTransactions(recentGenericTransactions.stream().limit(10).collect(Collectors.toList()));

        // 7. User/Account Summaries
        summary.setTotalUsers(allAccounts.size());
        if (allAccounts.stream().anyMatch(acc -> acc.getRole() != null)) {
            summary.setUsersByRole(new SummaryCountDto(allAccounts.stream()
                .filter(acc -> acc.getRole() != null)
                .collect(Collectors.groupingBy(acc -> acc.getRole().name(), Collectors.counting()))));
        } else {
            summary.setUsersByRole(new SummaryCountDto(Collections.emptyMap()));
        }
        
        summary.setOtherMetrics(null);

        return summary;
    }

    // Helper method to convert Remittances to RecentTransactionDto
    private RecentTransactionDto remittanceToRecentTransactionDto(Remittances remittance) {
        String remitterName = "N/A";
        if (remittance.getAccount() != null) {
            if (remittance.getAccount().getStudent() != null) {
                remitterName = remittance.getAccount().getStudent().getFirstName() + " " + remittance.getAccount().getStudent().getLastName();
            } else {
                remitterName = remittance.getAccount().getEmail();
            }
        }
        BigDecimal amount = remittance.getAmountRemitted() != null ? remittance.getAmountRemitted() : BigDecimal.ZERO;
        return new RecentTransactionDto(
            String.valueOf(remittance.getRemittanceId()),
            "Remittance",
            remittance.getFee() != null ? "Remittance for " + remittance.getFee().getFeeType() : "Remittance",
            amount,
            remittance.getRemittanceDate() != null ? remittance.getRemittanceDate().atStartOfDay() : null,
            remittance.getStatus() != null ? remittance.getStatus().name() : "N/A",
            remitterName
        );
    }

    public ClassTreasurerDashboardSummaryDto getClassTreasurerDashboardSummary(String username) {
        ClassTreasurerDashboardSummaryDto summary = new ClassTreasurerDashboardSummaryDto();
        Optional<Accounts> treasurerAccountOpt = Optional.ofNullable(accountRepository.findByEmail(username));

        if (treasurerAccountOpt.isEmpty() || treasurerAccountOpt.get().getStudent() == null) {
            log.warn("Class Treasurer account not found or not linked to a student for username: {}", username);
            summary.setTreasurerName("Unknown Treasurer");
            summary.setClassName("Unknown Class");
            summary.setRecentRemittancesByTreasurer(Collections.emptyList());
            summary.setStudentPaymentStatuses(Collections.emptyList());
            summary.setManagedFeeTypes(Collections.emptyList());
            summary.setTotalRemittancesMadeCount(0L);
            summary.setTotalAmountRemittedByTreasurer(BigDecimal.ZERO);
            summary.setRemittancesByStatus(new SummaryCountAmountDto(Collections.emptyMap(), Collections.emptyMap()));
            summary.setTotalCollectedForManagedFees(BigDecimal.ZERO);
            summary.setTotalPaymentsForManagedFeesCount(0L);
            summary.setRecentPaymentsInClass(Collections.emptyList());
            return summary;
        }

        Accounts treasurerAccount = treasurerAccountOpt.get();
        Students treasurerStudentInfo = treasurerAccount.getStudent();

        summary.setTreasurerName(treasurerStudentInfo.getFirstName() + " " + treasurerStudentInfo.getLastName());
        
        String programString = treasurerStudentInfo.getProgram() != null ? treasurerStudentInfo.getProgram().getProgramId() : "N/A";
        String yearLevelString = treasurerStudentInfo.getYearLevel() != null ? String.valueOf(treasurerStudentInfo.getYearLevel()) : "N/A";
        String sectionString = String.valueOf(treasurerStudentInfo.getSection());
        summary.setClassName(programString + " " + yearLevelString + "-" + sectionString);

        PageRequest recentRemittancesLimit = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "remittanceDate"));

        List<Remittances> treasurerRecentRemittances = remittanceRepository.findByAccountAccountIdOrderByRemittanceDateDesc(
            treasurerAccount.getAccountId(), 
            recentRemittancesLimit
        );
        summary.setTotalRemittancesMadeCount(remittanceRepository.countByAccountAccountId(treasurerAccount.getAccountId()));
        
        BigDecimal totalRemittedByTreasurer = BigDecimal.ZERO;
        Map<String, Long> remittanceStatusCounts = new HashMap<>();
        Map<String, BigDecimal> remittanceStatusAmounts = new HashMap<>();

        List<Remittances> allTreasurerRemittances = remittanceRepository.findByAccountAccountId(treasurerAccount.getAccountId());
        for (Remittances rem : allTreasurerRemittances) {
            if (rem.getAmountRemitted() != null) {
                BigDecimal amount = rem.getAmountRemitted();
                totalRemittedByTreasurer = totalRemittedByTreasurer.add(amount);
                if (rem.getStatus() != null) {
                    remittanceStatusCounts.merge(rem.getStatus().name(), 1L, Long::sum);
                    remittanceStatusAmounts.merge(rem.getStatus().name(), amount, BigDecimal::add);
                }
            }
        }
        summary.setTotalAmountRemittedByTreasurer(totalRemittedByTreasurer);
        summary.setRemittancesByStatus(new SummaryCountAmountDto(remittanceStatusCounts, remittanceStatusAmounts));
        summary.setRecentRemittancesByTreasurer(
            treasurerRecentRemittances.stream()
                .map(r -> new RecentTransactionDto(
                    String.valueOf(r.getRemittanceId()),
                    "Remittance",
                    "Remittance for " + (r.getFee() != null ? r.getFee().getFeeType() : "N/A Fee"),
                    r.getAmountRemitted() != null ? r.getAmountRemitted() : BigDecimal.ZERO,
                    r.getRemittanceDate() != null ? r.getRemittanceDate().atStartOfDay() : null,
                    r.getStatus() != null ? r.getStatus().name() : "N/A",
                    treasurerAccount.getEmail()
                ))
                .collect(Collectors.toList()));

        List<String> managedFees = feeService.getFees().stream().map(Fees::getFeeType).collect(Collectors.toList());
        summary.setManagedFeeTypes(managedFees);

        List<StudentPaymentStatusDto> studentPaymentStatuses = new ArrayList<>();
        BigDecimal totalCollectedForClass = BigDecimal.ZERO;
        long totalPaymentsInClassCount = 0;
        List<RecentTransactionDto> recentClassPayments = new ArrayList<>();

        if (treasurerStudentInfo.getProgram() != null && treasurerStudentInfo.getYearLevel() != null /* section is char, always has a value */) {
            List<Students> classmates = studentRepository.findStudentsByTreasurerDetails(
                treasurerStudentInfo.getProgram().getProgramId(), 
                treasurerStudentInfo.getYearLevel(), 
                treasurerStudentInfo.getSection()
            );

            List<Fees> allFees = feeRepository.findAll(); 

            for (Students classmate : classmates) {
                for (Fees fee : allFees) {
                    List<Payments> paymentsByStudentForFee = paymentRepository.findByStudentStudentIdAndFeeFeeId(
                        classmate.getStudentId(), 
                        fee.getFeeId()
                    ).stream().filter(p -> p.getStatus() == Status.Paid).collect(Collectors.toList());
                    
                    BigDecimal amountPaidForFee = paymentsByStudentForFee.stream()
                        .filter(p -> p.getFee() != null && p.getFee().getAmount() != null)
                        .map(p -> p.getFee().getAmount())
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal feeAmount = fee.getAmount() != null ? fee.getAmount() : BigDecimal.ZERO;
                    BigDecimal amountDue = feeAmount.subtract(amountPaidForFee);
                    String paymentStatusString = "Not Paid";
                    if (amountPaidForFee.compareTo(BigDecimal.ZERO) > 0) {
                        paymentStatusString = amountPaidForFee.compareTo(feeAmount) >= 0 ? "Paid" : "Partially Paid";
                    }
                    if (paymentStatusString.equals("Paid")) {
                         totalCollectedForClass = totalCollectedForClass.add(amountPaidForFee);
                    }

                    studentPaymentStatuses.add(new StudentPaymentStatusDto(
                        String.valueOf(classmate.getStudentId()),
                        classmate.getFirstName() + " " + classmate.getLastName(),
                        fee.getFeeType(),
                        amountPaidForFee,
                        amountDue.max(BigDecimal.ZERO),
                        paymentStatusString
                    ));

                    if (!paymentsByStudentForFee.isEmpty()) {
                        totalPaymentsInClassCount += paymentsByStudentForFee.size();
                    }
                }
            }
            PageRequest classPaymentRecentLimit = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "paymentDate"));
            List<Long> classmateIds = classmates.stream().map(Students::getStudentId).collect(Collectors.toList());
            if (!classmateIds.isEmpty()) {
                recentClassPayments = paymentRepository.findByStudentStudentIdIn(classmateIds, classPaymentRecentLimit).stream()
                    .map(p -> new RecentTransactionDto(
                        String.valueOf(p.getPaymentId()),
                        "PaymentInClass",
                         (p.getFee() != null ? p.getFee().getFeeType() : "N/A Fee") + " by " + (p.getStudent() != null ? p.getStudent().getFirstName() : "N/A"),
                        p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO,
                        p.getPaymentDate() != null ? p.getPaymentDate().atStartOfDay() : null,
                        p.getStatus() != null ? p.getStatus().name() : "N/A",
                        p.getStudent() != null ? p.getStudent().getFirstName() + " " + p.getStudent().getLastName() : "N/A Student"
                    )).collect(Collectors.toList());
             }
        }
        summary.setStudentPaymentStatuses(studentPaymentStatuses);
        summary.setTotalCollectedForManagedFees(totalCollectedForClass);
        summary.setTotalPaymentsForManagedFeesCount(totalPaymentsInClassCount); 
        summary.setRecentPaymentsInClass(recentClassPayments.stream()
            .sorted(Comparator.comparing(RecentTransactionDto::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .limit(5)
            .collect(Collectors.toList()));

        return summary;
    }

    public PublicDashboardSummaryDto getPublicDashboardSummary() {
        PublicDashboardSummaryDto summary = new PublicDashboardSummaryDto();

        // 1. Calculate total collections from PAID and REMITTED Payments
        BigDecimal totalCollectedOverall = paymentRepository.findAll().stream()
            .filter(p -> (p.getStatus() == Status.Paid || p.getStatus() == Status.Remitted) && p.getAmount() != null)
            .map(Payments::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalCollectedOverall(totalCollectedOverall);

        // 2. Calculate total expenses (APPROVED and PAID)
        BigDecimal totalSpentOverall = expenseRepository.findAll().stream()
            .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && 
                         e.getExpenseStatus() == Expenses.ExpenseStatus.PAID && 
                         e.getAmount() != null)
            .map(Expenses::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        summary.setTotalSpentOverall(totalSpentOverall);

        // 3. Calculate current fund balance
        summary.setCurrentFundsBalance(totalCollectedOverall.subtract(totalSpentOverall));

        // 4. Fee Breakdown
        List<FeeTransparencyDto> feeBreakdownList = new ArrayList<>();
        List<Fees> allFees = feeRepository.findAll(Sort.by(Sort.Direction.ASC, "feeType"));

        for (Fees fee : allFees) {
            FeeTransparencyDto feeDto = new FeeTransparencyDto(fee.getFeeType(), fee.getDescription());

            BigDecimal collectedForThisFee = paymentRepository.findByFee_FeeId(fee.getFeeId()).stream()
                .filter(p -> (p.getStatus() == Status.Paid || p.getStatus() == Status.Remitted) && p.getAmount() != null)
                .map(Payments::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            feeDto.setTotalCollectedForFee(collectedForThisFee);

            List<Expenses> expensesForThisFee = expenseRepository.findByRelatedFeeFeeId(fee.getFeeId());
            BigDecimal spentForThisFee = expensesForThisFee.stream()
                .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && 
                             e.getExpenseStatus() == Expenses.ExpenseStatus.PAID && 
                             e.getAmount() != null)
                .map(Expenses::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            feeDto.setTotalSpentFromFee(spentForThisFee);

            feeDto.setFeeBalance(collectedForThisFee.subtract(spentForThisFee));

            // Get recent/top 3-5 expenses for this fee
            List<ExpenseBreakdownDto> expenseBreakdownDetails = expensesForThisFee.stream()
                .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && e.getExpenseStatus() == Expenses.ExpenseStatus.PAID)
                .sorted(Comparator.comparing(Expenses::getExpenseDate, Comparator.nullsLast(Comparator.reverseOrder()))
                                  .thenComparing(Expenses::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(e -> new ExpenseBreakdownDto(
                    e.getExpenseTitle(),
                    e.getAmount(),
                    e.getExpenseDate(),
                    e.getVendorSupplier(),
                    e.getExpenseCategory() != null ? e.getExpenseCategory().name() : "N/A"
                ))
                .collect(Collectors.toList());
            feeDto.setExpenseBreakdown(expenseBreakdownDetails);
            
            feeBreakdownList.add(feeDto);
        }
        summary.setFeeBreakdown(feeBreakdownList);

        // 5. Optional: Top Expense Categories
        Map<String, BigDecimal> amountPerCategory = expenseRepository.findAll().stream()
            .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && 
                         e.getExpenseStatus() == Expenses.ExpenseStatus.PAID && 
                         e.getAmount() != null && e.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(e -> e.getExpenseCategory().name(),
                                          Collectors.reducing(BigDecimal.ZERO, Expenses::getAmount, BigDecimal::add)));

        Map<String, Long> countPerCategory = expenseRepository.findAll().stream()
            .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && 
                         e.getExpenseStatus() == Expenses.ExpenseStatus.PAID && 
                         e.getExpenseCategory() != null)
            .collect(Collectors.groupingBy(e -> e.getExpenseCategory().name(), Collectors.counting()));

        List<ExpenseCategorySummaryDto> topCategories = amountPerCategory.entrySet().stream()
            .map(entry -> new ExpenseCategorySummaryDto(
                entry.getKey().replace("_", " "), 
                entry.getValue(), 
                countPerCategory.getOrDefault(entry.getKey(), 0L)
            ))
            .sorted(Comparator.comparing(ExpenseCategorySummaryDto::getTotalAmountSpent).reversed())
            .limit(5) // Top 5 categories
            .collect(Collectors.toList());
        summary.setTopExpenseCategories(topCategories);

        return summary;
    }

    public List<FeeUtilizationDTO> getFeeUtilizationBreakdown() {
        List<Fees> allFees = feeRepository.findAll(Sort.by(Sort.Direction.ASC, "feeType"));
        List<FeeUtilizationDTO> utilizationList = new ArrayList<>();

        for (Fees fee : allFees) {
            Integer feeId = fee.getFeeId();

            // 1. Calculate Total Collected for this fee
            BigDecimal totalCollected = paymentRepository.findByFee_FeeId(feeId).stream()
                .filter(p -> (p.getStatus() == Status.Paid || p.getStatus() == Status.Remitted) && p.getAmount() != null)
                .map(Payments::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 2. Calculate Total Remitted for this fee
            BigDecimal totalRemitted = remittanceRepository.findByFee_FeeId(feeId).stream()
                .filter(r -> r.getAmountRemitted() != null && r.getStatus() == com.agaseeyyy.transparencysystem.remittances.RemittanceStatus.COMPLETED)
                .map(Remittances::getAmountRemitted)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 3. Calculate Total Expenses for this fee (relatedFeeId and Approved)
            BigDecimal totalExpenses = expenseRepository.findByRelatedFeeFeeId(feeId).stream()
                .filter(e -> e.getApprovalStatus() == Expenses.ApprovalStatus.APPROVED && e.getAmount() != null)
                .map(Expenses::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            // 4. Calculate Net Balance
            // Assuming net balance is (Total Collected from payments directly used for expenses) + (Total Remitted which can then be used for expenses) - Total Expenses
            // For simplicity here, let's consider net as (Collected + Remitted) - Expenses.
            // However, a more accurate model would depend on how funds flow.
            // If remitted funds are the source for expenses, then it might be Remitted - Expenses.
            // If collected funds are directly used for expenses, it might be Collected - Expenses (and remitted is separate).
            // Let's use a common interpretation: (Total Collected) - (Total Expenses directly from this fee).
            // Remitted amount is an internal transfer, so for utilization against expenses, we consider expenses tied to the fee.
            BigDecimal netBalance = totalCollected.subtract(totalExpenses);


            FeeUtilizationDTO dto = new FeeUtilizationDTO(
                feeId,
                fee.getFeeType(),
                totalCollected,
                totalRemitted, // This shows how much was passed on, not necessarily available for new expenses if already spent from remitted funds.
                totalExpenses,
                netBalance
            );
            utilizationList.add(dto);
        }
        return utilizationList;
    }
}