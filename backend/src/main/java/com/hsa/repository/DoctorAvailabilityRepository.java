package com.hsa.repository;

import com.hsa.model.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Long> {
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM DoctorAvailability a " +
           "WHERE a.doctor.id = :doctorId AND :appointmentTime BETWEEN a.startTime AND a.endTime " +
           "AND a.isAvailable = true")
    boolean isDoctorAvailable(Long doctorId, LocalDateTime appointmentTime);

    List<DoctorAvailability> findByDoctorIdAndIsAvailableTrue(Long doctorId);
}