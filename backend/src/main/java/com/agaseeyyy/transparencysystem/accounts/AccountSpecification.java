package com.agaseeyyy.transparencysystem.accounts;

import org.springframework.data.jpa.domain.Specification;

import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.remittances.Remittances;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;

public class AccountSpecification {
    public static Specification<Accounts> hasRole(String role) {
        return (root, query, cb) -> role == null || role.isEmpty() ? cb.conjunction() : cb.equal(root.get("role"), Accounts.Role.valueOf(role.toUpperCase()));
    }

    /**
     * Finds Accounts with the role Class_Treasurer that do NOT have a Remittance record 
     * for the specified feeId.
     */
    public static Specification<Accounts> findUnremittedClassTreasurersForFee(Integer feeId) {
        return (root, query, cb) -> {
            // Predicate for filtering by role 'Class_Treasurer'
            Predicate rolePredicate = cb.equal(root.get("role"), Accounts.Role.Class_Treasurer);

            if (feeId == null) {
                // If feeId is null, the condition of being "unremitted for a specific fee" is ill-defined.
                // Depending on requirements, could return all treasurers, no treasurers, or throw error.
                // For now, let's assume feeId is mandatory for this specific check and return no results if null.
                // Alternatively, throw new IllegalArgumentException("feeId cannot be null for this specification");
                return cb.and(rolePredicate, cb.disjunction()); // Ensures only class treasurers, but no specific fee check means no unremitted status determined
            }

            // Subquery to find Remittances for the current Account (root) and the given feeId
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<Remittances> remittanceRoot = subquery.from(Remittances.class);
            subquery.select(cb.literal(1L)); // We only care about existence

            Predicate feeMatchPredicate = cb.equal(remittanceRoot.get("fee").get("feeId"), feeId);
            Predicate accountMatchPredicate = cb.equal(remittanceRoot.get("account").get("accountId"), root.get("accountId"));
            
            subquery.where(cb.and(feeMatchPredicate, accountMatchPredicate));

            // We want Accounts where such a Remittance does NOT exist
            Predicate notRemittedPredicate = cb.not(cb.exists(subquery));

            return cb.and(rolePredicate, notRemittedPredicate);
        };
    }

    // Add a simple specification to get all Class Treasurers, which might be useful for your service layer
    public static Specification<Accounts> isClassTreasurer() {
        return (root, query, cb) -> cb.equal(root.get("role"), Accounts.Role.Class_Treasurer);
    }
    
    /**
     * Creates a specification that gets all class treasurers with aggregated remittance data for a specific fee.
     * The query will include both treasurers who have remitted and those who haven't, with the total amount
     * remitted calculated at the database level.
     */
    public static Specification<Accounts> findAllTreasurersWithRemittanceStatus(Integer feeId) {
        return (root, query, cb) -> {
            // First, filter for class treasurers only
            Predicate rolePredicate = cb.equal(root.get("role"), Accounts.Role.Class_Treasurer);
            
            // We need to handle aggregation, so we modify the query selection
            if (query.getResultType() == Accounts.class && !query.isDistinct()) {
                // We need to use a GROUP BY to aggregate, so make the query distinct
                query.distinct(true);
                
                // Create a left join to remittances to include treasurers who haven't remitted
                Join<Accounts, Remittances> remittanceJoin = root.join("remittances", JoinType.LEFT);
                
                // Add condition for the specific fee
                Predicate feePredicate = cb.or(
                    cb.equal(remittanceJoin.get("fee").get("feeId"), feeId),
                    cb.isNull(remittanceJoin.get("fee"))
                );
                
                // We're using selection to transform and add calculated fields
                query.groupBy(root.get("accountId"));
                
                // Calculate the sum of remitted amounts
                Expression<Double> sumAmount = cb.sum(remittanceJoin.get("amountRemitted"));
                
                // Count remittances to determine if any exist
                Expression<Long> countRemittances = cb.count(remittanceJoin.get("remittanceId"));
                
                // Add these expressions to the selection
                query.multiselect(
                    root,
                    cb.coalesce(sumAmount, 0.0).alias("totalRemitted"),
                    cb.greaterThan(countRemittances, 0L).alias("hasRemitted"),
                    cb.literal(feeId).alias("feeId")
                );
                
                return cb.and(rolePredicate, feePredicate);
            }

            // For count queries and other cases
            return rolePredicate;
        };
    }

    public static Specification<Accounts> filterBy(String email, String studentId, String role, String program, String yearLevel, String section, String status) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (email != null && !email.isEmpty()) {
                predicate = cb.and(predicate, cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() + "%"));
            }

            if (role != null && !role.isEmpty()) {
                try {
                    Accounts.Role accountRole = Accounts.Role.valueOf(role.toUpperCase());
                    predicate = cb.and(predicate, cb.equal(root.get("role"), accountRole));
                } catch (IllegalArgumentException e) {
                    // Handle invalid role string, maybe log or ignore
                }
            }

            // Student-related filters require joining with the Student entity
            if (studentId != null && !studentId.isEmpty()) {
                Join<Accounts, com.agaseeyyy.transparencysystem.students.Students> studentJoin = root.join("student", JoinType.LEFT);
                predicate = cb.and(predicate, cb.equal(studentJoin.get("studentId"), Long.parseLong(studentId)));
            }

            if (program != null && !program.isEmpty() && !"all".equalsIgnoreCase(program)) {
                Join<Accounts, com.agaseeyyy.transparencysystem.students.Students> studentJoin = root.join("student", JoinType.LEFT);
                Join<com.agaseeyyy.transparencysystem.students.Students, com.agaseeyyy.transparencysystem.programs.Programs> programJoin = studentJoin.join("program", JoinType.LEFT);
                predicate = cb.and(predicate, cb.equal(programJoin.get("programId"), program));
            }

            if (yearLevel != null && !yearLevel.isEmpty() && !"all".equalsIgnoreCase(yearLevel)) {
                Join<Accounts, com.agaseeyyy.transparencysystem.students.Students> studentJoin = root.join("student", JoinType.LEFT);
                try {
                    predicate = cb.and(predicate, cb.equal(studentJoin.get("yearLevel"), java.time.Year.parse(yearLevel)));
                } catch (Exception e) {
                    // Handle parse exception
                }
            }

            if (section != null && !section.isEmpty() && !"all".equalsIgnoreCase(section)) {
                Join<Accounts, com.agaseeyyy.transparencysystem.students.Students> studentJoin = root.join("student", JoinType.LEFT);
                predicate = cb.and(predicate, cb.equal(studentJoin.get("section"), section.charAt(0)));
            }
            
            // Status filter for Accounts itself (if applicable, e.g., account status like Active/Inactive)
            // This example assumes 'status' is a direct field on the Accounts entity.
            // If 'status' refers to something else (e.g., student status), adjust accordingly.
            if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
                 // Example: predicate = cb.and(predicate, cb.equal(root.get("accountStatus"), status));
                 // For now, this is a placeholder if Accounts has a direct status field.
            }

            return predicate;
        };
    }
}
