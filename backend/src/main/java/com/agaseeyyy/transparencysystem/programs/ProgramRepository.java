package com.agaseeyyy.transparencysystem.programs;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramRepository extends JpaRepository<Programs, String> {
  List<Programs> findByDepartmentDepartmentId(String departmentId);
}
