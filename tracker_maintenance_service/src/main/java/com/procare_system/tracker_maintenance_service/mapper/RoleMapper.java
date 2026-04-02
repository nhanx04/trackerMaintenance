package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.response.RoleResponse;
import com.procare_system.tracker_maintenance_service.entity.RoleEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class RoleMapper {
    private final PermissionMapper permissionMapper;

    public RoleResponse toResponse(RoleEntity entity) {
        return RoleResponse.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .permissions(
                    entity.getPermissions().stream()
                        .map(permissionMapper::toResponse)
                        .collect(Collectors.toSet())
                )
                .build();
    }

    public Set<RoleResponse> toResponses(Set<RoleEntity> entities) {
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toSet());
    }

}