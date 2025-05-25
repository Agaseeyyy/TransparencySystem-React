package com.agaseeyyy.transparencysystem.accounts;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.agaseeyyy.transparencysystem.students.StudentRepository;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.remittances.Remittances;
import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceInfoDTO;
import com.agaseeyyy.transparencysystem.fees.FeeRepository;

import jakarta.annotation.PostConstruct;
import com.agaseeyyy.transparencysystem.exception.BadRequestException;
import com.agaseeyyy.transparencysystem.exception.ResourceAlreadyExistsException;
import com.agaseeyyy.transparencysystem.exception.ResourceNotFoundException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.Year;

import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;
import com.agaseeyyy.transparencysystem.remittances.RemittanceStatusCalculator;
import com.agaseeyyy.transparencysystem.dto.AccountWithRemittanceStatusDTO;
import com.agaseeyyy.transparencysystem.fees.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Comparator;
import java.util.ArrayList;
import com.agaseeyyy.transparencysystem.dto.RemittanceSummary;
import com.agaseeyyy.transparencysystem.remittances.RemittanceRepository;

@Service
public class AccountService {
    private final AccountRepository accountRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final RemittanceStatusCalculator remittanceStatusCalculator;
    private final FeeRepository feeRepository;
    private final FeeService feeService;
    private final RemittanceRepository remittanceRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    // Constructors
    @Autowired
    public AccountService(AccountRepository accountRepository, StudentRepository studentRepository, 
                         PasswordEncoder passwordEncoder,
                         RemittanceStatusCalculator remittanceStatusCalculator,
                         FeeRepository feeRepository,
                         FeeService feeService,
                         RemittanceRepository remittanceRepository) {
        this.passwordEncoder = passwordEncoder;
        this.accountRepository = accountRepository;
        this.studentRepository = studentRepository;
        this.remittanceStatusCalculator = remittanceStatusCalculator;
        this.feeRepository = feeRepository;
        this.feeService = feeService;
        this.remittanceRepository = remittanceRepository;
    }


