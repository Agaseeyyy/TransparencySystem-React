package com.agaseeyyy.transparencysystem.security;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agaseeyyy.transparencysystem.accounts.AccountService;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.students.StudentRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtService jwtService;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserDetailsServiceImpl userDetailsService,
            JwtService jwtService,
            AccountService accountService,
            PasswordEncoder passwordEncoder,
            StudentRepository studentRepository) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.accountService = accountService;
        this.passwordEncoder = passwordEncoder;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        // Get user details
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        
        // Generate token
        String token = jwtService.generateToken(userDetails);
        
        // Get account details to include in response
        Accounts account = accountService.getAccountByEmail(request.getEmail());
        
        // Build and return the response
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setEmail(account.getEmail());
        response.setRole(account.getRole().name());
        response.setAccountId(account.getAccountId());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/verify")
    public ResponseEntity<Void> verifyToken(@AuthenticationPrincipal UserDetails userDetails) {
        // This endpoint is secured, so if we get here, the token is valid
        // The @AuthenticationPrincipal will extract the UserDetails from the JWT token
        
        // No need to do anything, just return 200 OK to indicate token is valid
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Create a new account
        Accounts account = new Accounts();
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRole(request.getRole());
        
        // If student ID is provided, associate with student
        if (request.getStudentId() != null) {
            Accounts savedAccount = accountService.addNewAccount(request.getStudentId(), account);
            
            // Generate token for the new user
            UserDetails userDetails = userDetailsService.loadUserByUsername(savedAccount.getEmail());
            String token = jwtService.generateToken(userDetails);
            
            // Build and return the response
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setEmail(savedAccount.getEmail());
            response.setRole(savedAccount.getRole().name());
            response.setAccountId(savedAccount.getAccountId());
            
            return ResponseEntity.ok(response);
        } else {
            // For admin accounts or accounts without students
            // Implementation depends on your specific requirements
            return ResponseEntity.badRequest().build();
        }
    }
} 