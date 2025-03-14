package com.agaseeyyy.transparencysystem.fees;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class FeeService {
  private final FeeRepository feeRepository;

  public FeeService(FeeRepository feeRepository) {
    this.feeRepository = feeRepository;
  }

  // Constructors
  public List <Fees> getAllFees() {
    return feeRepository.findAll();
  }
  
  
  // Named Methods and Business Logics
  public Fees addNewFee(Fees newFee) {
    if (newFee == null) {
      throw new RuntimeException("Failed to add new Fee!");
    }
    return feeRepository.save(newFee);
  }


  public Fees editFee(Integer feeId, Fees updatedFee) {
    Fees existingFee = feeRepository.findById(feeId).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeId)
    );

    existingFee.setFeeType(updatedFee.getFeeType());
    existingFee.setAmount(updatedFee.getAmount());
    existingFee.setDueDate(updatedFee.getDueDate());

    return feeRepository.save(existingFee);
  }
  

  public void deleteFee(Integer feeId) {
    if (!feeRepository.existsById(feeId)) {
      throw new RuntimeException("Fee not found with id " + feeId);
    }
    feeRepository.deleteById(feeId);
  }


  @PostConstruct
    public void initializeDefaultFees() {
        try {
            if (feeRepository.count() == 0) {
                // Create default fees
                Fees membershipFee = new Fees();
                membershipFee.setFeeType("JPCS Membership Fee");
                membershipFee.setAmount(150.00);
                membershipFee.setDueDate(LocalDate.now().plusMonths(1));
                feeRepository.save(membershipFee);

                Fees semestralFee = new Fees();
                semestralFee.setFeeType("JPCS Semestral Fee");
                semestralFee.setAmount(250.00);
                semestralFee.setDueDate(LocalDate.now().plusMonths(1));
                feeRepository.save(semestralFee);

                System.out.println("Default fees have been created successfully!");
            } else {
                System.out.println("Default fees already exist.");
            }
        } catch (Exception e) {
            System.err.println("Error creating default fees: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 
