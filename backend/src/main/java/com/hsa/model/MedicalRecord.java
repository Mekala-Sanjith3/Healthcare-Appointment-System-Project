package com.hsa.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "patient_id")
    private Long patientId;
    
    @Column(name = "patient_name")
    private String patientName;
    
    @Column(name = "doctor_id")
    private String doctorId;
    
    @Column(name = "doctor_name")
    private String doctorName;
    
    private String diagnosis;
    private String prescription;
    private String notes;
    
    private LocalDate date;
    
    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
    
    @Column(name = "created_at")
    private LocalDate createdAt;
    
    @Column(name = "updated_at")
    private LocalDate updatedAt;
} 