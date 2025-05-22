package com.agaseeyyy.transparencysystem.students;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Year;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping(path = "/api/v1/students")
public class StudentController {
    private final StudentService studentService;

    // Constructors
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    //REST API Endpoints
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public List<Students> displayStudents() {
        return studentService.getStudents();
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<Page<Students>> getStudents(
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "lastName") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.fromString(sortDirection), sortField));
        Page<Students> students = studentService.getStudents(program, yearLevel, section, status, pageable);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/without-accounts")
    @PreAuthorize("hasAuthority('Admin')")
    public List<Students> displayStudentsWithoutAccounts() {
        return studentService.getStudentsWithoutAccounts();
    }

    @GetMapping("/programs/{programCode}/{yearLevel}/{section}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public List <Students> displayStudentsByTreasurerDeets(@PathVariable String programCode, 
                                                          @PathVariable Year yearLevel, 
                                                          @PathVariable Character section) {
        return studentService.getStudentsByTreasurerDeets(programCode, yearLevel, section);
    }

    @PostMapping("/programs/{programId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Students addNewStudent(@PathVariable String programId, 
                                @RequestBody Students student) {
        return studentService.addNewStudent(student, programId);
    }

    @PutMapping("/{studentId}/programs/{programId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Students editStudent(@PathVariable Long studentId, 
                              @PathVariable String programId, 
                              @RequestBody Students student) {
        return studentService.editStudent(student, studentId, programId);
    }
    
    @DeleteMapping("/{studentId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public void deleteStudent(@PathVariable Long studentId) {
        studentService.deleteStudent(studentId);
    }
    

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<?> countStudentsByFilters(
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section) {
        
        try {
            // If program is "all", set it to null for the service method
            String programFilter = "all".equals(program) ? null : program;
            String yearLevelFilter = "all".equals(yearLevel) ? null : yearLevel;
            String sectionFilter = "all".equals(section) ? null : section;
            
            // Use the existing filter method but just return the count
            List<Students> filteredStudents = studentService.getStudentsByFilters(
                programFilter, yearLevelFilter, sectionFilter);
            
            return ResponseEntity.ok(Map.of("count", filteredStudents.size()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Error counting students: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/report")
    public ResponseEntity<List<Students>> getStudentsReport(
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "lastName") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        List<Students> students = studentService.generateStudentReport(program, yearLevel, section, status, sort);
        return ResponseEntity.ok(students);
    }
}
