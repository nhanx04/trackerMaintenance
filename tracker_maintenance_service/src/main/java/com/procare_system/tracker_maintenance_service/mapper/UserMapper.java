// UserMapper.java
package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.request.CreateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.response.UserResponse;
import com.procare_system.tracker_maintenance_service.entity.RoleEntity;
import com.procare_system.tracker_maintenance_service.entity.User;
import com.procare_system.tracker_maintenance_service.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final RoleMapper roleMapper;
    private final RoleRepository roleRepository;

    public User toUser(CreateUserRequest request) {
        Set<RoleEntity> roles = new HashSet<>();
        if (request.getRoles() != null) {
            roles = request.getRoles().stream()
                    .map(role -> roleRepository.findById(role)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + role)))
                    .collect(Collectors.toSet());
        }

        return User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(roles)
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .roles(
                    user.getRoles() == null ? new HashSet<>() :
                    user.getRoles().stream()
                        .map(roleMapper::toResponse)
                        .collect(Collectors.toSet())
                )
                .active(user.isActive())
                .build();
    }

    public void updateUser(UpdateUserRequest request, User user) {
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null)  user.setLastName(request.getLastName());
        if (request.getRoles() != null) {
            Set<RoleEntity> roles = request.getRoles().stream()
                    .map(role -> roleRepository.findById(role)
                            .orElseThrow(() -> new RuntimeException("Role not found: " + role)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
    }
}