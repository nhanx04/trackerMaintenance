package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "devices")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class Device extends BaseAuditingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(unique = true, nullable = false, updatable = false)
    String code;

    @Column(nullable = false)
    String name;

    String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    DeviceStatus status = DeviceStatus.AVAILABLE;

    String imageUrl;

    String imageObjectKey;

    String location;

    boolean isDeleted = false;

}
