package com.tarcom.dossiers.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DebugMongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @PostConstruct
    public void printUri() {
        System.out.println("MONGO URI USED = " + mongoUri);
    }
}
