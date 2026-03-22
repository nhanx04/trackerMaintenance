package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;

@Data
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketResponse {
    String id;
    String title;
    String description;
    TicketStatus status;

    String unresolvableReason;
    String confirmedByUserId;

    TicketPriority priority;
    String deviceId;
    String assignedTechnicianId;
    String createdByUserId;
    LocalDate scheduledDate;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    List<TicketImageResponse> beforeImages;
    List<TicketImageResponse> afterImages;
}