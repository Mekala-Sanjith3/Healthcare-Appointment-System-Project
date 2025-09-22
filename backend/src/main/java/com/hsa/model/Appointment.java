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
    
    @Column(name = "patient_id")
    private Long patientId;
    
    @Column(name = "patient_name")
    private String patientName;
    
    @Column(name = "patient_email")
    private String patientEmail;
    
    @Column(name = "doctor_id")
    private String doctorId;
    
    @Column(name = "doctor_name")
    private String doctorName;
    
    @Column(name = "doctor_specialization")
    private String doctorSpecialization;
    
    @Column(name = "appointment_date")
    private LocalDate appointmentDate;
    
    @Column(name = "appointment_time")
    private LocalTime appointmentTime;
    
    @Column(name = "appointment_type")
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