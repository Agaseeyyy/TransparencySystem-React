DELIMITER //

DROP PROCEDURE IF EXISTS SearchStudents//

CREATE PROCEDURE SearchStudents(
    IN p_search_term VARCHAR(255),
    IN p_limit INT
)
BEGIN
    -- Set default limit if not provided
    DECLARE limit_value INT;
    
    IF p_limit IS NULL THEN
        SET limit_value = 20;
    ELSE
        SET limit_value = p_limit;
    END IF;
    
    -- Search pattern with wildcards - use COLLATE to ensure consistent collation
    SET @pattern = CONCAT('%', p_search_term, '%') COLLATE utf8mb4_general_ci;
    
    -- Perform the search on students table with explicit collation
    SELECT 
        'student' AS entity_type,
        student_id AS id,
        CONCAT(first_name, ' ', last_name) AS title,
        email AS secondary_info,
        year_level AS year,
        section,
        -- Format student_id for display
        CONCAT('STU-', LPAD(student_id, 6, '0')) AS formatted_id
    FROM 
        students
    WHERE 
        first_name COLLATE utf8mb4_general_ci LIKE @pattern OR
        last_name COLLATE utf8mb4_general_ci LIKE @pattern OR
        email COLLATE utf8mb4_general_ci LIKE @pattern OR
        CAST(student_id AS CHAR) COLLATE utf8mb4_general_ci LIKE @pattern
    ORDER BY 
        -- Exact matches first, then partial matches
        CASE 
            WHEN first_name COLLATE utf8mb4_general_ci = p_search_term COLLATE utf8mb4_general_ci OR 
                 last_name COLLATE utf8mb4_general_ci = p_search_term COLLATE utf8mb4_general_ci THEN 0
            WHEN first_name COLLATE utf8mb4_general_ci LIKE CONCAT(p_search_term, '%') COLLATE utf8mb4_general_ci OR 
                 last_name COLLATE utf8mb4_general_ci LIKE CONCAT(p_search_term, '%') COLLATE utf8mb4_general_ci THEN 1
            ELSE 2
        END
    LIMIT limit_value;
END//

DELIMITER ;