package com.hsa.service.impl;

import com.hsa.dto.AvailabilityDTO;
import com.hsa.dto.DoctorProfileDTO;
import com.hsa.dto.PatientHistoryDTO;
import com.hsa.exception.ResourceNotFoundException;
import com.hsa.model.Appointment;
import com.hsa.model.Doctor;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.NotificationRepository;
import com.hsa.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public DoctorProfileDTO getDoctorProfile(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        return mapToDoctorProfileDTO(doctor);
    }

    @Override
    @Transactional
    public DoctorProfileDTO updateDoctorProfile(String doctorId, DoctorProfileDTO profileDTO) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        doctor.setName(profileDTO.getName());
        doctor.setSpecialization(profileDTO.getSpecialization());
        doctor.setAddress(profileDTO.getAddress());
        doctor.setPhoneNumber(profileDTO.getPhoneNumber());
        doctor.setBio(profileDTO.getBio());
        doctor.setProfileImageUrl(profileDTO.getProfileImageUrl());
        doctor.setGender(profileDTO.getGender());
        // Don't update email, id or status - these are managed separately
        
        doctor = doctorRepository.save(doctor);
        return mapToDoctorProfileDTO(doctor);
    }

    @Override
    public List<Appointment> getDoctorAppointments(String doctorId, String dateStr, String statusStr, String search) {
        List<Appointment> appointments;
        
        if (dateStr != null && !dateStr.isEmpty()) {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_DATE);
            appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
        } else {
            appointments = appointmentRepository.findByDoctorId(doctorId);
        }
        
        // Filter by status if provided
        if (statusStr != null && !statusStr.isEmpty()) {
            Appointment.AppointmentStatus status = Appointment.AppointmentStatus.valueOf(statusStr.toUpperCase());
            appointments = appointments.stream()
                    .filter(a -> a.getStatus() == status)
                    .collect(Collectors.toList());
        }
        
        // Filter by search term if provided
        if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            appointments = appointments.stream()
                    .filter(a -> a.getPatientName().toLowerCase().contains(searchLower) ||
                           (a.getNotes() != null && a.getNotes().toLowerCase().contains(searchLower)))
                    .collect(Collectors.toList());
        }
        
        return appointments;
    }

    @Override
    @Transactional
    public Appointment updateAppointmentStatus(Long appointmentId, String statusStr) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        Appointment.AppointmentStatus status = Appointment.AppointmentStatus.valueOf(statusStr.toUpperCase());
        appointment.setStatus(status);
        
        return appointmentRepository.save(appointment);
    }

    @Override
    public AvailabilityDTO getDoctorAvailability(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        // In a real implementation, this would fetch from a dedicated availability table
        // For now, return a mock implementation
        Map<String, AvailabilityDTO.DaySchedule> schedule = new HashMap<>();
        schedule.put("monday", new AvailabilityDTO.DaySchedule("09:00", "17:00", true));
        schedule.put("tuesday", new AvailabilityDTO.DaySchedule("09:00", "17:00", true));
        schedule.put("wednesday", new AvailabilityDTO.DaySchedule("09:00", "17:00", true));
        schedule.put("thursday", new AvailabilityDTO.DaySchedule("09:00", "17:00", true));
        schedule.put("friday", new AvailabilityDTO.DaySchedule("09:00", "17:00", true));
        
        return new AvailabilityDTO(schedule);
    }

    @Override
    @Transactional
    public AvailabilityDTO updateDoctorAvailability(String doctorId, AvailabilityDTO availabilityDTO) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
        
        // In a real implementation, this would update a dedicated availability table
        // For now, return the same DTO as received
        return availabilityDTO;
    }

    @Override
    public List<PatientHistoryDTO> getPatientHistory(String patientId) {
        // In a real implementation, this would fetch medical records from the database
        // For now, return a mock implementation
        List<PatientHistoryDTO> history = new ArrayList<>();
        
        history.add(new PatientHistoryDTO(
                1L,
                "Common Cold",
                "Paracetamol 500mg",
                "Patient reported symptoms of cough and mild fever.",
                LocalDate.now().minusMonths(1),
                "Dr. Mohan Venkat",
                "D0045"
        ));
        
        history.add(new PatientHistoryDTO(
                2L,
                "Hypertension",
                "Amlodipine 5mg",
                "Blood pressure readings: 145/95. Advised lifestyle changes.",
                LocalDate.now().minusMonths(2),
                "Dr. Sarah Johnson",
                "D0032"
        ));
        
        return history;
    }

    @Override
    public List<Map<String, Object>> getDoctorNotifications(String doctorId) {
        // In a real implementation, this would fetch notifications from the database
        // For now, return a mock implementation
        List<Map<String, Object>> notifications = new ArrayList<>();
        
        Map<String, Object> notification1 = new HashMap<>();
        notification1.put("id", 1);
        notification1.put("message", "New appointment request from Yashwanth");
        notification1.put("time", "5 minutes ago");
        notification1.put("type", "appointment");
        notification1.put("isRead", false);
        
        Map<String, Object> notification2 = new HashMap<>();
        notification2.put("id", 2);
        notification2.put("message", "Lab results ready for patient Raghu");
        notification2.put("time", "1 hour ago");
        notification2.put("type", "lab");
        notification2.put("isRead", false);
        
        notifications.add(notification1);
        notifications.add(notification2);
        
        return notifications;
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        // In a real implementation, this would update the notification in the database
        // For now, this is a mock implementation that does nothing
    }
    
    // Helper method to map entity to DTO
    private DoctorProfileDTO mapToDoctorProfileDTO(Doctor doctor) {
        return new DoctorProfileDTO(
                doctor.getId(),
                doctor.getName(),
                doctor.getEmail(),
                doctor.getSpecialization(),
                doctor.getAddress(),
                doctor.getPhoneNumber(),
                doctor.getBio(),
                doctor.getProfileImageUrl(),
                doctor.getGender(),
                doctor.getStatus()
        );
    }
} 