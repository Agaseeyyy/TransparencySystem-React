package com.agaseeyyy.transparencysystem.users;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping(path = "api/v1/users")
public class UserController {
    @Autowired
    private final UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public UserController(UserService userService) {
      this.userService = userService;
    }

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
        

    @GetMapping("/info")
    public List<Users> getUsersInfo() {
        return userService.getUsersInfo();
    }

    @GetMapping
    public List<Map<String, Object>> getUsers() {
        return userService.getUsers();
    } 

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PostMapping
    public void addNewUser(@RequestBody Users user) {
        userService.addNewUser(user);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping(path = "{userId}")
    public void updateUsers(@PathVariable("userId") Integer userId, @RequestBody Users user) {
        userService.updateUser(user, userId);
    }

    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping(path = "{userId}")
    public void deleteUsers(@PathVariable("userId") Integer userId) {
        userService.deleteUsers(userId);
    }
    
}
