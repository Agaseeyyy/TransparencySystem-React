package com.agaseeyyy.transparencysystem.users;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.*;


@Repository
public interface UserRepository extends JpaRepository<Users, Integer>{
    Users findByEmail(String email);

    @Query(value = "SELECT user_id AS id, " +
    "CONCAT(last_name, ', ', first_name, ' ', middle_initial, '.') " + 
    "AS full_name, " + 
    "email, " + 
    "role, " + 
    "created_at " + 
    "FROM users", 
    nativeQuery = true)
    List<Map<String, Object>> findAllUsers();
}