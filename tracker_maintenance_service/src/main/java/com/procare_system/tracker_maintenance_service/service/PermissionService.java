package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.response.PermissionResponse;
import com.procare_system.tracker_maintenance_service.entity.PermissionEntity;
import com.procare_system.tracker_maintenance_service.enums.Permission;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.PermissionMapper;
import com.procare_system.tracker_maintenance_service.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('PERMISSION_MANAGE')")
    public PermissionResponse updateDescription(Permission name, String description) {
        PermissionEntity entity = permissionRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        entity.setDescription(description);
        return permissionMapper.toResponse(permissionRepository.save(entity));
    }
}