package com.agaseeyyy.transparencysystem.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    // Handle ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Not Found",
            ex.getMessage(),
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }
    
    // Handle ResourceAlreadyExistsException
    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<Object> handleResourceAlreadyExistsException(
            ResourceAlreadyExistsException ex, WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            "Conflict",
            ex.getMessage(),
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }
    
    // Handle BadRequestException
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Object> handleBadRequestException(
            BadRequestException ex, WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            ex.getMessage(),
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    // Handle DataIntegrityViolationException (for database constraint violations)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, WebRequest request) {
        
        String path = getRequestPath(request);
        String message = ex.getMessage();
        
        // Check for duplicate entry
        if (message.contains("Duplicate entry") || message.contains("duplicate key") || 
            message.contains("already exists") || message.contains("unique constraint")) {
            ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                "Conflict",
                "A record with the same data already exists",
                path
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        }
        
        // Other database constraint errors
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            "Database constraint violation",
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    // Handle general RuntimeException
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Object> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        
        logger.error("Handling RuntimeException", ex);
        String path = getRequestPath(request);
        String message = ex.getMessage();
        
        // Check for common error patterns
        if (message != null) {
            // Check for duplicate error messages
            if (message.contains("already exists") || message.contains("duplicate")) {
                ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.CONFLICT.value(),
                    "Conflict",
                    message,
                    path
                );
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
            }
            
            // Check for not found errors
            if (message.contains("not found") || message.contains("does not exist")) {
                ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.NOT_FOUND.value(),
                    "Not Found",
                    message,
                    path
                );
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
        }
        
        // Default to Bad Request for other runtime exceptions
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Bad Request",
            message,
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    // Handle Security exceptions
    @ExceptionHandler({AccessDeniedException.class})
    public ResponseEntity<Object> handleAccessDeniedException(
            AccessDeniedException ex, WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            "Forbidden",
            "You don't have permission to access this resource",
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler({AuthenticationException.class, BadCredentialsException.class})
    public ResponseEntity<Object> handleAuthenticationException(
            Exception ex, WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.UNAUTHORIZED.value(),
            "Unauthorized",
            "Authentication failed: " + ex.getMessage(),
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }
    
    // Handle validation exceptions
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, 
            HttpHeaders headers,
            HttpStatus status, 
            WebRequest request) {
        
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Validation Error",
            "Validation failed",
            path
        );
        
        // Add field-specific validation errors
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errorResponse.addValidationError(error.getField(), error.getDefaultMessage());
        }
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    // Handle general exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGenericException(
            Exception ex, WebRequest request) {
        
        logger.error("Handling unhandled exception", ex);
        String path = getRequestPath(request);
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal Server Error",
            "An unexpected error occurred",
            path
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // Helper method to get the request path
    private String getRequestPath(WebRequest request) {
        String path = "";
        if (request instanceof ServletWebRequest) {
            HttpServletRequest servletRequest = ((ServletWebRequest) request).getRequest();
            path = servletRequest.getRequestURI();
        }
        return path;
    }
} 