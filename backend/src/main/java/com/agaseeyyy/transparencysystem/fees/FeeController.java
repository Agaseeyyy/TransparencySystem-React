package com.agaseeyyy.transparencysystem.fees;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/v1/fees")
public class FeeController {
    private final FeeService feeService;

    // Constructors
    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    
    // REST API Endpoints
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public List<Fees> getAllFees() {
        return feeService.getFees();
    }
    
    @GetMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public Page<Fees> displayFees(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "feeId") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        return feeService.getFees(pageNumber, pageSize, sortField, sortDirection);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Fees addNewFee(@RequestBody Fees newFee) {      
        return feeService.addNewFee(newFee);
    }

    @PutMapping("/{feeId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Fees putMethodName(@PathVariable Integer feeId, @RequestBody Fees updatedFee) {
        return feeService.editFee(feeId, updatedFee);
    }
    
    @DeleteMapping("/{feeId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public void deleteFee(@PathVariable Integer feeId) {
        feeService.deleteFee(feeId);
    }

}