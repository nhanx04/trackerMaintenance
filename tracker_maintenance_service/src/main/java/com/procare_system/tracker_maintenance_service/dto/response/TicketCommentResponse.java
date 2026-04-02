package com.procare_system.tracker_maintenance_service.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TicketCommentResponse {
    private String id;
    private String ticketId;
    private String authorId;
    private String authorName;
    private String content;
    private LocalDateTime createdAt;
}