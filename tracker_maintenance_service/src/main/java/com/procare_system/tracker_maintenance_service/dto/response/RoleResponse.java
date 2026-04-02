package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.Role;
import lombok.*;
import java.util.Set;

@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class RoleResponse {
    private Role name;
    private String description;
    private Set<PermissionResponse> permissions;
}