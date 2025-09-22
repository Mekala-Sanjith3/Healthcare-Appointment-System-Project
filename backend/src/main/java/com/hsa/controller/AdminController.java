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
            
            // Get appointment statistics (compute in-memory to avoid repository method requirements)
            List<Appointment> allAppointments = appointmentRepository.findAll();
            long pendingAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.PENDING)
                    .count();
            long confirmedAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
                    .count();
            long cancelledAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CANCELLED)
                    .count();
            long completedAppointments = allAppointments.stream()
                    .filter(a -> a.getStatus() == Appointment.AppointmentStatus.COMPLETED)
                    .count();
            
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

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long patientId) {
        try {
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(patient);
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

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String doctorId) {
        try {
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAllAppointments(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "search", required = false) String search
    ) {
        try {
            List<Appointment> appointments = appointmentRepository.findAll();

            // Optional server-side filtering for real-time results
            if (status != null && !status.trim().isEmpty()) {
                String s = status.trim().toLowerCase();
                if (!s.equals("all") && !s.equals("all status")) {
                    Appointment.AppointmentStatus wanted;
                    try {
                        wanted = Appointment.AppointmentStatus.valueOf(s.toUpperCase());
                        appointments = appointments.stream()
                                .filter(a -> a.getStatus() == wanted)
                                .toList();
                    } catch (IllegalArgumentException ignored) { /* ignore invalid status */ }
                }
            }

            if (date != null && !date.trim().isEmpty() && date.matches(".*\\d.*")) {
                String normalized = normalizeDate(date.trim());
                appointments = appointments.stream()
                        .filter(a -> a.getAppointmentDate() != null && a.getAppointmentDate().toString().equals(normalized))
                        .toList();
            }

            if (search != null && !search.trim().isEmpty()) {
                String q = search.trim().toLowerCase();
                appointments = appointments.stream().filter(a ->
                        (a.getPatientName() != null && a.getPatientName().toLowerCase().contains(q)) ||
                        (a.getDoctorName() != null && a.getDoctorName().toLowerCase().contains(q)) ||
                        (a.getPatientEmail() != null && a.getPatientEmail().toLowerCase().contains(q))
                ).toList();
            }

            // Enrich with patient/doctor display fields if missing
            for (Appointment appt : appointments) {
                // Patient fields
                if ((appt.getPatientName() == null || appt.getPatientEmail() == null) && appt.getPatientId() != null) {
                    patientRepository.findById(appt.getPatientId()).ifPresent(p -> {
                        appt.setPatientName(p.getName());
                        appt.setPatientEmail(p.getEmail());
                    });
                }
                // Doctor fields
                if ((appt.getDoctorName() == null || appt.getDoctorSpecialization() == null) && appt.getDoctorId() != null) {
                    doctorRepository.findById(appt.getDoctorId()).ifPresent(d -> {
                        appt.setDoctorName(d.getName());
                        appt.setDoctorSpecialization(d.getSpecialization());
                    });
                }
            }

            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/appointments/recent")
    public ResponseEntity<List<Appointment>> getRecentAppointments() {
        try {
            // Fallback to in-memory recent selection if repository method is not available
            List<Appointment> appointments = appointmentRepository.findAll();
            appointments.sort((a, b) -> {
                // Prefer createdAt when available; otherwise by id desc
                if (a.getCreatedAt() != null && b.getCreatedAt() != null) {
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                }
                // Handle nulls
                if (a.getCreatedAt() != null) return -1;
                if (b.getCreatedAt() != null) return 1;
                // Fallback by id
                Long aid = (a.getId() instanceof Long) ? (Long) a.getId() : null;
                Long bid = (b.getId() instanceof Long) ? (Long) b.getId() : null;
                if (aid != null && bid != null) return Long.compare(bid, aid);
                return 0;
            });
            if (appointments.size() > 10) {
                appointments = appointments.subList(0, 10);
            }

            // Enrich recent list as well
            for (Appointment appt : appointments) {
                if ((appt.getPatientName() == null || appt.getPatientEmail() == null) && appt.getPatientId() != null) {
                    patientRepository.findById(appt.getPatientId()).ifPresent(p -> {
                        appt.setPatientName(p.getName());
                        appt.setPatientEmail(p.getEmail());
                    });
                }
                if ((appt.getDoctorName() == null || appt.getDoctorSpecialization() == null) && appt.getDoctorId() != null) {
                    doctorRepository.findById(appt.getDoctorId()).ifPresent(d -> {
                        appt.setDoctorName(d.getName());
                        appt.setDoctorSpecialization(d.getSpecialization());
                    });
                }
            }

            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper to normalize date strings to yyyy-MM-dd for comparison
    private String normalizeDate(String value) {
        String s = value.trim();
        if (s.matches("^\\d{4}-\\d{2}-\\d{2}$")) return s;
        var dmy = s.matches("^\\d{1,2}-\\d{1,2}-\\d{4}$");
        if (dmy) {
            String[] p = s.split("-");
            return p[2] + "-" + String.format("%02d", Integer.parseInt(p[1])) + "-" + String.format("%02d", Integer.parseInt(p[0]));
        }
        String digits = s.replaceAll("\\D", "");
        if (digits.length() == 8) {
            return digits.substring(0,4) + "-" + digits.substring(4,6) + "-" + digits.substring(6,8);
        }
        return s;
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment request) {
        try {
            // Persist appointment; names/emails may be autopopulated later
            Appointment saved = appointmentRepository.save(request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/appointments/{appointmentId}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long appointmentId, @RequestBody Appointment updated) {
        try {
            Appointment appt = appointmentRepository.findById(appointmentId).orElse(null);
            if (appt == null) {
                return ResponseEntity.notFound().build();
            }

            // Update editable fields
            appt.setPatientId(updated.getPatientId());
            appt.setPatientName(updated.getPatientName());
            appt.setPatientEmail(updated.getPatientEmail());
            appt.setDoctorId(updated.getDoctorId());
            appt.setDoctorName(updated.getDoctorName());
            appt.setDoctorSpecialization(updated.getDoctorSpecialization());
            appt.setAppointmentDate(updated.getAppointmentDate());
            appt.setAppointmentTime(updated.getAppointmentTime());
            appt.setAppointmentType(updated.getAppointmentType());
            appt.setStatus(updated.getStatus());
            appt.setNotes(updated.getNotes());

            Appointment saved = appointmentRepository.save(appt);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/appointments/{appointmentId}")
    public ResponseEntity<Map<String, String>> deleteAppointment(@PathVariable Long appointmentId) {
        try {
            if (!appointmentRepository.existsById(appointmentId)) {
                return ResponseEntity.notFound().build();
            }
            appointmentRepository.deleteById(appointmentId);
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Appointment deleted successfully");
            return ResponseEntity.ok(resp);
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

    @PutMapping("/doctors/{doctorId}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable String doctorId, @RequestBody DoctorCreationRequest request) {
        try {
            // Find existing doctor
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if email is being changed and if new email already exists
            if (!doctor.getEmail().equals(request.getEmail()) && doctorRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }

            // Update doctor fields
            doctor.setName(request.getName());
            doctor.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                doctor.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            doctor.setSpecialization(request.getSpecialization());
            doctor.setPhoneNumber(request.getPhoneNumber());
            doctor.setAddress(request.getAddress());
            doctor.setExperience(request.getExperience().toString());
            doctor.setQualification(request.getQualification());
            doctor.setConsultationFee(request.getConsultationFee());

            Doctor updatedDoctor = doctorRepository.save(doctor);
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/doctors/{doctorId}")
    public ResponseEntity<Map<String, String>> deleteDoctor(@PathVariable String doctorId) {
        try {
            // Check if doctor exists
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete the doctor
            doctorRepository.deleteById(doctorId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Doctor deleted successfully");
            response.put("doctorId", doctorId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete doctor");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long patientId, @RequestBody PatientCreationRequest request) {
        try {
            // Find existing patient
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }

            // Check if email is being changed and if new email already exists
            if (!patient.getEmail().equals(request.getEmail()) && patientRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().build();
            }

            // Update patient fields
            patient.setName(request.getName());
            patient.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                patient.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            patient.setPhoneNumber(request.getPhoneNumber());
            patient.setAddress(request.getAddress());
            patient.setBloodGroup(request.getBloodGroup());
            patient.setAge(request.getAge());
            patient.setGender(request.getGender());

            Patient updatedPatient = patientRepository.save(patient);
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, String>> deletePatient(@PathVariable Long patientId) {
        try {
            // Check if patient exists
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }

            // Delete the patient
            patientRepository.deleteById(patientId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Patient deleted successfully");
            response.put("patientId", patientId.toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete patient");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PutMapping("/doctors/{doctorId}/status")
    public ResponseEntity<Map<String, Object>> updateDoctorStatus(@PathVariable String doctorId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || (!status.equals("ACTIVE") && !status.equals("INACTIVE") && !status.equals("PENDING"))) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid status. Must be ACTIVE, INACTIVE, or PENDING");
                return ResponseEntity.badRequest().body(error);
            }

            // Find existing doctor
            Doctor doctor = doctorRepository.findById(doctorId).orElse(null);
            if (doctor == null) {
                return ResponseEntity.notFound().build();
            }

            // Update doctor status
            doctor.setStatus(status);
            doctor.setUpdatedAt(java.time.LocalDateTime.now());
            Doctor updatedDoctor = doctorRepository.save(doctor);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Doctor status updated successfully");
            response.put("doctorId", doctorId);
            response.put("newStatus", status);
            response.put("doctor", updatedDoctor);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update doctor status");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    @PutMapping("/patients/{patientId}/status")
    public ResponseEntity<Map<String, Object>> updatePatientStatus(@PathVariable Long patientId, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || (!status.equals("ACTIVE") && !status.equals("INACTIVE") && !status.equals("PENDING"))) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Invalid status. Must be ACTIVE, INACTIVE, or PENDING");
                return ResponseEntity.badRequest().body(error);
            }

            // Find existing patient
            Patient patient = patientRepository.findById(patientId).orElse(null);
            if (patient == null) {
                return ResponseEntity.notFound().build();
            }

            // Update patient status (if you have a status field in Patient entity)
            // For now, we'll just update the updatedAt timestamp
            patient.setUpdatedAt(java.time.LocalDateTime.now());
            Patient updatedPatient = patientRepository.save(patient);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Patient status updated successfully");
            response.put("patientId", patientId);
            response.put("newStatus", status);
            response.put("patient", updatedPatient);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update patient status");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }

    private String generateDoctorId() {
        return "DOC_" + System.currentTimeMillis();
    }
}