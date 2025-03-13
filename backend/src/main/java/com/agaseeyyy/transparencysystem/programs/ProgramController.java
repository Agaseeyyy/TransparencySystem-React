package com.agaseeyyy.transparencysystem.programs;

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
@RequestMapping(path = "/api/v1/programs")
public class ProgramController {
  private final ProgramService programService;

  // Constructors
  public ProgramController(ProgramService programService) {
    this.programService = programService;
  }


  // REST APIs
  @GetMapping
  public List <Programs> getPrograms() {
    return programService.getAllPrograms();
  }

  @PostMapping("/departments/{departmentId}")
  public Programs addNewProgram(@PathVariable String departmentId,
                                @RequestBody Programs program) {
      return programService.addNewProgram(departmentId, program);
  }
  
  @PutMapping("/{programId}/departments/{departmentId}")
  public Programs editProgram(@PathVariable String programId,
                                @PathVariable String departmentId, 
                                @RequestBody Programs program) {
    return programService.editProgram(programId, departmentId, program);
  }

  @DeleteMapping("/{programId}")
  void deleteProgram(@PathVariable String programId) {
    programService.deleteProgram(programId);
  }



}
