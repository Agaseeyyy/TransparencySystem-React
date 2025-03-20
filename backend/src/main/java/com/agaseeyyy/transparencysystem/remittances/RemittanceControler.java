package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



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
