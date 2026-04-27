package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MaintenanceSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String deviceId;

    @Column(nullable = false)
    String title;

    @Column(columnDefinition = "TEXT")
    String description;

    @Column(nullable = false)
    LocalDate scheduledDate;

    String assignedTechnicianId;

    String createdByUserId;

    @Column(name = "cycle_days", nullable = false)
    @Builder.Default
    Integer cycleDays = 30;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    @Column(name = "completed_by_user_id")
    String completedByUserId;

    @Column(name = "completion_note", columnDefinition = "TEXT")
    String completionNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    ScheduleStatus status = ScheduleStatus.PENDING;

    @Builder.Default
    boolean isDeleted = false;

    @CreationTimestamp
    LocalDateTime createdAt;

    @UpdateTimestamp
    LocalDateTime updatedAt;
}