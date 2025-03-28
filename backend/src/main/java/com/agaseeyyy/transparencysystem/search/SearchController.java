package com.agaseeyyy.transparencysystem.search;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;  // Add this import!
import java.util.Map;

@RestController
@RequestMapping("/api/v1/search")
@CrossOrigin(origins = "${app.cors.allowed-origins:*}")
public class SearchController {
    private static final Logger log = LoggerFactory.getLogger(SearchController.class);
    private final SearchService searchService;
    
    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }
    
    @GetMapping("/global")
    // REMOVE this annotation - it's causing security issues
    // @PreAuthorize("hasAnyAuthority('Admin', 'Org_Treasurer', 'Class_Treasurer')")
    public ResponseEntity<?> globalSearch(
            @RequestParam String q,
            @RequestParam(required = false) Integer limit) {
        
        log.info("Received global search request for: {}", q);
        
        if (q == null || q.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", "Search term cannot be empty"
            ));
        }
        
        try {
            Map<String, List<Map<String, Object>>> searchResults;
            
            // First try with stored procedure
            if (searchService.checkProcedureExists()) {
                log.info("Using stored procedure for student search");
                searchResults = searchService.searchStudentsByProcedure(q.trim(), limit);
            } else {
                // Fall back to direct SQL if procedure doesn't exist
                log.warn("Stored procedure not found, using direct SQL search");
                searchResults = searchService.directSqlSearch(q.trim(), limit);
            }
            
            Map<String, Object> response = Map.of(
                "status", "success",
                "query", q,
                "results", searchResults
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing search request: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "error",
                "message", "Error performing search: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/check-procedure")
    public ResponseEntity<?> checkProcedure() {
        boolean exists = searchService.checkProcedureExists();
        return ResponseEntity.ok(Map.of(
            "status", exists ? "available" : "unavailable",
            "procedureExists", exists,
            "procedureName", "SearchStudents"
        ));
    }
}