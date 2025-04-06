package com.hsa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@Table(name = "doctors")
public class Doctor extends User {
    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private String qualification;

    @Column(nullable = false)
    private String experience;

    @Column
    private String clinicAddress;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column
    private String profilePicture;

    @Column
    private String credentialsFile;

    @Column
    private Double consultationFee;

    @Column
    private String availabilitySchedule;

    public Doctor(String name, String email, String password, String specialization,
                 String qualification, String experience, String clinicAddress) {
        super(null, name, email, password, Role.DOCTOR);
        this.specialization = specialization;
        this.qualification = qualification;
        this.experience = experience;
        this.clinicAddress = clinicAddress;
        this.status = "PENDING";
        this.consultationFee = 0.0;
    }
} 