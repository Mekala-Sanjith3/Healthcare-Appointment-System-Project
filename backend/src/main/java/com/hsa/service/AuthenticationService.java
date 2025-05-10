package com.hsa.service;

import com.hsa.config.JwtService;
import com.hsa.dto.*;
import com.hsa.model.*;
import com.hsa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CaptchaService captchaService;

    public LoginResponse registerDoctor(DoctorRegistrationRequest request) {
        var doctor = new Doctor(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getSpecialization(),
                request.getQualification(),
                request.getExperience(),
                request.getClinicAddress()
        );
        doctorRepository.save(doctor);
        var token = jwtService.generateToken(doctor);
        return new LoginResponse(token, doctor.getEmail(), doctor.getRole(), doctor.getId());
    }

    public LoginResponse registerPatient(PatientRegistrationRequest request) {
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
        var token = jwtService.generateToken(patient);
        return new LoginResponse(token, patient.getEmail(), patient.getRole().name(), patient.getId().toString());
    }

    public LoginResponse registerAdmin(AdminRegistrationRequest request) {
        var admin = new Admin(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getDepartment(),
                request.getContactNumber()
        );
        adminRepository.save(admin);
        var token = jwtService.generateToken(admin);
        return new LoginResponse(token, admin.getEmail(), admin.getRole().name(), admin.getId().toString());
    }

    public LoginResponse login(LoginRequest request) {
        // Validate captcha token first
        if (request.getCaptchaToken() == null || !captchaService.validateCaptcha(request.getCaptchaToken())) {
            throw new IllegalArgumentException("Invalid CAPTCHA. Please try again.");
        }
        
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        // First try to find as doctor
        var doctorOpt = doctorRepository.findByEmail(request.getEmail());
        if (doctorOpt.isPresent()) {
            var doctor = doctorOpt.get();
            var token = jwtService.generateToken(doctor);
            return new LoginResponse(token, doctor.getEmail(), doctor.getRole(), doctor.getId());
        }
        
        // Then try to find as regular user
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        var token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getEmail(), user.getRole().name(), user.getId().toString());
    }
} 