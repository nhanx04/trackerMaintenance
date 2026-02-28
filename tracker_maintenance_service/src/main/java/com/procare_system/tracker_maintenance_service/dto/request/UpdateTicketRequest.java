package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateTicketRequest {
    String title;
    String description;
    TicketPriority priority;
    TicketStatus status;
    String assignedTechnicianId;

    @FutureOrPresent(message = "TICKET_DATE_PAST")
    LocalDate scheduledDate;
}