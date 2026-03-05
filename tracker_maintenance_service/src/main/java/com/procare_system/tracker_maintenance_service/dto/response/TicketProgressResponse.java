package com.procare_system.tracker_maintenance_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketProgressResponse {
    String id;
    String ticketId;
    String technicianId;
    String note;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    List<TicketImageResponse> images;
}