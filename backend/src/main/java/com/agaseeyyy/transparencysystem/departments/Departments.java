package com.agaseeyyy.transparencysystem.departments;

import java.util.List;

import com.agaseeyyy.transparencysystem.programs.Programs;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Departments {
  @Id
  @Column(name = "department_id", nullable = false)
  private String departmentId;

  @Column(name = "department_name", nullable = false)
  private String departmentName;

  @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
  private List<Programs> programs;


  public Departments() {
  }

  public Departments(String departmentId, String departmentName) {
    this.departmentId = departmentId;
    this.departmentName = departmentName;
  }

  public String getDepartmentId() {
    return this.departmentId;
  }

  public void setDepartmentId(String departmentId) {
    this.departmentId = departmentId;
  }

  public String getDepartmentName() {
    return this.departmentName;
  }

  public void setDepartmentName(String departmentName) {
    this.departmentName = departmentName;
  }


}
