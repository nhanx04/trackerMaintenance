package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateScheduleRequest {
    String title;
    String description;
    LocalDate scheduledDate;
    String assignedTechnicianId;
    Integer cycleDays;
    String completionNote;
    ScheduleStatus status;
}