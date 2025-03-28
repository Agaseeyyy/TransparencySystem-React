package com.agaseeyyy.transparencysystem.controllers;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.exceptions.UnauthorizedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AccountRepository accountRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Accounts loginRequest) {
        // Find account by email
        Accounts account = accountRepository.findByEmail(loginRequest.getEmail());
        if (account == null) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Check if password matches
        if (!passwordEncoder.matches(loginRequest.getPassword(), account.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Return account details with simple auth key
        Map<String, Object> response = new HashMap<>();
        response.put("accountId", account.getaccountId());
        response.put("email", account.getEmail());
        response.put("role", account.getRole().toString());
        response.put("firstName", account.getFirstName());
        response.put("lastName", account.getLastName());
        response.put("program", account.getProgram());
        response.put("yearLevel", account.getYearLevel());
        response.put("section", account.getSection());
        response.put("authKey", account.getaccountId() + ":" + account.getRole().toString());
        
        return response;
    }
    
    
    // This endpoint can be optional if using pure client-side auth
    @GetMapping("/me")
    public Accounts getCurrentAccount(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        
        Accounts account = accountRepository.findByEmail(principal.getName());
        if (account == null) {
            throw new UnauthorizedException("Account not found");
        }
        
        account.setPassword(null);
        return account;
    }
}