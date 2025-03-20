package com.agaseeyyy.transparencysystem.students;


import java.time.Year;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Students, Long> {
  @Query("SELECT s FROM Students s WHERE s.program.programId = :programId AND s.yearLevel = :yearLevel AND s.section = :section")
    List<Students> findStudentsByTreasurerDetails(
      @Param("programId") String programId, 
      @Param("yearLevel") Year yearLevel, 
      @Param("section") Character section
    );
} 