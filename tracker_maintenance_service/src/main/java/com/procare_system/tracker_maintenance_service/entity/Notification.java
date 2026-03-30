package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ID của người nhận (Manager, Technician hoặc Reporter)
    @Column(name = "recipient_id", nullable = false)
    private String recipientId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    // ID của Ticket liên quan (để UI bấm vào thì nhảy qua trang chi tiết Ticket)
    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}