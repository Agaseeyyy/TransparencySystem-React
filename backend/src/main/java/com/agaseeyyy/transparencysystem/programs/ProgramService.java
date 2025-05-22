package com.agaseeyyy.transparencysystem.programs;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agaseeyyy.transparencysystem.departments.DepartmentRepository;
import com.agaseeyyy.transparencysystem.departments.Departments;
import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;

import jakarta.annotation.PostConstruct;



@Service
public class ProgramService {
    private final ProgramRepository programRepository;
    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;

    // Constructors
    public ProgramService(ProgramRepository programRepository, DepartmentRepository departmentRepository, StudentRepository studentRepository) {
        this.programRepository = programRepository;
        this.departmentRepository = departmentRepository;
        this.studentRepository = studentRepository;
    }


    // Named Methods and Business Logics
    public List <Programs> getAllPrograms() {
        return programRepository.findAll(Sort.by(Sort.Direction.ASC, "programId"));
    }

    public Page<Programs> getProgramsWithFilters(int pageNumber, int pageSize, String sortField, String sortDirection, String departmentId) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        
        // Create specification for filtering
        Specification<Programs> spec = Specification.where(null);
        // Add department filter if provided
        if (departmentId != null && !departmentId.isEmpty() && !departmentId.equals("all")) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("department").get("departmentId"), departmentId));
        }
        
        return programRepository.findAll(spec,  PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField)));
    }


    public Programs addNewProgram(String departmentId, Programs program) {
        if (program == null || program.getProgramId() == null || program.getProgramId().isBlank()) {
            throw new BadRequestException("Program details cannot be null or empty.");
        }
        if (programRepository.existsById(program.getProgramId())) {
            throw new ResourceAlreadyExistsException("Program with ID '" + program.getProgramId() + "' already exists.");
        }

        Departments department = departmentRepository.findById(departmentId).orElseThrow(
            () -> new ResourceNotFoundException("Department not found with ID: " + departmentId)
        );
        program.setDepartment(department);
        
        return programRepository.save(program);
    }


    @Transactional
    Programs editProgram(String oldProgramId, String newDepartmentId, Programs updatedProgramDetails) {
        if (updatedProgramDetails == null || updatedProgramDetails.getProgramId() == null || updatedProgramDetails.getProgramId().isBlank()) {
            throw new BadRequestException("Updated program details cannot be null or empty.");
        }

        Programs existingProgram = programRepository.findById(oldProgramId).orElseThrow(
            () -> new ResourceNotFoundException("Program not found with ID: " + oldProgramId)
        );

        Departments newDepartment = departmentRepository.findById(newDepartmentId).orElseThrow(
            () ->  new ResourceNotFoundException("Department not found with ID: " + newDepartmentId)
        );

        String newProgramId = updatedProgramDetails.getProgramId();

        // Case 1: Program ID is being changed
        if (newProgramId != null && !newProgramId.equals(oldProgramId)) {
            if (programRepository.existsById(newProgramId)) {
                throw new BadRequestException("Cannot update to Program ID '" + newProgramId + "' as it already exists. Choose a different ID.");
            }

            // Create and save the new program entity
            Programs newProgramInstance = new Programs();
            newProgramInstance.setProgramId(newProgramId);
            newProgramInstance.setProgramName(updatedProgramDetails.getProgramName());
            newProgramInstance.setDepartment(newDepartment);
            programRepository.save(newProgramInstance); 

            // Update students
            List<Students> studentsToUpdate = studentRepository.findByProgramProgramId(oldProgramId);
            for (Students student : studentsToUpdate) {
                student.setProgram(newProgramInstance); 
            }
            if (!studentsToUpdate.isEmpty()) {
                studentRepository.saveAll(studentsToUpdate); // Batch save students
            }

            // Delete the old program
            programRepository.delete(existingProgram);
            
            return newProgramInstance;

        } else { // Case 2: Program ID is not changing, or newProgramId is null (treat as no change to ID)
            existingProgram.setProgramName(updatedProgramDetails.getProgramName());
            existingProgram.setDepartment(newDepartment);
            // Ensure the ID remains the oldProgramId if not explicitly changed.
            existingProgram.setProgramId(oldProgramId); 

        return programRepository.save(existingProgram);
        }
    }
    

    void deleteProgram(String programId) {
        if(!programRepository.existsById(programId)) {
            throw new ResourceNotFoundException("Program not found with ID: " + programId);
        }
        long studentCount = studentRepository.countStudentsByProgram(programId);
        if (studentCount > 0) {
            throw new BadRequestException("Cannot delete Program '" + programId + "'. It is currently associated with " + studentCount + " student(s). Please reassign or remove the students first.");
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
