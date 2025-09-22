package com.hsa.controller;

import com.hsa.dto.PatientRegistrationRequest;
import com.hsa.model.Patient;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.UserRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.config.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TestAuthController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register/patient")
    public Map<String, Object> registerPatient(@RequestBody PatientRegistrationRequest request) {
        try {
            System.out.println("Attempting to register patient with email: " + request.getEmail());
            
            // Check if email already exists
            var existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent()) {
                System.out.println("Email already exists: " + request.getEmail());
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Email already exists in users table");
                return response;
            }
            
            // Create Patient using the constructor that handles inheritance properly
            var patient = new Patient(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                request.getAddress(),
                request.getBloodGroup(),
                request.getAge(),
                request.getGender()
            );
            
            patientRepository.save(patient);
            
            // Generate JWT token
            var token = jwtService.generateToken(patient);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Patient registered successfully");
            response.put("token", token);
            response.put("email", patient.getEmail());
            response.put("role", patient.getRole().name());
            response.put("userId", patient.getId().toString());
            response.put("patientId", patient.getId());
            response.put("name", patient.getName());
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return response;
        }
    }
}
