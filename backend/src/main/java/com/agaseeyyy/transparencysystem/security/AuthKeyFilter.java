package com.agaseeyyy.transparencysystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class AuthKeyFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@SuppressWarnings("null") HttpServletRequest request, 
                                    @SuppressWarnings("null") HttpServletResponse response, 
                                    @SuppressWarnings("null") FilterChain chain)
            throws ServletException, IOException {

        // Get the auth key from the header
        String authKey = request.getHeader("X-Auth-Key");

        // If we have an auth key, try to authenticate
        if (authKey != null && !authKey.isEmpty()) {
            try {
                // Parse the auth key (format: "userId:role")
                String[] parts = authKey.split(":");
                if (parts.length == 2) {
                    Integer userId = Integer.parseInt(parts[0]);
                    String role = parts[1];

                    // Set up the authentication in Spring Security
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // If there's any error parsing the token, just continue without authentication
                logger.error("Failed to process auth key", e);
            }
        }

        chain.doFilter(request, response);
    }
}