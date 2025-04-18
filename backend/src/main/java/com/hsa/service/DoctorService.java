package com.hsa.service;

import com.hsa.dto.AvailabilityDTO;
import com.hsa.dto.DoctorProfileDTO;
import com.hsa.dto.PatientHistoryDTO;
import com.hsa.model.Appointment;

import java.util.List;
import java.util.Map;

public interface DoctorService {
    DoctorProfileDTO getDoctorProfile(String doctorId);
    
    DoctorProfileDTO updateDoctorProfile(String doctorId, DoctorProfileDTO profileDTO);
    
    List<Appointment> getDoctorAppointments(String doctorId, String date, String status, String search);
    
    Appointment updateAppointmentStatus(Long appointmentId, String status);
    
    AvailabilityDTO getDoctorAvailability(String doctorId);
    
    AvailabilityDTO updateDoctorAvailability(String doctorId, AvailabilityDTO availabilityDTO);
    
    List<PatientHistoryDTO> getPatientHistory(String patientId);
    
    List<Map<String, Object>> getDoctorNotifications(String doctorId);
    
    void markNotificationAsRead(Long notificationId);
} 