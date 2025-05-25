package com.agaseeyyy.transparencysystem.remittances;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;

import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.AccountService;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO;
import com.agaseeyyy.transparencysystem.dto.RemittanceSummary;
import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;
import com.agaseeyyy.transparencysystem.enums.Status;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.payments.PaymentSpecification;
import com.agaseeyyy.transparencysystem.payments.Payments;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceStatusDTO;

@Service
public class RemittanceService {

    private final RemittanceRepository remittanceRepository;
    private final FeeRepository feeRepository;
    private final AccountRepository accountRepository;
    private final PaymentRepository paymentRepository;
    private final AccountService accountService;
    private final RemittanceStatusCalculator remittanceStatusCalculator;

    // Dependencies Injection
    @Autowired
    public RemittanceService(
            RemittanceRepository remittanceRepository,
            FeeRepository feeRepository,
            AccountRepository accountRepository,
            PaymentRepository paymentRepository,
            AccountService accountService,
            RemittanceStatusCalculator remittanceStatusCalculator) {
        this.remittanceRepository = remittanceRepository;
        this.feeRepository = feeRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.accountService = accountService;
        this.remittanceStatusCalculator = remittanceStatusCalculator;
    }


    // Static Methods
    // Timestamp-based ID generation
    public static String generateRemittanceId(Integer accountId) {
        LocalDateTime now = LocalDateTime.now();
        // Example: RMT-yyyyMMddHHmmss-accountId-randomSuffix
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = now.format(formatter);
        // Adding a small random number to further decrease collision chance if calls are very rapid
        int randomSuffix = new Random().nextInt(900) + 100; // 3-digit random number
        return "RMT-" + timestamp + "-" + accountId + "-" + randomSuffix;
    }

    // Named Methods and Business Logics
    @Transactional
    public Remittances addNewRemittance(Integer feeId, Integer accountId, Remittances newRemittanceDetails) {
        Fees fee = feeRepository.findById(feeId).orElseThrow(
            () -> new ResourceNotFoundException("Fee not found with id " + feeId)
        );
        
        Accounts account = accountRepository.findById(accountId).orElseThrow(
            () -> new ResourceNotFoundException("Account (Remitter) not found with id " + accountId)
        );

        Students studentDetailsOfRemitter = account.getStudent();
        if (studentDetailsOfRemitter == null) {
            throw new BadRequestException("Account ID " + accountId + " is not associated with any student details. Cannot determine class for remittance.");
        }
        if (studentDetailsOfRemitter.getProgram() == null) {
            throw new BadRequestException("Student associated with Account ID " + accountId + " does not have program details. Cannot determine class for remittance.");
        }

        String programId = studentDetailsOfRemitter.getProgram().getProgramId();
        Year yearLevel = studentDetailsOfRemitter.getYearLevel();
        Character section = studentDetailsOfRemitter.getSection();

        Specification<Payments> paymentsToRemitSpec = Specification
            .where(PaymentSpecification.filterByStudentDetailsAndFee(programId, yearLevel, section, feeId))
            .and(PaymentSpecification.hasStatus(Status.Paid.name()));
        
        List<Payments> paidPayments = paymentRepository.findAll(paymentsToRemitSpec);

        if (paidPayments.isEmpty()) {
            throw new BadRequestException("No PAID payments found for Fee ID " + feeId + 
                                        " for class " + programId + "-" + yearLevel + section + 
                                        ". Nothing to remit.");
        }

        // sumOfPaidPayments is now BigDecimal, calculation uses BigDecimal stream operations
        BigDecimal sumOfPaidPayments = paidPayments.stream()
                                             .filter(p -> p.getAmount() != null)
                                             .map(Payments::getAmount) // Payments.getAmount() is now BigDecimal
                                             .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Compare BigDecimal values using compareTo
        // Ensure newRemittanceDetails.getAmountRemitted() also returns BigDecimal or is converted
        BigDecimal amountToRemit = newRemittanceDetails.getAmountRemitted() != null 
                                    ? newRemittanceDetails.getAmountRemitted() 
                                    : BigDecimal.ZERO;

        if (sumOfPaidPayments.subtract(amountToRemit).abs().compareTo(new BigDecimal("0.001")) > 0) {
            throw new BadRequestException("The provided amount to remit (" + amountToRemit + 
                                        ") does not match the sum of available PAID payments (" + sumOfPaidPayments + "). Please refresh and try again.");
        }
        if (sumOfPaidPayments.compareTo(BigDecimal.ZERO) <= 0) { // Compare to BigDecimal.ZERO
             throw new BadRequestException("Total amount of PAID payments is zero or less. Nothing to remit.");
        }

        // Create the remittance entity
        Remittances remittanceToSave = new Remittances();
        remittanceToSave.setRemittanceId(generateRemittanceId(accountId));
        remittanceToSave.setFee(fee);
        remittanceToSave.setAccount(account);
        remittanceToSave.setAmountRemitted(sumOfPaidPayments); // Now expects and receives BigDecimal
        remittanceToSave.setRemittanceDate(LocalDate.now());
        
        // Use the calculator to determine status
        com.agaseeyyy.transparencysystem.enums.RemittanceStatus simpleCalculatedStatus = remittanceStatusCalculator.calculateStatus(
                feeId, programId, yearLevel, section, true);
        
        // Map to the detailed RemittanceStatus for storage
        com.agaseeyyy.transparencysystem.remittances.RemittanceStatus detailedStatus;
        switch (simpleCalculatedStatus) {
            case COMPLETED:
                detailedStatus = com.agaseeyyy.transparencysystem.remittances.RemittanceStatus.COMPLETED;
                break;
            case PARTIAL:
                detailedStatus = com.agaseeyyy.transparencysystem.remittances.RemittanceStatus.PARTIAL;
                break;
            case NOT_REMITTED:
                // This case should ideally not be reached if we are creating a new remittance,
                // as it implies something went wrong or no payments were found (which is checked earlier).
                // However, to be safe, map it to a pending state or similar.
                detailedStatus = com.agaseeyyy.transparencysystem.remittances.RemittanceStatus.PENDING_VERIFICATION; 
                break;
            default:
                detailedStatus = com.agaseeyyy.transparencysystem.remittances.RemittanceStatus.PENDING_VERIFICATION; // Default fallback
                break;
        }
        remittanceToSave.setStatus(detailedStatus);
        
        // Set the payments included in this remittance
        remittanceToSave.setPayments(paidPayments);
        
        // Save and update payments
        Remittances savedRemittance = remittanceRepository.save(remittanceToSave);

        for (Payments payment : paidPayments) {
            payment.setStatus(Status.Remitted);
            paymentRepository.save(payment);
    }

        return savedRemittance;
    }

