package com.agaseeyyy.transparencysystem.students;


import java.time.Year;
import java.util.List;

import org.springframework.data.domain.Sort;
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

  @Query("SELECT COUNT(s) FROM Students s WHERE s.program.programId = :programId")
  Long countStudentsByProgram(@Param("programId") String programId);

  /**
   * Find students with optional filters and sorting
   * This leverages database-level operations for efficiency
   */
  @Query("SELECT s FROM Students s WHERE " +
         "(:programId IS NULL OR s.program.programId = :programId) AND " +
         "(:yearLevel IS NULL OR s.yearLevel = :yearLevel) AND " +
         "(:section IS NULL OR s.section = :section)")
  List<Students> findStudentsWithFilters(
          @Param("programId") String programId,
          @Param("yearLevel") Year yearLevel,
          @Param("section") Character section,
          Sort sort);
}