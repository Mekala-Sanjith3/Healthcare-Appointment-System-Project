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
        // Check if email already exists
        if (doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create Doctor record (standalone entity, not extending User)
        var doctor = new Doctor();
        doctor.setId(java.util.UUID.randomUUID().toString());
        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        doctor.setRole("DOCTOR");
        doctor.setSpecialization(request.getSpecialization());
        doctor.setQualification(request.getQualification());
        doctor.setExperience(request.getExperience());
        doctor.setClinicAddress(request.getClinicAddress());
        doctor.setStatus("ACTIVE");
        doctor.setCreatedAt(java.time.LocalDateTime.now());
        doctor.setAccountNonExpired(true);
        doctor.setAccountNonLocked(true);
        doctor.setCredentialsNonExpired(true);
        doctor.setEnabled(true);
        
        doctorRepository.save(doctor);
        var token = jwtService.generateToken(doctor);
        return new LoginResponse(token, doctor.getEmail(), doctor.getRole(), doctor.getId());
    }

    public LoginResponse registerPatient(PatientRegistrationRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent() || 
            doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create Patient using the constructor that handles inheritance
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
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent() || 
            doctorRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        // Create Admin using the constructor that handles inheritance
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
        try {
            // Validate captcha token if provided (optional for testing)
            if (request.getCaptchaToken() != null && !request.getCaptchaToken().isEmpty()) {
                if (!captchaService.validateCaptcha(request.getCaptchaToken())) {
                    throw new IllegalArgumentException("Invalid CAPTCHA. Please try again.");
                }
            }
            
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            // First try to find as doctor
            var doctorOpt = doctorRepository.findByEmail(request.getEmail());
            if (doctorOpt.isPresent()) {
                var doctor = doctorOpt.get();
                
                // Check if doctor is active
                if (!"ACTIVE".equals(doctor.getStatus())) {
                    throw new IllegalArgumentException("Your account is currently inactive. Please contact the administrator.");
                }
                
                var token = jwtService.generateToken(doctor);
                return new LoginResponse(token, doctor.getEmail(), doctor.getRole(), doctor.getId());
            }
            
            // Then try to find as regular user (Patient/Admin)
            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
            var token = jwtService.generateToken(user);
            return new LoginResponse(token, user.getEmail(), user.getRole().name(), user.getId().toString());
            
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid email or password");
        }
    }
} 