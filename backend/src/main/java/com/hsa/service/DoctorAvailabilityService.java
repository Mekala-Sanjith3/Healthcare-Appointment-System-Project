package com.hsa.service;

import com.hsa.dto.DoctorAvailabilityRequest;
import com.hsa.model.Doctor;
import com.hsa.model.DoctorAvailability;
import com.hsa.repository.DoctorAvailabilityRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorAvailabilityService {
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRepository doctorRepository;
    private final SecurityUtils securityUtils;

    public DoctorAvailability setAvailability(DoctorAvailabilityRequest request) {
        Doctor doctor = securityUtils.getCurrentDoctor();
        
        DoctorAvailability availability = DoctorAvailability.builder()
            .doctor(doctor)
            .startTime(request.getStartTime())
            .endTime(request.getEndTime())
            .isAvailable(true)
            .build();

        return availabilityRepository.save(availability);
    }

    public List<DoctorAvailability> getDoctorAvailability(Long doctorId) {
        return availabilityRepository.findByDoctorIdAndIsAvailableTrue(doctorId);
    }
}