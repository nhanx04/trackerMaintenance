package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateTicketRequest {

    @NotBlank(message = "TICKET_TITLE_BLANK")
    String title;

    String description;

    @NotNull(message = "TICKET_PRIORITY_NULL")
    TicketPriority priority;

    @NotBlank(message = "TICKET_DEVICE_NULL")
    String deviceId;

    String assignedTechnicianId;

    @FutureOrPresent(message = "TICKET_DATE_PAST")
    LocalDate scheduledDate;
}