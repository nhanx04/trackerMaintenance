package com.procare_system.tracker_maintenance_service.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_comments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String ticketId;

    @Column(nullable = false)
    String authorId;

    String authorName;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Builder.Default
    boolean isDeleted = false;

    @CreationTimestamp
    LocalDateTime createdAt;
}