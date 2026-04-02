package com.procare_system.tracker_maintenance_service.entity;

import com.procare_system.tracker_maintenance_service.enums.Permission;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PermissionEntity {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true)
    private Permission name;

    private String description;
}