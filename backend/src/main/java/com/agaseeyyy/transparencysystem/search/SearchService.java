package com.agaseeyyy.transparencysystem.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SearchService {
    private static final Logger log = LoggerFactory.getLogger(SearchService.class);
    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;
    
    public SearchService(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }
    
    /**
     * Check if the SearchStudents procedure exists in the database
     */
    public boolean checkProcedureExists() {
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.routines " +
                "WHERE routine_type = 'PROCEDURE' AND routine_name = 'SearchStudents'",
                Integer.class);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("Error checking if procedure exists: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Search students using stored procedure
     */
    public Map<String, List<Map<String, Object>>> searchStudentsByProcedure(String searchTerm, Integer limit) {
        Map<String, List<Map<String, Object>>> results = new HashMap<>();
        List<Map<String, Object>> students = new ArrayList<>();
        results.put("students", students);
        
        try (Connection conn = dataSource.getConnection();
             CallableStatement cstmt = conn.prepareCall("{CALL SearchStudents(?, ?)}")) {
            
            // Set parameters
            cstmt.setString(1, searchTerm);
            if (limit != null) {
                cstmt.setInt(2, limit);
            } else {
                cstmt.setNull(2, java.sql.Types.INTEGER);
            }
            
            log.info("Executing SearchStudents procedure with term: {}", searchTerm);
            boolean hasResults = cstmt.execute();
            
            if (hasResults) {
                try (ResultSet rs = cstmt.getResultSet()) {
                    ResultSetMetaData metaData = rs.getMetaData();
                    int columnCount = metaData.getColumnCount();
                    
                    while (rs.next()) {
                        Map<String, Object> student = new HashMap<>();
                        for (int i = 1; i <= columnCount; i++) {
                            student.put(metaData.getColumnLabel(i), rs.getObject(i));
                        }
                        students.add(student);
                    }
                }
            }
            
            log.info("Found {} student results", students.size());
            
        } catch (Exception e) {
            log.error("Error executing SearchStudents procedure: {}", e.getMessage(), e);
        }
        
        return results;
    }
    
    /**
     * Direct SQL search fallback
     */
    public Map<String, List<Map<String, Object>>> directSqlSearch(String searchTerm, Integer limit) {
        Map<String, List<Map<String, Object>>> results = new HashMap<>();
        String searchPattern = "%" + searchTerm + "%";
        int limitValue = (limit != null) ? limit : 20;
        
        try {
            // Student search
            List<Map<String, Object>> students = jdbcTemplate.queryForList(
                "SELECT " +
                "    'student' AS entity_type, " +
                "    student_id AS id, " +
                "    CONCAT(first_name, ' ', last_name) AS title, " +
                "    email AS secondary_info, " +
                "    year_level AS year, " +
                "    section " +
                "FROM students " +
                "WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? " +
                "ORDER BY " +
                "    CASE " +
                "        WHEN first_name = ? OR last_name = ? THEN 0 " +
                "        WHEN first_name LIKE ? OR last_name LIKE ? THEN 1 " +
                "        ELSE 2 " +
                "    END " +
                "LIMIT ?",
                searchPattern, searchPattern, searchPattern,
                searchTerm, searchTerm,
                searchTerm + "%", searchTerm + "%",
                limitValue
            );
            
            results.put("students", students);
            results.put("fees", new ArrayList<>());
            results.put("payments", new ArrayList<>());
            results.put("remittances", new ArrayList<>());
            
        } catch (Exception e) {
            log.error("Error in direct SQL search: {}", e.getMessage(), e);
            results.put("students", new ArrayList<>());
            results.put("fees", new ArrayList<>());
            results.put("payments", new ArrayList<>());
            results.put("remittances", new ArrayList<>());
        }
        
        return results;
    }
}