package com.hsa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@Entity
@Table(name = "patients")
public class Patient extends User {
    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String address;

    @Column
    private String bloodGroup;

    @Column
    private Integer age;

    @Column
    private String gender;
    
    @Column
    private String profilePicture;
    
    @Column
    private String medicalRecords;

    public Patient(String name, String email, String password, String phoneNumber,
                  String address, String bloodGroup, Integer age, String gender) {
        super(null, name, email, password, Role.PATIENT);
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.age = age;
        this.gender = gender;
    }
} 