package com.agaseeyyy.transparencysystem.students;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;


@RestController
@RequestMapping(path = "/api/v1")
public class StudentController {
  private final StudentService studentService;

  // Constructor
  public StudentController(StudentService studentService) {
    this.studentService = studentService;
  }

  //REST API
  @GetMapping("/students")
  public List <Students> displayAllStudents() {
    return studentService.getAllStudents();
  }

  @PostMapping("/students/programs/{programId}")
  public Students addNewStudent(@PathVariable String programId, 
                                @RequestBody Students student) {
    return studentService.addNewStudent(student, programId);
  }

  @PutMapping("/students/{studentId}/programs/{programId}")
  public Students editStudent(@PathVariable Long studentId, 
                              @PathVariable String programId, 
                              @RequestBody Students student) {
    return studentService.editStudent(student, studentId, programId);
  }

  @DeleteMapping("/students/{studentId}")
  public void deleteStudent(@PathVariable Long studentId) {
    studentService.deleteStudent(studentId);
  }
  
}
