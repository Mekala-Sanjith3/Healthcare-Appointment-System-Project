package com.hsa.dto;

import lombok.Data;

@Data
public class PatientCreationRequest {
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String address;
    private Integer age;
    private String gender;
    private String bloodGroup;
}
