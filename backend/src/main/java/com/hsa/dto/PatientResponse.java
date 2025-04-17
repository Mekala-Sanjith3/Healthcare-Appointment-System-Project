package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Integer age;
    private String gender;
    private String profilePicture;
    private String medicalRecords;
} 