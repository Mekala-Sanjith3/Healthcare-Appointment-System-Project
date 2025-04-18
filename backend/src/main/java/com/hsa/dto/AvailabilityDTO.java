package com.hsa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {
    private Map<String, DaySchedule> schedule;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DaySchedule {
        private String start;
        private String end;
        private boolean isAvailable;
    }
} 