package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ScheduleResponse {
    String id;
    String deviceId;
    String title;
    String description;
    LocalDate scheduledDate;
    String assignedTechnicianId;
    String createdByUserId;
    ScheduleStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}