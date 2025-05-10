package com.hsa.service;

public interface SecurityService {
    boolean isDoctorAuthorized(String doctorId);
    
    boolean isPatientAuthorized(String patientId);
    
    boolean isAppointmentDoctorAuthorized(Long appointmentId);
    
    boolean isAppointmentPatientAuthorized(Long appointmentId);
    
    boolean isNotificationRecipientAuthorized(Long notificationId);
} 