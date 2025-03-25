package com.agaseeyyy.transparencysystem.students;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.programs.ProgramRepository;
import com.agaseeyyy.transparencysystem.programs.Programs;

import jakarta.annotation.PostConstruct;

@Service
public class StudentService {
  private final StudentRepository studentRepository;
  private final ProgramRepository programRepository;

  // Constructor
  public StudentService(StudentRepository studentRepository, ProgramRepository programRepository) {
    this.studentRepository = studentRepository;
    this.programRepository = programRepository;
  }


  // Named Methods and Business Logics
  public List <Students> getAllStudents() {
    return studentRepository.findAll();
  }

  public List <Students> getStudentsByTreasurerDeets(String programCode, Year yearLevel, Character section) {
    return studentRepository.findStudentsByTreasurerDetails(programCode, yearLevel, section);
  }

  public List<Students> getStudentsByFilters(String program, String yearLevel, String section) {
    List<Students> filteredStudents = new ArrayList<>(studentRepository.findAll());
    
    // Apply program filter if provided
    if (program != null && !program.isEmpty()) {
        filteredStudents = filteredStudents.stream()
            .filter(student -> student.getProgram() != null && 
                    program.equals(student.getProgram().getProgramId()))
            .collect(Collectors.toList());
    }
    
    // Apply year level filter if provided
    if (yearLevel != null && !yearLevel.isEmpty()) {
        try {
            int year = Integer.parseInt(yearLevel);
            filteredStudents = filteredStudents.stream()
                .filter(student -> student.getYearLevel() != null && 
                        year == Integer.parseInt(student.getYearLevel().toString()))
                .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            // Invalid year format, ignore this filter
        }
    }
    
    // Apply section filter if provided
    if (section != null && !section.isEmpty() && section.length() == 1) {
        char sectionChar = section.toUpperCase().charAt(0);
        filteredStudents = filteredStudents.stream()
            .filter(student -> student.getSection() == sectionChar)
            .collect(Collectors.toList());
    }
    
    return filteredStudents;
  }


  public Students addNewStudent(Students newStudent, String programId) {
    Programs program = programRepository.findById(programId).orElse(null);
    
    if (program == null) {
      throw new RuntimeException("Program not found with id " + programId);
    }
    
    newStudent.setProgram(program);
    return studentRepository.save(newStudent);
  }


  public Students editStudent(Students updatedStudent, Long studentId, String programId) {
    Students existingStudent = studentRepository.findById(studentId).orElseThrow(
      () -> new RuntimeException("Student not found with id " + studentId)
    );
    Programs program = programRepository.findById(programId).orElseThrow(
      () -> new RuntimeException("Program not found with id " + programId)
    );
  
    existingStudent.setLastName(updatedStudent.getLastName());
    existingStudent.setFirstName(updatedStudent.getFirstName());
    existingStudent.setMiddleInitial(updatedStudent.getMiddleInitial());
    existingStudent.setEmail(updatedStudent.getEmail());
    existingStudent.setProgram(updatedStudent.getProgram());
    existingStudent.setYearLevel(updatedStudent.getYearLevel());
    existingStudent.setStatus(updatedStudent.getStatus());
    existingStudent.setProgram(program);

    return studentRepository.save(updatedStudent);
  }


  public void deleteStudent(Long studentId) {
    if (!studentRepository.existsById(studentId)) {
      throw new RuntimeException("Student not found with id " + studentId);
    }
    studentRepository.deleteById(studentId);
  }

  @PostConstruct
    public void initializeDefaultStudent() {
        try {
            if (studentRepository.findById(202000001L).isEmpty()) {
                // Get the BSIT program first
                Programs bsitProgram = programRepository.findById("BSIT").orElse(null);
                
                if (bsitProgram != null) {
                    Students defaultStudent = new Students();
                    defaultStudent.setStudentId(202000001L);
                    defaultStudent.setLastName("Dela Cruz");
                    defaultStudent.setFirstName("Juan");
                    defaultStudent.setMiddleInitial('D');
                    defaultStudent.setEmail("juan.delacruz@student.cspc.edu.ph");
                    defaultStudent.setProgram(bsitProgram);
                    defaultStudent.setYearLevel(Year.of(4));
                    defaultStudent.setSection('A');
                    defaultStudent.setStatus(Students.Status.Active);
                    
                    studentRepository.save(defaultStudent);
                    System.out.println("Default student created successfully!");
                } else {
                    System.out.println("Could not create default student: BSIT program not found");
                }
            } else {
                System.out.println("Default student already exists.");
            }
        } catch (Exception e) {
            System.err.println("Error creating default student: " + e.getMessage());
            e.printStackTrace();
        }
    }

  /**
   * Get students with optional filtering and sorting
   * Uses database operations for better performance
   *
   * @param program Program ID filter (null for all)
   * @param yearLevel Year level filter (null for all) 
   * @param section Section filter (null for all)
   * @param sort Sort specification
   * @return List of filtered and sorted students
   */
  public List<Students> getTableData(
          String program, 
          String yearLevel, 
          String section, 
          Sort sort) {
      
      // Convert yearLevel string to Year object if present
      Year yearObj = null;
      if (yearLevel != null && !yearLevel.isEmpty()) {
          try {
              yearObj = Year.of(Integer.parseInt(yearLevel));
          } catch (NumberFormatException e) {
              // Invalid year format, ignore this filter
          }
      }
      
      // Convert section string to Character if present
      Character sectionChar = null;
      if (section != null && !section.isEmpty()) {
          sectionChar = section.toUpperCase().charAt(0);
      }
      
      // Use repository method to get filtered and sorted students
      return studentRepository.findStudentsWithFilters(
              program, yearObj, sectionChar, sort);
  }

}
