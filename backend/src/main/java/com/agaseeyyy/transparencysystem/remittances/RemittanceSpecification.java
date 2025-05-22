package com.agaseeyyy.transparencysystem.remittances;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import com.agaseeyyy.transparencysystem.accounts.Accounts;
import com.agaseeyyy.transparencysystem.enums.RemittanceStatus;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.programs.Programs;
import java.time.Year;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import java.util.List;

public class RemittanceSpecification {
    
    public static Specification<Remittances> getRemittancesSpecification(
            Integer feeId, String status, String accountId, 
            String program, Year yearLevel, Character section) {
        
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by Fee ID
            if (feeId != null) {
                Join<Remittances, Fees> feeJoin = root.join("fee");
                predicates.add(criteriaBuilder.equal(feeJoin.get("feeId"), feeId));
            }

            // Filter by Remittance Status (e.g., "Remitted", "Pending")
            if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
                try {
                    RemittanceStatus remittanceStatusEnum = RemittanceStatus.valueOf(status.toUpperCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), remittanceStatusEnum));
                } catch (IllegalArgumentException e) {
                    // Handle invalid status string, maybe log or ignore
                }
            }

            // Filter by Account ID (Class Treasurer's accountId)
            if (accountId != null && !accountId.trim().isEmpty()) {
                Join<Remittances, Accounts> accountJoin = root.join("account"); // 'account' is the field name in Remittances entity linking to Accounts
                predicates.add(criteriaBuilder.equal(accountJoin.get("accountId"), accountId));
            }

            // Filters related to the treasurer's student details (program, yearLevel, section)
            // These require joining through Account to Student
            if (program != null && !program.trim().isEmpty() && !program.equalsIgnoreCase("all") || 
                yearLevel != null || 
                section != null) {
                
                Join<Remittances, Accounts> accountJoin = root.join("account", JoinType.LEFT); // Use LEFT join if account might be optional
                Join<Accounts, Students> studentJoin = accountJoin.join("student", JoinType.LEFT); // Use LEFT join if student might be optional

                if (program != null && !program.trim().isEmpty() && !program.equalsIgnoreCase("all")) {
                    // Assuming student has a program object which has programCode or programId
                    predicates.add(criteriaBuilder.equal(studentJoin.get("program").get("programCode"), program));
                }
                if (yearLevel != null) {
                    predicates.add(criteriaBuilder.equal(studentJoin.get("yearLevel"), yearLevel));
                }
                if (section != null) {
                    predicates.add(criteriaBuilder.equal(studentJoin.get("section"), section));
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    public static Specification<Remittances> hasFee(Integer feeId) {
        return (root, query, cb) -> 
            feeId == null ? 
            cb.conjunction() : 
            cb.equal(root.get("fee").get("feeId"), feeId);
    }
    
    public static Specification<Remittances> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty() || status.equals("all")) {
                return cb.conjunction();
            }
            
            try {
                RemittanceStatus remittanceStatus = RemittanceStatus.valueOf(status);
                return cb.equal(root.get("status"), remittanceStatus);
            } catch (IllegalArgumentException e) {
                // Handle case where string doesn't match a valid enum value
                return cb.conjunction(); // Return always true predicate
            }
        };
    }
    
    public static Specification<Remittances> hasAccount(Long accountId) {
        return (root, query, criteriaBuilder) -> {
            if (accountId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("account").get("accountId"), accountId);
        };
    }

    public static Specification<Remittances> hasProgram(String programCode) {
        return (root, query, cb) -> {
            if (programCode == null || programCode.isEmpty() || "all".equalsIgnoreCase(programCode)) {
                return cb.conjunction(); // No filter
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            Join<Accounts, Students> studentJoin = accountJoin.join("student");
            Join<Students, Programs> programJoin = studentJoin.join("program");
            return cb.equal(programJoin.get("programId"), programCode);
        };
    }

    public static Specification<Remittances> hasYearLevel(Year yearLevelValue) {
        return (root, query, cb) -> {
            if (yearLevelValue == null) {
                return cb.conjunction(); // No filter
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            Join<Accounts, Students> studentJoin = accountJoin.join("student");
            return cb.equal(studentJoin.get("yearLevel"), yearLevelValue);
        };
    }

    public static Specification<Remittances> hasSection(Character sectionValue) {
        return (root, query, cb) -> {
            if (sectionValue == null) {
                return cb.conjunction(); // No filter
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            Join<Accounts, Students> studentJoin = accountJoin.join("student");
            return cb.equal(studentJoin.get("section"), sectionValue);
        };
    }

    // You might have other specific static Specification methods here, keep them if needed.
    // Example: by specific status
    public static Specification<Remittances> hasStatus(RemittanceStatus status) {
        return (root, query, criteriaBuilder) ->
                status == null ? criteriaBuilder.conjunction() :
                        criteriaBuilder.equal(root.get("status"), status);
    }

    // Example: by specific treasurer (account)
    public static Specification<Remittances> forTreasurer(String accountId) {
        return (root, query, criteriaBuilder) -> {
            if (accountId == null || accountId.trim().isEmpty()) {
                return criteriaBuilder.conjunction(); // No filter if accountId is null/empty
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            return criteriaBuilder.equal(accountJoin.get("accountId"), accountId);
        };
    }

    public static Specification<Remittances> filterBy(
            Long feeId,
            RemittanceStatus status,
            Long accountId,
            String program,
            String yearLevel,
            String section
    ) {
        return Specification.where(hasFee(feeId))
                .and(hasStatus(status))
                .and(hasAccount(accountId))
                .and(programEquals(program))
                .and(yearLevelEquals(yearLevel))
                .and(sectionEquals(section));
    }

    public static Specification<Remittances> hasFee(Long feeId) {
        return (root, query, cb) -> 
            feeId == null ? 
            cb.conjunction() : 
            cb.equal(root.get("fee").get("feeId"), feeId);
    }

    public static Specification<Remittances> programEquals(String program) {
        return (root, query, cb) -> {
            if (program == null || program.isEmpty() || "all".equalsIgnoreCase(program)) {
                return cb.conjunction();
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            Join<Accounts, Students> studentJoin = accountJoin.join("student");
            Join<Students, Programs> programJoin = studentJoin.join("program");
            return cb.equal(programJoin.get("programId"), program);
        };
    }

    public static Specification<Remittances> yearLevelEquals(String yearLevelStr) {
        return (root, query, cb) -> {
            if (yearLevelStr == null || yearLevelStr.isEmpty() || "all".equalsIgnoreCase(yearLevelStr)) {
                return cb.conjunction();
            }
            try {
                Year yearLevel = Year.parse(yearLevelStr);
                Join<Remittances, Accounts> accountJoin = root.join("account");
                Join<Accounts, Students> studentJoin = accountJoin.join("student");
                return cb.equal(studentJoin.get("yearLevel"), yearLevel);
            } catch (Exception e) { // Catch generic Exception for parsing issues
                return cb.disjunction(); // Or cb.conjunction() to ignore if parsing fails
            }
        };
    }

    public static Specification<Remittances> sectionEquals(String sectionStr) {
        return (root, query, cb) -> {
            if (sectionStr == null || sectionStr.isEmpty() || "all".equalsIgnoreCase(sectionStr) || sectionStr.length() != 1) {
                return cb.conjunction();
            }
            Join<Remittances, Accounts> accountJoin = root.join("account");
            Join<Accounts, Students> studentJoin = accountJoin.join("student");
            return cb.equal(studentJoin.get("section"), sectionStr.charAt(0));
        };
    }
} 