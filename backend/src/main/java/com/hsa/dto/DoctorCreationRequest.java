package com.hsa.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class DoctorCreationRequest {
    private String name;
    private String email;
    private String password;
    private String specialization;
    private String phoneNumber;
    private String address;
    private Integer experience;
    private String qualification;
    private Double consultationFee;
    private LocalTime availableFrom;
    private LocalTime availableTo;
}
