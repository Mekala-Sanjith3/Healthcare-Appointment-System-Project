package com.hsa.controller;

import com.hsa.model.User;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.repository.UserRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TestController {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/database-status")
    public ResponseEntity<Map<String, Object>> getDatabaseStatus() {
        Map<String, Object> status = new HashMap<>();
        
        try {
            long userCount = userRepository.count();
            long doctorCount = doctorRepository.count();
            long patientCount = patientRepository.count();
            
            status.put("status", "connected");
            status.put("userCount", userCount);
            status.put("doctorCount", doctorCount);
            status.put("patientCount", patientCount);
            status.put("message", "Database connection successful");
            
        } catch (Exception e) {
            status.put("status", "error");
            status.put("message", "Database connection failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/all-users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        Map<String, Object> data = new HashMap<>();
        
        try {
            data.put("users", userRepository.findAll());
            data.put("doctors", doctorRepository.findAll());
            data.put("patients", patientRepository.findAll());
            data.put("appointments", appointmentRepository.findAll());
            
        } catch (Exception e) {
            data.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(data);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Healthcare Backend is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/doctors-public")
    public ResponseEntity<?> getPublicDoctors() {
        try {
            return ResponseEntity.ok(doctorRepository.findAll());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments() {
        try {
            return ResponseEntity.ok(appointmentRepository.findAll());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/appointments/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorAppointmentsPublic(@PathVariable String doctorId) {
        try {
            List<?> appointments = appointmentRepository.findByDoctorId(doctorId);
            Map<String, Object> response = new HashMap<>();
            response.put("doctorId", doctorId);
            response.put("appointmentCount", appointments.size());
            response.put("appointments", appointments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/create-sample-doctors")
    public ResponseEntity<Map<String, Object>> createSampleDoctors() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if doctors already exist
            long doctorCount = doctorRepository.count();
            if (doctorCount >= 5) {
                response.put("message", "Sample doctors already exist");
                response.put("doctorCount", doctorCount);
                return ResponseEntity.ok(response);
            }

            // Create sample doctors
            String[] doctorData = {
                "DOC002,Dr. Emily Johnson,emily.johnson@hospital.com,Cardiology,+1-555-0102,456 Medical Plaza,8,MD Cardiology,150.00",
                "DOC003,Dr. Michael Brown,michael.brown@hospital.com,Neurology,+1-555-0103,789 Brain Center,12,MD Neurology,200.00",
                "DOC004,Dr. Sarah Wilson,sarah.wilson@hospital.com,Pediatrics,+1-555-0104,321 Children Hospital,6,MD Pediatrics,120.00",
                "DOC005,Dr. David Lee,david.lee@hospital.com,Orthopedics,+1-555-0105,654 Bone Clinic,10,MD Orthopedic Surgery,180.00",
                "DOC006,Dr. Lisa Garcia,lisa.garcia@hospital.com,Dermatology,+1-555-0106,987 Skin Care Center,7,MD Dermatology,140.00"
            };

            for (String data : doctorData) {
                String[] parts = data.split(",");
                if (!doctorRepository.existsById(parts[0])) {
                    Doctor doctor = new Doctor();
                    doctor.setId(parts[0]);
                    doctor.setName(parts[1]);
                    doctor.setEmail(parts[2]);
                    doctor.setPassword("$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"); // password: password
                    doctor.setSpecialization(parts[3]);
                    doctor.setPhoneNumber(parts[4]);
                    doctor.setAddress(parts[5]);
                    doctor.setExperience(parts[6]);
                    doctor.setQualification(parts[7]);
                    doctor.setConsultationFee(Double.parseDouble(parts[8]));
                    doctor.setStatus("ACTIVE");
                    doctor.setCreatedAt(java.time.LocalDateTime.now());
                    
                    doctorRepository.save(doctor);
                }
            }

            long newDoctorCount = doctorRepository.count();
            response.put("message", "Sample doctors created successfully");
            response.put("doctorCount", newDoctorCount);
            response.put("doctors", doctorRepository.findAll());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