    // Named Methods and Business Logics
    public List<Accounts> getAccountsByRole(String role) {
        Specification<Accounts> spec = Specification.where(null);
        if (role != null && !role.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), Accounts.Role.valueOf(role)));
        }
        return accountRepository.findAll(spec, Sort.by(
            Sort.Order.asc("student.yearLevel"),
            Sort.Order.asc("student.section"),
            Sort.Order.asc("student.lastName")
        ));
    }

    public Page<Accounts> getTreasurersByRemittanceStatus(int feeId, int pageNumber, int pageSize, String sortField, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField));
        Specification<Accounts> spec = Specification.where(AccountSpecification.findUnremittedClassTreasurersForFee(feeId));

        return accountRepository.findAll(spec, pageable); 
    }

   

    public Page<Accounts> getAccounts(int pageNumber, int pageSize, String sortField, String sortDirection, String role) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(direction, sortField));
        Specification<Accounts> spec = Specification.where(null);
        if (role != null && !role.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), Accounts.Role.valueOf(role.toUpperCase())));
        }
        return accountRepository.findAll(spec, pageable);
    }


    public Accounts getAccountByEmail(String email) {
        Accounts account = accountRepository.findByEmail(email);
        if (account == null) {
            // Optionally, throw ResourceNotFoundException if an account MUST exist for a given email check
            // For general lookup, returning null might be acceptable, depends on use case.
        }
        return account;
    }

    @Transactional
    public Accounts addNewAccount(Long studentId, Accounts newAccount) {
        // Debug logging to see what we receive
        System.out.println("DEBUG - Received account data:");
        System.out.println("Email: " + (newAccount != null ? newAccount.getEmail() : "null"));
        System.out.println("Password: " + (newAccount != null && newAccount.getPassword() != null ? "[PRESENT]" : "null"));
        System.out.println("Role: " + (newAccount != null ? newAccount.getRole() : "null"));
        
        if (newAccount == null || newAccount.getEmail() == null || newAccount.getEmail().isBlank() ||
            newAccount.getPassword() == null || newAccount.getPassword().isBlank() || 
            newAccount.getRole() == null) {
            throw new BadRequestException("Email, Password, and Role are required to create an account.");
        }

        Students student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student with ID " + studentId + " not found. Cannot create account."));

        if (student.getAccount() != null) {
            throw new BadRequestException("Student " + student.getLastName() + ", " + student.getFirstName() + " (ID: " + studentId + ") already has an account.");
        }

        if(accountRepository.existsByEmail(newAccount.getEmail())) {
            throw new ResourceAlreadyExistsException("Account with email '" + newAccount.getEmail() + "' already exists.");
        }

        newAccount.setPassword(passwordEncoder.encode(newAccount.getPassword()));
        newAccount.setStudent(student);
        Accounts savedAccount = accountRepository.save(newAccount);
        student.setAccount(savedAccount); // Link back from student to account
        studentRepository.save(student);
        return savedAccount;
    }

    @Transactional
    public Accounts updateAccount(Accounts updatedAccount, Integer accountId) {
        if (updatedAccount == null || updatedAccount.getEmail() == null || updatedAccount.getEmail().isBlank() || 
            updatedAccount.getRole() == null) {
            throw new BadRequestException("Email and Role cannot be empty.");
        }

        Accounts existingAccount = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));

        // Check if email is being changed and if the new email already exists for another account
        if (!existingAccount.getEmail().equalsIgnoreCase(updatedAccount.getEmail())) {
            if (accountRepository.existsByEmailAndAccountIdNot(updatedAccount.getEmail(), accountId)) {
                throw new ResourceAlreadyExistsException("Another account with email '" + updatedAccount.getEmail() + "' already exists.");
        }
        existingAccount.setEmail(updatedAccount.getEmail());
        }

        existingAccount.setRole(updatedAccount.getRole());
        
        // Only update password if provided (not empty)
        if (updatedAccount.getPassword() != null && !updatedAccount.getPassword().isEmpty()) {
            existingAccount.setPassword(passwordEncoder.encode(updatedAccount.getPassword()));
        }
        // Note: Changing the student associated with an account during an update is not handled here.
        // If that's a requirement, further logic for unlinking old student / linking new student would be needed.

        return accountRepository.save(existingAccount);
    }

    @Transactional
    public void deleteAccount(Integer accountId) {
        Accounts account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));
        
        // Prevent deletion of primary admin
        if ("admin@admin.com".equalsIgnoreCase(account.getEmail())) {
            throw new BadRequestException("The primary admin account (admin@admin.com) cannot be deleted.");
        }

        // If the account is linked to a student, unlink it
        if (account.getStudent() != null) {
            Students student = account.getStudent();
            student.setAccount(null); // Remove reference from student
            studentRepository.save(student);
            account.setStudent(null); // Remove reference from account before deleting
        }
        
        accountRepository.delete(account);
    }

    @Transactional(readOnly = true)
    public Accounts getAccountById(Integer accountId) {
        return accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + accountId));
    }

    @PostConstruct
    public void initializeDefaultAdmin() {
        Accounts existingAdmin = accountRepository.findByEmail("admin@admin.com");
        System.out.println("Checking for existing admin: " + (existingAdmin != null));
        
        if (existingAdmin == null) {
            Accounts admin = new Accounts();

            admin.setEmail("admin@admin.com");
            String rawPassword = "admin123";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            admin.setPassword(encodedPassword);
            admin.setRole(Accounts.Role.Admin);
            accountRepository.save(admin);
            System.out.println("Default admin account created with encoded password: " + encodedPassword);
        }
        
    }
    
    @Transactional(readOnly = true)
    public Page<AccountWithRemittanceInfoDTO> getClassTreasurersWithDetailedRemittanceStatus(
            Integer feeId, int pageNumber, int pageSize, String sortField, String sortDirection,
            String programFilter, String yearLevelFilter, String sectionFilter
    ) {
        // Validate feeId parameter
        if (feeId == null) {
            throw new BadRequestException("Fee ID is required to get remittance status");
        }
        
        // Validate if fee exists
        boolean feeExists = feeRepository.existsById(feeId);
        if (!feeExists) {
            throw new ResourceNotFoundException("Fee with ID " + feeId + " not found");
        }
        
        // Create pageable without sorting since we'll sort manually
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        
        // Convert filter parameters to correct types
        Character sectionChar = sectionFilter != null && !sectionFilter.isEmpty() && !"all".equalsIgnoreCase(sectionFilter) 
            ? sectionFilter.charAt(0) 
            : null;
        
        Year yearLevel = null;
        if (yearLevelFilter != null && !yearLevelFilter.isEmpty() && !"all".equalsIgnoreCase(yearLevelFilter)) {
            try {
                yearLevel = Year.of(Integer.parseInt(yearLevelFilter));
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid year level format: " + yearLevelFilter);
            }
        }
        
        try {
            // Get basic treasurer information with remittance status
            Page<AccountWithRemittanceInfoDTO> treasurersPage = accountRepository.findClassTreasurersWithRemittanceInfoByFee(
                    feeId,
                    programFilter != null && !programFilter.isEmpty() ? programFilter : "all",
                    yearLevel,
                    sectionChar,
                    pageable
            );
            
            // Process all content to calculate detailed status and fetch dates
            List<AccountWithRemittanceInfoDTO> enhancedDtos = treasurersPage.getContent().stream()
                .map(dto -> {
                    // Check if there's a remittance record
                    boolean hasRemitted = !dto.getRemittanceStatus().equals("Not Remitted");
                    
                    Accounts treasurer = dto.getAccount();
                    Students student = treasurer.getStudent();
                    
                    if (student == null || student.getProgram() == null) {
                        // If student details are incomplete, return with NOT_REMITTED status
                        AccountWithRemittanceInfoDTO newDto = new AccountWithRemittanceInfoDTO(
                                dto.getAccount(),
                                dto.getTotalRemittedAmountBigDecimal(),
                                RemittanceStatus.NOT_REMITTED,
                                dto.getFeeId(),
                                dto.getFeeType()
                        );
                        newDto.setRemittanceDate(null); // No date for NOT_REMITTED
                        return newDto;
                    }
                    
                    String programId = student.getProgram().getProgramId();
                    Year studentYearLevel = student.getYearLevel();
                    Character section = student.getSection();
                    
                    // Use the dedicated calculator to determine the status
                    RemittanceStatus status = remittanceStatusCalculator.calculateStatus(
                            feeId, programId, studentYearLevel, section, hasRemitted);
                    
                    // Create a new DTO with updated status
                    AccountWithRemittanceInfoDTO newDto = new AccountWithRemittanceInfoDTO(
                            dto.getAccount(),
                            dto.getTotalRemittedAmountBigDecimal(),
                            status,
                            dto.getFeeId(),
                            dto.getFeeType()
                    );
                    
                    // Fetch the remittance date from the database if status is not NOT_REMITTED
                    if (status != RemittanceStatus.NOT_REMITTED) {
                        // Find the most recent remittance date for this treasurer and fee
                        try {
                            // This can be a native query to be more efficient
                            List<Remittances> remittances = entityManager.createQuery(
                                    "SELECT r FROM Remittances r " +
                                    "WHERE r.account.accountId = :accountId " +
                                    "AND r.fee.feeId = :feeId " +
                                    "ORDER BY r.remittanceDate DESC",
                                    Remittances.class)
                                .setParameter("accountId", treasurer.getAccountId())
                                .setParameter("feeId", feeId)
                                .setMaxResults(1)
                                .getResultList();
                                
                            if (!remittances.isEmpty()) {
                                newDto.setRemittanceDate(remittances.get(0).getRemittanceDate());
                            }
                        } catch (Exception e) {
                            // Log error but continue with null remittance date
                            System.err.println("Error fetching remittance date: " + e.getMessage());
                        }
                    }
                    
                    return newDto;
                })
                .collect(Collectors.toList());
            
            // Apply manual sorting if needed
            if (sortField != null && !sortField.isEmpty()) {
                boolean ascending = sortDirection.equalsIgnoreCase("asc");
                
                try {
                    switch (sortField) {
                        case "amountRemitted":
                            Collections.sort(enhancedDtos, (a, b) -> ascending ? 
                                Double.compare(a.getTotalRemittedAmount(), b.getTotalRemittedAmount()) :
                                Double.compare(b.getTotalRemittedAmount(), a.getTotalRemittedAmount()));
                            break;
                            
                        case "status":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                int result = a.getRemittanceStatus().compareTo(b.getRemittanceStatus());
                                return ascending ? result : -result;
                            });
                            break;
                            
                        case "feeType":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                int result = a.getFeeType().compareTo(b.getFeeType());
                                return ascending ? result : -result;
                            });
                            break;
                            
                        case "remittanceDate":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                // Handle null dates - null dates are considered "older" than any actual date
                                if (a.getRemittanceDate() == null && b.getRemittanceDate() == null) {
                                    return 0; // Both null, consider equal
                                } else if (a.getRemittanceDate() == null) {
                                    return ascending ? -1 : 1; // a is null, so a < b
                                } else if (b.getRemittanceDate() == null) {
                                    return ascending ? 1 : -1; // b is null, so a > b
                                }
                                
                                // Both not null, compare normally
                                int result = a.getRemittanceDate().compareTo(b.getRemittanceDate());
                                return ascending ? result : -result;
                            });
                            break;
                            
                        case "treasurer":
                        case "user":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                try {
                                    String nameA = a.getAccount().getStudent().getLastName() + a.getAccount().getStudent().getFirstName();
                                    String nameB = b.getAccount().getStudent().getLastName() + b.getAccount().getStudent().getFirstName();
                                    int result = nameA.compareTo(nameB);
                                    return ascending ? result : -result;
                                } catch (NullPointerException e) {
                                    // Handle null pointer (e.g., missing student info)
                                    return 0;
                                }
                            });
                            break;
                            
                        case "program":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                try {
                                    String progA = a.getAccount().getStudent().getProgram().getProgramName();
                                    String progB = b.getAccount().getStudent().getProgram().getProgramName();
                                    int result = progA.compareTo(progB);
                                    return ascending ? result : -result;
                                } catch (NullPointerException e) {
                                    // Handle null pointer (e.g., missing program info)
                                    return 0;
                                }
                            });
                            break;
                            
                        case "yearAndSection":
                            Collections.sort(enhancedDtos, (a, b) -> {
                                try {
                                    Students studentA = a.getAccount().getStudent();
                                    Students studentB = b.getAccount().getStudent();
                                    String yearSectionA = studentA.getYearLevel() + "-" + studentA.getSection();
                                    String yearSectionB = studentB.getYearLevel() + "-" + studentB.getSection();
                                    int result = yearSectionA.compareTo(yearSectionB);
                                    return ascending ? result : -result;
                                } catch (NullPointerException e) {
                                    // Handle null pointer (e.g., missing student info)
                                    return 0;
                                }
                            });
                            break;
                            
                        default:
                            // Default sorting by last name
                            Collections.sort(enhancedDtos, (a, b) -> {
                                try {
                                    String nameA = a.getAccount().getStudent().getLastName();
                                    String nameB = b.getAccount().getStudent().getLastName();
                                    int result = nameA.compareTo(nameB);
                                    return ascending ? result : -result;
                                } catch (NullPointerException e) {
                                    // Handle null pointer (e.g., missing student info)
                                    return 0;
                                }
                            });
                    }
                } catch (Exception e) {
                    throw new BadRequestException("Error sorting remittance data: " + e.getMessage());
                }
            }
            
            // Create new Page with sorted content
            return new PageImpl<>(enhancedDtos, pageable, treasurersPage.getTotalElements());
        } catch (ResourceNotFoundException | BadRequestException e) {
            // Re-throw these specific exceptions as-is
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Error fetching remittance status: " + e.getMessage());
        }
    }

    public List<AccountWithRemittanceStatusDTO> generateAccountRemittanceStatusReportData(
            Integer feeId,
            String program,
            Year yearLevel,
            Character section,
            String remittanceStatusFilter,
            Sort sort
    ) {
        if (feeId == null) {
            throw new IllegalArgumentException("Fee ID cannot be null for generating remittance status report.");
        }

        // Step 1: Fetch all Class Treasurers matching program, year, section filters.
        // Create a base specification without sorting first.
        Specification<Accounts> spec = AccountSpecification.filterBy(
            null, 
            null, 
            Accounts.Role.Class_Treasurer.name(), 
            program != null && !"all".equalsIgnoreCase(program) ? program : null,
            yearLevel != null ? yearLevel.toString() : null, 
            section != null ? section.toString() : null,
            null 
        );
        
        // Fetch accounts using the specification. Sorting will be applied *after* status calculation if sort fields are DTO-specific.
        List<Accounts> treasurers = accountRepository.findAll(spec);

        // Step 2: For each treasurer, calculate their remittance status for the given feeId.
        List<AccountWithRemittanceStatusDTO> reportData = treasurers.stream().map(account -> {
            // Get student details for status calculation
            Students student = account.getStudent();
            String programId = null;
            Year studentYearLevel = null;
            Character sectionChar = null;
            boolean canCalculateStatus = false;

            if (student != null && student.getProgram() != null) {
                programId = student.getProgram().getProgramId();
                studentYearLevel = student.getYearLevel();
                sectionChar = student.getSection();
                canCalculateStatus = true;
            }

            // Calculate remittance status using the correct method
            // For hasRemittanceRecord, we need to check if any remittance exists for this account and fee.
            boolean hasRemittanceRecord = remittanceRepository.existsByAccountAccountIdAndFeeFeeId(account.getAccountId(), feeId);

            RemittanceStatus status = RemittanceStatus.NOT_REMITTED; // Default
            if (canCalculateStatus) {
                 status = remittanceStatusCalculator.calculateStatus(
                    feeId, programId, studentYearLevel, sectionChar, hasRemittanceRecord
                );
            } else {
                // Handle cases where student details are missing for status calculation
                // Defaulting to NOT_REMITTED or another appropriate status
            }
            
            AccountWithRemittanceStatusDTO dto = new AccountWithRemittanceStatusDTO();
            // Map account fields to DTO
            dto.setAccountId(account.getAccountId());
            dto.setEmail(account.getEmail());
            dto.setFirstName(account.getFirstName());
            dto.setLastName(account.getLastName());
            dto.setMiddleInitial(account.getMiddleInitial());
            dto.setRole(account.getRole().name());
            if (account.getStudent() != null) {
                dto.setStudentId(account.getStudent().getStudentId());
                dto.setStudentYearLevel(account.getStudent().getYearLevel());
                dto.setStudentSection(account.getStudent().getSection());
                if (account.getStudent().getProgram() != null) {
                    dto.setStudentProgramId(account.getStudent().getProgram().getProgramId());
                    dto.setStudentProgramCode(account.getStudent().getProgram().getProgramId());
                    dto.setStudentProgramName(account.getStudent().getProgram().getProgramName());
                }
            }

            dto.setFeeId(feeId);
            try {
                dto.setFeeType(feeService.getFeeById(feeId).getFeeType());
            } catch (Exception e) {
                // Handle if fee not found, or set a default
                dto.setFeeType("Unknown Fee"); 
            }
            // dto.setTotalRemittedAmount(summary.getTotalRemitted()); // Commented out
            // dto.setExpectedAmount(summary.getTotalExpected()); // Commented out
            dto.setRemittanceStatus(status.name());
            return dto;
        }).collect(Collectors.toList());

        // Step 3: Filter by remittanceStatusFilter if provided
        if (remittanceStatusFilter != null && !"all".equalsIgnoreCase(remittanceStatusFilter)) {
            reportData = reportData.stream()
                .filter(dto -> remittanceStatusFilter.equalsIgnoreCase(dto.getRemittanceStatus()))
                .collect(Collectors.toList());
        }

        // Step 4: Apply sorting
        if (sort != null && sort.isSorted()) {
            reportData.sort(createComparatorFromSort(sort));
        }

        return reportData;
    }

    // Helper to create a comparator from Spring Sort object for DTO list
    private Comparator<AccountWithRemittanceStatusDTO> createComparatorFromSort(Sort sort) {
        List<Comparator<AccountWithRemittanceStatusDTO>> comparators = new ArrayList<>();
        for (Sort.Order order : sort) {
            Comparator<AccountWithRemittanceStatusDTO> comparator = (dto1, dto2) -> {
                Object value1 = getPropertyValue(dto1, order.getProperty());
                Object value2 = getPropertyValue(dto2, order.getProperty());

                if (value1 == null && value2 == null) return 0;
                if (value1 == null) return order.isAscending() ? -1 : 1;
                if (value2 == null) return order.isAscending() ? 1 : -1;

                if (value1 instanceof Comparable && value2 instanceof Comparable) {
                    int comparison = ((Comparable) value1).compareTo(value2);
                    return order.isAscending() ? comparison : -comparison;
                }
                return 0; // Default if types are not comparable
            };
            comparators.add(comparator);
        }
        // Chain comparators if multiple sort orders are present
        return comparators.stream().reduce(Comparator::thenComparing).orElse((o1, o2) -> 0);
    }

    // Helper to get property value from DTO for sorting (simplified reflection)
    // For a production system, consider using a library like Apache Commons BeanUtils
    private Object getPropertyValue(AccountWithRemittanceStatusDTO dto, String propertyName) {
        // This is a simplified example. You'd need to handle nested properties like "account.student.lastName"
        // and map them to the correct DTO getter.
        switch (propertyName) {
            case "accountId": return dto.getAccountId();
            case "lastName": return dto.getLastName(); // Assuming DTO has getLastName()
            case "firstName": return dto.getFirstName();
            case "email": return dto.getEmail();
            case "studentProgramName": return dto.getStudentProgramName();
            case "studentYearLevel": return dto.getStudentYearLevel();
            case "studentSection": return dto.getStudentSection();
            case "feeType": return dto.getFeeType();
            case "remittanceStatus": return dto.getRemittanceStatus();
            // Add mappings for other sortable fields
            default:
                 // Try to map to student fields if prefixed
                if (propertyName.startsWith("student.")) {
                    String studentField = propertyName.substring("student.".length());
                    // Simplified: assumes direct mapping on student sub-object if it existed
                    // or direct field names on DTO like studentLastName
                    if ("lastName".equals(studentField)) return dto.getLastName();
                    if ("firstName".equals(studentField)) return dto.getFirstName();
                    // ... etc.
                }
                return null; // Or throw an exception for unhandled property
        }
    }
}
