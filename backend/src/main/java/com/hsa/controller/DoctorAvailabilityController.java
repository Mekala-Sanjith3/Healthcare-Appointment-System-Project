package com.hsa.controller;

import com.hsa.dto.DoctorAvailabilityRequest;
import com.hsa.model.DoctorAvailability;
import com.hsa.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor-availability")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorAvailability> setAvailability(@RequestBody DoctorAvailabilityRequest request) {
        return ResponseEntity.ok(availabilityService.setAvailability(request));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'PATIENT')")  // Add authorization
    public ResponseEntity<List<DoctorAvailability>> getDoctorAvailability(@PathVariable Long doctorId) {
        return ResponseEntity.ok(availabilityService.getDoctorAvailability(doctorId));
    }
}