package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientHistoryDTO {
    private Long id;
    private String diagnosis;
    private String prescription;
    private String notes;
    private LocalDate date;
    private String doctorName;
    private String doctorId;
} 