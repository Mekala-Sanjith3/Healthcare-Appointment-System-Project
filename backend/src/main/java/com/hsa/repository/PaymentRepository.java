package com.hsa.repository;

import com.hsa.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("select coalesce(sum(p.amount),0) from Payment p where p.status='COMPLETED' and p.createdAt between ?1 and ?2")
    Double sumCompletedBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByAppointmentId(Long appointmentId);
}


