package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDocumentResponse {
    private Long id;
    private String documentType;
    private String fileUrl;
    private String uploadDate;
}