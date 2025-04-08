package com.hsa.service;

import com.hsa.dto.PatientProfileResponse;
import com.hsa.dto.UpdatePatientRequest;
import com.hsa.dto.PatientDocumentResponse;
import com.hsa.model.Patient;
import com.hsa.repository.PatientRepository;
import com.hsa.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.ArrayList;

// Add to imports
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;  // Add this import
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;
    private final SecurityUtils securityUtils;
    private final FileStorageService fileStorageService;

    public PatientProfileResponse getPatientProfile() {
        Patient patient = securityUtils.getCurrentPatient();
        return mapToPatientProfileResponse(patient);
    }

    public PatientProfileResponse updateProfile(UpdatePatientRequest request) {
        Patient patient = securityUtils.getCurrentPatient();
        
        patient.setName(request.getName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAddress(request.getAddress());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        
        patientRepository.save(patient);
        return mapToPatientProfileResponse(patient);
    }

    public String uploadDocument(MultipartFile file, String documentType) {
        Patient patient = securityUtils.getCurrentPatient();
        return fileStorageService.store(file, patient.getId(), documentType);
    }

    public List<PatientDocumentResponse> getPatientDocuments() {
        Patient patient = securityUtils.getCurrentPatient();
        Path patientPath = Paths.get("documents", patient.getId().toString());
        
        try {
            return Files.walk(patientPath)
                .filter(Files::isRegularFile)
                .map(path -> new PatientDocumentResponse(
                    null,
                    path.getParent().getFileName().toString(),
                    path.toString(),
                    LocalDateTime.now().toString()
                ))
                .collect(Collectors.toList());
        } catch (java.io.IOException e) {
            return new ArrayList<>();
        }
    }

    private PatientProfileResponse mapToPatientProfileResponse(Patient patient) {
        return new PatientProfileResponse(
            patient.getId(),
            patient.getName(),
            patient.getEmail(),
            patient.getPhoneNumber(),
            patient.getAddress(),
            patient.getBloodGroup(),
            patient.getAge(),
            patient.getGender()
        );
    }
}