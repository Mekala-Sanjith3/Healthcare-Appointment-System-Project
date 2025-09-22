package com.hsa.controller;

import com.hsa.model.Appointment;
import com.hsa.model.Doctor;
import com.hsa.model.Patient;
import com.hsa.model.MedicalRecord;
import com.hsa.repository.AppointmentRepository;
import com.hsa.repository.DoctorRepository;
import com.hsa.repository.PatientRepository;
import com.hsa.repository.MedicalRecordRepository;
import com.hsa.repository.PaymentRepository;
import com.hsa.model.Payment;
import com.hsa.dto.AppointmentBookingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
// removed unused imports
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final PaymentRepository paymentRepository;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Appointment> bookAppointment(@RequestBody AppointmentBookingRequest request) {
        try {
            // Validate doctor exists
            Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
            if (!doctorOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Validate patient exists
            Optional<Patient> patientOpt = patientRepository.findById(Long.parseLong(request.getPatientId()));
            if (!patientOpt.isPresent()) {
                return ResponseEntity.badRequest().build();
            }

            // Create new appointment
            Appointment appointment = new Appointment();
            appointment.setPatientId(Long.parseLong(request.getPatientId()));
            appointment.setDoctorId(request.getDoctorId());
            appointment.setAppointmentDate(request.getAppointmentDate());
            appointment.setAppointmentTime(request.getAppointmentTime());
            appointment.setAppointmentType(request.getAppointmentType());
            appointment.setNotes(request.getNotes());
            appointment.setStatus(Appointment.AppointmentStatus.PENDING);
            appointment.setCreatedAt(LocalDate.now());

            Appointment savedAppointment = appointmentRepository.save(appointment);

            // Record an immediate $150 booking transaction
            try {
                Payment payment = new Payment();
                payment.setAppointmentId(savedAppointment.getId());
                payment.setPatientId(savedAppointment.getPatientId());
                payment.setDoctorId(savedAppointment.getDoctorId());
                payment.setAmount(150.0);
                payment.setCurrency("USD");
                payment.setPaymentMethod("CASH");
                payment.setStatus("COMPLETED");
                payment.setTransactionId("BOOK-" + savedAppointment.getId());
                paymentRepository.save(payment);
            } catch (Exception payErr) {
                System.err.println("Failed to create booking payment record: " + payErr.getMessage());
            }

            return ResponseEntity.ok(savedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN') or hasRole('DOCTOR')")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(Long.parseLong(patientId));
            
            // Populate patient and doctor names
            for (Appointment appointment : appointments) {
                // Get patient details
                if (appointment.getPatientId() != null) {
                    Optional<Patient> patient = patientRepository.findById(appointment.getPatientId());
                    if (patient.isPresent()) {
                        appointment.setPatientName(patient.get().getName());
                        appointment.setPatientEmail(patient.get().getEmail());
                    }
                }
                
                // Get doctor details
                if (appointment.getDoctorId() != null) {
                    Optional<Doctor> doctor = doctorRepository.findById(appointment.getDoctorId());
                    if (doctor.isPresent()) {
                        appointment.setDoctorName(doctor.get().getName());
                        appointment.setDoctorSpecialization(doctor.get().getSpecialization());
                    }
                }
            }
            
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable String doctorId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            
            // Populate patient and doctor names
            for (Appointment appointment : appointments) {
                // Get patient details
                if (appointment.getPatientId() != null) {
                    Optional<Patient> patient = patientRepository.findById(appointment.getPatientId());
                    if (patient.isPresent()) {
                        appointment.setPatientName(patient.get().getName());
                        appointment.setPatientEmail(patient.get().getEmail());
                    }
                }
                
                // Get doctor details
                if (appointment.getDoctorId() != null) {
                    Optional<Doctor> doctor = doctorRepository.findById(appointment.getDoctorId());
                    if (doctor.isPresent()) {
                        appointment.setDoctorName(doctor.get().getName());
                        appointment.setDoctorSpecialization(doctor.get().getSpecialization());
                    }
                }
            }
            
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{appointmentId}/status")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long appointmentId,
            @RequestParam Appointment.AppointmentStatus status) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(status);

            // Populate names before saving
            if (appointment.getPatientId() != null) {
                Optional<Patient> patient = patientRepository.findById(appointment.getPatientId());
                if (patient.isPresent()) {
                    appointment.setPatientName(patient.get().getName());
                    appointment.setPatientEmail(patient.get().getEmail());
                }
            }
            
            if (appointment.getDoctorId() != null) {
                Optional<Doctor> doctor = doctorRepository.findById(appointment.getDoctorId());
                if (doctor.isPresent()) {
                    appointment.setDoctorName(doctor.get().getName());
                    appointment.setDoctorSpecialization(doctor.get().getSpecialization());
                }
            }
            Appointment updatedAppointment = appointmentRepository.save(appointment);

            // If appointment is completed, create a medical record and payment
            if (status == Appointment.AppointmentStatus.COMPLETED) {
                try {
                    MedicalRecord medicalRecord = new MedicalRecord();
                    medicalRecord.setPatientId(appointment.getPatientId());
                    medicalRecord.setPatientName(appointment.getPatientName());
                    medicalRecord.setDoctorId(appointment.getDoctorId());
                    medicalRecord.setDoctorName(appointment.getDoctorName());
                    medicalRecord.setDiagnosis("Appointment Completed");
                    medicalRecord.setPrescription("Prescription details to be added by doctor");
                    medicalRecord.setNotes("Appointment completed on " + appointment.getAppointmentDate() + 
                                        " at " + appointment.getAppointmentTime() + 
                                        ". Notes: " + (appointment.getNotes() != null ? appointment.getNotes() : "No additional notes."));
                    medicalRecord.setDate(appointment.getAppointmentDate());
                    medicalRecord.setCreatedAt(LocalDate.now());
                    medicalRecord.setUpdatedAt(LocalDate.now());
                    
                    medicalRecordRepository.save(medicalRecord);
                } catch (Exception recordError) {
                    // Log error but don't fail the appointment update
                    System.err.println("Failed to create medical record for completed appointment: " + recordError.getMessage());
                }

                try {
                    Payment payment = new Payment();
                    payment.setAppointmentId(appointment.getId());
                    payment.setPatientId(appointment.getPatientId());
                    payment.setDoctorId(appointment.getDoctorId());
                    payment.setAmount(150.0);
                    payment.setCurrency("USD");
                    payment.setPaymentMethod("CASH");
                    payment.setStatus("COMPLETED");
                    payment.setTransactionId("APPT-" + appointment.getId());
                    paymentRepository.save(payment);
                } catch (Exception payErr) {
                    System.err.println("Failed to create payment record: " + payErr.getMessage());
                }
            }

            return ResponseEntity.ok(updatedAppointment);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long appointmentId) {
        try {
            Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
            if (!appointmentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
            appointmentRepository.save(appointment);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/doctor/{doctorId}/availability")
    public ResponseEntity<List<String>> getDoctorAvailability(
            @PathVariable String doctorId,
            @RequestParam String date) {
        try {
            LocalDate appointmentDate = LocalDate.parse(date);
            
            // Get existing appointments for this doctor on this date
            List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndAppointmentDate(doctorId, appointmentDate);
            
            // Generate available time slots using doctor's saved availability
            List<String> availableSlots = generateAvailableTimeSlots(doctorId, appointmentDate, existingAppointments);
            
            return ResponseEntity.ok(availableSlots);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private List<String> generateAvailableTimeSlots(String doctorId, LocalDate date, List<Appointment> existingAppointments) {
        // Default window in case availability not set
        List<String> allSlots = List.of(
            "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
            "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
        );
        try {
            Doctor d = doctorRepository.findById(doctorId).orElse(null);
            if (d != null && d.getAvailabilitySchedule() != null && !d.getAvailabilitySchedule().isBlank()) {
                // Expecting a simple stringified JSON like {"monday":{"isAvailable":true,"start":"09:00","end":"17:00"},...}
                String json = d.getAvailabilitySchedule();
                String dayKey = date.getDayOfWeek().name().toLowerCase();
                if (json.contains(dayKey)) {
                    // very lightweight parse without JSON lib
                    boolean isAvailable = json.contains("\"" + dayKey + "\":") && json.contains("isAvailable\":true");
                    String start = extract(json, dayKey, "start", "09:00");
                    String end = extract(json, dayKey, "end", "17:00");
                    if (isAvailable) {
                        allSlots = buildSlots(start, end, 30);
                    } else {
                        allSlots = List.of();
                    }
                }
            }
        } catch (Exception ignored) {}
        
        List<String> bookedSlots = existingAppointments.stream()
            .map(app -> app.getAppointmentTime().toString().substring(0, 5))
            .toList();
        
        return allSlots.stream()
            .filter(slot -> !bookedSlots.contains(slot))
            .toList();
    }

    private List<String> buildSlots(String start, String end, int minutes) {
        java.util.ArrayList<String> slots = new java.util.ArrayList<>();
        java.time.LocalTime s = java.time.LocalTime.parse(start);
        java.time.LocalTime e = java.time.LocalTime.parse(end);
        while (!s.isAfter(e)) {
            slots.add(s.toString().substring(0,5));
            s = s.plusMinutes(minutes);
        }
        return slots;
    }

    private String extract(String json, String dayKey, String field, String fallback) {
        try {
            int dayIdx = json.indexOf("\"" + dayKey + "\"");
            if (dayIdx < 0) return fallback;
            int startObj = json.indexOf('{', dayIdx);
            int endObj = json.indexOf('}', startObj);
            String obj = json.substring(startObj, endObj);
            int fIdx = obj.indexOf("\"" + field + "\"");
            if (fIdx < 0) return fallback;
            int colon = obj.indexOf(':', fIdx);
            int quote1 = obj.indexOf('"', colon + 1);
            int quote2 = obj.indexOf('"', quote1 + 1);
            return obj.substring(quote1 + 1, quote2);
        } catch (Exception e) { return fallback; }
    }
}
