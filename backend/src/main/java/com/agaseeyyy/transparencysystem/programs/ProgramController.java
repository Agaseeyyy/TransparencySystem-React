package com.agaseeyyy.transparencysystem.programs;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping(path = "api/v1")
public class ProgramController {
  private final ProgramService programService;

  public ProgramController(ProgramService programService) {
    this.programService = programService;
  }

  @GetMapping
  public List <Programs> getPrograms() {
      return programService.getPrograms();
  }
  

  @PostMapping("/departments/{departmentId}/programs")
    public ResponseEntity<Programs> createProgramInDepartment(
            @PathVariable String departmentId,
            @RequestBody Programs program) {
        try {
            Programs newProgram = programService.createProgramInDepartment(departmentId, program);
            return new ResponseEntity<>(newProgram, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

}
