package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileDTO {
    private String id;
    private String name;
    private String email;
    private String specialization;
    private String address;
    private String phoneNumber;
    private String bio;
    private String profileImageUrl;
    private String gender;
    private String status;
} 