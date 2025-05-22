package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.programs.ProgramRepository;
import com.agaseeyyy.transparencysystem.programs.Programs;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;
    private final ProgramRepository programRepository;

    public DepartmentService(DepartmentRepository departmentRepository, ProgramRepository programRepository) {
        this.departmentRepository = departmentRepository;
        this.programRepository = programRepository;
    }
  
    public Page<Departments> getDepartments(int pageNumber, int pageSize, String sortField, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        return departmentRepository.findAll(PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField)));
    }

    public List<Departments> getAllDepartments() {
        return departmentRepository.findAll(Sort.by(Sort.Direction.ASC, "departmentName"));
    }

    @Transactional
    public Departments addDepartment(Departments department) {
        if (department.getDepartmentId() == null || department.getDepartmentId().isBlank() ||
            department.getDepartmentName() == null || department.getDepartmentName().isBlank()) {
            throw new BadRequestException("Department ID and Name are required.");
        }
        if (departmentRepository.existsById(department.getDepartmentId())) {
            throw new ResourceAlreadyExistsException("Department with ID '" + department.getDepartmentId() + "' already exists.");
        }
        if (departmentRepository.existsByDepartmentName(department.getDepartmentName())) {
            throw new ResourceAlreadyExistsException("Department with Name '" + department.getDepartmentName() + "' already exists.");
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Departments updateDepartment(String oldDepartmentIdFromPath, Departments updatedDepartmentInfoFromBody) {
        if (updatedDepartmentInfoFromBody.getDepartmentId() == null || updatedDepartmentInfoFromBody.getDepartmentId().isBlank() ||
            updatedDepartmentInfoFromBody.getDepartmentName() == null || updatedDepartmentInfoFromBody.getDepartmentName().isBlank()) {
            throw new BadRequestException("Department ID and Name are required in the request body.");
        }

        String newDepartmentId = updatedDepartmentInfoFromBody.getDepartmentId();
        String newDepartmentName = updatedDepartmentInfoFromBody.getDepartmentName();

        Departments existingDepartment = departmentRepository.findById(oldDepartmentIdFromPath)
            .orElseThrow(() -> new ResourceNotFoundException("Department with ID '" + oldDepartmentIdFromPath + "' not found. Cannot update."));
    
        // Scenario 1: Department ID is changing
        if (!oldDepartmentIdFromPath.equals(newDepartmentId)) {
            // 1.1. Check if the new ID is already taken by another department.
            if (departmentRepository.existsById(newDepartmentId)) {
                throw new ResourceAlreadyExistsException("Cannot change department ID to '" + newDepartmentId + "' because it is already in use by another department.");
        }
    
            // 1.2. Check for name conflict for newDepartmentName:
            Departments departmentWithNewName = departmentRepository.findByDepartmentName(newDepartmentName);
            if (departmentWithNewName != null && !departmentWithNewName.getDepartmentId().equals(oldDepartmentIdFromPath)) {
                throw new ResourceAlreadyExistsException("Department name '" + newDepartmentName + "' is already in use by another department (ID: " + departmentWithNewName.getDepartmentId() + ").");
            }
            
            Departments newDepartmentPojo = new Departments();
            newDepartmentPojo.setDepartmentId(newDepartmentId);
            newDepartmentPojo.setDepartmentName(newDepartmentName);
            
            Departments savedNewDepartment = departmentRepository.save(newDepartmentPojo);
            departmentRepository.flush(); // Flush to persist newDepartmentPojo immediately

            List<Programs> associatedPrograms = programRepository.findByDepartmentDepartmentId(oldDepartmentIdFromPath);
            if (!associatedPrograms.isEmpty()) {
                for (Programs program : associatedPrograms) {
                    program.setDepartment(savedNewDepartment); 
                }
                programRepository.saveAll(associatedPrograms);
                programRepository.flush(); // Flush to persist program FK changes immediately
            }

            // Clear the programs collection of the old department entity before deleting it
            // to prevent unintended cascade deletion of re-parented programs.
            if (existingDepartment.getPrograms() != null) {
                existingDepartment.getPrograms().clear();
            }
            // Optionally, if using a versioned entity or need to reflect this cleared state:
            // departmentRepository.saveAndFlush(existingDepartment); // Usually not needed before a delete

            departmentRepository.delete(existingDepartment);
        
            return savedNewDepartment;

        } else { // Scenario 2: Department ID is NOT changing (oldDepartmentIdFromPath == newDepartmentId)
            // Only name might be changing.
            if (!existingDepartment.getDepartmentName().equalsIgnoreCase(newDepartmentName)) {
                // Check if the new name is already taken by *another* department (not this one).
                if (departmentRepository.existsByDepartmentNameAndDepartmentIdNot(newDepartmentName, oldDepartmentIdFromPath)) {
                    throw new ResourceAlreadyExistsException("Department name '" + newDepartmentName + "' is already in use by another department.");
                }
                existingDepartment.setDepartmentName(newDepartmentName);
            }
            return departmentRepository.save(existingDepartment);
        }
    }

    @Transactional
    public void deleteDepartment(String departmentId) {
        Departments department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department with ID '" + departmentId + "' not found."));

        if (programRepository.existsByDepartmentDepartmentId(departmentId)) {
            throw new BadRequestException("Cannot delete department '" + department.getDepartmentName() + "' (ID: " + departmentId + "). It has associated programs. Please reassign or delete them first.");
        }
        
        departmentRepository.delete(department);
    }

    @PostConstruct
    public void initializeDefaultDepartment() {
        if (departmentRepository.findByDepartmentId("CCS") == null) {
            Departments sampledept = new Departments();
            sampledept.setDepartmentId("CCS");
            sampledept.setDepartmentName("College of Computer Studies");
            departmentRepository.save(sampledept);
            System.out.println("Default department (CCS) has been created successfully!");
        } else {
            // System.out.println("Default department (CCS) already exists."); // Comment out or reduce verbosity
        }
    }
}
