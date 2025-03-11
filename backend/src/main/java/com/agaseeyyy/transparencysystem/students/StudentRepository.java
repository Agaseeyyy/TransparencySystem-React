package com.agaseeyyy.transparencysystem.students;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Students, Long> {

  interface StudentSummary {
        String getId();
        String getFullName();
        String getEmail();
        String getRole();
        LocalDateTime getCreatedAt();
  }
} 