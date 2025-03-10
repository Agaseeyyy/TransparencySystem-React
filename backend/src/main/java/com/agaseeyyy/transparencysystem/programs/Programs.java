package com.agaseeyyy.transparencysystem.programs;

import com.agaseeyyy.transparencysystem.departments.Departments;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "programs")
@JsonIgnoreProperties({"department"})
public class Programs {
  @Id
  @Column(name = "program_id")
  private String programId;

  @Column(name = "program_name", nullable = false)
  private String programName;
  
  @ManyToOne
  @JoinColumn(name = "department_id", nullable = false)
  private Departments department ;

  @JsonProperty("departmentId")
  public String getDepartmentId() {
    return department != null ? department.getDepartmentId() : null;
  }


  public Programs() {
  }

  public Programs(String programId, String programName, Departments department) {
    this.programId = programId;
    this.programName = programName;
    this.department = department;
  }

  public String getProgramId() {
    return this.programId;
  }

  public void setProgramId(String programId) {
    this.programId = programId;
  }

  public String getProgramName() {
    return this.programName;
  }

  public void setProgramName(String programName) {
    this.programName = programName;
  }

  public Departments getDepartment() {
    return this.department;
  }

  public void setDepartment(Departments department) {
    this.department = department;
  }

}
