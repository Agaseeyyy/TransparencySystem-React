package com.agaseeyyy.transparencysystem.accounts;

import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO;

@RestController
@RequestMapping(path = "/api/v1/accounts")
public class AccountController {
    private final AccountService accountService;

    // Constructors
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }


    // REST API Endpoints
    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public List<Accounts> displayAccountsByRole(@PathVariable String role) {
        return accountService.getAccountsByRole(role);
    }


    @GetMapping
    @PreAuthorize("hasAuthority('Admin')")
    public Page<Accounts> displayAccounts(
            @RequestParam(defaultValue = "0") int pageNumber, 
            @RequestParam(defaultValue = "10") int pageSize, 
            @RequestParam(defaultValue = "student.lastName") String sortField, 
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String role) {
        return accountService.getAccounts(pageNumber, pageSize, sortField, sortDirection, role);
    }

    @GetMapping("/fees/{feeId}/remittance-status")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Page<AccountWithRemittanceInfoDTO> getClassTreasurersWithRemittanceStatus(
            @PathVariable Integer feeId,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "account.student.lastName") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "all") String program,
            @RequestParam(defaultValue = "all") String yearLevel,
            @RequestParam(defaultValue = "all") String section) {
        
        return accountService.getClassTreasurersWithDetailedRemittanceStatus(
                feeId, pageNumber, pageSize, sortField, sortDirection, 
                program, yearLevel, section);
    }

    @PostMapping("/{studentId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void addNewAccount(@PathVariable Long studentId, @RequestBody Accounts account) {
        accountService.addNewAccount(studentId, account);
    }

    @PutMapping("/{accountId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void updateAccount(@PathVariable Integer accountId, @RequestBody Accounts account) {
        accountService.updateAccount(account, accountId);
    }

    
    @DeleteMapping("/{accountId}")
    @PreAuthorize("hasAuthority('Admin')")
    public void deleteAccount(@PathVariable Integer accountId) {
        accountService.deleteAccount(accountId);
    }
    
    @GetMapping("/{accountId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public Accounts getAccountById(@PathVariable Integer accountId) {
        return accountService.getAccountById(accountId);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<Accounts> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        Accounts account = accountService.getAccountByEmail(email);
        if (account == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(account);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<Accounts> updateCurrentUserProfile(
            @RequestBody Accounts updatedAccount, 
            Authentication authentication) {
        String email = authentication.getName();
        Accounts currentAccount = accountService.getAccountByEmail(email);
        if (currentAccount == null) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            Accounts updated = accountService.updateUserProfile(updatedAccount, currentAccount.getAccountId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
