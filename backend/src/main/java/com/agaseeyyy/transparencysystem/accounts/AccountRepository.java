package com.agaseeyyy.transparencysystem.accounts;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface AccountRepository extends JpaRepository<Accounts, Integer>{
    Accounts findByEmail(String email);
    boolean existsByEmail(String email);

    // @Query(value = "SELECT user_id AS id, " +
    // "CONCAT(last_name, ', ', first_name, ' ', middle_initial, '.') " + 
    // "AS full_name, " + 
    // "email, " + 
    // "role, " + 
    // "created_at " + 
    // "FROM users", 
    // nativeQuery = true)
    // List<Map<String, Object>> findAllUsers();
}