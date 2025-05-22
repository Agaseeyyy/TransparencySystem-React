package com.agaseeyyy.transparencysystem.programs;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Programs, String>, JpaSpecificationExecutor<Programs> {

    // Custom query to sort by department name
    @Query("SELECT p FROM Programs p LEFT JOIN p.department d ORDER BY d.departmentName")
    Page<Programs> findAllSortByDepartmentName(Pageable pageable);
    
    @Query("SELECT p FROM Programs p LEFT JOIN p.department d ORDER BY d.departmentName DESC")
    Page<Programs> findAllSortByDepartmentNameDesc(Pageable pageable);

    List<Programs> findByDepartmentDepartmentId(String departmentId);
    boolean existsByDepartmentDepartmentId(String departmentId);
}
