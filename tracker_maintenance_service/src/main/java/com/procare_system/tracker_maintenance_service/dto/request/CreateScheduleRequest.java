package com.procare_system.tracker_maintenance_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateScheduleRequest {

    @NotBlank(message = "deviceId is required")
    String deviceId;

    @NotBlank(message = "title is required")
    String title;

    String description;

    @NotNull(message = "scheduledDate is required")
    LocalDate scheduledDate;

    String assignedTechnicianId;
}