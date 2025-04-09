package com.hsa.repository;

import com.hsa.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByDoctorIdAndAppointmentTimeBetween(
        Long doctorId, LocalDateTime start, LocalDateTime end);

    boolean existsByDoctorIdAndAppointmentTimeAndStatus(Long doctorId, LocalDateTime appointmentTime, String status);
}