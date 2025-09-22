package com.hsa.controller;

import com.hsa.model.Payment;
import com.hsa.repository.PaymentRepository;
import com.hsa.repository.AppointmentRepository;
import com.hsa.model.Appointment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class FinanceController {

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Payment>> getPayments(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        if (from != null && to != null) {
            return ResponseEntity.ok(paymentRepository.findByCreatedAtBetween(LocalDateTime.parse(from), LocalDateTime.parse(to)));
        }
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSummary(
            @RequestParam String from,
            @RequestParam String to) {
        LocalDateTime start = LocalDateTime.parse(from);
        LocalDateTime end = LocalDateTime.parse(to);
        Double totalRevenue = paymentRepository.sumCompletedBetween(start, end);
        Map<String, Object> map = new HashMap<>();
        map.put("totalRevenue", totalRevenue);
        return ResponseEntity.ok(map);
    }

    // One-time reconciliation endpoint to backfill $150 payments for past appointments lacking payments
    @PostMapping("/reconcile-payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> reconcilePayments() {
        int created = 0;
        List<Appointment> all = appointmentRepository.findAll();
        for (Appointment a : all) {
            try {
                if (!paymentRepository.existsByAppointmentId(a.getId())) {
                    com.hsa.model.Payment p = new com.hsa.model.Payment();
                    p.setAppointmentId(a.getId());
                    p.setPatientId(a.getPatientId());
                    p.setDoctorId(a.getDoctorId());
                    p.setAmount(150.0);
                    p.setCurrency("USD");
                    p.setPaymentMethod("CASH");
                    p.setStatus("COMPLETED");
                    p.setTransactionId("RECON-" + a.getId());
                    paymentRepository.save(p);
                    created++;
                }
            } catch (Exception ignored) {}
        }
        Map<String, Object> res = new HashMap<>();
        res.put("created", created);
        return ResponseEntity.ok(res);
    }
}


