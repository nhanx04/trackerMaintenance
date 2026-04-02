package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.RoleRequest;
import com.procare_system.tracker_maintenance_service.dto.response.RoleResponse;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public List<RoleResponse> getAllRoles() {
        return roleService.getAllRoles();
    }

    @GetMapping("/{name}")
    public RoleResponse getRoleByName(@PathVariable Role name) {
        return roleService.getRoleByName(name);
    }

    @PutMapping("/{name}")
    public RoleResponse updateRole(
            @PathVariable Role name,
            @RequestBody RoleRequest request) {
        return roleService.updateRole(name, request);
    }
}