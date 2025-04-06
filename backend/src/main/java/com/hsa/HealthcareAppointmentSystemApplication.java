package com.hsa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.hsa.model")
@EnableJpaRepositories(basePackages = "com.hsa.repository")
public class HealthcareAppointmentSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(HealthcareAppointmentSystemApplication.class, args);
    }
} 