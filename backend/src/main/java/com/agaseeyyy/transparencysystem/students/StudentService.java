package com.agaseeyyy.transparencysystem.students;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.programs.ProgramRepository;
import com.agaseeyyy.transparencysystem.programs.Programs;

import jakarta.annotation.PostConstruct;

@Service
public class StudentService {
    private final StudentRepository studentRepository;
    private final ProgramRepository programRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;

    // Constructor
    public StudentService(StudentRepository studentRepository, 
                          ProgramRepository programRepository, 
                          AccountRepository accountRepository, 
                          PaymentRepository paymentRepository) {
        this.studentRepository = studentRepository;
        this.programRepository = programRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
    }


    // Named Methods and Business Logics
    public List<Students> getStudents() {
        return studentRepository.findAll(Sort.by("lastName").ascending());
    }

    public Page<Students> getStudents(
        String program,
        String yearLevel,
        String section,
        String status,
        Pageable pageable
    ) {
        Specification<Students> spec = StudentSpecification.filterBy(program, yearLevel, section, status);
        return studentRepository.findAll(spec, pageable);
    }

    public List<Students> getStudentsWithoutAccounts() {
        return studentRepository.findByAccountIsNull();
    }

    public List<Students> getStudentsByTreasurerDeets(String programCode, Year yearLevel, Character section) {
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

    // Add new student
    @Transactional
    public Students addNewStudent(Students newStudent, String programId) {
        if (newStudent == null || newStudent.getStudentId() == null) {
            throw new BadRequestException("Student ID is required.");
        }
        if (newStudent.getFirstName() == null || newStudent.getFirstName().isBlank() || 
            newStudent.getLastName() == null || newStudent.getLastName().isBlank() ||
            newStudent.getEmail() == null || newStudent.getEmail().isBlank()) {
            throw new BadRequestException("First Name, Last Name, and Email are required.");
        }

        if (studentRepository.existsById(newStudent.getStudentId())) {
            throw new ResourceAlreadyExistsException("Student with ID " + newStudent.getStudentId() + " already exists.");
        }
        // Check for duplicate email before saving
        if (studentRepository.existsByEmail(newStudent.getEmail())) {
            throw new ResourceAlreadyExistsException("Student with email '" + newStudent.getEmail() + "' already exists.");
        }
        
        Programs program = programRepository.findById(programId).orElseThrow(
            () -> new ResourceNotFoundException("Program not found with ID: " + programId)
        );
        
        newStudent.setProgram(program);
        return studentRepository.save(newStudent);
    }

    // Edit student
    @Transactional
    public Students editStudent(Students updatedStudent, Long studentIdFromPath, String programId) {
        if (updatedStudent == null || updatedStudent.getStudentId() == null) {
            throw new BadRequestException("Student ID in request body is required.");
        }
         if (updatedStudent.getFirstName() == null || updatedStudent.getFirstName().isBlank() || 
            updatedStudent.getLastName() == null || updatedStudent.getLastName().isBlank() ||
            updatedStudent.getEmail() == null || updatedStudent.getEmail().isBlank()) {
            throw new BadRequestException("First Name, Last Name, and Email are required.");
        }

        if (!studentIdFromPath.equals(updatedStudent.getStudentId())) {
            throw new BadRequestException("Student ID in path (" + studentIdFromPath + ") does not match Student ID in request body (" + updatedStudent.getStudentId() + "). Updating Student ID is not allowed via this endpoint.");
        }

        Students existingStudent = studentRepository.findById(studentIdFromPath).orElseThrow(
            () -> new ResourceNotFoundException("Student not found with ID: " + studentIdFromPath)
        );
        
        // Check for duplicate email only if the email is being changed
        if (!existingStudent.getEmail().equalsIgnoreCase(updatedStudent.getEmail())) {
            if (studentRepository.existsByEmailAndStudentIdNot(updatedStudent.getEmail(), studentIdFromPath)) {
                throw new ResourceAlreadyExistsException("Another student with email '" + updatedStudent.getEmail() + "' already exists.");
            }
        }

        Programs program = programRepository.findById(programId).orElseThrow(
            () -> new ResourceNotFoundException("Program not found with ID: " + programId)
        );

        existingStudent.setLastName(updatedStudent.getLastName());
        existingStudent.setFirstName(updatedStudent.getFirstName());
        existingStudent.setMiddleInitial(updatedStudent.getMiddleInitial());
        existingStudent.setEmail(updatedStudent.getEmail());
        existingStudent.setYearLevel(updatedStudent.getYearLevel());
        existingStudent.setSection(updatedStudent.getSection());
        existingStudent.setStatus(updatedStudent.getStatus());
        existingStudent.setProgram(program);

        return studentRepository.save(existingStudent);
    }

    // Delete student
    @Transactional
    public void deleteStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with ID: " + studentId);
        }

        // Check for associated accounts
        if (accountRepository.existsByStudentStudentId(studentId)) {
            throw new BadRequestException("Cannot delete student. Student ID " + studentId + " has an associated account. Please remove the account first.");
        }

        // Check for associated payments
        if (paymentRepository.existsByStudentStudentId(studentId)) {
            throw new BadRequestException("Cannot delete student. Student ID " + studentId + " has associated payment records. Please remove payment records first.");
        }
        
