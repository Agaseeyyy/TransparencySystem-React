package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;

@Service
public class RemittanceService {
  private final RemittanceRepository remittanceRepository;
  private final FeeRepository feeRepository;
  private final AccountRepository accountRepository;

  // Constructors
  public RemittanceService(
          RemittanceRepository remittanceRepository,
          FeeRepository feeRepository,
          AccountRepository accountRepository) {
    this.remittanceRepository = remittanceRepository;
    this.feeRepository = feeRepository;
    this.accountRepository = accountRepository;
  }


  // Named Methods and Business Logic
  public List<Remittances> getAllRemittances() {
    return remittanceRepository.findAll();
  }


  public Remittances addNewRemittance(Integer feeType, Integer accountId, Remittances newRemittance) {
    Fees fee = feeRepository.findById(feeType).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeType)
    );
    
    Accounts account = accountRepository.findById(accountId).orElseThrow(
      () -> new RuntimeException("Account not found with id " + accountId)
    );

    String remittanceId = generateRemittanceId(accountId);
    newRemittance.setRemittanceId(remittanceId);
    newRemittance.setFee(fee);
    newRemittance.setAccount(account);    
    return remittanceRepository.save(newRemittance);
  }


  public Remittances editRemittance(String remittanceId, Integer feeType, Integer accountId, Remittances updatedRemittance) {
    Remittances existingRemittance = remittanceRepository.findById(remittanceId).orElseThrow(
      () -> new RuntimeException("Remittance not found with id " + remittanceId)
    );
    
    Fees fee = feeRepository.findById(feeType).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeType)
    );
    
    Accounts account = accountRepository.findById(accountId).orElseThrow(
      () -> new RuntimeException("User not found with id " + accountId)
    );

    existingRemittance.setFee(fee);
    existingRemittance.setAccount(account);
    existingRemittance.setAmountRemitted(updatedRemittance.getAmountRemitted());
    existingRemittance.setStatus(updatedRemittance.getStatus());
    
    return remittanceRepository.save(existingRemittance);
  }


  public void deleteRemittance(String remittanceId) {
    if (!remittanceRepository.existsById(remittanceId)) {
      throw new RuntimeException("Remittance not found with id " + remittanceId);
    }
          
    remittanceRepository.deleteById(remittanceId);
  }


  private String generateRemittanceId(Integer accountId) {
      return String.format("RMT-%d-%d", accountId, System.currentTimeMillis());
  }

 /**
   * Calculate the total amount remitted for a specific fee type
   * 
   * @param feeId The ID of the fee to calculate remittances for
   * @return The total amount remitted
   */
  public double calculateTotalRemittedByFeeType(Integer feeId) {
    List<Remittances> remittances = remittanceRepository.findByFee_FeeId(feeId);
    
    return remittances.stream()
        .mapToDouble(Remittances::getAmountRemitted)
        .sum();
}

  /**
   * Get a list of recent remittances
   * 
   * @return List of recent remittance records
   */
  public List<Remittances> getRecentRemittances() {
      // Get the 10 most recent remittances
      // You could modify this to use paging or to filter by date
      return remittanceRepository.findTopByOrderByRemittanceIdDesc();
  }

  /**
   * Get remittances with optional filtering and sorting
   * 
   * @param feeType Filter by fee type ID (null for all)
   * @param status Filter by status (null for all)
   * @param date Filter by date (null for all)
   * @param sort Sort specification
   * @return List of filtered and sorted remittances
   */
  public List<Remittances> getTableData(Integer feeType, String status, String date, Sort sort) {
    // If no filters are provided, just return sorted data
    if (feeType == null && status == null && date == null) {
        return remittanceRepository.findAll(sort);
    }
    
    // Use repository method to get filtered and sorted data
    return remittanceRepository.findRemittancesWithFilters(feeType, status, date, sort);
  }

  /**
   * Get remittances with optional filtering and sorting
   * 
   * @param feeType Filter by fee type ID (null for all)
   * @param status Filter by status (null for all)
   * @param date Filter by date (null for all)
   * @param sort Sort specification
   * @return List of filtered and sorted remittances
   */
  public List<Remittances> getRemittancesWithFilters(Integer feeType, String status, String date, Sort sort) {
    // If no filters are provided, just return sorted data
    if ((feeType == null || feeType == 0) && 
        (status == null || status.isEmpty()) && 
        (date == null || date.isEmpty())) {
        return remittanceRepository.findAll(sort);
    }
    
    // Use repository method to get filtered and sorted data
    return remittanceRepository.findRemittancesWithFilters(feeType, status, date, sort);
  }

}
