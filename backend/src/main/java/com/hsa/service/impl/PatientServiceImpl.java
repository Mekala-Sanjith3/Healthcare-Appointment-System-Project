package com.hsa.service.impl;

import com.hsa.dto.SimpleResponse;
import com.hsa.exception.ResourceNotFoundException;
import com.hsa.model.Appointment;
import com.hsa.model.Notification;
import com.hsa.model.Patient;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.NotificationRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public List<Appointment> getPatientAppointments(String patientId, String statusStr) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(Long.parseLong(patientId));
        
        // Filter by status if provided
        if (statusStr != null && !statusStr.isEmpty()) {
            Appointment.AppointmentStatus status = Appointment.AppointmentStatus.valueOf(statusStr.toUpperCase());
            appointments = appointments.stream()
                    .filter(a -> a.getStatus() == status)
                    .collect(Collectors.toList());
        }
        
        return appointments;
    }

    @Override
    @Transactional
    public Appointment createAppointment(String patientId, Appointment appointment) {
        // Validate patient exists
        if (!patientRepository.existsById(Long.parseLong(patientId))) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Set appointment details
        appointment.setPatientId(Long.parseLong(patientId));
        // We would normally fetch the patient name and email from the repository
        // For now, hardcode or mock this data
        appointment.setPatientName("Patient Name"); // In a real implementation, fetch from repository
        appointment.setPatientEmail("patient@example.com"); // In a real implementation, fetch from repository
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        appointment.setCreatedAt(LocalDate.now());
        
        // Save the appointment
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Create notification for the doctor
        Notification doctorNotification = new Notification();
        doctorNotification.setRecipientId(appointment.getDoctorId());
        doctorNotification.setRecipientType("DOCTOR");
        doctorNotification.setMessage("A patient has scheduled an appointment with you on " + 
                appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime());
        doctorNotification.setType("appointment");
        doctorNotification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(doctorNotification);
        
        return savedAppointment;
    }

    @Override
    public List<Map<String, Object>> getPatientMedicalRecords(String patientId) {
        // Verify patient exists
        if (!patientRepository.existsById(Long.parseLong(patientId))) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // In a real implementation, this would fetch from the medical_records table
        // For now, return a mock implementation
        List<Map<String, Object>> records = new ArrayList<>();
        
        // Create sample records (in real implementation, this would come from the database)
        Map<String, Object> record1 = new HashMap<>();
        record1.put("id", 1);
        record1.put("patientId", patientId);
        record1.put("doctorName", "Dr. John Smith");
        record1.put("diagnosis", "Common Cold");
        record1.put("prescription", "Rest and fluids");
        record1.put("date", LocalDate.now().minusDays(30));
        records.add(record1);
        
        Map<String, Object> record2 = new HashMap<>();
        record2.put("id", 2);
        record2.put("patientId", patientId);
        record2.put("doctorName", "Dr. Emily Johnson");
        record2.put("diagnosis", "Seasonal Allergies");
        record2.put("prescription", "Antihistamines");
        record2.put("date", LocalDate.now().minusDays(60));
        records.add(record2);
        
        return records;
    }

    @Override
    public List<Map<String, Object>> getPatientNotifications(String patientId) {
        // Verify patient exists
        if (!patientRepository.existsById(Long.parseLong(patientId))) {
            throw new ResourceNotFoundException("Patient not found with id: " + patientId);
        }
        
        // Get all notifications for this patient
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(patientId);
        
        // Filter for patient-type notifications
        notifications = notifications.stream()
                .filter(n -> "PATIENT".equals(n.getRecipientType()))
                .collect(Collectors.toList());
        
        // Convert to map for easier frontend consumption
        return notifications.stream().map(notification -> {
            Map<String, Object> notificationMap = new HashMap<>();
            notificationMap.put("id", notification.getId());
            notificationMap.put("message", notification.getMessage());
            notificationMap.put("type", notification.getType());
            notificationMap.put("isRead", notification.isRead());
            notificationMap.put("createdAt", notification.getCreatedAt());
            return notificationMap;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public Appointment cancelAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Can only cancel if it's not already completed or cancelled
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED || 
            appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cannot cancel an appointment that is already completed or cancelled");
        }
        
        // Update the status
        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Create notification for the doctor
        Notification doctorNotification = new Notification();
        doctorNotification.setRecipientId(appointment.getDoctorId());
        doctorNotification.setRecipientType("DOCTOR");
        doctorNotification.setMessage("The appointment with " + appointment.getPatientName() + 
                " on " + appointment.getAppointmentDate() + " at " + appointment.getAppointmentTime() + 
                " has been cancelled by the patient.");
        doctorNotification.setType("appointment");
        doctorNotification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(doctorNotification);
        
        return savedAppointment;
    }
} 