package com.agaseeyyy.transparencysystem.controllers;

import com.agaseeyyy.transparencysystem.users.Users;
import com.agaseeyyy.transparencysystem.users.UserRepository;
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
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Users loginRequest) {
        // Find user by email
        Users user = userRepository.findByEmail(loginRequest.getEmail());
        if (user == null) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Check if password matches
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }
        
        // Return user details with simple auth key
        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getUserId());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().toString());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("program", user.getProgram());
        response.put("yearLevel", user.getYearLevel());
        response.put("section", user.getSection());
        response.put("authKey", user.getUserId() + ":" + user.getRole().toString());
        
        return response;
    }
    
    
    // This endpoint can be optional if using pure client-side auth
    @GetMapping("/me")
    public Users getCurrentUser(Principal principal) {
        if (principal == null) {
            throw new UnauthorizedException("Not authenticated");
        }
        
        Users user = userRepository.findByEmail(principal.getName());
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }
        
        user.setPassword(null);
        return user;
    }
}