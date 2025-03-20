package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;
import org.springframework.stereotype.Service;

import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.users.UserRepository;
import com.agaseeyyy.transparencysystem.users.Users;

@Service
public class RemittanceService {
  private final RemittanceRepository remittanceRepository;
  private final FeeRepository feeRepository;
  private final UserRepository userRepository;

  // Constructors
  public RemittanceService(
          RemittanceRepository remittanceRepository,
          FeeRepository feeRepository,
          UserRepository userRepository) {
    this.remittanceRepository = remittanceRepository;
    this.feeRepository = feeRepository;
    this.userRepository = userRepository;
  }


  // Named Methods and Business Logic
  public List<Remittances> getAllRemittances() {
    return remittanceRepository.findAll();
  }


  public Remittances addNewRemittance(Integer feeType, Integer userId, Remittances newRemittance) {
    Fees fee = feeRepository.findById(feeType).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeType)
    );
    
    Users user = userRepository.findById(userId).orElseThrow(
      () -> new RuntimeException("User not found with id " + userId)
    );

    String remittanceId = generateRemittanceId(userId);
    newRemittance.setRemittanceId(remittanceId);
    newRemittance.setFee(fee);
    newRemittance.setUser(user);    
    return remittanceRepository.save(newRemittance);
  }


  public Remittances editRemittance(String remittanceId, Integer feeType, Integer userId, Remittances updatedRemittance) {
    Remittances existingRemittance = remittanceRepository.findById(remittanceId).orElseThrow(
      () -> new RuntimeException("Remittance not found with id " + remittanceId)
    );
    
    Fees fee = feeRepository.findById(feeType).orElseThrow(
      () -> new RuntimeException("Fee not found with id " + feeType)
    );
    
    Users user = userRepository.findById(userId).orElseThrow(
      () -> new RuntimeException("User not found with id " + userId)
    );

    existingRemittance.setFee(fee);
    existingRemittance.setUser(user);
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


  private String generateRemittanceId(Integer userId) {
      return String.format("RMT-%d-%d", userId, System.currentTimeMillis());
  }

}
