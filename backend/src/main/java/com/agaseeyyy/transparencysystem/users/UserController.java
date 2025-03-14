package com.agaseeyyy.transparencysystem.users;

import java.util.HashMap;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping(path = "/api/v1/users")
public class UserController {
  private final UserService userService;
  private PasswordEncoder passwordEncoder;

  // Constructors
  public UserController(UserService userService, PasswordEncoder passwordEncoder) {
    this.userService = userService;
    this.passwordEncoder = passwordEncoder;
  }


  // REST APIs
  @PostMapping("/login")
  public ResponseEntity<?> login (@RequestBody Users loginRequest) {
    Users user = userService.getUserByEmail(loginRequest.getEmail());

    if (user == null) {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new HashMap<String, String>() {{ 
            put("message", "User not found"); 
        }});
    }

    if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
        return ResponseEntity.ok(user);
    }

    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new HashMap<String, String>() {{ 
            put("message", "Invalid credentials"); 
        }});
  }
        

  @GetMapping
  public List<Users> displayUsersInfo() {
    return userService.getUsersInfo();
  }


  @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
  @PostMapping("/{studentId}")
  public void addNewUser(@PathVariable Long studentId, @RequestBody Users user) {
    userService.addNewUser(studentId, user);
  }

  @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
  @PutMapping("/{userId}")
  public void updateUser(@PathVariable Integer userId, @RequestBody Users user) {
    userService.updateUser(user, userId);
  }

  @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
  @DeleteMapping("/{userId}")
  public void deleteUsers(@PathVariable Integer userId) {
    userService.deleteUsers(userId);
  }
    
}
