package com.agaseeyyy.transparencysystem.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.PreparedStatement;

@Component
public class StoredProcedureLoader {
    private static final Logger log = LoggerFactory.getLogger(StoredProcedureLoader.class);
    
    private final DataSource dataSource;
    
    @Autowired
    public StoredProcedureLoader(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    @EventListener(ContextRefreshedEvent.class)
    public void loadStoredProcedures() {
        log.info("Checking for student search stored procedure...");
        
        try (Connection conn = dataSource.getConnection()) {
            // Check if the procedure already exists
            boolean procedureExists = checkProcedureExists(conn, "SearchStudents");
            
            if (procedureExists) {
                log.info("SearchStudents procedure already exists, skipping creation");
                return;
            }
            
            log.info("Creating SearchStudents procedure...");
            
            // Create the new procedure
            String createProcedure = 
                "CREATE PROCEDURE SearchStudents(\n" +
                "    IN p_search_term VARCHAR(255),\n" +
                "    IN p_limit INT\n" +
                ")\n" +
                "BEGIN\n" +
                "    -- Set default limit if not provided\n" +
                "    DECLARE limit_value INT;\n" +
                "    \n" +
                "    IF p_limit IS NULL THEN\n" +
                "        SET limit_value = 20;\n" +
                "    ELSE\n" +
                "        SET limit_value = p_limit;\n" +
                "    END IF;\n" +
                "    \n" +
                "    -- Search pattern with wildcards - use COLLATE to ensure consistent collation\n" +
                "    SET @pattern = CONCAT('%', p_search_term, '%') COLLATE utf8mb4_general_ci;\n" +
                "    \n" +
                "    -- Perform the search on students table with explicit collation\n" +
                "    SELECT \n" +
                "        'student' AS entity_type,\n" +
                "        student_id AS id,\n" +
                "        CONCAT(first_name, ' ', last_name) AS title,\n" +
                "        email AS secondary_info,\n" +
                "        year_level AS year,\n" +
                "        section,\n" +
                "        -- Format student_id for display\n" +
                "        CONCAT('STU-', LPAD(student_id, 6, '0')) AS formatted_id\n" +
                "    FROM \n" +
                "        students\n" +
                "    WHERE \n" +
                "        first_name COLLATE utf8mb4_general_ci LIKE @pattern OR\n" +
                "        last_name COLLATE utf8mb4_general_ci LIKE @pattern OR\n" +
                "        email COLLATE utf8mb4_general_ci LIKE @pattern OR\n" +
                "        CAST(student_id AS CHAR) COLLATE utf8mb4_general_ci LIKE @pattern\n" +
                "    ORDER BY \n" +
                "        -- Exact matches first, then partial matches\n" +
                "        CASE \n" +
                "            WHEN first_name COLLATE utf8mb4_general_ci = p_search_term COLLATE utf8mb4_general_ci OR \n" +
                "                 last_name COLLATE utf8mb4_general_ci = p_search_term COLLATE utf8mb4_general_ci THEN 0\n" +
                "            WHEN first_name COLLATE utf8mb4_general_ci LIKE CONCAT(p_search_term, '%') COLLATE utf8mb4_general_ci OR \n" +
                "                 last_name COLLATE utf8mb4_general_ci LIKE CONCAT(p_search_term, '%') COLLATE utf8mb4_general_ci THEN 1\n" +
                "            ELSE 2\n" +
                "        END\n" +
                "    LIMIT limit_value;\n" +
                "END";
            
            try (Statement createStmt = conn.createStatement()) {
                createStmt.execute(createProcedure);
                log.info("Successfully created SearchStudents procedure");
            }
        } catch (Exception e) {
            log.error("Failed to create stored procedure: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Check if a stored procedure exists in the database
     * @param conn Database connection
     * @param procedureName Name of the procedure to check
     * @return true if the procedure exists, false otherwise
     */
    private boolean checkProcedureExists(Connection conn, String procedureName) {
        try {
            // Get the database name from the connection
            String dbName = conn.getCatalog();
            
            // Query to check if procedure exists in INFORMATION_SCHEMA
            String sql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE " +
                         "ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = ? AND ROUTINE_NAME = ?";
                         
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, dbName);
                stmt.setString(2, procedureName);
                
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt(1) > 0;
                    }
                }
            }
            return false;
        } catch (Exception e) {
            log.warn("Error checking if procedure exists: {}", e.getMessage());
            return false; // Assume it doesn't exist if we can't check
        }
    }
}