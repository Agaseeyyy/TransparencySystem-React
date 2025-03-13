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
            if (programRepository.findById("BSIT").isEmpty()) {
                // Get the CCS department first
                Departments ccsDepartment = departmentRepository.findByDepartmentId("CCS");
                
                if (ccsDepartment != null) {
                    Programs defaultProgram = new Programs();
                    defaultProgram.setProgramId("BSIT");
                    defaultProgram.setProgramName("BS Information Technology");
                    defaultProgram.setDepartment(ccsDepartment);
                    
                    programRepository.save(defaultProgram);
                    System.out.println("Default program (BSIT) created successfully!");
                } else {
                    System.out.println("Could not create default program: CCS department not found");
                }
            } else {
                System.out.println("Default program (BSIT) already exists.");
            }
        } catch (Exception e) {
            System.err.println("Error creating default program: " + e.getMessage());
            e.printStackTrace();
        }
    }
    


 
}
