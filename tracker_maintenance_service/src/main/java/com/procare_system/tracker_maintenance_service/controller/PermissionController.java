package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.response.PermissionResponse;
import com.procare_system.tracker_maintenance_service.enums.Permission;
import com.procare_system.tracker_maintenance_service.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public List<PermissionResponse> getAllPermissions() {
        return permissionService.getAllPermissions();
    }

    @PatchMapping("/{name}")
    public PermissionResponse updateDescription(
            @PathVariable Permission name,
            @RequestParam String description) {
        return permissionService.updateDescription(name, description);
    }
}