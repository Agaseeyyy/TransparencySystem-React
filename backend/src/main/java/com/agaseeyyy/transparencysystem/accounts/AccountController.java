package com.agaseeyyy.transparencysystem.accounts;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping(path = "/api/v1/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AccountController {
  private final AccountService accountService;

  // Constructors
  public AccountController(AccountService accountService) {
    this.accountService = accountService;
  }


  // REST APIs
  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public List<Accounts> displayAccountsInfo() {
    return accountService.getAccountsInfo();
  }


  @PostMapping("/{studentId}")
  @PreAuthorize("hasAuthority('Admin')")
  public void addNewAccount(@PathVariable Long studentId, @RequestBody Accounts account) {
     accountService.addNewAccount(studentId, account);
  }

  @PutMapping("/{userId}")
  @PreAuthorize("hasAuthority('Admin')") 
  public void updateAccount(@PathVariable Integer accountId, @RequestBody Accounts account) {
    accountService.updateAccount(account, accountId);
  }

  
  @DeleteMapping("/{userId}")
  public void deleteAccount(@PathVariable Integer accountId) {
    accountService.deleteAccount(accountId);
  }
    
}
