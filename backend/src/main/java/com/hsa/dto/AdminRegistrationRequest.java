package com.hsa.dto;

import lombok.Data;

@Data
public class AdminRegistrationRequest {
    private String name;
    private String email;
    private String password;
    private String department;
    private String contactNumber;
} 