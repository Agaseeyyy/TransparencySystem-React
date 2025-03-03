package com.agaseeyyy.transparencysystem.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.model.Users;
import com.agaseeyyy.transparencysystem.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
      this.userRepository = userRepository;
    }

    public List<Users> getUsers() {
        return userRepository.findAll();
    } 

    public Users addNewUser(Users user) {
        return userRepository.save(user);
    }

}
