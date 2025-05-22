package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentsController {
    private final DepartmentService departmentService;

    public DepartmentsController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<Page<Departments>> getDepartments(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "departmentId") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        Page<Departments> departments = departmentService.getDepartments(pageNumber, pageSize, sortField, sortDirection);
        return ResponseEntity.ok(departments);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Departments>> getAllDepartments() {
        List<Departments> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @PostMapping
    public ResponseEntity<Departments> addDepartment(@RequestBody Departments department) {
        Departments newDepartment = departmentService.addDepartment(department);
        return new ResponseEntity<>(newDepartment, HttpStatus.CREATED);
    }

    @PutMapping("/{oldDepartmentId}")
    public ResponseEntity<Departments> updateDepartment(@PathVariable String oldDepartmentId, @RequestBody Departments updatedDepartmentInfo) {
        Departments department = departmentService.updateDepartment(oldDepartmentId, updatedDepartmentInfo);
        return ResponseEntity.ok(department);
    }

    @DeleteMapping("/{departmentId}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable String departmentId) {
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.noContent().build();
    } 
}
