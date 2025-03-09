package com.agaseeyyy.transparencysystem.programs;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.departments.DepartmentRepository;



@Service
public class ProgramService {
  private final ProgramRepository programRepository;
  private final DepartmentRepository departmentRepository;

  public ProgramService(ProgramRepository programRepository, DepartmentRepository departmentRepository) {
    this.programRepository = programRepository;
    this.departmentRepository = departmentRepository;
  }

  public List <Programs> getPrograms() {
    return programRepository.findAll();
  }

  public Programs createProgramInDepartment(String departmentId, Programs program) {
    return departmentRepository.findById(departmentId).map(department -> {
        program.setDepartment(department);
        return programRepository.save(program);
    }).orElseThrow(() -> new RuntimeException("Department not found with id " + departmentId));
}


 
}