    public Remittances editRemittance(String remittanceId, Integer feeIdInput, Integer accountIdInput, Remittances updatedRemittanceDetails) {
        Remittances existingRemittance = remittanceRepository.findById(remittanceId).orElseThrow(
            () -> new ResourceNotFoundException("Remittance not found with id " + remittanceId)
        );
        
        Fees fee = feeRepository.findById(feeIdInput).orElseThrow(
            () -> new ResourceNotFoundException("Fee not found with id " + feeIdInput)
        );
        
        Accounts account = accountRepository.findById(accountIdInput).orElseThrow(
            () -> new ResourceNotFoundException("Account not found with id " + accountIdInput)
        );

        existingRemittance.setFee(fee);
        existingRemittance.setAccount(account);
        existingRemittance.setStatus(updatedRemittanceDetails.getStatus());
        
        return remittanceRepository.save(existingRemittance);
    }

    public void deleteRemittance(String remittanceId) {
        Remittances remittance = remittanceRepository.findById(remittanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Remittance not found with id " + remittanceId));

        // Only update payments associated with this remittance
        if (remittance.getPayments() != null) {
            for (Payments payment : remittance.getPayments()) {
                if (payment.getStatus() == Status.Remitted) {
                    payment.setStatus(Status.Paid);
                    paymentRepository.save(payment);
                }
            }
        }
              
        remittanceRepository.deleteById(remittanceId);
    }

    public Page<Remittances> getRemittances(
        Long feeId,
        RemittanceStatus status,
        Long accountId,
        String program,
        String yearLevel,
        String section,
        Pageable pageable
    ) {
        Specification<Remittances> spec = RemittanceSpecification.filterBy(feeId, status, accountId, program, yearLevel, section);
        return remittanceRepository.findAll(spec, pageable);
    }

    public List<Remittances> generateRemittanceReport(
        Long feeId,
        RemittanceStatus status,
        Long accountId,
        String program,
        String yearLevel,
        String section,
        Sort sort
    ) {
        Specification<Remittances> spec = RemittanceSpecification.filterBy(feeId, status, accountId, program, yearLevel, section);
        return remittanceRepository.findAll(spec, sort);
    }

    // Add the method that was referenced in RemittanceControler but not implemented yet
    public Page<AccountWithRemittanceInfoDTO> getRemittanceStatusByFee(
        Integer feeId, int pageNumber, int pageSize, String sortField, String sortDirection,
        String programFilter, String yearLevelFilter, String sectionFilter) {

    return accountService.getClassTreasurersWithDetailedRemittanceStatus(
            feeId, pageNumber, pageSize, sortField, sortDirection,
            programFilter, yearLevelFilter, sectionFilter);
    }
















    public List<RemittanceSummary> calculateTotalRemittedByTreasurer() {
        return remittanceRepository.getAmountRemittedGroupByAccountIdAndFeeId();
    }

    public BigDecimal calculateTotalRemittedByFeeType(Integer feeId) {
        List<Remittances> remittances = remittanceRepository.findByFee_FeeId(feeId);
        if (remittances == null || remittances.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return remittances.stream()
                          .filter(r -> r.getAmountRemitted() != null) // Ensure amount is not null
                          .map(Remittances::getAmountRemitted) // This is now BigDecimal
                          .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public List<Remittances> getRecentRemittances() {
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "remittanceDate").and(Sort.by(Sort.Direction.DESC, "remittanceId")));
        return remittanceRepository.findAll(pageRequest).getContent();
    }
}
