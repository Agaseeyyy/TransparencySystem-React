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
@RequestMapping(path = "api/v1/")
public class ProgramController {
  private final ProgramService programService;

  public ProgramController(ProgramService programService) {
    this.programService = programService;
  }

  @GetMapping("/programs")
  public List <Programs> getPrograms() {
    return programService.getPrograms();
  }

  @PostMapping("/departments/{departmentId}/programs")
  public Programs addNewProgram(@PathVariable String departmentId,
                                @RequestBody Programs program) {
      return programService.createProgramInDepartment(departmentId, program);
  }
  
  @PutMapping("/departments/{departmentId}/programs/{programId}")
  public Programs updateProgram(@PathVariable String departmentId, 
                            @RequestBody Programs program, 
                            @PathVariable String programId) {
    return programService.editProgramInDepartment(departmentId, program, programId);
  }

  @DeleteMapping("/programs/{programId}")
  void deleteProgram(@PathVariable String programId) {
    programService.deleteProgram(programId);
  }



}
