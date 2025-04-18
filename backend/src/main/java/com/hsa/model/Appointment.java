package com.hsa.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String patientId;
    private String patientName;
    private String patientEmail;
    
    private String doctorId;
    private String doctorName;
    private String doctorSpecialization;
    
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String appointmentType;
    
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    
    private String notes;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    public enum AppointmentStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
} 