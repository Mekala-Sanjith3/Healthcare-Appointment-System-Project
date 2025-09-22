package com.hsa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "doctor_id")
    private String doctorId;

    @Column(nullable = false)
    private Double amount;

    @Column
    private String currency = "USD";

    @Column
    private String paymentMethod = "CASH"; // CASH, CARD, INSURANCE, etc.

    @Column
    private String status = "COMPLETED"; // PENDING, COMPLETED, REFUNDED

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.currency == null) this.currency = "USD";
        if (this.status == null) this.status = "COMPLETED";
        if (this.paymentMethod == null) this.paymentMethod = "CASH";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}


