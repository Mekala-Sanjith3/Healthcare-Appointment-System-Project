package com.hsa.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class PatientRegistrationRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    private String password;
    
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    
    private String address;
    private String bloodGroup;
    
    @Min(value = 0, message = "Age must be positive")
    private Integer age;
    
    private String gender;
}