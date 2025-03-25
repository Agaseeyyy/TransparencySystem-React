package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping(path = "/api/v1/remittances")
public class RemittanceControler {
  private RemittanceService remittanceService;

  // Constructors
  public RemittanceControler(RemittanceService remittanceService) {
    this.remittanceService = remittanceService;
  }

  @GetMapping
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public List<Remittances> displayAllRemittances() {
      return remittanceService.getAllRemittances();
  }

  @GetMapping("/table")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public ResponseEntity<?> getTableData(
          @RequestParam(required = false) String feeType,
          @RequestParam(required = false) String status,
          @RequestParam(required = false) String date,
          @RequestParam(required = false, defaultValue = "remittanceDate") String sortBy,
          @RequestParam(required = false, defaultValue = "desc") String sortDir) {
      
      try {
          // Parse feeType parameter
          Integer feeTypeId = null;
          if (feeType != null && !feeType.equals("all")) {
              try {
                  feeTypeId = Integer.parseInt(feeType);
              } catch (NumberFormatException e) {
                  feeTypeId = null;
              }
          }
          
          // Map frontend field names to actual entity property paths
          // DO NOT use prefixes like r., f., u. - Spring Data doesn't understand these
          String sortField = sortBy;
          switch (sortBy) {
              case "feeType":
                  sortField = "fee.feeType"; // Use this to theproperty pathfee type
                  break;
              case "remittedBy":
                  sortField = "user.lastName"; // Use the actual property path
                  break;
              case "amount":
                  sortField = "amountRemitted"; // Direct property, no prefix
                  break;
              // No need to map others if they match directly
          }
          
          // Create sort object
          Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                  Sort.by(sortField).descending() : 
                  Sort.by(sortField).ascending();
          
          String statusParam = "all".equals(status) ? null : status;
          String dateParam = "all".equals(date) ? null : date;
          
          List<Remittances> remittances = remittanceService.getRemittancesWithFilters(
                  feeTypeId, statusParam, dateParam, sort);
          
          return ResponseEntity.ok(Map.of(
              "success", true,
              "message", "Remittances retrieved successfully",
              "data", remittances
          ));
      } catch (Exception e) {
          e.printStackTrace();
          return ResponseEntity.badRequest().body(Map.of(
              "success", false,
              "message", "Error retrieving remittances: " + e.getMessage()
          ));
      }
  }
  
  @PostMapping("/fees/{feeType}/users/{userId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public Remittances addNewRemittance(@PathVariable Integer feeType,
                                      @PathVariable Integer userId,
                                      @RequestBody Remittances remittance) {
      return remittanceService.addNewRemittance(feeType, userId, remittance);
  }

  @PutMapping("/{remittanceId}/fees/{feeType}/users/{userId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public Remittances editRemittance(@PathVariable String remittanceId,
                                    @PathVariable Integer feeType,
                                    @PathVariable Integer userId,
                                    @RequestBody Remittances remittance) {
      return remittanceService.editRemittance(remittanceId, feeType, userId, remittance);
  }

  @DeleteMapping("/{remittanceId}")
  @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer')")
  public void deleteRemittance(@PathVariable String remittanceId) {
      remittanceService.deleteRemittance(remittanceId);
  }
  
}
