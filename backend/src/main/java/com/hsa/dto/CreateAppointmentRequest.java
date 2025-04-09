package com.hsa.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateAppointmentRequest {
    private Long doctorId;
    private LocalDateTime appointmentTime;
    private String symptoms;
    private String notes;
}