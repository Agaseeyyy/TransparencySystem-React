package com.agaseeyyy.transparencysystem.students;

import java.time.Year;
import java.util.List;

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

}
