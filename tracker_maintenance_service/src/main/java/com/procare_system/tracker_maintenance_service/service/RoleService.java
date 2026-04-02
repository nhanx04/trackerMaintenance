package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.RoleRequest;
import com.procare_system.tracker_maintenance_service.dto.response.RoleResponse;
import com.procare_system.tracker_maintenance_service.entity.PermissionEntity;
import com.procare_system.tracker_maintenance_service.entity.RoleEntity;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.RoleMapper;
import com.procare_system.tracker_maintenance_service.repository.PermissionRepository;
import com.procare_system.tracker_maintenance_service.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;

    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public RoleResponse getRoleByName(Role name) {
        RoleEntity role = roleRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        return roleMapper.toResponse(role);
    }

    @PreAuthorize("hasAuthority('ROLE_MANAGE')")
    public RoleResponse updateRole(Role name, RoleRequest request) {
        RoleEntity role = roleRepository.findById(name)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }

        if (request.getPermissions() != null) {
            Set<PermissionEntity> permissions = request.getPermissions().stream()
                    .map(p -> permissionRepository.findById(p)
                            .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            role.setPermissions(permissions);
        }

        return roleMapper.toResponse(roleRepository.save(role));
    }
}