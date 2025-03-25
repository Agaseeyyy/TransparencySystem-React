package com.agaseeyyy.transparencysystem.students;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Year;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping(path = "/api/v1/students")
public class StudentController {
  private final StudentService studentService;

  // Constructors
  public StudentController(StudentService studentService) {
    this.studentService = studentService;
  }

  //REST APIs
  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public List <Students> displayAllStudents() {
    return studentService.getAllStudents();
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
  
  @GetMapping("/table")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
  public ResponseEntity<?> getTableData(
          @RequestParam(required = false) String program,
          @RequestParam(required = false) String yearLevel,
          @RequestParam(required = false) String section,
          @RequestParam(required = false, defaultValue = "lastName") String sortBy,
          @RequestParam(required = false, defaultValue = "asc") String sortDir) {
      
      try {
          // Create sort object - always provide a default sort
          Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                  Sort.by(sortBy).descending() : 
                  Sort.by(sortBy).ascending();
          
          // Set null for "all" values
          String programFilter = "all".equals(program) ? null : program;
          String yearLevelFilter = "all".equals(yearLevel) ? null : yearLevel;
          String sectionFilter = "all".equals(section) ? null : section;
          
          // Get data using the service method
          List<Students> students = studentService.getTableData(
                  programFilter, yearLevelFilter, sectionFilter, sort);
          
          return ResponseEntity.ok(Map.of(
              "success", true,
              "message", "Students retrieved successfully",
              "data", students
          ));
      } catch (Exception e) {
          return ResponseEntity.badRequest().body(Map.of(
              "success", false,
              "message", "Error retrieving students: " + e.getMessage()
          ));
      }
  }
}
