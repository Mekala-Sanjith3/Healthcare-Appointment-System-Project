package com.hsa.service;

import com.hsa.dto.CreateAppointmentRequest;
import com.hsa.dto.AppointmentCompletionRequest;
import com.hsa.model.Appointment;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.DoctorAvailabilityRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.security.SecurityUtils;
import com.hsa.exception.ResourceNotFoundException;  // Move import here
import com.hsa.exception.AccessDeniedException;     // Move import here
import com.hsa.exception.AppointmentException;      // Move import here
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final SecurityUtils securityUtils;
    private final DoctorAvailabilityRepository availabilityRepository;

    public Appointment createAppointment(CreateAppointmentRequest request) {
        // Validate appointment time
        if (request.getAppointmentTime().isBefore(LocalDateTime.now())) {
            throw new AppointmentException("Appointment time cannot be in the past");
        }

        Patient patient = securityUtils.getCurrentPatient();
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
            .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Check for existing appointments
        boolean hasConflict = appointmentRepository.existsByDoctorIdAndAppointmentTimeAndStatus(
            doctor.getId(), 
            request.getAppointmentTime(),
            "SCHEDULED"
        );
        
        if (hasConflict) {
            throw new AppointmentException("Doctor already has an appointment at this time");
        }

        // Check if doctor is available
        boolean isAvailable = availabilityRepository.isDoctorAvailable(
            doctor.getId(), 
            request.getAppointmentTime()
        );
        
        if (!isAvailable) {
            throw new AppointmentException("Doctor is not available at this time");
        }

        Appointment appointment = Appointment.builder()
            .patient(patient)
            .doctor(doctor)
            .appointmentTime(request.getAppointmentTime())
            .status("SCHEDULED")
            .symptoms(request.getSymptoms())
            .notes(request.getNotes())
            .build();

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPatientAppointments() {
        Patient patient = securityUtils.getCurrentPatient();
        return appointmentRepository.findByPatientId(patient.getId());
    }

    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        if ("CANCELLED".equals(appointment.getStatus()) || 
            "COMPLETED".equals(appointment.getStatus())) {
            throw new AppointmentException("Cannot cancel a " + appointment.getStatus().toLowerCase() + " appointment");
        }
        
        // Check if current user has permission to cancel
        if (securityUtils.isCurrentUserPatient()) {
            Patient currentPatient = securityUtils.getCurrentPatient();
            if (!appointment.getPatient().getId().equals(currentPatient.getId())) {
                throw new AccessDeniedException("You can only cancel your own appointments");
            }
        } else if (securityUtils.isCurrentUserDoctor()) {
            Doctor currentDoctor = securityUtils.getCurrentDoctor();
            if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
                throw new AccessDeniedException("You can only cancel appointments assigned to you");
            }
        }
        
        appointment.setStatus("CANCELLED");
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getDoctorAppointments() {
        Doctor doctor = securityUtils.getCurrentDoctor();
        return appointmentRepository.findByDoctorId(doctor.getId());
    }

    public List<Appointment> getDoctorSchedule(LocalDateTime start, LocalDateTime end) {
        Doctor doctor = securityUtils.getCurrentDoctor();
        return appointmentRepository.findByDoctorIdAndAppointmentTimeBetween(
            doctor.getId(), start, end);
    }

    public Appointment completeAppointment(Long appointmentId, AppointmentCompletionRequest request) {
        if (request.getDiagnosis() == null || request.getDiagnosis().trim().isEmpty()) {
            throw new AppointmentException("Diagnosis is required");
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        
        Doctor currentDoctor = securityUtils.getCurrentDoctor();
        if (!appointment.getDoctor().getId().equals(currentDoctor.getId())) {
            throw new AccessDeniedException("You can only complete your own appointments");
        }
        
        if (!"SCHEDULED".equals(appointment.getStatus())) {
            throw new RuntimeException("Only scheduled appointments can be completed");
        }
        
        appointment.setStatus("COMPLETED");
        appointment.setDiagnosis(request.getDiagnosis());
        appointment.setPrescription(request.getPrescription());
        appointment.setNotes(request.getNotes());
        
        return appointmentRepository.save(appointment);
    }
}