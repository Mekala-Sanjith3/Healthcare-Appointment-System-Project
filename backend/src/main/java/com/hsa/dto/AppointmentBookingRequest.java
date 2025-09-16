package com.hsa.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentBookingRequest {
    private String patientId;
    private String doctorId;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String appointmentType;
    private String notes;
}