        studentRepository.deleteById(studentId);
    }

    public List<Students> generateStudentReport(
        String program,
        String yearLevel,
        String section,
        String status,
        Sort sort
    ) {
        Specification<Students> spec = StudentSpecification.filterBy(program, yearLevel, section, status);
        return studentRepository.findAll(spec, sort);
    }

    // // Initialize default student
    // @PostConstruct
    // public void initializeDefaultStudent() {
    //     try {
    //         if (studentRepository.findById(202000001L).isEmpty()) {
    //             // Get the BSIT program first
    //             Programs bsitProgram = programRepository.findById("BSIT").orElse(null);
                
    //             if (bsitProgram != null) {
    //                 Students defaultStudent = new Students();
    //                 defaultStudent.setStudentId(202000001L);
    //                 defaultStudent.setLastName("Dela Cruz");
    //                 defaultStudent.setFirstName("Juan");
    //                 defaultStudent.setMiddleInitial('D');
    //                 defaultStudent.setEmail("juan.delacruz@student.cspc.edu.ph");
    //                 defaultStudent.setProgram(bsitProgram);
    //                 defaultStudent.setYearLevel(Year.of(4));
    //                 defaultStudent.setSection('A');
    //                 defaultStudent.setStatus(Students.Status.Active);
                    
    //                 studentRepository.save(defaultStudent);
    //                 System.out.println("Default student created successfully!");
                    
    //                 // Generate 200 random students
    //                 generateRandomStudents();
    //             } else {
    //                 System.out.println("Could not create default student: BSIT program not found");
    //             }
    //         } else {
    //             System.out.println("Default student already exists.");
                
    //             // Check if we need to generate random students
    //             if (studentRepository.count() < 200) {
    //                 generateRandomStudents();
    //             }
    //         }
    //     } catch (Exception e) {
    //         System.err.println("Error creating default student: " + e.getMessage());
    //         e.printStackTrace();
    //     }
    // }

    // /**
    //  * Generates 200 random students for testing purposes
    //  */
    // private void generateRandomStudents() {
    //     try {
    //         System.out.println("Generating 200 random students...");
    //         Random random = new Random();
    //         List<Programs> availablePrograms = programRepository.findAll();
            
    //         if (availablePrograms.isEmpty()) {
    //             System.err.println("No programs available to assign to students");
    //             return;
    //         }
            
    //         // Sample data for random generation
    //         String[] firstNames = {
    //             "John", "Jane", "Michael", "Sarah", "David", "Emily", "Daniel", "Sofia", "Matthew", "Olivia",
    //             "Joshua", "Emma", "Andrew", "Ava", "Christopher", "Mia", "Ryan", "Isabella", "Joseph", "Sophia",
    //             "Maria", "Carlos", "Ana", "Miguel", "Gabriela", "Jose", "Carmen", "Juan", "Laura", "Pedro",
    //             "Diego", "Valentina", "Fernando", "Camila", "Alejandro", "Lucia", "Eduardo", "Isabella", "Javier", "Elena"
    //         };
            
    //         String[] lastNames = {
    //             "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    //             "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    //             "Reyes", "Santos", "Cruz", "Diaz", "Gonzales", "Torres", "Flores", "Rivera", "Perez", "Ramirez",
    //             "Ramos", "De la Cruz", "Bautista", "Castro", "Fernandez", "Mendoza", "Castillo", "Morales", "Aquino", "Villanueva"
    //         };
            
    //         // Generate student IDs starting from a base year
    //         int baseYear = 2020;
    //         int currentYear = Year.now().getValue();
    //         int digit = 2; // Starting digit after default student
    //         int studentsCreated = 0;
            
    //         while (studentsCreated < 200) {
    //             // Generate a random student ID with format: YYYY00001, YYYY00002, etc.
    //             int randomYearOffset = random.nextInt(currentYear - baseYear + 1);
    //             int year = baseYear + randomYearOffset;
    //             Long studentId = Long.parseLong(year + String.format("%05d", digit++));
                
    //             // Skip if student ID already exists
    //             if (studentRepository.existsById(studentId)) {
    //                 continue;
    //             }
                
    //             Students student = new Students();
                
    //             // Random name
    //             String firstName = firstNames[random.nextInt(firstNames.length)];
    //             String lastName = lastNames[random.nextInt(lastNames.length)];
    //             char middleInitial = (char) ('A' + random.nextInt(26));
                
    //             // Random program
    //             Programs program = availablePrograms.get(random.nextInt(availablePrograms.size()));
                
    //             // Random year level (1-4)
    //             int yearLevel = random.nextInt(4) + 1;
                
    //             // Random section (A-F)
    //             char section = (char) ('A' + random.nextInt(6));
                
    //             // Random status (mostly active)
    //             Students.Status status;
    //             int statusRandom = random.nextInt(10);
    //             if (statusRandom < 8) {
    //                 status = Students.Status.Active;
    //             } else if (statusRandom < 9) {
    //                 status = Students.Status.Inactive;
    //             } else {
    //                 status = Students.Status.Graduated;
    //             }
                
    //             // Set student properties
    //             student.setStudentId(studentId);
    //             student.setFirstName(firstName);
    //             student.setLastName(lastName);
    //             student.setMiddleInitial(middleInitial);
    //             student.setEmail(firstName.toLowerCase() + "." + lastName.toLowerCase() + "@student.cspc.edu.ph");
    //             student.setProgram(program);
    //             student.setYearLevel(Year.of(yearLevel));
    //             student.setSection(section);
    //             student.setStatus(status);
                
    //             // Save student to database
    //             studentRepository.save(student);
    //             studentsCreated++;
                
    //             if (studentsCreated % 20 == 0) {
    //                 System.out.println("Generated " + studentsCreated + " students so far...");
    //             }
    //         }
            
    //         System.out.println("Successfully generated 200 random students");
    //     } catch (Exception e) {
    //         System.err.println("Error generating random students: " + e.getMessage());
    //         e.printStackTrace();
    //     }
    // }

}
