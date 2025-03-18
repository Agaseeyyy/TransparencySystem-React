package com.agaseeyyy.transparencysystem.users;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping(path = "/api/v1/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {
  private final UserService userService;

  // Constructors
  public UserController(UserService userService) {
    this.userService = userService;
  }


  // REST APIs
  @GetMapping
  @PreAuthorize("hasAuthority('Admin')")
  public List<Users> displayUsersInfo() {
    return userService.getUsersInfo();
  }


  @PostMapping("/{studentId}")
  @PreAuthorize("hasAuthority('Admin')")
  public void addNewUser(@PathVariable Long studentId, @RequestBody Users user) {
     userService.addNewUser(studentId, user);
  }

  @PutMapping("/{userId}")
  @PreAuthorize("hasAuthority('Admin')") 
  public void updateUser(@PathVariable Integer userId, @RequestBody Users user) {
    userService.updateUser(user, userId);
  }

  
  @DeleteMapping("/{userId}")
  public void deleteUsers(@PathVariable Integer userId) {
    userService.deleteUsers(userId);
  }
    
}
