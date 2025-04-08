package com.hsa.security;

import com.hsa.model.Patient;
import com.hsa.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final PatientRepository patientRepository;

    public Patient getCurrentPatient() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Patient not found"));
    }
}