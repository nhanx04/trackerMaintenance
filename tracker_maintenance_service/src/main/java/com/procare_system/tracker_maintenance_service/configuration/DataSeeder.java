package com.procare_system.tracker_maintenance_service.configuration;

import com.procare_system.tracker_maintenance_service.entity.PermissionEntity;
import com.procare_system.tracker_maintenance_service.entity.RoleEntity;
import com.procare_system.tracker_maintenance_service.enums.Permission;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.repository.PermissionRepository;
import com.procare_system.tracker_maintenance_service.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    private static final Map<Role, Set<Permission>> ROLE_PERMISSIONS = Map.of(
        Role.ADMIN, Set.of(Permission.values()),

        Role.MANAGER, Set.of(
            Permission.USER_READ,
            Permission.DEVICE_CREATE, Permission.DEVICE_READ,
            Permission.DEVICE_UPDATE, Permission.DEVICE_DELETE,
            Permission.TICKET_CREATE, Permission.TICKET_READ,
            Permission.TICKET_UPDATE, Permission.TICKET_DELETE,
            Permission.TICKET_ASSIGN, Permission.TICKET_CONFIRM,
            Permission.DASHBOARD_READ
        ),

        Role.TECHNICIAN, Set.of(
            Permission.DEVICE_READ,
            Permission.TICKET_READ, Permission.TICKET_UPDATE
        ),

        Role.REPORTER, Set.of(
            Permission.DEVICE_READ,
            Permission.TICKET_CREATE, Permission.TICKET_READ,
            Permission.TICKET_UPDATE
        )
    );

    @Bean
    @Order(1)
    public ApplicationRunner seedData() {
        return args -> {
            Arrays.stream(Permission.values()).forEach(p -> {
                if (!permissionRepository.existsById(p)) {
                    permissionRepository.save(
                        PermissionEntity.builder()
                            .name(p)
                            .description(p.name())
                            .build()
                    );
                }
            });
            log.info("Permissions seeded");

            // 2. Seed roles
            Map<Permission, PermissionEntity> permMap = permissionRepository.findAll()
                    .stream().collect(Collectors.toMap(PermissionEntity::getName, e -> e));

            Arrays.stream(Role.values()).forEach(role -> {
                if (!roleRepository.existsById(role)) {
                    Set<PermissionEntity> perms = ROLE_PERMISSIONS
                            .getOrDefault(role, Set.of())
                            .stream()
                            .map(permMap::get)
                            .collect(Collectors.toSet());

                    roleRepository.save(
                        RoleEntity.builder()
                            .name(role)
                            .description(role.name())
                            .permissions(perms)
                            .build()
                    );
                }
            });
            log.info("Roles seeded");
        };
    }
}