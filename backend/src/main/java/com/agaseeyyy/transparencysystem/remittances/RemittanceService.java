package com.agaseeyyy.transparencysystem.remittances;

import java.util.List;
import org.springframework.stereotype.Service;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.agaseeyyy.transparencysystem.users.UserRepository;
import com.agaseeyyy.transparencysystem.users.Users;

@Service
public class RemittanceService {
  private final RemittanceRepository remittanceRepository;
  private final PaymentRepository paymentRepository;
  private final UserRepository userRepository;

  // Constructors
  public RemittanceService(
          RemittanceRepository remittanceRepository,
          PaymentRepository paymentRepository,
          UserRepository userRepository) {
    this.remittanceRepository = remittanceRepository;
    this.paymentRepository = paymentRepository;
    this.userRepository = userRepository;
  }


  // Named Methods and Business Logic
  public List<Remittances> getAllRemittances() {
    return remittanceRepository.findAll();
  }


  public Remittances addNewRemittance(String paymentId, Integer userId, Remittances newRemittance) {
    Payments payment = paymentRepository.findById(paymentId).orElseThrow(
      () -> new RuntimeException("Payment not found with id " + paymentId)
    );
    
    Users user = userRepository.findById(userId).orElseThrow(
      () -> new RuntimeException("User not found with id " + userId)
    );

    String remittanceId = generateRemittanceId(userId);
    newRemittance.setRemittanceId(remittanceId);
    newRemittance.setPayment(payment);
    newRemittance.setUser(user);
    
    return remittanceRepository.save(newRemittance);
  }


  public Remittances editRemittance(String remittanceId, String paymentId, Integer userId, Remittances updatedRemittance) {
    Remittances existingRemittance = remittanceRepository.findById(remittanceId).orElseThrow(
      () -> new RuntimeException("Remittance not found with id " + remittanceId)
    );
    
    Payments payment = paymentRepository.findById(paymentId).orElseThrow(
      () -> new RuntimeException("Payment not found with id " + paymentId)
    );
    
    Users user = userRepository.findById(userId).orElseThrow(
      () -> new RuntimeException("User not found with id " + userId)
    );

    existingRemittance.setPayment(payment);
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
