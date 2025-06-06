package com.agaseeyyy.transparencysystem.departments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends  JpaRepository<Departments, String> {
    Departments findByDepartmentId(String departmentId);
    Departments findByDepartmentName(String departmentName);
    boolean existsByDepartmentName(String departmentName);
    boolean existsByDepartmentNameAndDepartmentIdNot(String departmentName, String departmentId);
} 
