package com.agaseeyyy.transparencysystem.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.agaseeyyy.transparencysystem.model.Users;
import com.agaseeyyy.transparencysystem.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping(path = "api/v1/users")
@CrossOrigin
public class UserController {
  
    private final UserService userService;
    
    public UserController(UserService userService) {
      this.userService = userService;
    }

    @GetMapping
    public List<Users> getUsers() {
        return userService.getUsers();
    } 

    @PostMapping
    public void addNewUser(@RequestBody Users user) {
        userService.addNewUser(user);
    }
    
}
