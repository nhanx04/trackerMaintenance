package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.ImageType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_images")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String ticketId;

    @Column(nullable = true)
    String ticketProgressId;

    @Column(nullable = false)
    String imageUrl;

    @Column(nullable = false)
    String objectKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ImageType imageType;   

    String uploadedByUserId;

    @CreationTimestamp
    LocalDateTime uploadedAt;
}