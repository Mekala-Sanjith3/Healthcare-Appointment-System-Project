package com.hsa.security;

import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public boolean isCurrentUserPatient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_PATIENT"));
    }

    public boolean isCurrentUserDoctor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_DOCTOR"));
    }

    public Patient getCurrentPatient() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Doctor getCurrentDoctor() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }
}