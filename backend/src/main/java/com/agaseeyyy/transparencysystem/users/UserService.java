package com.agaseeyyy.transparencysystem.users;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;

import jakarta.annotation.PostConstruct;

@Service
public class UserService {
  private final UserRepository userRepository;
  private final StudentRepository studentRepository;
  private final PasswordEncoder passwordEncoder;
    
  // Constructors
  public UserService(UserRepository userRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
    this.passwordEncoder = passwordEncoder;
    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
  }


  // Named Methods and Business Logics
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


  public Users addNewUser(Long studentId, Users newUser) {
    Students student = studentRepository.findById(studentId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student with id " + studentId + " does not exist")
    );

    if(userRepository.existsByEmail(newUser.getEmail())) {
      throw new RuntimeException("newUser with email " + newUser.getEmail() + " already exists");
    }

    newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
    newUser.setStudent(student);
    return userRepository.save(newUser);
  }


  public Users updateUser(Users updatedUser, Integer userId) {
    Users existingUser = userRepository.findById(userId).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User with id " + userId + " does not exist")
    );

    existingUser.setEmail(updatedUser.getEmail());
    existingUser.setRole(updatedUser.getRole());

    return userRepository.save(existingUser);
  }


  public void deleteUsers( Integer userId) {
    if (!userRepository.existsById(userId)) {
      throw new RuntimeException("User with id " + userId + " does not exist");
    }

    userRepository.deleteById(userId);
  }


  @PostConstruct
  public void initializeDefaultAdmin() {
    Users existingAdmin = userRepository.findByEmail("admin@admin.com");
    System.out.println("Checking for existing admin: " + (existingAdmin != null));
    
    if (existingAdmin == null) {
      Users admin = new Users();

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
