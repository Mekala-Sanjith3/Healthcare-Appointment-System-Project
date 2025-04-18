package com.hsa.service.impl;

import com.hsa.model.Appointment;
import com.hsa.model.Doctor;
import com.hsa.model.Notification;
import com.hsa.model.Patient;
import com.hsa.model.User;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.NotificationRepository;
import com.hsa.service.SecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SecurityServiceImpl implements SecurityService {
    
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    
    @Override
    public boolean isDoctorAuthorized(String doctorId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            return false;
        }
        
        UserDetails userDetails = (UserDetails) principal;
        
        // If user is an admin, they can access any doctor information
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        
        // If user is the doctor themselves, they can access their information
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (principal instanceof Doctor) {
                Doctor doctor = (Doctor) principal;
                return doctor.getId().equals(doctorId);
            }
        }
        
        return false;
    }
    
    @Override
    public boolean isAppointmentDoctorAuthorized(Long appointmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            return false;
        }
        
        UserDetails userDetails = (UserDetails) principal;
        
        // If user is an admin, they can access any appointment
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isEmpty()) {
            return false;
        }
        
        Appointment appointment = appointmentOpt.get();
        
        // If user is the doctor of the appointment, they can access it
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (principal instanceof Doctor) {
                Doctor doctor = (Doctor) principal;
                return doctor.getId().equals(appointment.getDoctorId());
            }
        }
        
        // If user is the patient of the appointment, they can access it
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            if (principal instanceof User) {
                User user = (User) principal;
                if (user.getRole() == User.Role.PATIENT && principal instanceof Patient) {
                    Patient patient = (Patient) principal;
                    return patient.getId().toString().equals(appointment.getPatientId());
                }
            }
        }
        
        return false;
    }
    
    @Override
    public boolean isNotificationRecipientAuthorized(Long notificationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails)) {
            return false;
        }
        
        UserDetails userDetails = (UserDetails) principal;
        
        // If user is an admin, they can access any notification
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            return false;
        }
        
        Notification notification = notificationOpt.get();
        
        // If user is a doctor and the notification is for them
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            if (principal instanceof Doctor) {
                Doctor doctor = (Doctor) principal;
                return doctor.getId().equals(notification.getRecipientId()) && 
                       "DOCTOR".equals(notification.getRecipientType());
            }
        }
        
        // If user is a patient and the notification is for them
        if (userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            if (principal instanceof User) {
                User user = (User) principal;
                if (user.getRole() == User.Role.PATIENT && principal instanceof Patient) {
                    Patient patient = (Patient) principal;
                    return patient.getId().toString().equals(notification.getRecipientId()) && 
                           "PATIENT".equals(notification.getRecipientType());
                }
            }
        }
        
        return false;
    }
} 