package com.agaseeyyy.transparencysystem.expenses;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.agaseeyyy.transparencysystem.dto.ExpenseDTO;
import com.agaseeyyy.transparencysystem.dto.ExpenseInputDTO;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.util.FileUploadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {
    
    private final ExpenseService expenseService;
    private final ExpenseMapper expenseMapper;
    private final FileUploadService fileUploadService;
    
    public ExpenseController(ExpenseService expenseService, ExpenseMapper expenseMapper, FileUploadService fileUploadService) {
        this.expenseService = expenseService;
        this.expenseMapper = expenseMapper;
        this.fileUploadService = fileUploadService;
    }
    
    // Create new expense
    @PostMapping
    public ResponseEntity<ExpenseDTO> createExpense(
            @Valid @RequestBody ExpenseInputDTO expenseDTO,
            @RequestParam Integer createdByAccountId) {
        Expenses expense = expenseMapper.toEntity(expenseDTO, null);
        Expenses createdExpense = expenseService.createExpense(expense, createdByAccountId);
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseMapper.toDTO(createdExpense));
    }
    
    // Create new expense with file upload
    @PostMapping(value = "/with-file", consumes = "multipart/form-data")
    public ResponseEntity<ExpenseDTO> createExpenseWithFile(
            @RequestParam("expenseData") String expenseDataJson,
            @RequestParam("createdByAccountId") Integer createdByAccountId,
            @RequestParam(value = "documentation", required = false) MultipartFile documentationFile) {
        try {
            // Parse JSON data
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            ExpenseInputDTO expenseDTO = mapper.readValue(expenseDataJson, ExpenseInputDTO.class);
            
            // Handle file upload if provided
            if (documentationFile != null && !documentationFile.isEmpty()) {
                String filePath = fileUploadService.uploadExpenseDocumentation(documentationFile);
                expenseDTO.setDocumentationPath(filePath);
            }
            
            Expenses expense = expenseMapper.toEntity(expenseDTO, null);
            Expenses createdExpense = expenseService.createExpense(expense, createdByAccountId);
            return ResponseEntity.status(HttpStatus.CREATED).body(expenseMapper.toDTO(createdExpense));
        } catch (Exception e) {
            throw new com.agaseeyyy.transparencysystem.exception.BadRequestException("Failed to create expense: " + e.getMessage());
        }
    }
    
    // Get all expenses with filtering and pagination
    @GetMapping
    public ResponseEntity<Page<ExpenseDTO>> getAllExpenses(
            @RequestParam(required = false) ExpenseCategory category,
            @RequestParam(required = false) ExpenseStatus expenseStatus,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer createdBy,
            @RequestParam(required = false) Integer approvedBy,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String vendorSupplier,
            @RequestParam(required = false) String budgetAllocation,
            @RequestParam(required = false) Boolean isRecurring,
            @RequestParam(required = false) String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Page<Expenses> expenses = expenseService.getAllExpenses(
            category, expenseStatus, approvalStatus, departmentId, createdBy, approvedBy,
            academicYear, semester, startDate, endDate, minAmount, maxAmount,
            vendorSupplier, budgetAllocation, isRecurring, searchTerm,
            page, size, sortBy, sortDirection
        );
        
        return ResponseEntity.ok(expenseMapper.toPageDTO(expenses));
    }
    
    // Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<ExpenseDTO> getExpenseById(@PathVariable Long id) {
        return expenseService.getExpenseById(id)
            .map(expense -> ResponseEntity.ok(expenseMapper.toDTO(expense)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Get expense by reference
    @GetMapping("/reference/{reference}")
    public ResponseEntity<ExpenseDTO> getExpenseByReference(@PathVariable String reference) {
        return expenseService.getExpenseByReference(reference)
            .map(expense -> ResponseEntity.ok(expenseMapper.toDTO(expense)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    // Update expense
    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDTO> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseInputDTO expenseDTO) {
        expenseService.getExpenseById(id)
            .orElseThrow(() -> new com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException("Expense not found with ID: " + id));

        Expenses expense = expenseMapper.toEntity(expenseDTO, null);
        Expenses updatedExpense = expenseService.updateExpense(id, expense);
        return ResponseEntity.ok(expenseMapper.toDTO(updatedExpense));
    }
    
    // Update expense with file upload
    @PutMapping(value = "/{id}/with-file", consumes = "multipart/form-data")
    public ResponseEntity<ExpenseDTO> updateExpenseWithFile(
            @PathVariable Long id,
            @RequestParam("expenseData") String expenseDataJson,
            @RequestParam(value = "documentation", required = false) MultipartFile documentationFile) {
        try {
            Expenses existingExpense = expenseService.getExpenseById(id)
                .orElseThrow(() -> new com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException("Expense not found with ID: " + id));
            
            // Parse JSON data
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
            ExpenseInputDTO expenseDTO = mapper.readValue(expenseDataJson, ExpenseInputDTO.class);
            
            // Handle file upload if provided
            if (documentationFile != null && !documentationFile.isEmpty()) {
                // Delete old file if exists
                if (existingExpense.getDocumentationPath() != null) {
                    fileUploadService.deleteFile(existingExpense.getDocumentationPath());
                }
                String filePath = fileUploadService.uploadExpenseDocumentation(documentationFile);
                expenseDTO.setDocumentationPath(filePath);
            }
            
            Expenses expense = expenseMapper.toEntity(expenseDTO, existingExpense);
            Expenses updatedExpense = expenseService.updateExpense(id, expense);
            return ResponseEntity.ok(expenseMapper.toDTO(updatedExpense));
        } catch (Exception e) {
            throw new com.agaseeyyy.transparencysystem.exception.BadRequestException("Failed to update expense: " + e.getMessage());
        }
    }
    
    // Approve expense
    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseDTO> approveExpense(
            @PathVariable Long id,
            @RequestParam Integer approvedByAccountId,
            @RequestParam(required = false) String approvalRemarks) {
        Expenses approvedExpense = expenseService.approveExpense(id, approvedByAccountId, approvalRemarks);
        return ResponseEntity.ok(expenseMapper.toDTO(approvedExpense));
    }
    
    // Reject expense
    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseDTO> rejectExpense(
            @PathVariable Long id,
            @RequestParam Integer rejectedByAccountId,
            @RequestParam(required = false) String rejectionRemarks) {
        Expenses rejectedExpense = expenseService.rejectExpense(id, rejectedByAccountId, rejectionRemarks);
        return ResponseEntity.ok(expenseMapper.toDTO(rejectedExpense));
    }
    
    // Mark expense as paid
    @PostMapping("/{id}/pay")
    public ResponseEntity<ExpenseDTO> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentDate) {
        Expenses paidExpense = expenseService.markAsPaid(id, paymentDate);
        return ResponseEntity.ok(expenseMapper.toDTO(paidExpense));
    }
    
    // Delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
    
    // Get pending approval expenses
    @GetMapping("/pending-approval")
    public ResponseEntity<List<ExpenseDTO>> getPendingApprovalExpenses() {
        List<Expenses> pendingExpenses = expenseService.getPendingApprovalExpenses();
        return ResponseEntity.ok(expenseMapper.toDTOList(pendingExpenses));
    }
    
    // Get expenses by created user
    @GetMapping("/created-by/{accountId}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByCreatedUser(@PathVariable Integer accountId) {
        List<Expenses> expenses = expenseService.getExpensesByCreatedUser(accountId);
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Get expenses by department
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ExpenseDTO>> getExpensesByDepartment(@PathVariable String departmentId) {
        List<Expenses> expenses = expenseService.getExpensesByDepartment(departmentId);
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Get recurring expenses
    @GetMapping("/recurring")
    public ResponseEntity<List<ExpenseDTO>> getRecurringExpenses() {
        List<Expenses> recurringExpenses = expenseService.getRecurringExpenses();
        return ResponseEntity.ok(expenseMapper.toDTOList(recurringExpenses));
    }
    
    // Get expenses requiring review
    @GetMapping("/requiring-review")
    public ResponseEntity<List<ExpenseDTO>> getExpensesRequiringReview(
            @RequestParam(defaultValue = "10000.0") Double threshold) {
        List<Expenses> expenses = expenseService.getExpensesRequiringReview(threshold);
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Analytics and Dashboard Endpoints
    
    // Get total expenses by category
    @GetMapping("/analytics/by-category")
    public ResponseEntity<Map<ExpenseCategory, Double>> getTotalExpensesByCategory() {
        Map<ExpenseCategory, Double> categoryTotals = expenseService.getTotalExpensesByCategory();
        return ResponseEntity.ok(categoryTotals);
    }
    
    // Get monthly expenses summary
    @GetMapping("/analytics/monthly")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyExpensesSummary() {
        List<Map<String, Object>> monthlyData = expenseService.getMonthlyExpensesSummary();
        return ResponseEntity.ok(monthlyData);
    }
    
    // Get total expenses for academic year
    @GetMapping("/analytics/academic-year/{academicYear}")
    public ResponseEntity<Double> getTotalExpensesForAcademicYear(@PathVariable String academicYear) {
        Double total = expenseService.getTotalExpensesForAcademicYear(academicYear);
        return ResponseEntity.ok(total);
    }
    
    // Get total expenses by department
    @GetMapping("/analytics/department/{departmentId}")
    public ResponseEntity<Double> getTotalExpensesByDepartment(@PathVariable String departmentId) {
        Double total = expenseService.getTotalExpensesByDepartment(departmentId);
        return ResponseEntity.ok(total);
    }
    
    // Get total expenses by date range
    @GetMapping("/analytics/date-range")
    public ResponseEntity<Double> getTotalExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Double total = expenseService.getTotalExpensesByDateRange(startDate, endDate);
        return ResponseEntity.ok(total);
    }
    
    // Get top expense categories
    @GetMapping("/analytics/top-categories")
    public ResponseEntity<List<Map<String, Object>>> getTopExpenseCategories() {
        List<Map<String, Object>> topCategories = expenseService.getTopExpenseCategories();
        return ResponseEntity.ok(topCategories);
    }
    
    // Transparency Reports
    
    // Generate transparency report
    @GetMapping("/transparency/report")
    public ResponseEntity<Map<String, Object>> generateTransparencyReport(
            @RequestParam String academicYear,
            @RequestParam(required = false) String semester) {
        Map<String, Object> report = expenseService.generateTransparencyReport(academicYear, semester);
        return ResponseEntity.ok(report);
    }
    
    // Expense Categories Endpoint (for frontend dropdowns)
    @GetMapping("/categories")
    public ResponseEntity<ExpenseCategory[]> getExpenseCategories() {
        return ResponseEntity.ok(ExpenseCategory.values());
    }
    
    // Expense Statuses Endpoint (for frontend dropdowns)
    @GetMapping("/statuses")
    public ResponseEntity<ExpenseStatus[]> getExpenseStatuses() {
        return ResponseEntity.ok(ExpenseStatus.values());
    }
    
    // Approval Statuses Endpoint (for frontend dropdowns)
    @GetMapping("/approval-statuses")
    public ResponseEntity<ApprovalStatus[]> getApprovalStatuses() {
        return ResponseEntity.ok(ApprovalStatus.values());
    }
    
    // Generate expense reference
    @GetMapping("/generate-reference")
    public ResponseEntity<Map<String, String>> generateExpenseReference() {
        String reference = expenseService.generateExpenseReference();
        return ResponseEntity.ok(Map.of("reference", reference));
    }
    
    // Export Endpoints
    
    // Export expenses with filters
    @GetMapping("/export")
    public ResponseEntity<List<ExpenseDTO>> exportExpenses(
            @RequestParam(required = false) ExpenseCategory category,
            @RequestParam(required = false) ExpenseCategory expenseCategory,
            @RequestParam(required = false) ExpenseStatus expenseStatus,
            @RequestParam(required = false) ApprovalStatus approvalStatus,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) Integer createdBy,
            @RequestParam(required = false) Integer approvedBy,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(required = false) String vendorSupplier,
            @RequestParam(required = false) String budgetAllocation,
            @RequestParam(required = false) Boolean isRecurring,
            @RequestParam(required = false) String searchTerm) {
        
        // Use category if expenseCategory is null (for backward compatibility)
        ExpenseCategory finalCategory = expenseCategory != null ? expenseCategory : category;
        
        List<Expenses> expenses = expenseService.getExpensesForExport(
            finalCategory, expenseStatus, approvalStatus, departmentId, createdBy, approvedBy,
            academicYear, semester, startDate, endDate, minAmount, maxAmount,
            vendorSupplier, budgetAllocation, isRecurring, searchTerm
        );
        
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Export expenses by department
    @GetMapping("/export/department/{departmentId}")
    public ResponseEntity<List<ExpenseDTO>> exportExpensesByDepartment(@PathVariable String departmentId) {
        List<Expenses> expenses = expenseService.getExpensesByDepartment(departmentId);
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Export expenses by academic year
    @GetMapping("/export/academic-year/{academicYear}")
    public ResponseEntity<List<ExpenseDTO>> exportExpensesByAcademicYear(@PathVariable String academicYear) {
        List<Expenses> expenses = expenseService.getExpensesForExport(
            null, null, null, null, null, null, academicYear, null, null, null, null, null, null, null, null, null
        );
        return ResponseEntity.ok(expenseMapper.toDTOList(expenses));
    }
    
    // Export transparency report
    @GetMapping("/export/transparency-report")
    public ResponseEntity<Map<String, Object>> exportTransparencyReport(
            @RequestParam String academicYear,
            @RequestParam(required = false) String semester) {
        Map<String, Object> report = expenseService.generateTransparencyReport(academicYear, semester);
        return ResponseEntity.ok(report);
    }
}
