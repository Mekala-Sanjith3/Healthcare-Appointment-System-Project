package com.hsa.controller;

import com.hsa.dto.PatientProfileResponse;
import com.hsa.dto.UpdatePatientRequest;
import com.hsa.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Add this import with other imports
import com.hsa.dto.PatientDocumentResponse;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('PATIENT')")
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/profile")
    public ResponseEntity<PatientProfileResponse> getProfile() {
        return ResponseEntity.ok(patientService.getPatientProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientProfileResponse> updateProfile(@RequestBody UpdatePatientRequest request) {
        return ResponseEntity.ok(patientService.updateProfile(request));
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        return ResponseEntity.ok(patientService.uploadDocument(file, documentType));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<PatientDocumentResponse>> getDocuments() {
        return ResponseEntity.ok(patientService.getPatientDocuments());
    }
}