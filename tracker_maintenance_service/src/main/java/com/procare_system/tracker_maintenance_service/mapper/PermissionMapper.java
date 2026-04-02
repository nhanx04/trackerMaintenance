package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.response.PermissionResponse;
import com.procare_system.tracker_maintenance_service.entity.PermissionEntity;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {
    public PermissionResponse toResponse(PermissionEntity entity) {
        return PermissionResponse.builder()
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }
}