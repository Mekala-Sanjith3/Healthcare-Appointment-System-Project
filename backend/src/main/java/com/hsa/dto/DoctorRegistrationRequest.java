package com.hsa.dto;

import lombok.Data;

@Data
public class DoctorRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String specialization;
    private String qualification;
    private String experience;
    private String clinicAddress;
} 