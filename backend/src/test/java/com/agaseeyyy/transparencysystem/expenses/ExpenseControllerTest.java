package com.agaseeyyy.transparencysystem.expenses;

import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import com.agaseeyyy.transparencysystem.security.JwtService;
import com.agaseeyyy.transparencysystem.security.JwtAuthenticationFilter;
import com.agaseeyyy.transparencysystem.security.UserDetailsServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ExpenseController.class, 
    excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        SecurityFilterAutoConfiguration.class,
        UserDetailsServiceAutoConfiguration.class,
        OAuth2ClientAutoConfiguration.class,
        OAuth2ResourceServerAutoConfiguration.class
    },
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, 
        classes = {JwtAuthenticationFilter.class, JwtService.class, UserDetailsServiceImpl.class})
)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    @Autowired
    private ObjectMapper objectMapper;

    private Expenses testExpense;

    @BeforeEach
    void setUp() {
        testExpense = new Expenses();
        testExpense.setExpenseId(1L);
        testExpense.setExpenseReference("EXP001");
        testExpense.setExpenseTitle("Test Expense");
        testExpense.setExpenseCategory(ExpenseCategory.OFFICE_SUPPLIES);
        testExpense.setAmount(new BigDecimal("100.00"));
        testExpense.setExpenseDate(LocalDate.now());
        testExpense.setExpenseStatus(ExpenseStatus.PENDING);
        testExpense.setApprovalStatus(ApprovalStatus.PENDING);
    }

    @Test
    void getAllExpenses_ShouldReturnPagedExpenses() throws Exception {
        // Arrange
        Expenses testExpense = new Expenses();
        testExpense.setExpenseReference("EXP001");
        testExpense.setExpenseTitle("Test Expense");
        
        List<Expenses> expenseList = Arrays.asList(testExpense);
        Page<Expenses> expensePage = new PageImpl<>(expenseList, PageRequest.of(0, 10), 1);

        when(expenseService.getAllExpenses(
            any(), any(), any(), any(), any(), any(), any(), any(), 
            any(), any(), any(), any(), any(), any(), any(), any(),
            anyInt(), anyInt(), any(), any()))
                .thenReturn(expensePage);

        // Act & Assert
        mockMvc.perform(get("/api/expenses")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].expenseReference").value("EXP001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getExpenseById_ShouldReturnExpense() throws Exception {
        // Arrange
        Expenses testExpense = new Expenses();
        testExpense.setExpenseReference("EXP001");
        testExpense.setExpenseTitle("Test Expense");
        
        when(expenseService.getExpenseById(1L)).thenReturn(Optional.of(testExpense));

        // Act & Assert
        mockMvc.perform(get("/api/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenseReference").value("EXP001"))
                .andExpect(jsonPath("$.expenseTitle").value("Test Expense"));
    }

    @Test
    void createExpense_ShouldReturnCreatedExpense() throws Exception {
        // Arrange
        Expenses newExpense = new Expenses();
        newExpense.setExpenseReference("EXP002");
        newExpense.setExpenseTitle("New Expense");
        newExpense.setExpenseCategory(ExpenseCategory.UTILITIES);
        newExpense.setAmount(new BigDecimal("200.00"));
        newExpense.setExpenseDate(LocalDate.now());

        Expenses createdExpense = new Expenses();
        createdExpense.setExpenseReference("EXP001");
        createdExpense.setExpenseTitle("Test Expense");

        when(expenseService.createExpense(any(Expenses.class), eq(1))).thenReturn(createdExpense);

        // Act & Assert
        mockMvc.perform(post("/api/expenses")
                        .param("createdByAccountId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newExpense)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.expenseReference").value("EXP001"));
    }

    @Test
    void updateExpense_ShouldReturnUpdatedExpense() throws Exception {
        // Arrange
        Expenses updatedExpense = new Expenses();
        updatedExpense.setExpenseTitle("Updated Expense");
        updatedExpense.setExpenseCategory(ExpenseCategory.UTILITIES);
        updatedExpense.setAmount(new BigDecimal("200.00"));
        
        Expenses returnedExpense = new Expenses();
        returnedExpense.setExpenseId(1L);
        returnedExpense.setExpenseTitle("Updated Expense");
        returnedExpense.setExpenseCategory(ExpenseCategory.UTILITIES);
        
        when(expenseService.updateExpense(eq(1L), any(Expenses.class))).thenReturn(returnedExpense);

        // Act & Assert
        mockMvc.perform(put("/api/expenses/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedExpense)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expenseTitle").value("Updated Expense"));
    }

    @Test
    void approveExpense_ShouldReturnApprovedExpense() throws Exception {
        // Arrange
        Expenses approvedExpense = new Expenses();
        approvedExpense.setExpenseId(1L);
        approvedExpense.setApprovalStatus(ApprovalStatus.APPROVED);
        
        when(expenseService.approveExpense(eq(1L), eq(1), any(String.class))).thenReturn(approvedExpense);

        // Act & Assert
        mockMvc.perform(post("/api/expenses/1/approve")
                        .param("approvedByAccountId", "1")
                        .param("approvalRemarks", "Approved for payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvalStatus").value("APPROVED"));
    }

    @Test
    void rejectExpense_ShouldReturnRejectedExpense() throws Exception {
        // Arrange
        Expenses rejectedExpense = new Expenses();
        rejectedExpense.setExpenseId(1L);
        rejectedExpense.setApprovalStatus(ApprovalStatus.REJECTED);
        
        when(expenseService.rejectExpense(eq(1L), eq(1), any(String.class))).thenReturn(rejectedExpense);

        // Act & Assert
        mockMvc.perform(post("/api/expenses/1/reject")
                        .param("rejectedByAccountId", "1")
                        .param("rejectionRemarks", "Insufficient documentation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvalStatus").value("REJECTED"));
    }

    @Test
    void deleteExpense_ShouldReturnNoContent() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isNoContent());
    }
}
