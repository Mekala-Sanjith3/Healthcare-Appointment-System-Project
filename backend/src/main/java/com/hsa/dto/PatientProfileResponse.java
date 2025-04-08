package com.hsa.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String bloodGroup;
    private Integer age;
    private String gender;
}