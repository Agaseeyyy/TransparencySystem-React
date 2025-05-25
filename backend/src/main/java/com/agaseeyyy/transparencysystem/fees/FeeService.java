package com.agaseeyyy.transparencysystem.fees;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;
import com.agaseeyyy.transparencysystem.payments.PaymentRepository;
import com.agaseeyyy.transparencysystem.accounts.AccountRepository;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.students.Students;
import java.security.Principal;

@Service
public class FeeService {
    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;

    // Constructors
    public FeeService(FeeRepository feeRepository, PaymentRepository paymentRepository, AccountRepository accountRepository) {
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
        this.accountRepository = accountRepository;
    }
  
    // Named Methods and Business Logics
    public List<Fees> getFees() {
        return feeRepository.findAll(Sort.by(Sort.Direction.ASC, "feeType"));
    }

    public Page <Fees> getFees(int pageNumber, int pageSize, String sortField, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;    

        return feeRepository.findAll(PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField)));
    }

    public Fees getFeeById(Integer feeId) {
        return feeRepository.findById(feeId)
            .orElseThrow(() -> new ResourceNotFoundException("Fee with ID '" + feeId + "' not found."));
    }
  
    
    @Transactional
    public Fees addNewFee(Fees fee) {
        // Validate required fields
        if (fee.getFeeType() == null || fee.getFeeType().isBlank()) {
            throw new BadRequestException("Fee Type is required.");
        }
        if (fee.getAmount() == null) {
            throw new BadRequestException("Amount is required.");
        }
        if (fee.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than zero.");
        }
        if (fee.getDueDate() == null) {
            throw new BadRequestException("Due Date is required.");
        }

        // Check for duplicate fee type
        if (feeRepository.existsByFeeType(fee.getFeeType())) {
            throw new ResourceAlreadyExistsException("Fee with Type '" + fee.getFeeType() + "' already exists.");
        }
        
        return feeRepository.save(fee);
    }

    @Transactional
    public Fees editFee(Integer feeId, Fees updatedFeeDetails) {
        // Ensure fee exists
        Fees existingFee = feeRepository.findById(feeId)
            .orElseThrow(() -> new ResourceNotFoundException("Fee with ID '" + feeId + "' not found. Cannot update."));

        // Validate required fields from request body
        if (updatedFeeDetails.getFeeType() == null || updatedFeeDetails.getFeeType().isBlank()) {
            throw new BadRequestException("Fee Type is required in the request body.");
        }
        if (updatedFeeDetails.getAmount() == null) {
            throw new BadRequestException("Amount is required in the request body.");
        }
         if (updatedFeeDetails.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than zero.");
        }
        if (updatedFeeDetails.getDueDate() == null) {
            throw new BadRequestException("Due Date is required in the request body.");
        }

        // Check if the fee type is being changed and if the new type already exists for another fee
        if (!existingFee.getFeeType().equalsIgnoreCase(updatedFeeDetails.getFeeType())) {
            if (feeRepository.existsByFeeTypeAndFeeIdNot(updatedFeeDetails.getFeeType(), feeId)) {
                throw new ResourceAlreadyExistsException("Another fee with Type '" + updatedFeeDetails.getFeeType() + "' already exists.");
            }
        }

        // Update fields
        existingFee.setFeeType(updatedFeeDetails.getFeeType());
        existingFee.setAmount(updatedFeeDetails.getAmount());
        existingFee.setDueDate(updatedFeeDetails.getDueDate());
        
        return feeRepository.save(existingFee);
    }
  
    @Transactional
    public void deleteFee(Integer feeId) {
        // Ensure fee exists
        Fees feeToDelete = feeRepository.findById(feeId)
            .orElseThrow(() -> new ResourceNotFoundException("Fee with ID '" + feeId + "' not found."));

        // Check for associated payments
        if (paymentRepository.existsByFeeFeeId(feeId)) {
            throw new BadRequestException("Cannot delete Fee '" + feeToDelete.getFeeType() + "' (ID: " + feeId + "). It has associated payments. Please remove or reassign them first.");
        }
        
        feeRepository.delete(feeToDelete);
    }

    @PostConstruct
    public void initializeDefaultFees() {
        try {
            if (feeRepository.count() == 0) {
                // Create default fees
                Fees membershipFee = new Fees();
                membershipFee.setFeeType("JPCS Membership Fee");
                membershipFee.setAmount(new BigDecimal("150.00"));
                membershipFee.setDueDate(LocalDate.now().plusMonths(1));
                feeRepository.save(membershipFee);

                Fees semestralFee = new Fees();
                semestralFee.setFeeType("JPCS Semestral Fee");
                semestralFee.setAmount(new BigDecimal("250.00"));
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

    // Helper method to check if the current user is a Class Treasurer
    private boolean isClassTreasurer(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return false;
        }
        
        try {
            Accounts account = accountRepository.findByEmail(principal.getName());
            return account != null && "Class_Treasurer".equals(account.getRole());
        } catch (Exception e) {
            return false;
        }
    }

    // Helper method to get Class Treasurer's class details
    private ClassTreasurerDetails getClassTreasurerDetails(String username) {
        try {
            Accounts treasurerAccount = accountRepository.findByEmail(username);
            if (treasurerAccount != null && treasurerAccount.getStudent() != null) {
                Students treasurerStudentInfo = treasurerAccount.getStudent();
                
                String program = treasurerStudentInfo.getProgram() != null ? 
                    treasurerStudentInfo.getProgram().getProgramId() : null;
                String yearLevel = treasurerStudentInfo.getYearLevel() != null ? 
                    String.valueOf(treasurerStudentInfo.getYearLevel()) : null;
                String section = String.valueOf(treasurerStudentInfo.getSection());
                
                return new ClassTreasurerDetails(program, yearLevel, section);
            }
        } catch (Exception e) {
            // Log error if needed
        }
        return null;
    }

    // Helper class for Class Treasurer details
    private static class ClassTreasurerDetails {
        private final String program;
        private final String yearLevel;
        private final String section;

        public ClassTreasurerDetails(String program, String yearLevel, String section) {
            this.program = program;
            this.yearLevel = yearLevel;
            this.section = section;
        }

        public String getProgram() { return program; }
        public String getYearLevel() { return yearLevel; }
        public String getSection() { return section; }
    }
}
