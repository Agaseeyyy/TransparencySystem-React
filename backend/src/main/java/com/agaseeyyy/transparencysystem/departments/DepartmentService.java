package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jakarta.annotation.PostConstruct;

@Service
public class DepartmentService {
  private final DepartmentRepository departmentRepository;

  public DepartmentService(DepartmentRepository departmentRepository) {
    this.departmentRepository = departmentRepository;
  }
  
  public List <Departments> getAllDepartments() {
    return departmentRepository.findAll();
  }

  public Departments addDepartment(Departments department) {
    return departmentRepository.save(department);
  }

  public Departments updateDepartment(Departments updatedDepartment, String departmentId) {
    // First check if the original department exists
    if(!departmentRepository.existsById(departmentId)) { 
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department ID " + departmentId + " does not exist!");
    }
    
    // Check if we're trying to change the ID
    boolean isChangingId = !departmentId.equals(updatedDepartment.getDepartmentId());
    
    // If changing ID, check if the new ID already exists
    if (isChangingId && departmentRepository.existsById(updatedDepartment.getDepartmentId())) {
        throw new ResponseStatusException(HttpStatus.CONFLICT, 
            "Cannot update department ID to " + updatedDepartment.getDepartmentId() + 
            " because it already exists!");
    }
    
    if (isChangingId) {
        // Handle ID change by creating a new entity and deleting the old one
        
        // First get the existing department
        Departments existingDepartment = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
        
        // Create a new department with the new ID but same data
        Departments newDepartment = new Departments();
        newDepartment.setDepartmentId(updatedDepartment.getDepartmentId());
        newDepartment.setDepartmentName(updatedDepartment.getDepartmentName());
        
        // Save the new department
        departmentRepository.save(newDepartment);
        
        // Delete the old department
        departmentRepository.deleteById(departmentId);
        
        return newDepartment;
    } else {
        // No ID change, just regular update
        Departments existingDepartment = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found"));
        
        // Update only the name
        existingDepartment.setDepartmentName(updatedDepartment.getDepartmentName());
        
        // Save and return
        return departmentRepository.save(existingDepartment);
    }
}

  public void deleteDepartment(String departmentId) {
    if (!departmentRepository.existsById(departmentId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department ID with " + departmentId + " does not exist!");
    }
    departmentRepository.deleteById(departmentId);
  }


  @PostConstruct
    public void initializeDefaultDepartment() {
        // Check if department already exists
        if (departmentRepository.findByDepartmentId("CCS") == null) {
            Departments sampledept = new Departments();
            sampledept.setDepartmentId("CCS");
            sampledept.setDepartmentName("College of Computer Studies");
            
            departmentRepository.save(sampledept);
            System.out.println("Default department (CCS) has been created successfully!");
        } else {
            System.out.println("Default department (CCS) already exists.");
        }
    }
}
