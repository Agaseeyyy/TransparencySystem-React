package com.agaseeyyy.transparencysystem.programs;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.departments.DepartmentRepository;
import com.agaseeyyy.transparencysystem.departments.Departments;

import jakarta.annotation.PostConstruct;



@Service
public class ProgramService {
  private final ProgramRepository programRepository;
  private final DepartmentRepository departmentRepository;

  // Constructors
  public ProgramService(ProgramRepository programRepository, DepartmentRepository departmentRepository) {
    this.programRepository = programRepository;
    this.departmentRepository = departmentRepository;
  }


  // Named Methods and Business Logics
  public List <Programs> getAllPrograms() {
    return programRepository.findAll();
  }


  public Programs addNewProgram(String departmentId, Programs program) {
    if (program == null) {
      throw new RuntimeException("Failed to add new program!");
    }

    Departments department = departmentRepository.findById(departmentId).orElseThrow(
      () -> new RuntimeException("Department not found with id " + departmentId)
    );
    program.setDepartment(department);
    
    return programRepository.save(program);
  }


  Programs editProgram(String programId, String departmentId, Programs updatedProgram) {
    Programs existingProgram = programRepository.findById(programId).orElseThrow(
      () -> new RuntimeException("Program not found with id " + programId)
    );
    Departments updatedDepartment = departmentRepository.findById(departmentId).orElseThrow(
      () ->  new RuntimeException("Department not found with id " + departmentId)
    );

    existingProgram.setProgramName(updatedProgram.getProgramName());
    existingProgram.setDepartment(updatedDepartment);
    return programRepository.save(existingProgram);
  }
  

  void deleteProgram(String programId) {
    if(!programRepository.existsById(programId)) {
      throw new RuntimeException("Program not found with id " + programId);
    }
    
    programRepository.deleteById(programId);
  }
  

  @PostConstruct
  public void initializeDefaultProgram() {
    try {
        // Get the CCS department first
        Departments ccsDepartment = departmentRepository.findByDepartmentId("CCS");
        
        if (ccsDepartment != null) {
            // Define default programs to create
            List<String[]> defaultPrograms = List.of(
                new String[]{"BSIT", "BS Information Technology"},
                new String[]{"BSCS", "BS Computer Science"},
                new String[]{"BSIS", "BS Information Systems"}
            );
            
            int createdCount = 0;
            
            // Create each program if it doesn't exist
            for (String[] programInfo : defaultPrograms) {
                String programId = programInfo[0];
                String programName = programInfo[1];
                
                if (programRepository.findById(programId).isEmpty()) {
                    Programs program = new Programs();
                    program.setProgramId(programId);
                    program.setProgramName(programName);
                    program.setDepartment(ccsDepartment);
                    
                    programRepository.save(program);
                    createdCount++;
                    System.out.println("Default program (" + programId + ") created successfully!");
                } else {
                    System.out.println("Default program (" + programId + ") already exists.");
                }
            }
            
            if (createdCount > 0) {
                System.out.println("Created " + createdCount + " default programs for CCS department");
            } else {
                System.out.println("All default programs already exist.");
            }
        } else {
            System.out.println("Could not create default programs: CCS department not found");
        }
    } catch (Exception e) {
        System.err.println("Error creating default programs: " + e.getMessage());
        e.printStackTrace();
    }
  }
}
