package com.agaseeyyy.transparencysystem.dashboard;

import com.agaseeyyy.transparencysystem.dashboard.dto.AdminDashboardSummaryDto;
import com.agaseeyyy.transparencysystem.dashboard.dto.ClassTreasurerDashboardSummaryDto;
import com.agaseeyyy.transparencysystem.dashboard.dto.FeeUtilizationDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {
    private final TransparencyService transparencyService;

    public DashboardController(TransparencyService transparencyService) {
        this.transparencyService = transparencyService;
    }

    @GetMapping("/admin-summary")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<AdminDashboardSummaryDto> getAdminDashboardSummary() {
        return ResponseEntity.ok(transparencyService.getAdminDashboardSummary());
    }

    @GetMapping("/class-treasurer-summary")
    @PreAuthorize("hasAuthority('Class_Treasurer')")
    public ResponseEntity<ClassTreasurerDashboardSummaryDto> getClassTreasurerDashboardSummary(Principal principal) {
        if (principal == null || principal.getName() == null) {
            // Handle cases where principal might be null if endpoint is misconfigured or accessed anonymously
            return ResponseEntity.status(401).build(); // Unauthorized
        }
        return ResponseEntity.ok(transparencyService.getClassTreasurerDashboardSummary(principal.getName()));
    }

    @GetMapping("/admin/fee-utilization")
    @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
    public ResponseEntity<List<FeeUtilizationDTO>> getFeeUtilizationBreakdown() {
        List<FeeUtilizationDTO> utilizationData = transparencyService.getFeeUtilizationBreakdown();
        return ResponseEntity.ok(utilizationData);
    }
} 