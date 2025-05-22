package com.agaseeyyy.transparencysystem.programs;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
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


    // REST API Endpoints
    @GetMapping
    public Page<Programs> displayPrograms(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "programId") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String departmentId) {
        return programService.getProgramsWithFilters(pageNumber, pageSize, sortField, sortDirection, departmentId);
    }

    @PostMapping("/departments/{departmentId}")
    public Programs addNewProgram(@PathVariable String departmentId,
                                  @RequestBody Programs program) {
        return programService.addNewProgram(departmentId, program);
    }
    
    @PutMapping("/{oldProgramId}/departments/{newDepartmentId}")
    public Programs editProgram(@PathVariable String oldProgramId,
                                  @PathVariable String newDepartmentId, 
                                  @RequestBody Programs program) {
        return programService.editProgram(oldProgramId, newDepartmentId, program);
    }

    @DeleteMapping("/{programId}")
    void deleteProgram(@PathVariable String programId) {
        programService.deleteProgram(programId);
    }



}
