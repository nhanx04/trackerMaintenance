package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.ImageType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketImageResponse {
    String id;
    String ticketId;
    String imageUrl;
    ImageType imageType;
    String uploadedByUserId;
    LocalDateTime uploadedAt;
}