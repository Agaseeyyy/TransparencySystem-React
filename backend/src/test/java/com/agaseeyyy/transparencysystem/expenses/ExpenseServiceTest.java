package com.agaseeyyy.transparencysystem.expenses;

import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseCategory;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ExpenseStatus;
import com.agaseeyyy.transparencysystem.expenses.Expenses.ApprovalStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;
    
    @Mock
    private com.agaseeyyy.transparencysystem.accounts.AccountRepository accountRepository;
    
    @Mock
    private com.agaseeyyy.transparencysystem.departments.DepartmentRepository departmentRepository;
    
    @Mock
    private com.agaseeyyy.transparencysystem.fees.FeeRepository feeRepository;

    @InjectMocks
    private ExpenseService expenseService;

    private Expenses testExpense;
    private Accounts testAccount;

    @BeforeEach
    void setUp() {
        testAccount = new Accounts();
        testAccount.setAccountId(1); // Use Integer instead of Long
        testAccount.setEmail("test@example.com"); // Use email instead of username
        testAccount.setRole(Accounts.Role.Admin); // Set role to Admin for approval authority

        testExpense = new Expenses();
        testExpense.setExpenseId(1L);
        testExpense.setExpenseReference("EXP001");
        testExpense.setExpenseTitle("Test Expense");
        testExpense.setExpenseCategory(ExpenseCategory.OFFICE_SUPPLIES);
        testExpense.setAmount(new BigDecimal("100.00"));
        testExpense.setExpenseDate(LocalDate.now());
        testExpense.setExpenseStatus(ExpenseStatus.PENDING);
        testExpense.setApprovalStatus(ApprovalStatus.PENDING);
        testExpense.setCreatedByAccount(testAccount);
        testExpense.setCreatedAt(LocalDateTime.now());
        testExpense.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @SuppressWarnings("unchecked")
    void getAllExpenses_ShouldReturnPagedExpenses() {
        // Arrange
        List<Expenses> expenseList = Arrays.asList(testExpense);
        Page<Expenses> expensePage = new PageImpl<>(expenseList, PageRequest.of(0, 10), 1);

        when(expenseRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(expensePage);

        // Act
        Page<Expenses> result = expenseService.getAllExpenses(
            null, null, null, null, null, null, null, null, 
            null, null, null, null, null, null, null, null,
            0, 10, "expenseId", "asc"
        );

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("EXP001", result.getContent().get(0).getExpenseReference());
        verify(expenseRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void getExpenseById_ShouldReturnExpense_WhenExists() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));

        // Act
        Optional<Expenses> result = expenseService.getExpenseById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("EXP001", result.get().getExpenseReference());
        assertEquals("Test Expense", result.get().getExpenseTitle());
        verify(expenseRepository).findById(1L);
    }

    @Test
    void getExpenseById_ShouldReturnEmpty_WhenNotExists() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<Expenses> result = expenseService.getExpenseById(1L);

        // Assert
        assertFalse(result.isPresent());
        verify(expenseRepository).findById(1L);
    }

    @Test
    void createExpense_ShouldSaveAndReturnExpense() {
        // Arrange
        Expenses newExpense = new Expenses();
        newExpense.setExpenseReference("EXP002");
        newExpense.setExpenseTitle("New Expense");
        newExpense.setExpenseCategory(ExpenseCategory.UTILITIES);
        newExpense.setAmount(new BigDecimal("200.00"));
        newExpense.setExpenseDate(LocalDate.now());

        when(accountRepository.findById(1)).thenReturn(Optional.of(testAccount));
        when(expenseRepository.save(any(Expenses.class))).thenReturn(testExpense);

        // Act
        Expenses result = expenseService.createExpense(newExpense, 1);

        // Assert
        assertNotNull(result);
        verify(accountRepository).findById(1);
        verify(expenseRepository).save(any(Expenses.class));
    }

    @Test
    void approveExpense_ShouldUpdateApprovalStatus() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        when(accountRepository.findById(1)).thenReturn(Optional.of(testAccount));
        when(expenseRepository.save(any(Expenses.class))).thenReturn(testExpense);

        // Act
        Expenses result = expenseService.approveExpense(1L, 1, "Approved for payment");

        // Assert
        assertNotNull(result);
        assertEquals(ApprovalStatus.APPROVED, testExpense.getApprovalStatus());
        assertNotNull(testExpense.getApprovalDate());
        assertEquals("Approved for payment", testExpense.getApprovalRemarks());
        verify(expenseRepository).findById(1L);
        verify(expenseRepository).save(testExpense);
    }

    @Test
    void rejectExpense_ShouldUpdateApprovalStatus() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));
        when(accountRepository.findById(1)).thenReturn(Optional.of(testAccount));
        when(expenseRepository.save(any(Expenses.class))).thenReturn(testExpense);

        // Act
        Expenses result = expenseService.rejectExpense(1L, 1, "Insufficient documentation");

        // Assert
        assertNotNull(result);
        assertEquals(ApprovalStatus.REJECTED, testExpense.getApprovalStatus());
        assertNotNull(testExpense.getApprovalDate());
        assertEquals("Insufficient documentation", testExpense.getApprovalRemarks());
        verify(expenseRepository).findById(1L);
        verify(expenseRepository).save(testExpense);
    }

    @Test
    void deleteExpense_ShouldCallRepository() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(testExpense));

        // Act
        expenseService.deleteExpense(1L);

        // Assert
        verify(expenseRepository).findById(1L);
        verify(expenseRepository).delete(testExpense);
    }

    @Test
    void deleteExpense_ShouldThrowException_WhenNotExists() {
        // Arrange
        when(expenseRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException.class, 
                    () -> expenseService.deleteExpense(1L));
        verify(expenseRepository).findById(1L);
        verify(expenseRepository, never()).delete(any(Expenses.class));
    }
}
