package com.agaseeyyy.transparencysystem.users;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
      this.passwordEncoder = passwordEncoder;
      this.userRepository = userRepository;
    }

    public Users getUserByEmail(String email) {
        Users user = userRepository.findByEmail(email);
        System.out.println("Finding user with email: " + email);
        System.out.println("User found: " + (user != null));
        
        if (user != null) {
            System.out.println("User role: " + user.getRole());
        }
        return user;
    }

    public List <Users> getUsersInfo() {
        return userRepository.findAll();
    }

    public List<Map<String, Object>> getUsers() {
        return userRepository.findAllUsers();
    } 

    public Users addNewUser(Users user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Users updateUser(Users updatedUser, Integer userId) {
        Users existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with id " + userId + " does not exist"));
            
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setMiddleInitial(updatedUser.getMiddleInitial());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setRole(updatedUser.getRole());
        return userRepository.save(existingUser);
    }

    public void deleteUsers( Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalStateException("User with id " + userId + " does not exist");
        }
        userRepository.deleteById(userId);
    }

    @PostConstruct
    public void initializeDefaultAdmin() {
        Users existingAdmin = userRepository.findByEmail("admin@admin.com");
        System.out.println("Checking for existing admin: " + (existingAdmin != null));
        
        if (existingAdmin == null) {
            Users admin = new Users();
            admin.setFirstName("Administrator");
            admin.setLastName("System");
            admin.setMiddleInitial('A');
            admin.setEmail("admin@admin.com");
            String rawPassword = "admin123";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            admin.setPassword(encodedPassword);
            admin.setRole(Users.Role.Admin);
            userRepository.save(admin);
            System.out.println("Default admin account created with encoded password: " + encodedPassword);
        }
    }

}
