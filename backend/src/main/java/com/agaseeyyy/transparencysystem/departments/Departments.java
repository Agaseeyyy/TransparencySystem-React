package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import com.agaseeyyy.transparencysystem.programs.Programs;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Departments {
    @Id
    @Column(name = "department_id", unique = true, nullable = false)
    private String departmentId;

    @Column(name = "department_name", unique = true, nullable = false)
    private String departmentName;

    @OneToMany(mappedBy = "department")
    private List<Programs> programs;

    // Constructors
    public Departments() {
    }

    public Departments(String departmentId, String departmentName) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
    }

    // Getters and Setters
    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<Programs> getPrograms() {
        return programs;
    }

    public void setPrograms(List<Programs> programs) {
        this.programs = programs;
    }
}
