package com.hsa.dto;

import lombok.Data;

@Data
public class AppointmentCompletionRequest {
    private String diagnosis;
    private String prescription;
    private String notes;
    private String followUpInstructions;
}