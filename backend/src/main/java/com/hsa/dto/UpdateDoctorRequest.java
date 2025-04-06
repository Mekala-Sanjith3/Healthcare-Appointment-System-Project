package com.hsa.dto;

import lombok.Data;

@Data
public class UpdateDoctorRequest {
    private String name;
    private String email;
    private String specialization;
    private String qualification;
    private String experience;
    private String clinicAddress;
    private Double consultationFee;
    private String availabilitySchedule;
} 