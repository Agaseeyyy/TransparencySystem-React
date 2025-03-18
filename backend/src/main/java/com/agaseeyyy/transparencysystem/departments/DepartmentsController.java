package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;



@RestController
@RequestMapping(path = "api/v1/departments")
public class DepartmentsController {
  private final DepartmentService departmentService;

  public DepartmentsController(DepartmentService departmentService) {
    this.departmentService = departmentService;
  }

  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public List<Departments> getDepartments() {
    return departmentService.getAllDepartments();
  }

  @PostMapping
  @PreAuthorize("hasAuthority('Admin')")
  public Departments addNewDepartment(@RequestBody Departments department) {
      return departmentService.addDepartment(department);
  }

  @PreAuthorize("hasAuthority('Admin')")
  @PutMapping(path = "/{departmentId}")
  public Departments updateDepartment(@PathVariable String departmentId, @RequestBody Departments department) {
      return departmentService.updateDepartment(department, departmentId);
  }

  @PreAuthorize("hasAuthority('Admin')")
  @DeleteMapping(path = "{departmentId}")
  public void deleteDepartment(@PathVariable String departmentId) {
    departmentService.deleteDepartment(departmentId);
  } 
  
}
