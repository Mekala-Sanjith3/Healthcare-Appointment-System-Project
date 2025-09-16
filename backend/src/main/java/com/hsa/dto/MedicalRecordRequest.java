package com.hsa.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MedicalRecordRequest {
    private String patientId;
    private String doctorId;
    private String diagnosis;
    private String prescription;
    private String notes;
    private LocalDate recordDate;
}
