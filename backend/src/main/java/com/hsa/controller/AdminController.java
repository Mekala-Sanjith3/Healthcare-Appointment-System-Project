package com.hsa.controller;

import com.hsa.dto.DoctorResponse;
import com.hsa.dto.PatientResponse;
import com.hsa.dto.CreateDoctorRequest;
import com.hsa.dto.CreatePatientRequest;
import com.hsa.dto.UpdateDoctorRequest;
import com.hsa.dto.UpdatePatientRequest;
import com.hsa.dto.UpdateDoctorStatusRequest;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import java.io.IOException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponse>> getAllDoctors() {
        List<Doctor> doctors = adminService.getAllDoctors();
        List<DoctorResponse> response = doctors.stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctors/{id}")
    public ResponseEntity<DoctorResponse> getDoctorById(@PathVariable String id) {
        Doctor doctor = adminService.getDoctorById(id);
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @PostMapping("/doctors")
    public ResponseEntity<DoctorResponse> createDoctor(@RequestBody CreateDoctorRequest request) {
        Doctor doctor = adminService.createDoctor(request);
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<DoctorResponse> updateDoctor(
            @PathVariable String id,
            @RequestBody UpdateDoctorRequest request) {
        Doctor doctor = adminService.updateDoctor(id, request);
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @PutMapping("/doctors/{id}/status")
    public ResponseEntity<DoctorResponse> updateDoctorStatus(
            @PathVariable String id,
            @RequestBody UpdateDoctorStatusRequest request) {
        Doctor doctor = adminService.updateDoctorStatus(id, request.getStatus());
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @PostMapping(value = "/doctors/{id}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DoctorResponse> uploadProfilePicture(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Doctor doctor = adminService.uploadProfilePicture(id, file);
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @PostMapping(value = "/doctors/{id}/credentials", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DoctorResponse> uploadCredentials(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Doctor doctor = adminService.uploadCredentials(id, file);
        return ResponseEntity.ok(mapToDoctorResponse(doctor));
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String id) {
        adminService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PatientResponse>> getAllPatients() {
        List<Patient> patients = adminService.getAllPatients();
        List<PatientResponse> response = patients.stream()
                .map(this::mapToPatientResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientResponse> getPatientById(@PathVariable Long id) {
        Patient patient = adminService.getPatientById(id);
        return ResponseEntity.ok(mapToPatientResponse(patient));
    }

    @PostMapping("/patients")
    public ResponseEntity<PatientResponse> createPatient(@RequestBody CreatePatientRequest request) {
        Patient patient = adminService.createPatient(request);
        return ResponseEntity.ok(mapToPatientResponse(patient));
    }

    @PutMapping("/patients/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @RequestBody UpdatePatientRequest request) {
        Patient patient = adminService.updatePatient(id, request);
        return ResponseEntity.ok(mapToPatientResponse(patient));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        adminService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/patients/{id}/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientResponse> uploadPatientProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Patient patient = adminService.uploadPatientProfilePicture(id, file);
        return ResponseEntity.ok(mapToPatientResponse(patient));
    }

    @PostMapping(value = "/patients/{id}/medical-records", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientResponse> uploadMedicalRecords(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Patient patient = adminService.uploadMedicalRecords(id, file);
        return ResponseEntity.ok(mapToPatientResponse(patient));
    }

    private DoctorResponse mapToDoctorResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),
                doctor.getSpecialization(),
                doctor.getQualification(),
                doctor.getExperience(),
                doctor.getClinicAddress(),
                doctor.getStatus(),
                doctor.getProfilePicture(),
                doctor.getCredentialsFile(),
                doctor.getConsultationFee(),
                doctor.getAvailabilitySchedule()
        );
    }

    private PatientResponse mapToPatientResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getName(),
                patient.getEmail(),
                patient.getPhoneNumber(),
                patient.getAddress(),
                patient.getBloodGroup(),
                patient.getAge(),
                patient.getGender(),
                patient.getProfilePicture(),
                patient.getMedicalRecords()
        );
    }
} 