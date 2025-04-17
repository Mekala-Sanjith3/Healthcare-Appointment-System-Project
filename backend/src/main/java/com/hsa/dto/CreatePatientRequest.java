package com.hsa.dto;

import lombok.Data;

@Data
public class CreatePatientRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Integer age;
    private String gender;
} 