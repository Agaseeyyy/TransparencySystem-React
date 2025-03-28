package com.agaseeyyy.transparencysystem.accounts;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;

import jakarta.annotation.PostConstruct;

@Service
public class AccountService {
  private final AccountRepository accountRepository;
  private final StudentRepository studentRepository;
  private final PasswordEncoder passwordEncoder;
    
  // Constructors
  public AccountService(AccountRepository accountRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
    this.accountRepository = accountRepository;
    this.studentRepository = studentRepository;
  }


  // Named Methods and Business Logics
  public Accounts getAccountByEmail(String email) {
    Accounts account = accountRepository.findByEmail(email);
    System.out.println("Finding account with email: " + email);
    System.out.println("Account found: " + (account != null));
        
    if (account != null) {
      System.out.println("Account role: " + account.getRole());
    }
    return account;
  }


  public List <Accounts> getAccountsInfo() {
    return accountRepository.findAll();
  }


  public Accounts addNewAccount(Long studentId, Accounts newAccount) {
    Students student = studentRepository.findById(studentId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student with id " + studentId + " does not exist")
    );

    if(accountRepository.existsByEmail(newAccount.getEmail())) {
      throw new RuntimeException("New account with email " + newAccount.getEmail() + " already exists");
    }

    newAccount.setPassword(passwordEncoder.encode(newAccount.getPassword()));
    newAccount.setStudent(student);
    return accountRepository.save(newAccount);
  }


  public Accounts updateAccount(Accounts updatedAccount, Integer accountId) {
    Accounts existingAccount = accountRepository.findById(accountId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with id " + accountId + " does not exist")
    );

    existingAccount.setEmail(updatedAccount.getEmail());
    existingAccount.setRole(updatedAccount.getRole());

    return accountRepository.save(existingAccount);
  }


  public void deleteAccount( Integer accountId) {
    if (!accountRepository.existsById(accountId)) {
      throw new RuntimeException("User with id " + accountId + " does not exist");
    }

    accountRepository.deleteById(accountId);
  }


  @PostConstruct
  public void initializeDefaultAdmin() {
    Accounts existingAdmin = accountRepository.findByEmail("admin@admin.com");
    System.out.println("Checking for existing admin: " + (existingAdmin != null));
    
    if (existingAdmin == null) {
      Accounts admin = new Accounts();

      admin.setEmail("admin@admin.com");
      String rawPassword = "admin123";
      String encodedPassword = passwordEncoder.encode(rawPassword);
      admin.setPassword(encodedPassword);
      admin.setRole(Accounts.Role.Admin);
      accountRepository.save(admin);
      System.out.println("Default admin account created with encoded password: " + encodedPassword);
    }
  }

}
