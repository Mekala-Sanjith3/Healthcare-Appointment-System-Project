package com.hsa.service;

public interface SecurityService {
    boolean isDoctorAuthorized(String doctorId);
    
    boolean isAppointmentDoctorAuthorized(Long appointmentId);
    
    boolean isNotificationRecipientAuthorized(Long notificationId);
} 