package com.agaseeyyy.transparencysystem.remittances;

import java.time.Year;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.agaseeyyy.transparencysystem.accounts.AccountService;
import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO;
import com.agaseeyyy.transparencysystem.dto.RemittanceSummary;
import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;




@RestController
@RequestMapping(path = "/api/v1/remittances")
public class RemittanceController {

    private final RemittanceService remittanceService;

    // Constructors
    public RemittanceController(RemittanceService remittanceService) {
        this.remittanceService = remittanceService;
    }

    // REST API Endpoints
    @GetMapping("/fees/{feeId}/remittance-status")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Page<AccountWithRemittanceInfoDTO> getRemittanceStatusByFee(
            @PathVariable Integer feeId,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "student.lastName") String sortField,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "all") String program,
            @RequestParam(defaultValue = "all") String yearLevel,
            @RequestParam(defaultValue = "all") String section) {
        return remittanceService.getRemittanceStatusByFee(
                feeId, pageNumber, pageSize, sortField, sortDirection,
                program, yearLevel, section);
    }
    
    @PostMapping("/fees/{feeType}/users/{accountId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Remittances addNewRemittance(@PathVariable Integer feeType,
                                        @PathVariable Integer accountId,
                                        @RequestBody Remittances remittance) {
        return remittanceService.addNewRemittance(feeType, accountId, remittance);
    }

    @PutMapping("/{remittanceId}/fees/{feeType}/users/{accountId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public Remittances editRemittance(@PathVariable String remittanceId,
                                    @PathVariable Integer feeType,
                                    @PathVariable Integer accountId,
                                    @RequestBody Remittances remittance) {
        return remittanceService.editRemittance(remittanceId, feeType, accountId, remittance);
    }

    @DeleteMapping("/{remittanceId}")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public void deleteRemittance(@PathVariable String remittanceId) {
        remittanceService.deleteRemittance(remittanceId);
    }

    @GetMapping("/treasurer")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public List<RemittanceSummary> calculateTotalRemittedByTreasurer() {
        return remittanceService.calculateTotalRemittedByTreasurer();
    }
    
    @GetMapping
    public ResponseEntity<Page<Remittances>> getRemittances(
            @RequestParam(required = false) Long feeId,
            @RequestParam(required = false) RemittanceStatus status,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "remittanceDate") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.fromString(sortDirection), sortField));
        Page<Remittances> remittances = remittanceService.getRemittances(feeId, status, accountId, program, yearLevel, section, pageable);
        return ResponseEntity.ok(remittances);
    }

    @GetMapping("/report")
    public ResponseEntity<List<Remittances>> getRemittancesReport(
            @RequestParam(required = false) Long feeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long accountId,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String yearLevel,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "remittanceDate") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortField);
        
        RemittanceStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty() && !"all".equalsIgnoreCase(status)) {
            try {
                statusEnum = RemittanceStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                System.err.println("Invalid status format for report: " + status);
            }
        }

        List<Remittances> reportData = remittanceService.generateRemittanceReport(
            feeId, 
            statusEnum, 
            accountId,
            program, 
            yearLevel,
            section,
            sort
        );
        return ResponseEntity.ok(reportData);
    }
}
