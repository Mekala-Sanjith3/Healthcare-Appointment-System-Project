package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private String id;
    private String name;
    private String email;
    private String specialization;
    private String qualification;
    private String experience;
    private String clinicAddress;
    private String status;
    private String profilePicture;
    private String credentialsFile;
    private Double consultationFee;
    private String availabilitySchedule;
} 