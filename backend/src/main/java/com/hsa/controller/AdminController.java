package com.hsa.controller;

import com.hsa.model.User;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.model.Appointment;
import com.hsa.repository.UserRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.AppointmentRepository;
import com.hsa.dto.PatientCreationRequest;
import com.hsa.dto.DoctorCreationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Get real counts from database
            long totalPatients = patientRepository.count();
            long totalDoctors = doctorRepository.count();
            long totalAdmins = userRepository.countByRole(User.Role.ADMIN);
            long totalAppointments = appointmentRepository.count();
            
            // Get appointment statistics
            long pendingAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.PENDING);
            long confirmedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CONFIRMED);
            long cancelledAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.CANCELLED);
            long completedAppointments = appointmentRepository.countByStatus(Appointment.AppointmentStatus.COMPLETED);
            
            stats.put("totalPatients", totalPatients);
            stats.put("totalDoctors", totalDoctors);
            stats.put("totalAdmins", totalAdmins);
            stats.put("totalAppointments", totalAppointments);
            stats.put("pendingAppointments", pendingAppointments);
            stats.put("confirmedAppointments", confirmedAppointments);
            stats.put("cancelledAppointments", cancelledAppointments);
            stats.put("completedAppointments", completedAppointments);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch dashboard statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        try {
            List<Doctor> doctors = doctorRepository.findAll();
            return ResponseEntity.ok(doctors);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        try {
            List<Appointment> appointments = appointmentRepository.findAll();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/appointments/recent")
    public ResponseEntity<List<Appointment>> getRecentAppointments() {
        try {
            List<Appointment> appointments = appointmentRepository.findTop10ByOrderByCreatedAtDesc();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/admins")
    public ResponseEntity<List<User>> getAllAdmins() {
        try {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/patients")
    public ResponseEntity<Patient> createPatient(@RequestBody PatientCreationRequest request) {
        try {
            // Check if email already exists
            if (patientRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }

            // Create new patient
            Patient patient = new Patient(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhoneNumber(),
                request.getAddress(),
                request.getBloodGroup(),
                request.getAge(),
                request.getGender()
            );

            Patient savedPatient = patientRepository.save(patient);
            return ResponseEntity.ok(savedPatient);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/doctors")
    public ResponseEntity<Doctor> createDoctor(@RequestBody DoctorCreationRequest request) {
        try {
            // Check if email already exists
            if (doctorRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }

            // Create new doctor
            Doctor doctor = new Doctor();
            doctor.setId(generateDoctorId());
            doctor.setName(request.getName());
            doctor.setEmail(request.getEmail());
            doctor.setPassword(passwordEncoder.encode(request.getPassword()));
            doctor.setSpecialization(request.getSpecialization());
            doctor.setPhoneNumber(request.getPhoneNumber());
            doctor.setAddress(request.getAddress());
            doctor.setExperience(request.getExperience().toString());
            doctor.setQualification(request.getQualification());
            doctor.setConsultationFee(request.getConsultationFee());
            doctor.setStatus("ACTIVE");
            doctor.setCreatedAt(java.time.LocalDateTime.now());

            Doctor savedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String generateDoctorId() {
        return "DOC_" + System.currentTimeMillis();
    }
}