package com.agaseeyyy.transparencysystem.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {
    
    private final FileUploadService fileUploadService;
    
    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    
    /**
     * Upload expense documentation
     */
    @PostMapping("/expenses/documentation")
    public ResponseEntity<Map<String, String>> uploadExpenseDocumentation(
            @RequestParam("file") MultipartFile file) {
        try {
            String filePath = fileUploadService.uploadExpenseDocumentation(file);
            
            Map<String, String> response = new HashMap<>();
            response.put("filePath", filePath);
            response.put("fileName", file.getOriginalFilename());
            response.put("message", "File uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Serve uploaded files by path parameter
     */
    @GetMapping("/serve")
    public ResponseEntity<Resource> serveFileByPath(
            @RequestParam("path") String filePath,
            @RequestParam(value = "download", defaultValue = "false") boolean download) {
        try {
            Path fullPath = fileUploadService.getFilePath(filePath);
            
            if (!Files.exists(fullPath)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(fullPath.toUri());
            
            // Determine content type
            String contentType = Files.probeContentType(fullPath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            String filename = fullPath.getFileName().toString();
            String disposition = download ? "attachment" : "inline";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            disposition + "; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Serve uploaded files by path segments
     */
    @GetMapping("/{subdirectory}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String subdirectory,
            @PathVariable String filename) {
        try {
            String relativePath = subdirectory + "/" + filename;
            Path filePath = fileUploadService.getFilePath(relativePath);
            
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a file by query parameter
     */
    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteFileByPath(
            @RequestParam("path") String filePath) {
        
        boolean deleted = fileUploadService.deleteFile(filePath);
        
        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "File not found or could not be deleted");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Delete a file
     */
    @DeleteMapping("/{subdirectory}/{filename:.+}")
    public ResponseEntity<Map<String, String>> deleteFile(
            @PathVariable String subdirectory,
            @PathVariable String filename) {
        
        String relativePath = subdirectory + "/" + filename;
        boolean deleted = fileUploadService.deleteFile(relativePath);
        
        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("message", "File deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "File not found or could not be deleted");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
