package com.hsa.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DoctorAvailabilityRequest {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}