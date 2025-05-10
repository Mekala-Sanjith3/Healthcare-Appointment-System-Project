package com.hsa.service;

import com.hsa.model.Appointment;

import java.util.List;
import java.util.Map;

public interface PatientService {
    List<Appointment> getPatientAppointments(String patientId, String status);
    
    Appointment createAppointment(String patientId, Appointment appointment);
    
    List<Map<String, Object>> getPatientMedicalRecords(String patientId);
    
    List<Map<String, Object>> getPatientNotifications(String patientId);
    
    void markNotificationAsRead(Long notificationId);
    
    Appointment cancelAppointment(Long appointmentId);
} 