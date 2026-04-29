package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TicketStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TicketPriority priority;

    @Column(nullable = false)
    String deviceId;

    String assignedTechnicianId;

    String createdByUserId;

    LocalDate scheduledDate;

    @Builder.Default
    boolean isDeleted = false;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    String unresolvableReason;

    String confirmedByUserId;

    @Column(name = "due_time")
    LocalDateTime dueTime;

    // Cờ đánh dấu đã quá hạn
    @Builder.Default
    @Column(name = "is_overdue")
    boolean isOverdue = false;

    @Builder.Default
    @Column(name = "is_due_soon_warning_sent")
    boolean isDueSoonWarningSent = false;
}