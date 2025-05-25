package com.agaseeyyy.transparencysystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfig {

    /**
     * Configure Jackson to handle serialization issues, particularly with Hibernate proxies
     * and Java 8 date/time types
     */
    @Bean
    public ObjectMapper objectMapper() {
        Hibernate5JakartaModule hibernate5Module = new Hibernate5JakartaModule();
        // Configure Hibernate module to handle lazy loading properly
        hibernate5Module.configure(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING, false);
        hibernate5Module.configure(Hibernate5JakartaModule.Feature.USE_TRANSIENT_ANNOTATION, true);
        
        // Create and register the JavaTimeModule for handling LocalDate, LocalDateTime, etc.
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        
        return Jackson2ObjectMapperBuilder.json()
                .featuresToDisable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS) // Use ISO-8601 format instead of timestamps
                .modules(hibernate5Module, javaTimeModule)
                .build();
    }
}
