package com.hsa.controller;

import com.hsa.dto.AdminRegistrationRequest;
import com.hsa.dto.DoctorRegistrationRequest;
import com.hsa.dto.LoginRequest;
import com.hsa.dto.LoginResponse;
import com.hsa.dto.PatientRegistrationRequest;
import com.hsa.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register/doctor")
    public ResponseEntity<LoginResponse> registerDoctor(@RequestBody DoctorRegistrationRequest request) {
        return ResponseEntity.ok(authenticationService.registerDoctor(request));
    }

    @PostMapping("/register/patient")
    public ResponseEntity<LoginResponse> registerPatient(@RequestBody PatientRegistrationRequest request) {
        return ResponseEntity.ok(authenticationService.registerPatient(request));
    }

    @PostMapping("/register/admin")
    public ResponseEntity<LoginResponse> registerAdmin(@RequestBody AdminRegistrationRequest request) {
        return ResponseEntity.ok(authenticationService.registerAdmin(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authenticationService.login(request));
    }
} 