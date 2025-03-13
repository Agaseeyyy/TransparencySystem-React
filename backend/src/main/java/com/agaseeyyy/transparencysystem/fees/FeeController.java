package com.agaseeyyy.transparencysystem.fees;

import java.util.List;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/v1/fees")
public class FeeController {
  private final FeeService feeService;

  // Constructors
  public FeeController(FeeService feeService) {
    this.feeService = feeService;
  }

  
  // REST APIs
  @GetMapping
  public List <Fees> displayAllFees() {
    return feeService.getAllFees();
  }

  @PostMapping
  public Fees addNewFee(@RequestBody Fees newFee) {      
      return feeService.addNewFee(newFee);
  }

  @PutMapping("/{feeId}")
  public Fees putMethodName(@PathVariable Integer feeId, @RequestBody Fees updatedFee) {
      return feeService.editFee(feeId, updatedFee);
  }
  
  @DeleteMapping("/{feeId}")
  public void deleteFee(@PathVariable Integer feeId) {
    feeService.deleteFee(feeId);
  }

}