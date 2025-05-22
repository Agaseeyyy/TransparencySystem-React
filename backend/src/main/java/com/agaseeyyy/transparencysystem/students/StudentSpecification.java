package com.agaseeyyy.transparencysystem.students;

import java.time.Year;

import org.springframework.data.jpa.domain.Specification;

public class StudentSpecification {
    
    public static Specification<Students> hasProgram(String programId) {
        return (root, query, cb) -> 
            programId == null || programId.isEmpty() ? 
            cb.conjunction() : 
            cb.equal(root.get("program").get("programId"), programId);
    }
    
    public static Specification<Students> hasYearLevel(String yearLevel) {
        return (root, query, cb) -> {
            if (yearLevel == null || yearLevel.isEmpty()) return cb.conjunction();
            try {
                return cb.equal(root.get("yearLevel"), Year.of(Integer.parseInt(yearLevel)));
            } catch (NumberFormatException e) {
                return cb.conjunction(); // Invalid year format, return always true predicate
            }
        };
    }
    
    public static Specification<Students> hasSection(String section) {
        return (root, query, cb) -> 
            section == null || section.isEmpty() ? 
            cb.conjunction() : 
            cb.equal(root.get("section"), section.toUpperCase().charAt(0));
    }
    
    public static Specification<Students> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty()) return cb.conjunction();
            try {
                Students.Status statusEnum = Students.Status.valueOf(status);
                return cb.equal(root.get("status"), statusEnum);
            } catch (IllegalArgumentException e) {
                return cb.conjunction(); // Invalid status, return always true predicate
            }
        };
    }

    public static Specification<Students> filterBy(String program, String yearLevel, String section, String status) {
        return Specification.where(hasProgram(program))
                .and(hasYearLevel(yearLevel))
                .and(hasSection(section))
                .and(hasStatus(status));
    }
}