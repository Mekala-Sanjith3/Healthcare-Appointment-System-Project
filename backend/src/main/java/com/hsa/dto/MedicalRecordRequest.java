package com.hsa.dto;

import lombok.Data;

@Data
public class MedicalRecordRequest {
    private Long patientId;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private String notes;
    private String attachments;
}