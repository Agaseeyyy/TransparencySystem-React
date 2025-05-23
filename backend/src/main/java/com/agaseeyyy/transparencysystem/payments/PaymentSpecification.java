package com.agaseeyyy.transparencysystem.payments;

import com.agaseeyyy.transparencysystem.enums.Status;
import com.agaseeyyy.transparencysystem.fees.Fees;
import com.agaseeyyy.transparencysystem.students.Students;
import com.agaseeyyy.transparencysystem.programs.Programs;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class PaymentSpecification {
    
    public static Specification<Payments> filterBy(
            Long feeId,
            Long studentId,
            String status,
            String program,
            String yearLevel,
            String section
    ) {
        return Specification.where(hasFee(feeId))
                .and(hasStudent(studentId))
                .and(hasStatus(status))
                .and(hasProgram(program))
                .and(hasYearLevel(yearLevel))
                .and(hasSection(section));
    }

    public static Specification<Payments> hasFee(Long feeId) {
        return (root, query, cb) ->
                feeId == null ? cb.conjunction() :
                        cb.equal(root.get("fee").get("feeId"), feeId);
    }

    public static Specification<Payments> hasStudent(Long studentId) {
        return (root, query, cb) ->
                studentId == null ? cb.conjunction() :
                        cb.equal(root.get("student").get("studentId"), studentId);
    }
    
    public static Specification<Payments> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty() || "all".equalsIgnoreCase(status)) {
                return cb.conjunction();
            }
            
            try {
                if ("Paid".equalsIgnoreCase(status)) {
                    return cb.equal(root.get("status"), Status.Paid);
                } else if ("Pending".equalsIgnoreCase(status)) {
                    return cb.equal(root.get("status"), Status.Pending);
                } else if ("Remitted".equalsIgnoreCase(status)) {
                    return cb.equal(root.get("status"), Status.Remitted);
                } else {
                    // Try to parse the status as an enum value directly
                    Status enumStatus = Status.valueOf(status);
                    return cb.equal(root.get("status"), enumStatus);
                }
            } catch (IllegalArgumentException e) {
                // If the status string doesn't match any enum value, return a conjunction (true)
                return cb.conjunction();
            }
        };
    }
    
    public static Specification<Payments> hasProgram(String program) {
        return (root, query, cb) -> {
            if (program == null || program.isEmpty() || "all".equalsIgnoreCase(program)) {
                return cb.conjunction();
            }
            Join<Payments, Students> studentJoin = root.join("student");
            Join<Students, Programs> programJoin = studentJoin.join("program");
            return cb.equal(programJoin.get("programId"), program);
        };
    }
    
    public static Specification<Payments> hasYearLevel(String yearLevel) {
        return (root, query, cb) -> {
            if (yearLevel == null || yearLevel.isEmpty() || "all".equalsIgnoreCase(yearLevel)) {
                return cb.conjunction();
            }
            try {
                int yl = Integer.parseInt(yearLevel);
                Join<Payments, Students> studentJoin = root.join("student");
                return cb.equal(studentJoin.get("yearLevel"), yl);
            } catch (NumberFormatException e) {
                return cb.disjunction();
            }
        };
    }
    
    public static Specification<Payments> hasSection(String section) {
        return (root, query, cb) -> {
            if (section == null || section.isEmpty() || "all".equalsIgnoreCase(section) || section.length() != 1) {
                return cb.conjunction();
            }
            Join<Payments, Students> studentJoin = root.join("student");
            return cb.equal(studentJoin.get("section"), section.charAt(0));
        };
    }
    
    public static Specification<Payments> filterByStudentDetailsAndFee(
            String program, 
            java.time.Year yearLevel, 
            Character section, 
            Integer feeId
    ) {
        Specification<Payments> spec = Specification.where(null);

        if (program != null && !program.isEmpty() && !"all".equalsIgnoreCase(program)) {
            spec = spec.and(hasProgram(program));
            }
        if (yearLevel != null) {
            spec = spec.and(hasYearLevel(yearLevel.toString())); // Convert Year to String for existing hasYearLevel
        }
        if (section != null) {
            spec = spec.and(hasSection(section.toString())); // Convert Character to String for existing hasSection
        }
        if (feeId != null) {
            spec = spec.and(hasFee(Long.valueOf(feeId)));
        }
        
        return spec;
    }

    public static Specification<Payments> hasPaymentDate(String dateStr) {
        return (root, query, cb) -> {
            if (dateStr == null || dateStr.isEmpty() || "all".equalsIgnoreCase(dateStr)) {
                return cb.conjunction();
            }
            try {
                // Assuming dateStr is in "yyyy-MM-dd" format
                java.time.LocalDate paymentDate = java.time.LocalDate.parse(dateStr);
                return cb.equal(root.get("paymentDate"), paymentDate);
            } catch (java.time.format.DateTimeParseException e) {
                // Handle parsing error, perhaps log it or return a disjunction
                return cb.disjunction(); 
            }
        };
    }
} 