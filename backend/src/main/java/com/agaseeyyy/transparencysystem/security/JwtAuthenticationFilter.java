package com.agaseeyyy.transparencysystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String requestPath = request.getRequestURI();
        
        // Skip token validation for login and register paths
        if (requestPath.contains("/api/auth/login") || requestPath.contains("/api/auth/register")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        final String authHeader = request.getHeader("Authorization");
        logger.debug("Processing request for path: {}, auth header: {}", requestPath, 
                     authHeader == null ? "null" : "present");
                     
        // Check for Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.debug("No valid Authorization header found for path: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extract the JWT token (remove "Bearer " prefix)
            final String jwt = authHeader.substring(7);

            // Additional check: if token is empty or too short, don't try to parse
            if (jwt.isEmpty() || jwt.length() < 5) { // Basic check, real JWTs are much longer
                logger.debug("Extracted JWT is empty or too short for path: {}", requestPath);
                filterChain.doFilter(request, response);
                return;
            }

            final String userEmail = jwtService.extractUsername(jwt);
            
            logger.debug("JWT token processed for path: {}, extracted email: {}", requestPath, userEmail);
            
            // Check if user is already authenticated
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                logger.debug("User loaded from database: {}, Authorities: {}", 
                             userEmail, userDetails.getAuthorities());
                
                // Validate the token
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    
                    // Set details from request
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Update security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("Authentication successful for user: {}", userEmail);
                } else {
                    logger.warn("Token validation failed for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            logger.error("Error processing JWT token", e);
            // We don't throw the exception to allow the request to continue to the security filters
            // which will properly handle the authentication failure
        }
        
        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
} 